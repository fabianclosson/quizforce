"use server";

import { createServerSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const enrollSchema = z.object({
  certificationId: z.string().uuid(),
});

export async function enrollInCertification(certificationId: string) {
  try {
    const validation = enrollSchema.safeParse({ certificationId });
    if (!validation.success) {
      return {
        success: false,
        message: "Invalid certification ID.",
      };
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Authentication required." };
    }

    // Check if the certification is free
    const { data: certification, error: certError } = await supabase
      .from("certifications")
      .select("price_cents")
      .eq("id", certificationId)
      .single();

    if (certError || !certification) {
      return { success: false, message: "Certification not found." };
    }

    if (certification.price_cents && certification.price_cents > 0) {
      return {
        success: false,
        message: "This certification requires payment.",
      };
    }

    // Check for existing active enrollment
    const { data: existingEnrollment, error: existingError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("certification_id", certificationId)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing enrollment:", existingError);
      return { success: false, message: "Database error." };
    }

    if (existingEnrollment) {
      return { success: false, message: "You are already enrolled." };
    }

    // Create the enrollment
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year access

    const { error: insertError } = await supabase.from("enrollments").insert({
      user_id: user.id,
      certification_id: certificationId,
      expires_at: expiresAt.toISOString(),
      source: "direct",
    });

    if (insertError) {
      console.error("Error creating enrollment:", insertError);
      return { success: false, message: "Failed to enroll." };
    }

    revalidatePath("/practice-exams");
    return { success: true, message: "Enrollment successful!" };
  } catch (error) {
    console.error("Unexpected error during enrollment:", error);
    return {
      success: false,
      message: "An unexpected error occurred.",
    };
  }
}
