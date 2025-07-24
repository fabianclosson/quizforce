/**
 * Input Sanitization and Validation System
 * 
 * Provides comprehensive input sanitization, validation, and protection
 * against common injection attacks including XSS, SQL injection, and LDAP injection.
 */

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { securityLogger, logSecurity } from './logger';
import { alertManager } from './alerting';

// Initialize DOMPurify for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

// Sanitization configuration
export interface SanitizationConfig {
  allowedTags: string[];
  allowedAttributes: string[];
  allowedSchemes: string[];
  maxLength: number;
  stripComments: boolean;
  stripScripts: boolean;
}

// Default sanitization configs for different contexts
export const SANITIZATION_CONFIGS = {
  strict: {
    allowedTags: [],
    allowedAttributes: [],
    allowedSchemes: [],
    maxLength: 1000,
    stripComments: true,
    stripScripts: true,
  },
  
  basic: {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'b', 'i'],
    allowedAttributes: [],
    allowedSchemes: [],
    maxLength: 5000,
    stripComments: true,
    stripScripts: true,
  },
  
  rich: {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li', 'a', 'img'],
    allowedAttributes: ['href', 'src', 'alt', 'title'],
    allowedSchemes: ['http', 'https'],
    maxLength: 10000,
    stripComments: true,
    stripScripts: true,
  },
} as const;

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^\+?[\d\s\-\(\)]{10,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
} as const;

// Dangerous patterns to detect
const DANGEROUS_PATTERNS = [
  // XSS patterns
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<link\b[^>]*>/gi,
  /<meta\b[^>]*>/gi,
  
  // SQL injection patterns
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
  /(--|#|\/\*|\*\/)/g,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
  /('\s*(OR|AND)\s*')/gi,
  
  // LDAP injection patterns
  /[()&|!]/g,
  
  // Command injection patterns
  /[;&|`$(){}[\]]/g,
  
  // Path traversal patterns
  /\.\.[\/\\]/g,
  
  // NoSQL injection patterns
  /\$\w+/g,
] as const;

/**
 * Input Sanitizer Class
 */
export class InputSanitizer {
  private config: SanitizationConfig;

  constructor(config: SanitizationConfig = SANITIZATION_CONFIGS.basic) {
    this.config = config;
  }

  /**
   * Sanitize HTML content
   */
  sanitizeHtml(input: string, context?: string): string {
    if (!input) return '';

    try {
      // Check for dangerous patterns first
      this.detectDangerousPatterns(input, context);

      // Configure DOMPurify
      const config: any = {
        ALLOWED_TAGS: this.config.allowedTags,
        ALLOWED_ATTR: this.config.allowedAttributes,
        ALLOWED_URI_REGEXP: this.config.allowedSchemes.length > 0 
          ? new RegExp(`^(?:${this.config.allowedSchemes.join('|')}):`, 'i')
          : /^$/,
        REMOVE_COMMENTS: this.config.stripComments,
        REMOVE_SCRIPTS: this.config.stripScripts,
        SANITIZE_DOM: true,
        KEEP_CONTENT: true,
      };

      // Sanitize the input
      let sanitized = purify.sanitize(input, config);

      // Truncate if too long
      if (sanitized.length > this.config.maxLength) {
        sanitized = sanitized.substring(0, this.config.maxLength);
        
        securityLogger.warn('Input truncated due to length', {
          originalLength: input.length,
          maxLength: this.config.maxLength,
          context,
        });
      }

      return sanitized;
    } catch (error) {
      securityLogger.error('HTML sanitization error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context,
        inputLength: input.length,
      }, error instanceof Error ? error : undefined);

      // Return empty string on error for security
      return '';
    }
  }

  /**
   * Sanitize plain text (remove all HTML)
   */
  sanitizeText(input: string, context?: string): string {
    if (!input) return '';

    try {
      // Check for dangerous patterns
      this.detectDangerousPatterns(input, context);

      // Remove all HTML tags and decode entities
      let sanitized = purify.sanitize(input, { 
        ALLOWED_TAGS: [], 
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
      });

      // Additional cleaning
      sanitized = sanitized
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .trim();

      // Truncate if necessary
      if (sanitized.length > this.config.maxLength) {
        sanitized = sanitized.substring(0, this.config.maxLength);
      }

      return sanitized;
    } catch (error) {
      securityLogger.error('Text sanitization error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context,
        inputLength: input.length,
      }, error instanceof Error ? error : undefined);

      return '';
    }
  }

  /**
   * Validate input against a pattern
   */
  validate(input: string, pattern: RegExp | keyof typeof VALIDATION_PATTERNS, context?: string): boolean {
    if (!input) return false;

    try {
      const regex = typeof pattern === 'string' ? VALIDATION_PATTERNS[pattern] : pattern;
      const isValid = regex.test(input);

      if (!isValid) {
        securityLogger.info('Input validation failed', {
          pattern: pattern.toString(),
          context,
          inputLength: input.length,
        });
      }

      return isValid;
    } catch (error) {
      securityLogger.error('Input validation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context,
        pattern: pattern.toString(),
      }, error instanceof Error ? error : undefined);

      return false;
    }
  }

  /**
   * Sanitize SQL input (basic protection)
   */
  sanitizeSql(input: string, context?: string): string {
    if (!input) return '';

    try {
      // Check for SQL injection patterns
      this.detectDangerousPatterns(input, context);

      // Basic SQL sanitization
      let sanitized = input
        .replace(/['"]/g, '') // Remove quotes
        .replace(/[;--]/g, '') // Remove common SQL terminators
        .replace(/\/\*.*?\*\//g, '') // Remove SQL comments
        .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b/gi, '') // Remove SQL keywords
        .trim();

      return sanitized;
    } catch (error) {
      securityLogger.error('SQL sanitization error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context,
      }, error instanceof Error ? error : undefined);

      return '';
    }
  }

  /**
   * Detect dangerous patterns in input
   */
  private detectDangerousPatterns(input: string, context?: string): void {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(input)) {
        const violation = {
          pattern: pattern.toString(),
          input: input.substring(0, 100), // Only log first 100 chars
          context: context || 'unknown',
          timestamp: new Date().toISOString(),
        };

        // Log security violation
        logSecurity('suspicious_activity', 'high', violation);

        // Trigger alert for potential attack
        alertManager.checkAlerts({
          securityEvent: 'suspicious_activity',
          ip: 'unknown', // This would be filled in by the calling code
          details: `Dangerous pattern detected: ${pattern.toString()}`,
          context,
        });

        securityLogger.warn('Dangerous pattern detected in input', violation);
        break; // Only log the first match to avoid spam
      }
    }
  }
}

/**
 * Input Validation Utilities
 */
export class InputValidator {
  /**
   * Validate email address
   */
  static isEmail(email: string): boolean {
    return VALIDATION_PATTERNS.email.test(email);
  }

  /**
   * Validate URL
   */
  static isUrl(url: string): boolean {
    return VALIDATION_PATTERNS.url.test(url);
  }

  /**
   * Validate UUID
   */
  static isUuid(uuid: string): boolean {
    return VALIDATION_PATTERNS.uuid.test(uuid);
  }

  /**
   * Validate username
   */
  static isUsername(username: string): boolean {
    return VALIDATION_PATTERNS.username.test(username);
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password: string): boolean {
    return VALIDATION_PATTERNS.password.test(password);
  }

  /**
   * Check if string contains only safe characters
   */
  static isSafeString(input: string): boolean {
    // Allow alphanumeric, spaces, and basic punctuation
    const safePattern = /^[a-zA-Z0-9\s\.,!?\-_()]+$/;
    return safePattern.test(input);
  }

  /**
   * Check if input is within length limits
   */
  static isValidLength(input: string, min: number = 0, max: number = 1000): boolean {
    return input.length >= min && input.length <= max;
  }
}

// Create default sanitizer instances
export const strictSanitizer = new InputSanitizer(SANITIZATION_CONFIGS.strict);
export const basicSanitizer = new InputSanitizer(SANITIZATION_CONFIGS.basic);
export const richSanitizer = new InputSanitizer(SANITIZATION_CONFIGS.rich);

// Utility functions for common sanitization tasks
export const sanitizeHtml = (input: string, context?: string) => 
  basicSanitizer.sanitizeHtml(input, context);

export const sanitizeText = (input: string, context?: string) => 
  basicSanitizer.sanitizeText(input, context);

export const sanitizeSql = (input: string, context?: string) => 
  basicSanitizer.sanitizeSql(input, context);

export const validateInput = (input: string, pattern: RegExp | keyof typeof VALIDATION_PATTERNS, context?: string) =>
  basicSanitizer.validate(input, pattern, context);

// Initialize input sanitization system
if (typeof window === 'undefined') {
  securityLogger.info('Input sanitization system initialized', {
    dangerousPatternsCount: DANGEROUS_PATTERNS.length,
    validationPatternsCount: Object.keys(VALIDATION_PATTERNS).length,
    sanitizationConfigsCount: Object.keys(SANITIZATION_CONFIGS).length,
  });
} 