/**
 * Authentication Middleware for API Routes
 * 
 * Provides consistent authentication and authorization patterns across all API routes.
 * Uses JWT verification with Supabase Auth helpers for secure and reliable auth checking.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { config } from "./config";
import type { User } from "@supabase/supabase-js";

// Types for auth middleware
export interface AuthenticatedUser extends User {
  role?: string;
}

export interface AuthContext {
  user: AuthenticatedUser;
  supabase: ReturnType<typeof createServerClient>;
}

export interface AuthOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  allowedRoles?: string[];
}

export interface AuthMiddlewareResult {
  success: boolean;
  context?: AuthContext;
  response?: NextResponse;
  error?: string;
}

/**
 * Create a server Supabase client for auth middleware
 */
function createAuthSupabaseClient(request: NextRequest) {
  return createServerClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // In middleware context, we can't set cookies
          // They will be set by the response handling
        },
        remove(name: string, options: any) {
          // In middleware context, we can't remove cookies
          // They will be removed by the response handling
        },
      },
    }
  );
}

/**
 * Extract user from Supabase auth
 */
async function extractUser(
  supabase: ReturnType<typeof createServerClient>
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Auth extraction error:", authError);
      return { user: null, error: authError.message };
    }
    
    return { user, error: null };
  } catch (error) {
    console.error("User extraction error:", error);
    return { 
      user: null, 
      error: error instanceof Error ? error.message : "Authentication failed" 
    };
  }
}

/**
 * Get user role from profiles table
 */
async function getUserRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<{ role: string | null; error: string | null }> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return { role: null, error: "Failed to fetch user profile" };
    }

    return { role: profile?.role || "user", error: null };
  } catch (error) {
    console.error("Role fetch error:", error);
    return { 
      role: null, 
      error: error instanceof Error ? error.message : "Failed to fetch user role" 
    };
  }
}

/**
 * Create standardized error responses
 */
export const authResponses = {
  unauthorized: (message: string = "Authentication required") =>
    NextResponse.json(
      { 
        success: false, 
        error: message,
        code: "UNAUTHORIZED" 
      },
      { status: 401 }
    ),
    
  forbidden: (message: string = "Insufficient permissions") =>
    NextResponse.json(
      { 
        success: false, 
        error: message,
        code: "FORBIDDEN" 
      },
      { status: 403 }
    ),
    
  serverError: (message: string = "Authentication error") =>
    NextResponse.json(
      { 
        success: false, 
        error: message,
        code: "INTERNAL_ERROR" 
      },
      { status: 500 }
    ),
};

/**
 * Main authentication middleware
 */
export async function withAuth(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<AuthMiddlewareResult> {
  const {
    requireAuth = true,
    requireAdmin = false,
    allowedRoles = [],
  } = options;

  try {
    // Create Supabase client
    const supabase = createAuthSupabaseClient(request);
    
    // Extract user from JWT token
    const { user, error: userError } = await extractUser(supabase);
    
    // Handle authentication requirement
    if (requireAuth && (!user || userError)) {
      return {
        success: false,
        response: authResponses.unauthorized(
          userError || "Valid authentication token required"
        ),
        error: userError || "No valid authentication token",
      };
    }
    
    // If no auth required and no user, allow through
    if (!requireAuth && !user) {
      return {
        success: true,
        context: {
          user: {} as AuthenticatedUser, // Empty user object for consistency
          supabase,
        },
      };
    }
    
    // Get user role if authenticated
    let userRole = "user";
    if (user) {
      const { role, error: roleError } = await getUserRole(supabase, user.id);
      
      if (roleError) {
        return {
          success: false,
          response: authResponses.serverError(roleError),
          error: roleError,
        };
      }
      
      userRole = role || "user";
    }
    
    // Create authenticated user object
    const authenticatedUser: AuthenticatedUser = {
      ...user!,
      role: userRole,
    };
    
    // Check admin requirement
    if (requireAdmin && userRole !== "admin") {
      return {
        success: false,
        response: authResponses.forbidden("Admin access required"),
        error: "User is not an admin",
      };
    }
    
    // Check allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return {
        success: false,
        response: authResponses.forbidden(
          `Access denied. Required roles: ${allowedRoles.join(", ")}`
        ),
        error: `User role '${userRole}' not in allowed roles`,
      };
    }
    
    // Success - return auth context
    return {
      success: true,
      context: {
        user: authenticatedUser,
        supabase,
      },
    };
    
  } catch (error) {
    console.error("Auth middleware error:", error);
    return {
      success: false,
      response: authResponses.serverError("Authentication system error"),
      error: error instanceof Error ? error.message : "Unknown auth error",
    };
  }
}

/**
 * Convenience wrapper for routes that require authentication
 */
export async function requireAuth(
  request: NextRequest,
  options: Omit<AuthOptions, "requireAuth"> = {}
): Promise<AuthMiddlewareResult> {
  return withAuth(request, { ...options, requireAuth: true });
}

/**
 * Convenience wrapper for routes that require admin access
 */
export async function requireAdmin(
  request: NextRequest,
  options: Omit<AuthOptions, "requireAuth" | "requireAdmin"> = {}
): Promise<AuthMiddlewareResult> {
  return withAuth(request, { ...options, requireAuth: true, requireAdmin: true });
}

/**
 * Convenience wrapper for optional authentication
 */
export async function optionalAuth(
  request: NextRequest,
  options: Omit<AuthOptions, "requireAuth"> = {}
): Promise<AuthMiddlewareResult> {
  return withAuth(request, { ...options, requireAuth: false });
}

/**
 * Higher-order function to wrap API route handlers with authentication
 */
export function withAuthHandler<T extends any[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await withAuth(request, options);
    
    if (!authResult.success || !authResult.context) {
      return authResult.response!;
    }
    
    return handler(request, authResult.context, ...args);
  };
}

/**
 * Decorator for admin-only API routes
 */
export function adminOnly<T extends any[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<NextResponse>
) {
  return withAuthHandler(handler, { requireAdmin: true });
}

/**
 * Decorator for authenticated API routes
 */
export function authenticated<T extends any[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<NextResponse>
) {
  return withAuthHandler(handler, { requireAuth: true });
}

/**
 * Decorator for routes with optional authentication
 */
export function maybeAuthenticated<T extends any[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<NextResponse>
) {
  return withAuthHandler(handler, { requireAuth: false });
}

/**
 * Utility to check if user has specific permissions
 */
export function hasPermission(
  user: AuthenticatedUser,
  permission: string
): boolean {
  // For now, admins have all permissions
  if (user.role === "admin") {
    return true;
  }
  
  // Add more granular permission checking here as needed
  // This could be extended with role-based permissions in the future
  
  return false;
}

/**
 * JWT token validation utility (for custom verification if needed)
 */
export async function validateJWT(token: string): Promise<{
  valid: boolean;
  user?: User;
  error?: string;
}> {
  try {
    // Create a temporary client for token validation
    const supabase = createServerClient(
      config.supabase.url,
      config.supabase.anonKey,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return {
        valid: false,
        error: error?.message || "Invalid token",
      };
    }
    
    return {
      valid: true,
      user,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Token validation failed",
    };
  }
}

/**
 * Rate limiting integration (if needed)
 */
export async function withRateLimit(
  request: NextRequest,
  identifier?: string
): Promise<{ allowed: boolean; response?: NextResponse }> {
  // This can be integrated with your existing rate limiter
  // For now, always allow (rate limiting is handled elsewhere)
  return { allowed: true };
}

/**
 * Audit logging for authenticated actions
 */
export async function logAuthAction(
  user: AuthenticatedUser,
  action: string,
  resource?: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    // Log to console in development
    if (config.isDevelopment) {
      console.log("Auth Action:", {
        userId: user.id,
        email: user.email,
        role: user.role,
        action,
        resource,
        details,
        timestamp: new Date().toISOString(),
      });
    }
    
    // TODO: Implement database logging when audit_logs table is ready
    // This could integrate with your existing audit logging system
  } catch (error) {
    console.error("Failed to log auth action:", error);
  }
} 