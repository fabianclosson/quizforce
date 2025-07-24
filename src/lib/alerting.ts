/**
 * Production Alerting System
 * 
 * Provides configurable alerting rules and integrations with Sentry
 * for critical system events, performance issues, and security concerns.
 */

import * as Sentry from "@sentry/nextjs";
import { rootLogger, LogContext } from "./logger";
import { config } from "./config";

// Alert severity levels
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Alert categories
export enum AlertCategory {
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  AVAILABILITY = 'availability',
  BUSINESS = 'business',
  SYSTEM = 'system',
}

// Alert rule interface
export interface AlertRule {
  id: string;
  name: string;
  category: AlertCategory;
  severity: AlertSeverity;
  condition: (data: any) => boolean;
  message: (data: any) => string;
  enabled: boolean;
  cooldownMs: number; // Minimum time between alerts of same type
  tags?: Record<string, string>;
}

// Alert data interface
export interface AlertData {
  ruleId: string;
  severity: AlertSeverity;
  category: AlertCategory;
  message: string;
  context: LogContext;
  timestamp: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

// Cooldown tracking
const alertCooldowns = new Map<string, number>();

// Pre-configured alert rules
const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'critical_slow_request',
    name: 'Critical Slow Request',
    category: AlertCategory.PERFORMANCE,
    severity: AlertSeverity.CRITICAL,
    condition: (data) => data.duration > 10000, // 10 seconds
    message: (data) => `Critical slow request: ${data.method} ${data.url} took ${data.duration}ms`,
    enabled: true,
    cooldownMs: 5 * 60 * 1000, // 5 minutes
    tags: { alert_type: 'performance', subsystem: 'api' },
  },
  {
    id: 'high_error_rate',
    name: 'High Error Rate',
    category: AlertCategory.AVAILABILITY,
    severity: AlertSeverity.HIGH,
    condition: (data) => data.errorRate > 0.1, // 10% error rate
    message: (data) => `High error rate detected: ${(data.errorRate * 100).toFixed(1)}% over ${data.timeWindow}`,
    enabled: true,
    cooldownMs: 10 * 60 * 1000, // 10 minutes
    tags: { alert_type: 'availability', subsystem: 'api' },
  },
  {
    id: 'database_connection_failure',
    name: 'Database Connection Failure',
    category: AlertCategory.SYSTEM,
    severity: AlertSeverity.CRITICAL,
    condition: (data) => data.errorMessage && data.errorMessage.toLowerCase().includes('connection'),
    message: (data) => `Database connection failure: ${data.errorMessage}`,
    enabled: true,
    cooldownMs: 2 * 60 * 1000, // 2 minutes
    tags: { alert_type: 'system', subsystem: 'database' },
  },
  {
    id: 'security_breach_attempt',
    name: 'Security Breach Attempt',
    category: AlertCategory.SECURITY,
    severity: AlertSeverity.HIGH,
    condition: (data) => data.securityEvent === 'suspicious_activity',
    message: (data) => `Security breach attempt detected from ${data.ip}: ${data.details}`,
    enabled: true,
    cooldownMs: 1 * 60 * 1000, // 1 minute
    tags: { alert_type: 'security', subsystem: 'auth' },
  },
  {
    id: 'memory_usage_high',
    name: 'High Memory Usage',
    category: AlertCategory.SYSTEM,
    severity: AlertSeverity.MEDIUM,
    condition: (data) => data.memoryUsagePercent > 85,
    message: (data) => `High memory usage: ${data.memoryUsagePercent}% (${data.memoryUsageMB}MB)`,
    enabled: true,
    cooldownMs: 15 * 60 * 1000, // 15 minutes
    tags: { alert_type: 'system', subsystem: 'memory' },
  },
  {
    id: 'payment_failure_spike',
    name: 'Payment Failure Spike',
    category: AlertCategory.BUSINESS,
    severity: AlertSeverity.HIGH,
    condition: (data) => data.paymentFailureRate > 0.05, // 5% failure rate
    message: (data) => `Payment failure spike: ${(data.paymentFailureRate * 100).toFixed(1)}% failures in last ${data.timeWindow}`,
    enabled: true,
    cooldownMs: 5 * 60 * 1000, // 5 minutes
    tags: { alert_type: 'business', subsystem: 'payments' },
  },
  {
    id: 'exam_completion_anomaly',
    name: 'Exam Completion Anomaly',
    category: AlertCategory.BUSINESS,
    severity: AlertSeverity.MEDIUM,
    condition: (data) => data.examCompletionRate < 0.1, // Less than 10% completion rate
    message: (data) => `Exam completion anomaly: Only ${(data.examCompletionRate * 100).toFixed(1)}% completion rate`,
    enabled: true,
    cooldownMs: 30 * 60 * 1000, // 30 minutes
    tags: { alert_type: 'business', subsystem: 'exams' },
  },
];

/**
 * Alert Manager Class
 */
export class AlertManager {
  private rules: Map<string, AlertRule>;
  private enabled: boolean;

  constructor() {
    this.rules = new Map();
    this.enabled = config.isProduction; // Only enable in production by default
    
    // Load default rules
    DEFAULT_ALERT_RULES.forEach(rule => {
      this.rules.set(rule.id, rule);
    });

    rootLogger.info('Alert manager initialized', {
      rulesCount: this.rules.size,
      enabled: this.enabled,
    });
  }

  /**
   * Add or update an alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    rootLogger.info('Alert rule added/updated', { ruleId: rule.id, name: rule.name });
  }

  /**
   * Remove an alert rule
   */
  removeRule(ruleId: string): void {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      rootLogger.info('Alert rule removed', { ruleId });
    }
  }

  /**
   * Enable/disable specific rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      rootLogger.info('Alert rule status changed', { ruleId, enabled });
    }
  }

  /**
   * Enable/disable entire alert system
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    rootLogger.info('Alert system status changed', { enabled });
  }

  /**
   * Check data against all rules and trigger alerts
   */
  checkAlerts(data: any, context?: LogContext): void {
    if (!this.enabled) {
      return;
    }

    for (const rule of this.rules.values()) {
      if (!rule.enabled) {
        continue;
      }

      try {
        if (rule.condition(data)) {
          this.triggerAlert(rule, data, context);
        }
      } catch (error) {
        rootLogger.error('Error evaluating alert rule', {
          ruleId: rule.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, error instanceof Error ? error : undefined);
      }
    }
  }

  /**
   * Trigger an alert if not in cooldown
   */
  private triggerAlert(rule: AlertRule, data: any, context?: LogContext): void {
    const now = Date.now();
    const cooldownKey = `${rule.id}`;
    const lastAlertTime = alertCooldowns.get(cooldownKey) || 0;

    // Check cooldown
    if (now - lastAlertTime < rule.cooldownMs) {
      return;
    }

    // Update cooldown
    alertCooldowns.set(cooldownKey, now);

    // Create alert data
    const alertData: AlertData = {
      ruleId: rule.id,
      severity: rule.severity,
      category: rule.category,
      message: rule.message(data),
      context: context || {},
      timestamp: now,
      tags: rule.tags,
      metadata: data,
    };

    // Log the alert
    const logLevel = rule.severity === AlertSeverity.CRITICAL ? 'error' : 
                    rule.severity === AlertSeverity.HIGH ? 'warn' : 'info';
    
    rootLogger[logLevel](`ALERT: ${alertData.message}`, {
      alertId: rule.id,
      severity: rule.severity,
      category: rule.category,
      ...context,
    });

    // Send to Sentry
    this.sendToSentry(alertData);

    // Send to other integrations (webhook, email, etc.)
    this.sendToIntegrations(alertData);
  }

  /**
   * Send alert to Sentry
   */
  private sendToSentry(alert: AlertData): void {
    if (!config.sentry.isConfigured) {
      return;
    }

    const sentryLevel = alert.severity === AlertSeverity.CRITICAL ? 'fatal' :
                       alert.severity === AlertSeverity.HIGH ? 'error' :
                       alert.severity === AlertSeverity.MEDIUM ? 'warning' : 'info';

    Sentry.withScope((scope) => {
      // Set alert context
      scope.setTag('alert', true);
      scope.setTag('alert_severity', alert.severity);
      scope.setTag('alert_category', alert.category);
      scope.setTag('alert_rule', alert.ruleId);

      // Add custom tags
      if (alert.tags) {
        Object.entries(alert.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }

      // Set context
      scope.setContext('alert', {
        ruleId: alert.ruleId,
        severity: alert.severity,
        category: alert.category,
        timestamp: alert.timestamp,
        metadata: alert.metadata,
      });

      // Capture the alert
      Sentry.captureMessage(`ALERT: ${alert.message}`, sentryLevel);
    });
  }

  /**
   * Send alert to other integrations (placeholder for future enhancements)
   */
  private sendToIntegrations(alert: AlertData): void {
    // Placeholder for webhook notifications, email alerts, Slack integration, etc.
    // In production, you might want to add:
    // - Webhook notifications
    // - Email alerts for critical issues
    // - Slack/Discord integration
    // - PagerDuty integration for critical alerts
    
    rootLogger.debug('Alert sent to integrations', {
      ruleId: alert.ruleId,
      severity: alert.severity,
      // Add integration-specific logging here
    });
  }

  /**
   * Get alert statistics
   */
  getStats(): {
    totalRules: number;
    enabledRules: number;
    disabledRules: number;
    alertsInCooldown: number;
  } {
    const enabledRules = Array.from(this.rules.values()).filter(rule => rule.enabled).length;
    
    return {
      totalRules: this.rules.size,
      enabledRules,
      disabledRules: this.rules.size - enabledRules,
      alertsInCooldown: alertCooldowns.size,
    };
  }

  /**
   * Get all rules
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Clear all cooldowns (useful for testing)
   */
  clearCooldowns(): void {
    alertCooldowns.clear();
    rootLogger.info('Alert cooldowns cleared');
  }
}

// Create singleton alert manager
export const alertManager = new AlertManager();

// Utility functions for common alert scenarios
export const alertSlowRequest = (method: string, url: string, duration: number, context?: LogContext) => {
  alertManager.checkAlerts({ method, url, duration }, context);
};

export const alertErrorRate = (errorRate: number, timeWindow: string, context?: LogContext) => {
  alertManager.checkAlerts({ errorRate, timeWindow }, context);
};

export const alertSecurityEvent = (securityEvent: string, ip: string, details: string, context?: LogContext) => {
  alertManager.checkAlerts({ securityEvent, ip, details }, context);
};

export const alertSystemMetrics = (memoryUsagePercent: number, memoryUsageMB: number, context?: LogContext) => {
  alertManager.checkAlerts({ memoryUsagePercent, memoryUsageMB }, context);
};

export const alertBusinessMetrics = (paymentFailureRate?: number, examCompletionRate?: number, timeWindow?: string, context?: LogContext) => {
  alertManager.checkAlerts({ paymentFailureRate, examCompletionRate, timeWindow }, context);
};

// Initialize alerting system
if (typeof window === 'undefined') {
  rootLogger.info('Alerting system initialized', {
    enabled: alertManager.getStats().enabledRules > 0,
    rulesCount: alertManager.getStats().totalRules,
  });
} 