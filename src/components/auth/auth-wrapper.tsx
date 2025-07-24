"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts";

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: "admin" | "user";
  fallback?: React.ReactNode;
}

export function AuthWrapper({
  children,
  requireAuth = true,
  requiredRole,
  fallback,
}: AuthWrapperProps) {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    router.push("/auth/signin");
    return null;
  }

  // Check role requirement
  if (requiredRole && userRole !== requiredRole) {
    if (requiredRole === "admin") {
      router.push("/dashboard");
      return null;
    }
  }

  // User is authenticated and has required role
  return <>{children}</>;
}

// Export the useAuth hook from context for backward compatibility
export { useAuth } from "@/contexts";
