/**
 * API Cookie Helpers
 *
 * Utilities for managing cookies securely in API routes and server actions.
 * These helpers ensure proper security configurations for different cookie types.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SecureCookieOptions,
  CookieSecurityValidator,
  AUTH_COOKIE_OPTIONS,
  SESSION_COOKIE_OPTIONS,
  PREFERENCE_COOKIE_OPTIONS,
  ANALYTICS_COOKIE_OPTIONS,
} from "./cookie-security";

/**
 * Server-side cookie manager for API routes
 */
export class ApiCookieManager {
  private cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;
  private response: NextResponse | null = null;

  constructor(response?: NextResponse) {
    this.response = response || null;
  }

  /**
   * Initialize cookie store (for use in Server Components and API routes)
   */
  private async getCookieStore() {
    if (!this.cookieStore) {
      this.cookieStore = await cookies();
    }
    return this.cookieStore;
  }

  /**
   * Set a secure cookie in API routes
   */
  async setApiCookie(
    name: string,
    value: string,
    options: SecureCookieOptions = {}
  ): Promise<void> {
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

    try {
      if (this.response) {
        // If we have a response object (middleware context)
        this.response.cookies.set(name, value, options);
      } else {
        // If we're in a Server Component or API route
        const cookieStore = await this.getCookieStore();
        cookieStore.set(name, value, options);
      }
    } catch (error) {
      console.error(`Failed to set cookie ${name}:`, error);
      throw new Error(`Failed to set cookie ${name}`);
    }
  }

  /**
   * Get a cookie value in API routes
   */
  async getApiCookie(name: string): Promise<string | undefined> {
    try {
      const cookieStore = await this.getCookieStore();
      return cookieStore.get(name)?.value;
    } catch (error) {
      console.error(`Failed to get cookie ${name}:`, error);
      return undefined;
    }
  }

  /**
   * Remove a cookie in API routes
   */
  async removeApiCookie(
    name: string,
    options: Partial<SecureCookieOptions> = {}
  ): Promise<void> {
    const removeOptions: SecureCookieOptions = {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      ...options,
      maxAge: 0,
      expires: new Date(0),
    };

    await this.setApiCookie(name, "", removeOptions);
  }

  /**
   * Set an authentication cookie
   */
  async setAuthCookie(name: string, value: string): Promise<void> {
    await this.setApiCookie(name, value, AUTH_COOKIE_OPTIONS);
  }

  /**
   * Set a session cookie
   */
  async setSessionCookie(name: string, value: string): Promise<void> {
    await this.setApiCookie(name, value, SESSION_COOKIE_OPTIONS);
  }

  /**
   * Set a preference cookie
   */
  async setPreferenceCookie(name: string, value: string): Promise<void> {
    await this.setApiCookie(name, value, PREFERENCE_COOKIE_OPTIONS);
  }

  /**
   * Set an analytics cookie
   */
  async setAnalyticsCookie(name: string, value: string): Promise<void> {
    await this.setApiCookie(name, value, ANALYTICS_COOKIE_OPTIONS);
  }

  /**
   * Clear all authentication-related cookies
   */
  async clearAuthCookies(): Promise<void> {
    const cookieStore = await this.getCookieStore();
    const allCookies = cookieStore.getAll();

    const authCookiePatterns = [
      /^sb-.*-auth-token.*$/,
      /^__Host-csrf-token$/,
      /^session-.*$/,
      /^auth-.*$/,
    ];

    for (const cookie of allCookies) {
      const shouldClear = authCookiePatterns.some(pattern =>
        pattern.test(cookie.name)
      );

      if (shouldClear) {
        await this.removeApiCookie(cookie.name);
      }
    }
  }

  /**
   * Get all cookies as a record
   */
  async getAllCookies(): Promise<Record<string, string>> {
    try {
      const cookieStore = await this.getCookieStore();
      const allCookies = cookieStore.getAll();

      const cookieRecord: Record<string, string> = {};
      for (const cookie of allCookies) {
        cookieRecord[cookie.name] = cookie.value;
      }

      return cookieRecord;
    } catch (error) {
      console.error("Failed to get all cookies:", error);
      return {};
    }
  }
}

/**
 * Utility functions for API routes
 */
export class ApiCookieUtils {
  /**
   * Create a response with secure cookies set
   */
  static createResponseWithCookies(
    data: any,
    cookies: Array<{
      name: string;
      value: string;
      options?: SecureCookieOptions;
    }>,
    status: number = 200
  ): NextResponse {
    const response = NextResponse.json(data, { status });

    for (const cookie of cookies) {
      const options = cookie.options || {};
      const validation = CookieSecurityValidator.validateOptions(options);

      if (!validation.isSecure) {
        console.error("Cookie security validation failed:", validation.errors);
        continue;
      }

      response.cookies.set(cookie.name, cookie.value, options);
    }

    return response;
  }

  /**
   * Extract cookies from request
   */
  static extractCookiesFromRequest(
    request: NextRequest
  ): Record<string, string> {
    const cookies: Record<string, string> = {};

    for (const cookie of request.cookies.getAll()) {
      cookies[cookie.name] = cookie.value;
    }

    return cookies;
  }

  /**
   * Validate request cookies for security
   */
  static validateRequestCookies(request: NextRequest): {
    secure: string[];
    insecure: string[];
    warnings: Record<string, string[]>;
  } {
    const secure: string[] = [];
    const insecure: string[] = [];
    const warnings: Record<string, string[]> = {};

    for (const cookie of request.cookies.getAll()) {
      const { name } = cookie;

      if (name.startsWith("__Host-") || name.startsWith("__Secure-")) {
        secure.push(name);
      } else if (
        name.includes("auth") ||
        name.includes("session") ||
        name.includes("csrf")
      ) {
        insecure.push(name);
        warnings[name] = [
          "Should use __Host- or __Secure- prefix for security",
        ];
      } else {
        secure.push(name);
      }
    }

    return { secure, insecure, warnings };
  }

  /**
   * Create a secure cookie string for Set-Cookie header
   */
  static createSecureCookieString(
    name: string,
    value: string,
    options: SecureCookieOptions = {}
  ): string {
    const validation = CookieSecurityValidator.validateOptions(options);

    if (!validation.isSecure) {
      throw new Error(`Insecure cookie configuration for ${name}`);
    }

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (options.maxAge !== undefined) {
      cookieString += `; Max-Age=${options.maxAge}`;
    }

    if (options.expires) {
      cookieString += `; Expires=${options.expires.toUTCString()}`;
    }

    if (options.path) {
      cookieString += `; Path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; Domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += "; Secure";
    }

    if (options.httpOnly) {
      cookieString += "; HttpOnly";
    }

    if (options.sameSite) {
      cookieString += `; SameSite=${options.sameSite}`;
    }

    return cookieString;
  }
}

/**
 * Higher-order function to add cookie security to API handlers
 */
export function withSecureCookies<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Validate incoming cookies
    const validation = ApiCookieUtils.validateRequestCookies(request);

    if (validation.insecure.length > 0) {
      console.warn("Insecure cookies detected:", validation.insecure);
    }

    try {
      const response = await handler(request, ...args);

      // Add security headers to response
      response.headers.set(
        "Set-Cookie-Security-Policy",
        "secure; samesite=lax; httponly"
      );

      return response;
    } catch (error) {
      console.error("API handler error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware helper for cookie security
 */
export function enhanceRequestWithCookieSecurity(
  request: NextRequest
): NextRequest {
  // Log cookie security status in development
  if (process.env.NODE_ENV === "development") {
    const validation = ApiCookieUtils.validateRequestCookies(request);

    if (
      validation.insecure.length > 0 ||
      Object.keys(validation.warnings).length > 0
    ) {
      console.log("🍪 Cookie Security Analysis:");
      console.log("  Secure cookies:", validation.secure);
      console.log("  Insecure cookies:", validation.insecure);
      console.log("  Warnings:", validation.warnings);
    }
  }

  return request;
}

/**
 * Factory function to create API cookie manager
 */
export function createApiCookieManager(
  response?: NextResponse
): ApiCookieManager {
  return new ApiCookieManager(response);
}

/**
 * Convenience functions for common cookie operations
 */
export const apiCookies = {
  /**
   * Set a secure cookie in API route
   */
  async set(
    name: string,
    value: string,
    options: SecureCookieOptions = {}
  ): Promise<void> {
    const manager = new ApiCookieManager();
    await manager.setApiCookie(name, value, options);
  },

  /**
   * Get a cookie value in API route
   */
  async get(name: string): Promise<string | undefined> {
    const manager = new ApiCookieManager();
    return await manager.getApiCookie(name);
  },

  /**
   * Remove a cookie in API route
   */
  async remove(
    name: string,
    options: Partial<SecureCookieOptions> = {}
  ): Promise<void> {
    const manager = new ApiCookieManager();
    await manager.removeApiCookie(name, options);
  },

  /**
   * Set authentication cookie
   */
  async setAuth(name: string, value: string): Promise<void> {
    const manager = new ApiCookieManager();
    await manager.setAuthCookie(name, value);
  },

  /**
   * Set session cookie
   */
  async setSession(name: string, value: string): Promise<void> {
    const manager = new ApiCookieManager();
    await manager.setSessionCookie(name, value);
  },

  /**
   * Clear all auth cookies
   */
  async clearAuth(): Promise<void> {
    const manager = new ApiCookieManager();
    await manager.clearAuthCookies();
  },
};
