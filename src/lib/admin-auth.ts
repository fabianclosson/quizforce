/**
 * Admin Authentication and Authorization Utilities
 * Provides server-side and client-side utilities for admin access control
 * 
 * @deprecated Use the new auth-middleware.ts for standardized authentication
 * This file is kept for backward compatibility during migration
 */

import { createClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { withAuth, requireAdmin, AuthContext } from "./auth-middleware";

export interface AdminAuthResult {
  isAdmin: boolean;
  user: User | null;
  error?: string;
}

/**
 * Server-side admin authentication check
 * Use this in API routes and server components
 */
export async function verifyAdminAccess(): Promise<AdminAuthResult> {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        isAdmin: false,
        user: null,
        error: "Not authenticated",
      };
    }

    // Check user role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return {
        isAdmin: false,
        user,
        error: "Error verifying admin status",
      };
    }

    const isAdmin = profile?.role === "admin";

    return {
      isAdmin,
      user,
      error: isAdmin ? undefined : "Insufficient permissions",
    };
  } catch (error) {
    console.error("Admin verification error:", error);
    return {
      isAdmin: false,
      user: null,
      error: "Authentication error",
    };
  }
}

/**
 * Admin route guard for API routes
 * Returns a Response object if access should be denied
 */
export async function adminRouteGuard(): Promise<Response | null> {
  const { isAdmin, error } = await verifyAdminAccess();

  if (!isAdmin) {
    return new Response(
      JSON.stringify({
        error: "Access denied",
        message: error || "Admin access required",
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return null; // Access granted
}

/**
 * Create an admin user (for development/testing)
 * This should only be used in development environments
 */
export async function createAdminUser(email: string): Promise<boolean> {
  if (process.env.NODE_ENV === "production") {
    console.warn("Cannot create admin user in production");
    return false;
  }

  try {
    const supabase = createClient();

    // Find user by email
    const { data: users, error: searchError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .single();

    if (searchError) {
      console.error("Error finding user:", searchError);
      return false;
    }

    if (!users) {
      console.error("User not found");
      return false;
    }

    // Update user role to admin
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", users.id);

    if (updateError) {
      console.error("Error updating user role:", updateError);
      return false;
    }

    console.log(`Successfully granted admin role to ${email}`);
    return true;
  } catch (error) {
    console.error("Error creating admin user:", error);
    return false;
  }
}

/**
 * Admin permissions enum
 */
export enum AdminPermission {
  MANAGE_USERS = "manage_users",
  MANAGE_CONTENT = "manage_content",
  MANAGE_CERTIFICATIONS = "manage_certifications",
  MANAGE_EXAMS = "manage_exams",
  MANAGE_QUESTIONS = "manage_questions",
  VIEW_ANALYTICS = "view_analytics",
  MANAGE_SETTINGS = "manage_settings",
}

/**
 * Check if admin has specific permission
 * For future extensibility - currently all admins have all permissions
 */
export async function hasAdminPermission(
  permission: AdminPermission
): Promise<boolean> {
  const { isAdmin } = await verifyAdminAccess();

  // For now, all admins have all permissions
  // This can be extended later with role-based permissions
  return isAdmin;
}

/**
 * Admin audit log types
 */
export interface AdminAuditLog {
  id?: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  created_at?: string;
}

/**
 * Log admin actions for audit trail
 */
export async function logAdminAction(
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const { user } = await verifyAdminAccess();

    if (!user) {
      return; // Don't log if not authenticated
    }

    const supabase = createClient();

    const logEntry: AdminAuditLog = {
      admin_id: user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
    };

    // Note: This assumes an admin_audit_logs table exists
    // For now, we'll just log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("Admin Action:", logEntry);
    }

    // TODO: Implement actual database logging when admin_audit_logs table is created
    // const { error } = await supabase
    //   .from("admin_audit_logs")
    //   .insert([logEntry]);

    // if (error) {
    //   console.error("Error logging admin action:", error);
    // }
  } catch (error) {
    console.error("Error in admin action logging:", error);
  }
}

/**
 * Admin dashboard statistics
 */
export interface AdminStats {
  totalUsers: number;
  totalCertifications: number;
  totalExams: number;
  totalQuestions: number;
  recentSignups: number;
  systemStatus: "online" | "maintenance" | "offline";
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const { isAdmin } = await verifyAdminAccess();

    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    const supabase = createClient();

    // Get user count
    const { count: userCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get certification count
    const { count: certificationCount } = await supabase
      .from("certifications")
      .select("*", { count: "exact", head: true });

    // Get exam count (from exam_sessions)
    const { count: examCount } = await supabase
      .from("exam_sessions")
      .select("*", { count: "exact", head: true });

    // Get question count
    const { count: questionCount } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true });

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentSignups } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString());

    return {
      totalUsers: userCount || 0,
      totalCertifications: certificationCount || 0,
      totalExams: examCount || 0,
      totalQuestions: questionCount || 0,
      recentSignups: recentSignups || 0,
      systemStatus: "online",
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalUsers: 0,
      totalCertifications: 0,
      totalExams: 0,
      totalQuestions: 0,
      recentSignups: 0,
      systemStatus: "offline",
    };
  }
}
