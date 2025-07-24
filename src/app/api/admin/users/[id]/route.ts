import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Await params in Next.js 15
    const { id } = await params;

    // Check admin access
    const { isAdmin } = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select(
        `
        id,
        email,
        full_name,
        role,
        account_status,
        created_at,
        updated_at,
        avatar_url
      `
      )
      .eq("id", id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user enrollments with certification details
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(
        `
        id,
        enrolled_at,
        status,
        certifications (
          id,
          name,
          slug,
          description,
          price_cents,
          category
        )
      `
      )
      .eq("user_id", id)
      .order("enrolled_at", { ascending: false });

    // Get user exam attempts
    const { data: examAttempts } = await supabase
      .from("exam_attempts")
      .select(
        `
        id,
        score,
        passed,
        started_at,
        completed_at,
        time_taken_seconds,
        practice_exams (
          id,
          name,
          total_questions,
          passing_score,
          certifications (
            name,
            slug
          )
        )
      `
      )
      .eq("user_id", id)
      .order("started_at", { ascending: false });

    // Get user purchase history
    const { data: purchases } = await supabase
      .from("payments")
      .select(
        `
        id,
        stripe_payment_intent_id,
        product_type,
        product_id,
        product_name,
        amount_cents,
        currency,
        discount_amount_cents,
        final_amount_cents,
        status,
        coupon_code,
        created_at,
        completed_at
      `
      )
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    // Calculate user statistics
    const totalEnrollments = enrollments?.length || 0;
    const totalExamAttempts = examAttempts?.length || 0;
    const passedExams =
      examAttempts?.filter(attempt => attempt.passed)?.length || 0;
    const totalPurchases =
      purchases?.filter(purchase => purchase.status === "completed")?.length ||
      0;
    const totalSpent =
      purchases
        ?.filter(purchase => purchase.status === "completed")
        ?.reduce((sum, purchase) => sum + purchase.final_amount_cents, 0) || 0;
    const averageScore = examAttempts?.length
      ? Math.round(
          examAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) /
            examAttempts.length
        )
      : 0;

    return NextResponse.json({
      user,
      enrollments: enrollments || [],
      examAttempts: examAttempts || [],
      purchases: purchases || [],
      statistics: {
        totalEnrollments,
        totalExamAttempts,
        passedExams,
        totalPurchases,
        totalSpent,
        averageScore,
        successRate:
          totalExamAttempts > 0
            ? Math.round((passedExams / totalExamAttempts) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("Error in user detail API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin access
    const { isAdmin } = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { role, account_status, action } = body;

    const supabase = await createServerSupabaseClient();

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("profiles")
      .select("id, email, role, account_status")
      .eq("id", id)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: {
      updated_at: string;
      role?: string;
      account_status?: string;
    } = { updated_at: new Date().toISOString() };
    let actionMessage = "";

    // Handle different actions
    if (action === "reset_password") {
      // Trigger password reset email via Supabase Auth
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: existingUser.email,
      });

      if (resetError) {
        console.error("Error generating password reset:", resetError);
        return NextResponse.json(
          { error: "Failed to send password reset email" },
          { status: 500 }
        );
      }

      actionMessage = "Password reset email sent successfully";
    } else {
      // Handle role updates
      if (role) {
        if (!["user", "admin"].includes(role)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        updateData.role = role;
        actionMessage = `User role updated to ${role}`;
      }

      // Handle account status updates
      if (account_status) {
        if (
          !["active", "suspended", "banned", "pending"].includes(account_status)
        ) {
          return NextResponse.json(
            { error: "Invalid account status" },
            { status: 400 }
          );
        }
        updateData.account_status = account_status;
        actionMessage = `Account status updated to ${account_status}`;
      }

      // Update user profile if there are changes
      if (Object.keys(updateData).length > 1) {
        // More than just updated_at
        const { data, error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error updating user:", error);
          return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message: actionMessage || "User updated successfully",
          user: data,
        });
      }
    }

    // For password reset or if no updates needed
    return NextResponse.json({
      message: actionMessage || "Action completed successfully",
    });
  } catch (error) {
    console.error("Error in user update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin access
    const { isAdmin } = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", id)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deletion of admin users (optional safety measure)
    if (existingUser.role === "admin") {
      return NextResponse.json(
        { error: "Cannot delete admin users" },
        { status: 400 }
      );
    }

    // Delete user profile
    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    // Note: In a production system, you might want to:
    // 1. Soft delete instead of hard delete
    // 2. Clean up related data (enrollments, exam results, etc.)
    // 3. Send notification to the user
    // 4. Log the deletion for audit purposes

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error in user deletion API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
