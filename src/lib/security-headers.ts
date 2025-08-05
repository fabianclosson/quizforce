/**
 * Security Headers Configuration for QuizForce
 *
 * This module provides Content Security Policy (CSP) and other security headers
 * to protect against XSS, clickjacking, and other web vulnerabilities.
 */

/**
 * Generate Content Security Policy header string
 *
 * This CSP is configured for our Next.js app with Supabase and Stripe integration.
 * It follows security best practices while allowing necessary third-party resources.
 *
 * @param nonce - Optional nonce for inline scripts/styles
 * @returns CSP header string
 */
export function generateCSPHeader(nonce?: string): string {
  const nonceStr = nonce ? `'nonce-${nonce}'` : "";

  const directives = [
    // Default fallback for all resource types
    "default-src 'self'",

    // Scripts: Allow self, nonce (if provided), unsafe-inline (for Next.js), and Stripe
    `script-src 'self' ${nonceStr} 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.jsdelivr.net https://vercel.live`.trim(),

    // Styles: Allow self, nonce, inline styles (for CSS-in-JS), and Google Fonts
    `style-src 'self' ${nonceStr} 'unsafe-inline' https://fonts.googleapis.com`.trim(),

    // Images: Allow self, data URLs, Supabase storage, and Google profile images
    "img-src 'self' data: https://*.supabase.co https://*.stripe.com https://lh3.googleusercontent.com",

    // AJAX/WebSocket/Fetch: Allow self, Supabase API, and Stripe API
    "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co",

    // Fonts: Allow self and Google Fonts
    "font-src 'self' https://fonts.gstatic.com",

    // Frames/iframes: Only allow Stripe checkout
    "frame-src https://js.stripe.com",

    // Objects/plugins: Block all
    "object-src 'none'",

    // Base URI: Only allow self
    "base-uri 'self'",

    // Form submissions: Only allow self
    "form-action 'self'",

    // Frame ancestors: Prevent embedding (clickjacking protection)
    "frame-ancestors 'none'",

    // Block mixed content
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

/**
 * Get all security headers for the application
 *
 * @param isDevelopment - Whether we're in development mode
 * @param nonce - Optional nonce for CSP
 * @returns Object with security headers
 */
export function getSecurityHeaders(isDevelopment = false, nonce?: string) {
  // Use report-only mode in development or on Vercel until we fine-tune CSP
  const isVercel = process.env.VERCEL === '1';
  const useReportOnly = isDevelopment || isVercel;
  
  const cspHeaderName = useReportOnly
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy";

  return [
    {
      key: cspHeaderName,
      value: generateCSPHeader(nonce),
    },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
  ];
}

/**
 * Development-friendly CSP that's less restrictive
 * Used during development to avoid breaking hot reloading and dev tools
 */
export function getDevelopmentCSP(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com https://lh3.googleusercontent.com",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com ws: wss:",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  return directives.join("; ");
}
