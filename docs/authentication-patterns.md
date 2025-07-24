# Authentication Patterns - QuizForce API Routes

This document outlines the standardized authentication patterns implemented in QuizForce API routes using the new `auth-middleware.ts` system.

## Overview

The authentication middleware provides consistent, secure, and maintainable authentication patterns across all API routes. It uses JWT verification with Supabase Auth helpers and supports multiple authentication scenarios.

## Key Benefits

- **Consistent Error Responses**: Standardized error messages and HTTP status codes
- **JWT Verification**: Secure token validation using Supabase Auth
- **Role-Based Access**: Built-in admin and role checking
- **Type Safety**: Full TypeScript support with typed user objects
- **Simplified Code**: Eliminates repetitive auth checking code
- **Centralized Logic**: Single source of truth for authentication

## Authentication Decorators

### `authenticated` - Requires Authentication

For routes that require user authentication:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { authenticated } from "@/lib/auth-middleware";

export const GET = authenticated(async (request: NextRequest, { user, supabase }) => {
  // user is guaranteed to be authenticated
  // supabase client is pre-configured with user context
  
  return NextResponse.json({
    message: `Hello ${user.email}!`,
    userId: user.id,
  });
});
```

### `adminOnly` - Requires Admin Access

For routes that require admin privileges:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { adminOnly } from "@/lib/auth-middleware";

export const POST = adminOnly(async (request: NextRequest, { user, supabase }) => {
  // user is guaranteed to be authenticated AND have admin role
  
  return NextResponse.json({
    message: `Admin action by ${user.email}`,
    role: user.role, // "admin"
  });
});
```

### `maybeAuthenticated` - Optional Authentication

For routes that work with or without authentication:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { maybeAuthenticated } from "@/lib/auth-middleware";

export const GET = maybeAuthenticated(async (request: NextRequest, { user, supabase }) => {
  // user might be null/undefined if not authenticated
  
  if (user) {
    // Provide personalized response
    return NextResponse.json({
      message: `Welcome back, ${user.email}!`,
      isAuthenticated: true,
    });
  } else {
    // Provide public response
    return NextResponse.json({
      message: "Welcome, guest!",
      isAuthenticated: false,
    });
  }
});
```

## Advanced Usage

### Custom Role Requirements

```typescript
import { withAuthHandler } from "@/lib/auth-middleware";

export const POST = withAuthHandler(
  async (request: NextRequest, { user, supabase }) => {
    // Handle the request
    return NextResponse.json({ success: true });
  },
  {
    requireAuth: true,
    allowedRoles: ["admin", "moderator"],
  }
);
```

### Manual Authentication Check

For complex scenarios, you can use the core `withAuth` function:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, {
    requireAuth: true,
    requireAdmin: false,
  });

  if (!authResult.success || !authResult.context) {
    return authResult.response!;
  }

  const { user, supabase } = authResult.context;
  
  // Custom logic here
  return NextResponse.json({ success: true });
}
```

## Error Responses

The middleware provides standardized error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "code": "FORBIDDEN"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Authentication system error",
  "code": "INTERNAL_ERROR"
}
```

## Migration Guide

### Before (Old Pattern)

```typescript
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Check admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    
    // Route logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### After (New Pattern)

```typescript
import { adminOnly } from "@/lib/auth-middleware";

export const GET = adminOnly(async (request: NextRequest, { user, supabase }) => {
  try {
    // Route logic here - user is guaranteed to be admin
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
```

## Route Parameter Support

The middleware supports Next.js route parameters:

```typescript
interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = authenticated(async (
  request: NextRequest,
  { user, supabase },
  { params }: RouteParams
) => {
  const { id } = await params;
  
  // Use the id parameter
  return NextResponse.json({ id, userId: user.id });
});
```

## Best Practices

### 1. Choose the Right Decorator
- Use `authenticated` for user-only routes
- Use `adminOnly` for admin-only routes  
- Use `maybeAuthenticated` for public routes with optional personalization

### 2. Error Handling
```typescript
export const POST = authenticated(async (request: NextRequest, { user, supabase }) => {
  try {
    // Route logic
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
```

### 3. Type Safety
```typescript
import type { AuthenticatedUser } from "@/lib/auth-middleware";

function processUser(user: AuthenticatedUser) {
  // user.role is available and typed
  console.log(`Processing user: ${user.email} (${user.role})`);
}
```

### 4. Logging Actions
```typescript
import { logAuthAction } from "@/lib/auth-middleware";

export const POST = authenticated(async (request: NextRequest, { user, supabase }) => {
  // Log the action
  await logAuthAction(user, "create_exam", "exam", { examId: "123" });
  
  return NextResponse.json({ success: true });
});
```

## Testing Authentication

### Unit Tests
```typescript
import { withAuth } from "@/lib/auth-middleware";

describe("Authentication Middleware", () => {
  it("should reject unauthenticated requests", async () => {
    const mockRequest = new NextRequest("http://localhost/api/test");
    const result = await withAuth(mockRequest, { requireAuth: true });
    
    expect(result.success).toBe(false);
    expect(result.response?.status).toBe(401);
  });
});
```

### Integration Tests
```typescript
describe("API Route Authentication", () => {
  it("should allow authenticated users", async () => {
    const response = await fetch("/api/user/profile", {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    
    expect(response.status).toBe(200);
  });
});
```

## Security Considerations

1. **JWT Validation**: All tokens are validated through Supabase Auth
2. **Role Verification**: User roles are fetched from the database on each request
3. **Error Information**: Minimal error information is exposed to prevent information leakage
4. **Audit Logging**: All authenticated actions can be logged for security auditing

## Troubleshooting

### Common Issues

1. **"User not found" errors**: Ensure the JWT token is valid and the user exists in the profiles table
2. **Role errors**: Verify that user roles are properly set in the profiles table
3. **CORS issues**: Ensure proper CORS configuration for authentication headers

### Debug Mode

Enable debug logging in development:

```typescript
// The middleware automatically logs in development mode
// Check console for authentication debug information
```

## Future Enhancements

1. **Permission System**: Granular permissions beyond role-based access
2. **Rate Limiting**: Integration with rate limiting per user
3. **Session Management**: Advanced session handling and refresh
4. **Multi-factor Authentication**: Support for MFA requirements

---

This authentication system provides a robust foundation for secure API routes while maintaining simplicity and developer experience. 