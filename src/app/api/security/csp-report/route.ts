/**
 * CSP Violation Reporting Endpoint
 * 
 * Receives Content Security Policy violation reports and processes them
 * for security monitoring and alerting.
 */

import { NextRequest, NextResponse } from "next/server";
import { securityLogger, logSecurity } from "@/lib/logger";
import { alertManager } from "@/lib/alerting";

interface CSPViolationReport {
  'csp-report': {
    'document-uri': string;
    referrer: string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    disposition: string;
    'blocked-uri': string;
    'line-number': number;
    'column-number': number;
    'source-file': string;
    'status-code': number;
    'script-sample': string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse the CSP violation report
    const report: CSPViolationReport = await request.json();
    const cspReport = report['csp-report'];

    if (!cspReport) {
      return NextResponse.json({ error: 'Invalid CSP report format' }, { status: 400 });
    }

    // Extract relevant information
    const violationData = {
      documentUri: cspReport['document-uri'],
      referrer: cspReport.referrer,
      violatedDirective: cspReport['violated-directive'],
      effectiveDirective: cspReport['effective-directive'],
      blockedUri: cspReport['blocked-uri'],
      sourceFile: cspReport['source-file'],
      lineNumber: cspReport['line-number'],
      columnNumber: cspReport['column-number'],
      scriptSample: cspReport['script-sample'],
      statusCode: cspReport['status-code'],
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // Determine severity based on violation type
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    
    if (cspReport['violated-directive'].includes('script-src')) {
      severity = 'high'; // Script violations are more serious
    } else if (cspReport['violated-directive'].includes('object-src') || 
               cspReport['violated-directive'].includes('base-uri')) {
      severity = 'critical'; // These could indicate serious attacks
    } else if (cspReport['violated-directive'].includes('img-src') || 
               cspReport['violated-directive'].includes('style-src')) {
      severity = 'low'; // Less critical violations
    }

    // Log the CSP violation
    securityLogger.warn('CSP violation detected', {
      ...violationData,
      severity,
      logType: 'security',
    });

    // Log security event
    logSecurity('csrf_violation', severity, violationData);

    // Check if this looks like a potential attack
    const isPotentialAttack = (
      cspReport['blocked-uri'].includes('javascript:') ||
      cspReport['blocked-uri'].includes('data:') ||
      cspReport['script-sample']?.includes('<script') ||
      cspReport['violated-directive'].includes('script-src')
    );

    if (isPotentialAttack) {
      // Trigger security alert
      alertManager.checkAlerts({
        securityEvent: 'suspicious_activity',
        ip: violationData.ip,
        details: `CSP violation: ${cspReport['violated-directive']} blocked ${cspReport['blocked-uri']}`,
        userAgent: violationData.userAgent,
        severity: severity,
      });
    }

    // Track violation patterns for rate limiting
    await trackViolationPattern(violationData);

    return NextResponse.json({ 
      status: 'received',
      message: 'CSP violation report processed successfully' 
    });

  } catch (error) {
    securityLogger.error('Error processing CSP violation report', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: request.url,
      method: request.method,
    }, error instanceof Error ? error : undefined);

    return NextResponse.json(
      { error: 'Failed to process CSP violation report' },
      { status: 500 }
    );
  }
}

/**
 * Track violation patterns to detect potential attacks
 */
async function trackViolationPattern(violationData: any): Promise<void> {
  // In a production environment, you might want to:
  // 1. Store violations in a database
  // 2. Implement rate limiting for repeated violations from same IP
  // 3. Automatically block IPs with too many violations
  // 4. Generate reports for security team

  // For now, we'll just log patterns
  securityLogger.info('CSP violation pattern tracked', {
    ip: violationData.ip,
    violatedDirective: violationData.violatedDirective,
    blockedUri: violationData.blockedUri,
    userAgent: violationData.userAgent,
  });
}

// Handle GET requests (CSP reports can sometimes be sent as GET)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'CSP violation reporting endpoint',
    method: 'POST',
    contentType: 'application/csp-report'
  });
} 