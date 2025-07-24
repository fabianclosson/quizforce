"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type UserRole = "user" | "admin" | "instructor";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  handleAuthError: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const supabase = createClient();

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      console.log("🔍 Fetching user role for:", userId);

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("🔍 Error fetching user role:", error);
        console.warn(
          "🔍 Using default role 'user' due to error:",
          error.message
        );
        return "user";
      }

      if (!data) {
        console.warn("🔍 No profile data found, using default role");
        return "user";
      }

      console.log("🔍 User role fetched successfully:", data.role);
      return (data.role as UserRole) || "user";
    } catch (error) {
      console.error("🔍 Error in fetchUserRole:", error);
      return "user";
    }
  };

  // Non-blocking role fetch - doesn't prevent user from being set
  const fetchUserRoleNonBlocking = async (userId: string) => {
    try {
      const role = await fetchUserRole(userId);
      setUserRole(role);
    } catch (error) {
      console.error("🔍 Non-blocking role fetch failed:", error);
      setUserRole("user");
    }
  };

  const refreshUser = async () => {
    try {
      console.log("🔄 Refreshing user...");
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("🔄 Auth error during refresh:", error);
        // If there's an auth error, sign out to clear invalid session
        await signOut();
        return;
      }

      setUser(user);

      if (user) {
        // Fetch role non-blocking
        fetchUserRoleNonBlocking(user.id);
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error("🔄 Error refreshing user:", error);
      setUser(null);
      setUserRole(null);
    }
  };

  const signOut = async () => {
    try {
      console.log("👋 Signing out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("👋 Error signing out:", error);
        // Even if signOut fails, clear local state
      }
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("👋 Sign out error:", error);
      // Always clear local state even if API call fails
      setUser(null);
      setUserRole(null);
    }
  };

  const handleAuthError = async () => {
    console.log("🚨 Handling authentication error - clearing session");
    await signOut();
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        console.log("🚀 Getting initial session...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("🚀 Auth error during initial session:", error);
          // Clear any invalid session data
          setUser(null);
          setUserRole(null);
          return;
        }

        if (session?.user) {
          console.log("🚀 Initial session found, setting user");
          setUser(session.user);
          // Fetch role non-blocking - don't wait for it
          fetchUserRoleNonBlocking(session.user.id);
        } else {
          console.log("🚀 No initial session found");
        }
      } catch (error) {
        console.error("🚀 Error getting initial session:", error);
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state change:", event);

      // Don't set loading for role fetches - only for user authentication
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setLoading(true);
      }

      try {
        if (event === "SIGNED_IN" && session?.user) {
          console.log("✅ User signed in, setting user immediately");
          setUser(session.user);
          // Set loading to false immediately after setting user
          setLoading(false);
          // Fetch role in background - don't block the UI
          fetchUserRoleNonBlocking(session.user.id);
        } else if (event === "SIGNED_OUT") {
          console.log("👋 User signed out");
          setUser(null);
          setUserRole(null);
          setLoading(false);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          console.log("🔄 Token refreshed");
          setUser(session.user);
          // Keep existing role unless we need to refresh it
          if (!userRole) {
            fetchUserRoleNonBlocking(session.user.id);
          }
        }
      } catch (error) {
        console.error("🔄 Auth state change error:", error);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    userRole,
    signOut,
    refreshUser,
    handleAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Additional hooks for specific use cases
export function useUser() {
  const { user, loading } = useAuth();
  return { user, loading };
}

export function useIsAuthenticated() {
  const { user, loading } = useAuth();
  return { isAuthenticated: !!user, loading };
}

export function useUserRole() {
  const { userRole, loading } = useAuth();
  return { userRole, loading };
}

export function useIsAdmin() {
  const { userRole, loading } = useAuth();
  return { isAdmin: userRole === "admin", loading };
}
