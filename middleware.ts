import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { validateCSRFMiddleware } from "./src/lib/csrf";
import { rateLimiters, getClientIdentifier } from "./src/lib/rate-limiter";
import {
  SecureCookieManager,
  enhanceResponseWithCookieSecurity,
  logCookieSecurityStatus,
  AUTH_COOKIE_OPTIONS,
} from "./src/lib/cookie-security";
import { config as appConfig } from "./src/lib/config";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Log cookie security status in development
  logCookieSecurityStatus(request);

  // Handle rate limiting and CSRF protection for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    try {
      // Apply rate limiting first
      const rateLimitResult = await handleRateLimit(request);
      if (rateLimitResult) {
        return rateLimitResult;
      }

      // Then apply CSRF protection
      await handleCSRFProtection(request);
    } catch (error) {
      console.error("API middleware error:", error);
      if (
        error instanceof Error &&
        error.message === "Invalid or missing CSRF token"
      ) {
        return new NextResponse("Invalid or missing CSRF token", {
          status: 403,
        });
      }
      return new NextResponse("Internal server error", { status: 500 });
    }
  }

  // Continue with existing authentication logic for non-API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    const supabase = createServerClient(
          appConfig.supabase.url,
        appConfig.supabase.anonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options) {
            // Enhance cookie security for Supabase auth cookies
            const enhancedOptions = name.includes("auth")
              ? {
                  ...options,
                  ...AUTH_COOKIE_OPTIONS,
                  // Preserve any Supabase-specific options
                  ...(options || {}),
                }
              : options;

            response.cookies.set({ name, value, ...enhancedOptions });
          },
          remove(name: string, options) {
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Refresh session if expired - required for Server Components
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Define protected routes
    const protectedRoutes = ["/dashboard", "/exam", "/profile", "/admin"];

    // Define auth routes (should redirect to dashboard if logged in)
    const authRoutes = [
      "/auth/signin",
      "/auth/signup",
      "/auth/forgot-password",
    ];

    const isProtectedRoute = protectedRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );

    const isAuthRoute = authRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );

    // Handle protected routes
    if (isProtectedRoute && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signin";
      url.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Handle auth routes (redirect to dashboard if already logged in)
    if (isAuthRoute && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Admin routes - require admin role
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/signin";
        url.searchParams.set("redirectTo", request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }

      // Check for admin role in user metadata
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  // Enhance response with cookie security headers
  response = enhanceResponseWithCookieSecurity(response);

  return response;
}

/**
 * Handle rate limiting for API routes
 *
 * @param request - The Next.js request object
 * @returns Response if rate limited, null if allowed
 */
async function handleRateLimit(request: NextRequest): Promise<Response | null> {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Skip rate limiting for webhooks (they have their own validation)
  const skipRateLimitRoutes = ["/api/webhooks/"];

  const shouldSkipRateLimit = skipRateLimitRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (shouldSkipRateLimit) {
    return null;
  }

  // Select appropriate rate limiter based on endpoint
  let limiter;
  const clientId = getClientIdentifier(request);

  if (
    pathname.includes("/auth/") ||
    pathname.includes("/signin") ||
    pathname.includes("/signup")
  ) {
    limiter = rateLimiters.auth;
  } else if (pathname.includes("/checkout")) {
    limiter = rateLimiters.checkout;
  } else if (pathname.includes("/upload")) {
    limiter = rateLimiters.upload;
  } else if (pathname.includes("/password") || pathname.includes("/reset")) {
    limiter = rateLimiters.passwordReset;
  } else {
    limiter = rateLimiters.api;
  }

  try {
    const result = await limiter(clientId);

    if (!result.success) {
      const headers = new Headers({
        "Content-Type": "application/json",
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
      });

      if (result.retryAfter) {
        headers.set("Retry-After", result.retryAfter.toString());
      }

      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: "Too many requests, please try again later",
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers,
        }
      );
    }

    return null; // Allow request to continue
  } catch (error) {
    console.error("Rate limiting error:", error);
    // If rate limiting fails, allow the request to continue
    // This ensures the app doesn't break if there are rate limiting issues
    return null;
  }
}

/**
 * Handle CSRF protection for API routes
 *
 * @param request - The Next.js request object
 */
async function handleCSRFProtection(request: NextRequest): Promise<void> {
  // Use the new Edge Runtime compatible CSRF validation
  const isValid = await validateCSRFMiddleware(request);

  if (!isValid) {
    throw new Error("Invalid or missing CSRF token");
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
