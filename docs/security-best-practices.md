# Security Best Practices - QuizForce

This document outlines the comprehensive security measures implemented in QuizForce to protect against common web vulnerabilities and ensure production-grade security.

## 🛡️ Security Architecture Overview

QuizForce implements a multi-layered security approach with the following components:

1. **Enhanced Security Headers** - CSP, HSTS, CORS, and additional protection headers
2. **Advanced Rate Limiting** - Intelligent rate limiting with Redis backend
3. **CSRF Protection** - Token-based CSRF protection for all state-changing operations
4. **Input Sanitization** - Comprehensive XSS and injection attack prevention
5. **Security Monitoring** - Real-time security event logging and alerting
6. **Authentication Security** - Standardized auth patterns with JWT verification

## 🔒 Security Headers Implementation

### Content Security Policy (CSP)
- **Nonce-based CSP**: Dynamic nonce generation for inline scripts/styles
- **Strict Directives**: Blocks unsafe-inline and unsafe-eval in production
- **Trusted Sources**: Only allows vetted external resources (Stripe, Supabase, Google Fonts)
- **Violation Reporting**: CSP violations reported to `/api/security/csp-report`

```typescript
// CSP Configuration
script-src 'self' 'nonce-{random}' https://js.stripe.com
style-src 'self' 'nonce-{random}' 'unsafe-inline' https://fonts.googleapis.com
img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com
connect-src 'self' https://*.supabase.co https://api.stripe.com
```

### HTTP Strict Transport Security (HSTS)
- **Enabled in Production**: Forces HTTPS connections
- **Preload Ready**: Configured for HSTS preload list inclusion
- **Subdomain Protection**: Includes all subdomains

### Additional Security Headers
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff (prevents MIME sniffing)
- **X-XSS-Protection**: 1; mode=block (legacy XSS protection)
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricts dangerous browser features

## ⚡ Rate Limiting Strategy

### Multi-Tier Rate Limiting
- **Authentication Routes**: 5 requests/minute (login, signup, password reset)
- **API Routes**: 100 requests/minute (general API access)
- **Upload Routes**: 10 requests/hour (file uploads)
- **Checkout Routes**: 20 requests/hour (payment processing)

### Implementation Details
- **Redis Backend**: Uses Upstash Redis for distributed rate limiting
- **Sliding Window**: Implements sliding window algorithm for smooth rate limiting
- **IP-based Tracking**: Tracks requests by client IP address
- **Graceful Degradation**: Falls back to memory-based limiting if Redis unavailable

```typescript
// Rate Limiting Configuration
const rateLimiters = {
  auth: rateLimit(5, "1 m"),      // 5 requests per minute
  api: rateLimit(100, "1 m"),     // 100 requests per minute
  upload: rateLimit(10, "1 h"),   // 10 requests per hour
  checkout: rateLimit(20, "1 h"), // 20 requests per hour
};
```

## 🔐 CSRF Protection

### Token-Based Protection
- **Dual Token System**: Uses both cookie and header tokens
- **Secure Storage**: Tokens stored in HTTP-only cookies
- **Automatic Validation**: Middleware validates all state-changing requests
- **Edge Runtime Compatible**: Works with Next.js Edge Runtime

### Implementation
- **GET/HEAD/OPTIONS**: Exempt from CSRF validation
- **POST/PUT/PATCH/DELETE**: Require valid CSRF token
- **Webhook Endpoints**: Exempt (use signature validation instead)

## 🧹 Input Sanitization

### Multi-Layer Sanitization
- **HTML Sanitization**: Uses DOMPurify for safe HTML rendering
- **XSS Prevention**: Strips dangerous scripts and event handlers
- **SQL Injection Protection**: Removes SQL keywords and dangerous characters
- **Command Injection Prevention**: Blocks shell metacharacters

### Sanitization Levels
1. **Strict**: No HTML allowed, plain text only
2. **Basic**: Simple formatting tags only (p, br, strong, em)
3. **Rich**: Extended formatting with links and images

```typescript
// Sanitization Examples
const sanitized = sanitizeHtml(userInput, 'comment');
const plainText = sanitizeText(userInput, 'username');
const safeQuery = sanitizeSql(searchTerm, 'search');
```

### Dangerous Pattern Detection
Automatically detects and logs:
- XSS attempts (script tags, javascript: URLs, event handlers)
- SQL injection patterns (UNION, SELECT, OR 1=1)
- Command injection (shell metacharacters)
- Path traversal attempts (../)
- LDAP injection patterns

## 📊 Security Monitoring & Alerting

### Real-Time Security Events
- **CSP Violations**: Automatic detection and reporting
- **Rate Limit Exceeded**: Tracks potential DDoS attempts
- **Authentication Failures**: Monitors brute force attempts
- **Suspicious Input**: Detects injection attack attempts

### Alert System
- **7 Pre-configured Rules**: From slow requests to security breaches
- **Smart Cooldowns**: Prevents alert spam with configurable delays
- **Severity Levels**: Low, Medium, High, Critical classifications
- **Sentry Integration**: Automatic error reporting and tracking

```typescript
// Security Alert Rules
1. Critical Slow Request (>10s) - 5min cooldown
2. High Error Rate (>10%) - 10min cooldown
3. Database Connection Failure - 2min cooldown
4. Security Breach Attempt - 1min cooldown
5. High Memory Usage (>85%) - 15min cooldown
6. Payment Failure Spike (>5%) - 5min cooldown
7. Exam Completion Anomaly (<10%) - 30min cooldown
```

## 🔍 CORS Configuration

### Strict Origin Control
- **Development**: Allows localhost origins
- **Production**: Restricted to configured domains
- **Credentials**: Supports credentials for authenticated requests
- **Preflight Handling**: Proper OPTIONS request handling

### Allowed Methods & Headers
- **Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization, X-CSRF-Token, X-Requested-With
- **Max Age**: 24-hour preflight cache

## 🚨 Security Incident Response

### Automatic Response
1. **Oversized Requests**: Immediate 413 response
2. **CORS Violations**: 403 response with logging
3. **CSP Violations**: Logged and reported to security team
4. **Rate Limit Exceeded**: 429 response with retry-after header

### Manual Response Procedures
1. **Security Alert Received**: Investigate Sentry reports
2. **Pattern Analysis**: Review security logs for attack patterns
3. **IP Blocking**: Implement temporary IP blocks if needed
4. **Incident Documentation**: Document and learn from incidents

## 🔧 Security Configuration

### Environment Variables
```bash
# Security Configuration
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Next.js Security
NEXTAUTH_SECRET=your_secure_secret_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Production Checklist
- [ ] HTTPS enforced (HSTS enabled)
- [ ] CSP headers configured and tested
- [ ] Rate limiting configured with Redis
- [ ] CSRF protection enabled
- [ ] Input sanitization implemented
- [ ] Security monitoring active
- [ ] Error tracking configured
- [ ] Security headers verified

## 🔍 Security Testing

### Automated Testing
- **CSP Validation**: Test CSP headers with browser dev tools
- **Rate Limiting**: Verify rate limits with load testing
- **Input Sanitization**: Test with OWASP XSS payloads
- **CSRF Protection**: Verify token validation works

### Manual Security Testing
1. **Browser Security Headers**: Use securityheaders.com
2. **SSL Configuration**: Test with ssllabs.com
3. **Vulnerability Scanning**: Use OWASP ZAP or similar tools
4. **Penetration Testing**: Regular professional security audits

### Security Test Commands
```bash
# Test CSP headers
curl -I https://your-domain.com

# Test rate limiting
for i in {1..10}; do curl -X POST https://your-domain.com/api/auth/signin; done

# Test CSRF protection
curl -X POST https://your-domain.com/api/exam/start -H "Content-Type: application/json"
```

## 📚 Security Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)

### Tools
- [OWASP ZAP](https://www.zaproxy.org/) - Security testing
- [Security Headers](https://securityheaders.com/) - Header analysis
- [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL testing

## 🚀 Security Maintenance

### Regular Tasks
- **Weekly**: Review security logs and alerts
- **Monthly**: Update dependencies for security patches
- **Quarterly**: Review and update CSP policies
- **Annually**: Comprehensive security audit

### Monitoring Dashboards
- **Sentry**: Error tracking and performance monitoring
- **Upstash**: Redis performance and rate limiting metrics
- **Next.js**: Application performance and security metrics

---

**Last Updated**: December 2024  
**Next Review**: March 2025  
**Security Contact**: security@quizforce.com 