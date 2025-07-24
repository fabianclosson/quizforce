import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const results = [];

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    results.push({
      step: "Authentication",
      status: "success",
      message: `Authenticated as ${user.email}`,
    });

    // Step 1: Check for broken enrollments (with NULL expires_at)
    const { data: brokenEnrollments, error: brokenError } = await supabase
      .from("enrollments")
      .select("id, enrolled_at, expires_at, certification_id")
      .is("expires_at", null);

    if (brokenError) {
      results.push({
        step: "Check Broken Enrollments",
        status: "error",
        message: `Failed to check broken enrollments: ${brokenError.message}`,
      });
    } else {
      results.push({
        step: "Check Broken Enrollments",
        status: "success",
        message: `Found ${brokenEnrollments?.length || 0} enrollments with NULL expires_at`,
      });

      // Fix broken enrollments by setting expires_at to 1 year from enrolled_at
      if (brokenEnrollments && brokenEnrollments.length > 0) {
        for (const enrollment of brokenEnrollments) {
          const enrolledDate = new Date(enrollment.enrolled_at);
          const expiryDate = new Date(enrolledDate);
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);

          const { error: updateError } = await supabase
            .from("enrollments")
            .update({ expires_at: expiryDate.toISOString() })
            .eq("id", enrollment.id);

          if (updateError) {
            results.push({
              step: `Fix Enrollment ${enrollment.id}`,
              status: "error",
              message: `Failed to fix enrollment: ${updateError.message}`,
            });
          } else {
            results.push({
              step: `Fix Enrollment ${enrollment.id}`,
              status: "success",
              message: `Fixed enrollment expires_at to ${expiryDate.toISOString()}`,
            });
          }
        }
      }
    }

    // Step 2: Check user's current enrollments
    const { data: userEnrollments, error: userEnrollError } = await supabase
      .from("enrollments")
      .select("id, certification_id, expires_at, source")
      .eq("user_id", user.id);

    if (userEnrollError) {
      results.push({
        step: "Check User Enrollments",
        status: "error",
        message: `Failed to check user enrollments: ${userEnrollError.message}`,
      });
    } else {
      results.push({
        step: "Check User Enrollments",
        status: "success",
        message: `User has ${userEnrollments?.length || 0} enrollments`,
      });

      // Step 3: If user has no enrollments, create test enrollments for all free certifications
      if (!userEnrollments || userEnrollments.length === 0) {
        const { data: freeCertifications, error: certsError } = await supabase
          .from("certifications")
          .select("id, name")
          .eq("is_active", true)
          .eq("price_cents", 0);

        if (certsError) {
          results.push({
            step: "Get Free Certifications",
            status: "error",
            message: `Failed to get free certifications: ${certsError.message}`,
          });
        } else if (freeCertifications && freeCertifications.length > 0) {
          results.push({
            step: "Get Free Certifications",
            status: "success",
            message: `Found ${freeCertifications.length} free certifications`,
          });

          // Create enrollments for all free certifications
          for (const cert of freeCertifications) {
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);

            const { data: newEnrollment, error: enrollError } = await supabase
              .from("enrollments")
              .insert({
                user_id: user.id,
                certification_id: cert.id,
                purchase_price_cents: 0,
                source: "auto_fix",
                expires_at: expiryDate.toISOString(),
              })
              .select()
              .single();

            if (enrollError) {
              results.push({
                step: `Create Enrollment for ${cert.name}`,
                status: "error",
                message: `Failed to create enrollment: ${enrollError.message}`,
              });
            } else {
              results.push({
                step: `Create Enrollment for ${cert.name}`,
                status: "success",
                message: `Created enrollment ID: ${newEnrollment.id}`,
                data: newEnrollment,
              });
            }
          }
        } else {
          results.push({
            step: "Get Free Certifications",
            status: "warning",
            message: "No free certifications available for enrollment",
          });
        }
      }
    }

    // Step 4: Verify enrollments are working
    const { data: finalEnrollments, error: finalError } = await supabase
      .from("enrollments")
      .select(
        `
        id,
        enrolled_at,
        expires_at,
        source,
        certifications!enrollments_certification_id_fkey (
          id,
          name,
          slug
        )
      `
      )
      .eq("user_id", user.id)
      .gte("expires_at", new Date().toISOString());

    if (finalError) {
      results.push({
        step: "Verify Final Enrollments",
        status: "error",
        message: `Failed to verify enrollments: ${finalError.message}`,
      });
    } else {
      results.push({
        step: "Verify Final Enrollments",
        status: "success",
        message: `User now has ${finalEnrollments?.length || 0} active enrollments`,
        data: finalEnrollments,
      });
    }

    const successCount = results.filter(r => r.status === "success").length;
    const errorCount = results.filter(r => r.status === "error").length;

    return NextResponse.json({
      success: errorCount === 0,
      message: `Enrollment fix completed. ${successCount} successful operations, ${errorCount} errors.`,
      results,
      user: {
        id: user.id,
        email: user.email,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
