/**
 * Cookie Security Configuration
 *
 * This module provides secure cookie configurations and utilities
 * for maintaining proper cookie security throughout the application.
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Secure cookie configuration options
 */
export interface SecureCookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
}

/**
 * Default secure cookie configuration
 */
export const DEFAULT_SECURE_COOKIE_OPTIONS: SecureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax", // Good balance for auth flows
  path: "/",
  // maxAge and expires should be set per cookie type
};

/**
 * Authentication cookie configuration
 * Used for session management and user authentication
 */
export const AUTH_COOKIE_OPTIONS: SecureCookieOptions = {
  ...DEFAULT_SECURE_COOKIE_OPTIONS,
  sameSite: "lax", // Required for OAuth redirects
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/**
 * CSRF cookie configuration
 * Already implemented in csrf.ts but documented here for reference
 */
export const CSRF_COOKIE_OPTIONS: SecureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict", // Strict for CSRF tokens
  path: "/",
  maxAge: 60 * 60 * 24, // 24 hours
};

/**
 * Session cookie configuration
 * For temporary session data
 */
export const SESSION_COOKIE_OPTIONS: SecureCookieOptions = {
  ...DEFAULT_SECURE_COOKIE_OPTIONS,
  sameSite: "strict",
  maxAge: 60 * 60 * 2, // 2 hours
};

/**
 * Preference cookie configuration
 * For user preferences (theme, language, etc.)
 */
export const PREFERENCE_COOKIE_OPTIONS: SecureCookieOptions = {
  httpOnly: false, // Preferences need to be accessible to JavaScript
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 year
};

/**
 * Analytics cookie configuration
 * For analytics and tracking (if implemented)
 */
export const ANALYTICS_COOKIE_OPTIONS: SecureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

/**
 * Cookie security validator
 * Validates that cookies meet security requirements
 */
export class CookieSecurityValidator {
  /**
   * Validate cookie security configuration
   */
  static validateOptions(options: SecureCookieOptions): {
    isSecure: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    let isSecure = true;

    // Check secure flag in production
    if (process.env.NODE_ENV === "production" && !options.secure) {
      errors.push("Secure flag must be true in production");
      isSecure = false;
    }

    // Check SameSite configuration
    if (!options.sameSite) {
      warnings.push("SameSite attribute should be explicitly set");
    } else if (options.sameSite === "none" && !options.secure) {
      errors.push("SameSite=None requires Secure flag");
      isSecure = false;
    }

    // Check path configuration
    if (!options.path) {
      warnings.push("Path should be explicitly set");
    }

    // Check expiration
    if (!options.maxAge && !options.expires) {
      warnings.push("Cookie expiration should be set");
    }

    // Check for overly permissive settings
    if (options.domain && options.domain.startsWith(".")) {
      warnings.push("Wildcard domains increase security risk");
    }

    return { isSecure, warnings, errors };
  }

  /**
   * Get recommended options for a cookie type
   */
  static getRecommendedOptions(cookieType: string): SecureCookieOptions {
    switch (cookieType.toLowerCase()) {
      case "auth":
      case "authentication":
      case "session":
        return AUTH_COOKIE_OPTIONS;
      case "csrf":
        return CSRF_COOKIE_OPTIONS;
      case "preference":
      case "settings":
        return PREFERENCE_COOKIE_OPTIONS;
      case "analytics":
      case "tracking":
        return ANALYTICS_COOKIE_OPTIONS;
      default:
        return DEFAULT_SECURE_COOKIE_OPTIONS;
    }
  }
}

/**
 * Secure cookie manager for middleware and API routes
 */
export class SecureCookieManager {
  private request: NextRequest;
  private response: NextResponse;

  constructor(request: NextRequest, response: NextResponse) {
    this.request = request;
    this.response = response;
  }

  /**
   * Set a secure cookie with proper validation
   */
  setSecureCookie(
    name: string,
    value: string,
    options: SecureCookieOptions = DEFAULT_SECURE_COOKIE_OPTIONS
  ): void {
    const validation = CookieSecurityValidator.validateOptions(options);

    if (!validation.isSecure) {
      console.error("Cookie security validation failed:", validation.errors);
      throw new Error(`Insecure cookie configuration for ${name}`);
    }

    if (validation.warnings.length > 0) {
      console.warn(
        `Cookie security warnings for ${name}:`,
        validation.warnings
      );
    }

    this.response.cookies.set(name, value, options);
  }

  /**
   * Get a cookie value safely
   */
  getCookie(name: string): string | undefined {
    return this.request.cookies.get(name)?.value;
  }

  /**
   * Remove a cookie securely
   */
  removeCookie(name: string, options: Partial<SecureCookieOptions> = {}): void {
    const removeOptions: SecureCookieOptions = {
      ...DEFAULT_SECURE_COOKIE_OPTIONS,
      ...options,
      maxAge: 0,
      expires: new Date(0),
    };

    this.response.cookies.set(name, "", removeOptions);
  }

  /**
   * Clear all authentication-related cookies
   */
  clearAuthCookies(): void {
    const authCookiePatterns = [
      /^sb-.*-auth-token.*$/,
      /^__Host-csrf-token$/,
      /^session-.*$/,
    ];

    // Get all cookie names from request
    const cookieNames = Array.from(
      this.request.cookies.getAll().map(c => c.name)
    );

    cookieNames.forEach(name => {
      const shouldClear = authCookiePatterns.some(pattern =>
        pattern.test(name)
      );
      if (shouldClear) {
        this.removeCookie(name);
      }
    });
  }

  /**
   * Validate all existing cookies meet security standards
   */
  validateExistingCookies(): {
    secure: string[];
    insecure: string[];
    warnings: Record<string, string[]>;
  } {
    const secure: string[] = [];
    const insecure: string[] = [];
    const warnings: Record<string, string[]> = {};

    this.request.cookies.getAll().forEach(({ name, value }) => {
      // This is a basic validation - in a real scenario, you'd need access to the cookie attributes
      // which aren't available in the request object
      if (name.startsWith("__Secure-") || name.startsWith("__Host-")) {
        secure.push(name);
      } else if (
        name.includes("session") ||
        name.includes("auth") ||
        name.includes("csrf")
      ) {
        // These should have secure prefixes
        insecure.push(name);
        warnings[name] = [
          "Should use __Host- or __Secure- prefix for security",
        ];
      } else {
        secure.push(name);
      }
    });

    return { secure, insecure, warnings };
  }
}

/**
 * Cookie security middleware helper
 * Enhances response with secure cookie headers
 */
export function enhanceResponseWithCookieSecurity(
  response: NextResponse
): NextResponse {
  // Add cookie-related security headers
  response.headers.set(
    "Set-Cookie-Security-Policy",
    "secure; samesite=lax; httponly"
  );

  return response;
}

/**
 * Development helper to check cookie security
 */
export function logCookieSecurityStatus(request: NextRequest): void {
  if (process.env.NODE_ENV === "development") {
    const cookies = request.cookies.getAll();

    console.log("🍪 Cookie Security Status:");
    cookies.forEach(({ name, value }) => {
      const isSecure =
        name.startsWith("__Host-") || name.startsWith("__Secure-");
      const status = isSecure ? "✅ Secure" : "⚠️  Check security";
      console.log(`  ${name}: ${status}`);
    });
  }
}

/**
 * Utility to generate secure cookie names with prefixes
 */
export class SecureCookieNaming {
  /**
   * Generate a secure cookie name with __Host- prefix
   * Use for cookies that need maximum security
   */
  static hostPrefixed(name: string): string {
    return `__Host-${name}`;
  }

  /**
   * Generate a secure cookie name with __Secure- prefix
   * Use for cookies that need secure flag but may have domain/path
   */
  static securePrefixed(name: string): string {
    return `__Secure-${name}`;
  }

  /**
   * Check if a cookie name has a security prefix
   */
  static hasSecurityPrefix(name: string): boolean {
    return name.startsWith("__Host-") || name.startsWith("__Secure-");
  }

  /**
   * Get recommended prefix for cookie type
   */
  static getRecommendedPrefix(cookieType: string): string {
    switch (cookieType.toLowerCase()) {
      case "csrf":
      case "session":
      case "auth":
        return "__Host-"; // Maximum security
      case "preference":
      case "analytics":
        return "__Secure-"; // Secure but may need domain/path flexibility
      default:
        return "__Secure-";
    }
  }
}

/**
 * Cookie expiration utilities
 */
export class CookieExpiration {
  /**
   * Get expiration time for different cookie types
   */
  static getExpirationTime(cookieType: string): number {
    switch (cookieType.toLowerCase()) {
      case "csrf":
        return 60 * 60 * 24; // 24 hours
      case "session":
        return 60 * 60 * 2; // 2 hours
      case "auth":
        return 60 * 60 * 24 * 7; // 7 days
      case "preference":
        return 60 * 60 * 24 * 365; // 1 year
      case "analytics":
        return 60 * 60 * 24 * 30; // 30 days
      case "temporary":
        return 60 * 15; // 15 minutes
      default:
        return 60 * 60 * 24; // 24 hours default
    }
  }

  /**
   * Check if a cookie should be expired based on type and creation time
   */
  static shouldExpire(cookieType: string, createdAt: Date): boolean {
    const maxAge = this.getExpirationTime(cookieType);
    const expiresAt = new Date(createdAt.getTime() + maxAge * 1000);
    return new Date() > expiresAt;
  }
}
