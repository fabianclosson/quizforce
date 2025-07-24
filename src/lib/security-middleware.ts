/**
 * Comprehensive Security Middleware
 * 
 * Provides enhanced security measures including advanced CSP, CORS management,
 * security headers via Helmet, input sanitization, and security monitoring.
 */

import { NextRequest, NextResponse } from "next/server";
import helmet from "helmet";
import { config } from "./config";
import { logSecurity, securityLogger } from "./logger";
import { alertManager } from "./alerting";

// Security configuration interfaces
export interface SecurityConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableCORS: boolean;
  enableXSSProtection: boolean;
  enableReferrerPolicy: boolean;
  enablePermissionsPolicy: boolean;
  allowedOrigins: string[];
  maxRequestSize: number;
  enableSecurityLogging: boolean;
}

// Default security configuration
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enableCSP: true,
  enableHSTS: config.isProduction,
  enableCORS: true,
  enableXSSProtection: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true,
  allowedOrigins: config.security.corsOrigins,
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  enableSecurityLogging: config.isProduction,
};

// Advanced CSP configuration with nonce support
export interface CSPConfig {
  useNonce: boolean;
  reportUri?: string;
  reportOnly: boolean;
  customDirectives?: Record<string, string[]>;
}

// Security violation types
export enum SecurityViolationType {
  CSP_VIOLATION = 'csp_violation',
  CORS_VIOLATION = 'cors_violation',
  OVERSIZED_REQUEST = 'oversized_request',
  SUSPICIOUS_HEADERS = 'suspicious_headers',
  MALFORMED_REQUEST = 'malformed_request',
}

/**
 * Enhanced Content Security Policy Generator
 */
export class AdvancedCSPGenerator {
  private nonce?: string;
  private config: CSPConfig;

  constructor(config: CSPConfig = { useNonce: false, reportOnly: false }) {
    this.config = config;
    if (config.useNonce) {
      this.nonce = this.generateNonce();
    }
  }

  private generateNonce(): string {
    return Buffer.from(crypto.randomUUID()).toString('base64');
  }

  getNonce(): string | undefined {
    return this.nonce;
  }

  generateCSP(): string {
    const nonceStr = this.nonce ? `'nonce-${this.nonce}'` : "";
    
    // Base directives with enhanced security
    const directives: Record<string, string[]> = {
      'default-src': ["'self'"],
      
      // Scripts: Enhanced with nonce and strict evaluation
      'script-src': [
        "'self'",
        ...(nonceStr ? [nonceStr] : []),
        'https://js.stripe.com',
        'https://cdn.jsdelivr.net',
        ...(config.isDevelopment ? ["'unsafe-eval'", "'unsafe-inline'"] : [])
      ].filter(Boolean),
      
      // Styles: Allow nonce and necessary external sources
      'style-src': [
        "'self'",
        ...(nonceStr ? [nonceStr] : []),
        "'unsafe-inline'", // Required for CSS-in-JS libraries
        'https://fonts.googleapis.com'
      ].filter(Boolean),
      
      // Images: Allow data URLs and trusted sources
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https://*.supabase.co',
        'https://*.stripe.com',
        'https://avatars.githubusercontent.com',
        'https://lh3.googleusercontent.com'
      ],
      
      // AJAX/WebSocket: Restrict to trusted APIs
      'connect-src': [
        "'self'",
        'https://*.supabase.co',
        'https://api.stripe.com',
        'https://checkout.stripe.com',
        ...(config.isDevelopment ? ['ws:', 'wss:'] : [])
      ],
      
      // Fonts: Google Fonts and self
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com'
      ],
      
      // Frames: Strict control
      'frame-src': [
        'https://js.stripe.com',
        'https://checkout.stripe.com'
      ],
      
      // Objects: Block completely
      'object-src': ["'none'"],
      
      // Base URI: Only self
      'base-uri': ["'self'"],
      
      // Form actions: Only self
      'form-action': ["'self'"],
      
      // Frame ancestors: Prevent embedding
      'frame-ancestors': ["'none'"],
      
      // Worker sources: Self only
      'worker-src': ["'self'", 'blob:'],
      
      // Manifest sources: Self only
      'manifest-src': ["'self'"],
      
      // Media sources: Self and data
      'media-src': ["'self'", 'data:', 'blob:'],
    };

    // Add custom directives if provided
    if (this.config.customDirectives) {
      Object.entries(this.config.customDirectives).forEach(([key, values]) => {
        directives[key] = [...(directives[key] || []), ...values];
      });
    }

    // Add reporting directive if configured
    if (this.config.reportUri) {
      directives['report-uri'] = [this.config.reportUri];
      directives['report-to'] = ['csp-endpoint'];
    }

    // Add upgrade-insecure-requests in production
    if (config.isProduction) {
      directives['upgrade-insecure-requests'] = [];
    }

    // Convert to CSP string
    return Object.entries(directives)
      .map(([directive, sources]) => 
        sources.length > 0 
          ? `${directive} ${sources.join(' ')}`
          : directive
      )
      .join('; ');
  }

  getCSPHeaders(): Record<string, string> {
    const csp = this.generateCSP();
    const headerName = this.config.reportOnly 
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';

    return { [headerName]: csp };
  }
}

/**
 * CORS Configuration Manager
 */
export class CORSManager {
  private allowedOrigins: string[];
  private allowedMethods: string[];
  private allowedHeaders: string[];
  private maxAge: number;

  constructor(config: SecurityConfig) {
    this.allowedOrigins = config.allowedOrigins;
    this.allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
    this.allowedHeaders = [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Requested-With',
      'Accept',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Date',
      'X-Api-Version'
    ];
    this.maxAge = 86400; // 24 hours
  }

  isOriginAllowed(origin: string | null): boolean {
    if (!origin) return true; // Same-origin requests

    // In development, be more permissive
    if (config.isDevelopment && origin.includes('localhost')) {
      return true;
    }

    return this.allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.includes('*')) {
        const regex = new RegExp(allowed.replace(/\*/g, '.*'));
        return regex.test(origin);
      }
      return allowed === origin;
    });
  }

  getCORSHeaders(request: NextRequest): Record<string, string> {
    const origin = request.headers.get('origin');
    const headers: Record<string, string> = {};

    if (this.isOriginAllowed(origin)) {
      headers['Access-Control-Allow-Origin'] = origin || '*';
      headers['Access-Control-Allow-Methods'] = this.allowedMethods.join(', ');
      headers['Access-Control-Allow-Headers'] = this.allowedHeaders.join(', ');
      headers['Access-Control-Max-Age'] = this.maxAge.toString();
      headers['Access-Control-Allow-Credentials'] = 'true';
    }

    return headers;
  }

  handlePreflightRequest(request: NextRequest): NextResponse | null {
    if (request.method !== 'OPTIONS') return null;

    const origin = request.headers.get('origin');
    
    if (!this.isOriginAllowed(origin)) {
             // Log CORS violation
       logSecurity('suspicious_activity', 'medium', {
         origin: origin || 'null',
         method: request.method,
         url: request.url,
         userAgent: request.headers.get('user-agent') || 'unknown',
         violationType: 'cors_violation',
       });

      return new NextResponse(null, { status: 403 });
    }

    const corsHeaders = this.getCORSHeaders(request);
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
}

/**
 * Security Headers Manager using Helmet-like functionality
 */
export class SecurityHeadersManager {
  private config: SecurityConfig;

  constructor(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.config = config;
  }

  generateSecurityHeaders(cspHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {};

    // Content Security Policy (from CSP generator)
    Object.assign(headers, cspHeaders);

    // HTTP Strict Transport Security
    if (this.config.enableHSTS && config.isProduction) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    // X-Frame-Options (clickjacking protection)
    headers['X-Frame-Options'] = 'DENY';

    // X-Content-Type-Options (MIME sniffing protection)
    headers['X-Content-Type-Options'] = 'nosniff';

    // X-XSS-Protection (legacy XSS protection)
    if (this.config.enableXSSProtection) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }

    // Referrer Policy
    if (this.config.enableReferrerPolicy) {
      headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    }

    // Permissions Policy (feature policy)
    if (this.config.enablePermissionsPolicy) {
      headers['Permissions-Policy'] = [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=(self)',
        'usb=()',
        'magnetometer=()',
        'accelerometer=()',
        'gyroscope=()',
        'clipboard-read=(self)',
        'clipboard-write=(self)'
      ].join(', ');
    }

    // Cross-Origin-Embedder-Policy
    headers['Cross-Origin-Embedder-Policy'] = 'require-corp';

    // Cross-Origin-Opener-Policy
    headers['Cross-Origin-Opener-Policy'] = 'same-origin';

    // Cross-Origin-Resource-Policy
    headers['Cross-Origin-Resource-Policy'] = 'same-origin';

    // Remove server information
    headers['Server'] = '';
    headers['X-Powered-By'] = '';

    return headers;
  }
}

/**
 * Request Security Validator
 */
export class RequestSecurityValidator {
  private config: SecurityConfig;

  constructor(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.config = config;
  }

  validateRequest(request: NextRequest): {
    isValid: boolean;
    violations: SecurityViolationType[];
    details: Record<string, any>;
  } {
    const violations: SecurityViolationType[] = [];
    const details: Record<string, any> = {};

    // Check request size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > this.config.maxRequestSize) {
      violations.push(SecurityViolationType.OVERSIZED_REQUEST);
      details.contentLength = contentLength;
      details.maxAllowed = this.config.maxRequestSize;
    }

    // Check for suspicious headers
    const suspiciousHeaders = [
      'x-forwarded-host',
      'x-real-ip',
      'x-forwarded-for'
    ];

    const presentSuspiciousHeaders = suspiciousHeaders.filter(header => 
      request.headers.has(header)
    );

    if (presentSuspiciousHeaders.length > 2) {
      violations.push(SecurityViolationType.SUSPICIOUS_HEADERS);
      details.suspiciousHeaders = presentSuspiciousHeaders;
    }

    // Validate Content-Type for POST/PUT/PATCH requests
    const method = request.method;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers.get('content-type');
      if (!contentType || (!contentType.includes('application/json') && 
                          !contentType.includes('multipart/form-data') &&
                          !contentType.includes('application/x-www-form-urlencoded'))) {
        violations.push(SecurityViolationType.MALFORMED_REQUEST);
        details.invalidContentType = contentType;
      }
    }

    // Check User-Agent (basic bot detection)
    const userAgent = request.headers.get('user-agent');
    if (!userAgent || userAgent.length < 10) {
      violations.push(SecurityViolationType.SUSPICIOUS_HEADERS);
      details.suspiciousUserAgent = userAgent;
    }

    return {
      isValid: violations.length === 0,
      violations,
      details,
    };
  }
}

/**
 * Main Security Middleware Class
 */
export class SecurityMiddleware {
  private config: SecurityConfig;
  private cspGenerator: AdvancedCSPGenerator;
  private corsManager: CORSManager;
  private headersManager: SecurityHeadersManager;
  private requestValidator: RequestSecurityValidator;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
    
         this.cspGenerator = new AdvancedCSPGenerator({
       useNonce: true,
       reportOnly: config.isDevelopment,
       reportUri: config.isProduction ? '/api/security/csp-report' : undefined,
     });
    
    this.corsManager = new CORSManager(this.config);
    this.headersManager = new SecurityHeadersManager(this.config);
    this.requestValidator = new RequestSecurityValidator(this.config);
  }

  /**
   * Apply security middleware to a request
   */
  async applySecurityMiddleware(
    request: NextRequest,
    response?: NextResponse
  ): Promise<NextResponse> {
    const startTime = Date.now();
    
    // Handle CORS preflight requests
    const preflightResponse = this.corsManager.handlePreflightRequest(request);
    if (preflightResponse) {
      return preflightResponse;
    }

    // Validate request security
    const validation = this.requestValidator.validateRequest(request);
    
         // Log security violations
     if (!validation.isValid && this.config.enableSecurityLogging) {
       for (const violation of validation.violations) {
         logSecurity('suspicious_activity', 'medium', {
           url: request.url,
           method: request.method,
           userAgent: request.headers.get('user-agent') || 'unknown',
           ip: request.headers.get('x-forwarded-for') || 'unknown',
           details: validation.details,
           violationType: violation,
         });

         // Trigger alerts for critical violations
         if (violation === SecurityViolationType.OVERSIZED_REQUEST) {
           alertManager.checkAlerts({
             securityEvent: 'suspicious_activity',
             ip: request.headers.get('x-forwarded-for') || 'unknown',
             details: `Oversized request: ${validation.details.contentLength} bytes`,
           });
         }
       }
     }

    // Block severely malicious requests
    if (validation.violations.includes(SecurityViolationType.OVERSIZED_REQUEST)) {
      return new NextResponse('Request too large', { status: 413 });
    }

    // Create or enhance response
    const secureResponse = response || NextResponse.next();

    // Generate and apply security headers
    const cspHeaders = this.cspGenerator.getCSPHeaders();
    const corsHeaders = this.corsManager.getCORSHeaders(request);
    const securityHeaders = this.headersManager.generateSecurityHeaders(cspHeaders);

    // Apply all headers
    Object.entries({ ...corsHeaders, ...securityHeaders }).forEach(([key, value]) => {
      secureResponse.headers.set(key, value);
    });

    // Add nonce to response for script/style tags
    const nonce = this.cspGenerator.getNonce();
    if (nonce) {
      secureResponse.headers.set('X-CSP-Nonce', nonce);
    }

    // Log security middleware performance
    const duration = Date.now() - startTime;
    if (duration > 50) { // Log if security middleware is slow
      securityLogger.warn('Security middleware performance issue', {
        duration,
        url: request.url,
        method: request.method,
      });
    }

    return secureResponse;
  }

  /**
   * Get CSP nonce for inline scripts/styles
   */
  getCSPNonce(): string | undefined {
    return this.cspGenerator.getNonce();
  }

  /**
   * Create security middleware wrapper for API routes
   */
  withSecurity<T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      try {
        // Apply security checks first
        const securityResponse = await this.applySecurityMiddleware(request);
        
        // If security middleware returns a blocking response, return it
        if (securityResponse.status !== 200 && securityResponse.body) {
          return securityResponse;
        }

        // Execute the handler
        const handlerResponse = await handler(request, ...args);

        // Apply security headers to the handler response
        return await this.applySecurityMiddleware(request, handlerResponse);
      } catch (error) {
        securityLogger.error('Security middleware error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          url: request.url,
          method: request.method,
        }, error instanceof Error ? error : undefined);

        // Return secure error response
        const errorResponse = NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
        
        return await this.applySecurityMiddleware(request, errorResponse);
      }
    };
  }
}

// Create default security middleware instance
export const securityMiddleware = new SecurityMiddleware();

// Utility functions for common security patterns
export const withSecurity = securityMiddleware.withSecurity.bind(securityMiddleware);

export const getCSPNonce = (): string | undefined => {
  return securityMiddleware.getCSPNonce();
};

// Initialize security middleware
if (typeof window === 'undefined') {
  securityLogger.info('Security middleware initialized', {
    cspEnabled: DEFAULT_SECURITY_CONFIG.enableCSP,
    hstsEnabled: DEFAULT_SECURITY_CONFIG.enableHSTS,
    corsEnabled: DEFAULT_SECURITY_CONFIG.enableCORS,
    environment: config.isDevelopment ? 'development' : 'production',
  });
} 