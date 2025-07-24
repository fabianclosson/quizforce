import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { practice_exam_id } = await request.json();

    console.log("🔄 Restarting exam with data:", { practice_exam_id });

    if (!practice_exam_id) {
      return NextResponse.json(
        { error: "Practice exam ID is required" },
        { status: 400 }
      );
    }

    // Get authenticated user using server client
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("🔐 Auth check:", {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    });

    if (authError || !user) {
      return NextResponse.json(
        { error: "User must be authenticated to restart an exam" },
        { status: 401 }
      );
    }

    // Find any in-progress attempts for this practice exam and user
    const { data: inProgressAttempts, error: findError } = await supabase
      .from("exam_attempts")
      .select("id")
      .eq("user_id", user.id)
      .eq("practice_exam_id", practice_exam_id)
      .eq("status", "in_progress");

    if (findError) {
      console.error("❌ Error finding in-progress attempts:", findError);
      return NextResponse.json(
        { error: "Failed to find existing attempts" },
        { status: 500 }
      );
    }

    // If there are in-progress attempts, abandon them
    if (inProgressAttempts && inProgressAttempts.length > 0) {
      console.log(
        "🚫 Abandoning in-progress attempts:",
        inProgressAttempts.map(a => a.id)
      );

      const { error: abandonError } = await supabase
        .from("exam_attempts")
        .update({
          status: "abandoned",
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("practice_exam_id", practice_exam_id)
        .eq("status", "in_progress");

      if (abandonError) {
        console.error("❌ Error abandoning attempts:", abandonError);
        return NextResponse.json(
          { error: "Failed to abandon existing attempts" },
          { status: 500 }
        );
      }
    }

    console.log("✅ Exam restart completed successfully");

    return NextResponse.json({
      message: "Exam restarted successfully",
      abandoned_attempts: inProgressAttempts?.length || 0,
    });
  } catch (error) {
    console.error("❌ Error restarting exam:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to restart exam",
      },
      { status: 500 }
    );
  }
}
