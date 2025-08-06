import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase";
import { ApiValidationMiddleware } from "@/lib/api-validation-helpers";
import { ValidationPatterns } from "@/lib/validators";
import { z } from "zod";
import {
  withApiErrorHandler,
  createAuthenticationError,
  createNotFoundError,
  createValidationError,
  withDatabaseErrorHandling,
  withExternalApiErrorHandling,
} from "@/lib/api-error-handler";

// Validation schema for certification checkout
const checkoutParamsSchema = z.object({
  id: ValidationPatterns.uuid,
});

// Optional body schema for additional checkout options
const checkoutBodySchema = z
  .object({
    successUrl: ValidationPatterns.url.optional(),
    cancelUrl: ValidationPatterns.url.optional(),
  })
  .optional();

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

async function handleCertificationCheckout(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const steps: string[] = [];
  
  try {
    steps.push("1. Starting checkout process");
    
    const resolvedParams = await params;
    steps.push("2. Resolved route parameters");

    // Validate URL parameters
    const paramValidation = ApiValidationMiddleware.validateParams(
      resolvedParams,
      checkoutParamsSchema
    );

    if (!paramValidation.success) {
      return NextResponse.json({
        error: "Parameter validation failed",
        steps,
        validationErrors: paramValidation.errors
      }, { status: 400 });
    }
    
    steps.push("3. Parameter validation passed");

    // Validate request body (optional)
    let bodyData = undefined;
    const contentType = request.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      try {
        const bodyValidation = await ApiValidationMiddleware.validateBody(
          request,
          checkoutBodySchema,
          { textFields: ["successUrl", "cancelUrl"] }
        );

        if (!bodyValidation.success) {
          return NextResponse.json({
            error: "Body validation failed",
            steps,
            validationErrors: bodyValidation.errors
          }, { status: 400 });
        }
        
        bodyData = bodyValidation.data;
        steps.push("4. Body validation passed");
      } catch (bodyError: any) {
        return NextResponse.json({
          error: "Body validation error",
          steps,
          bodyError: bodyError.message
        }, { status: 400 });
      }
    } else {
      steps.push("4. No body to validate");
    }

    const { id } = paramValidation.data!;
    steps.push(`5. Processing certification ID: ${id}`);
    
    // Use server client for authentication (reads user session)
    let serverSupabase;
    try {
      serverSupabase = await createServerSupabaseClient();
      steps.push("6. Created server Supabase client");
    } catch (supabaseError: any) {
      return NextResponse.json({
        error: "Failed to create Supabase client",
        steps,
        supabaseError: supabaseError.message
      }, { status: 500 });
    }
    
    // Check authentication
    let user;
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await serverSupabase.auth.getUser();
      
      if (authError || !authUser) {
        return NextResponse.json({
          error: "Authentication failed",
          steps,
          authError: authError?.message || "No user found"
        }, { status: 401 });
      }
      
      user = authUser;
      steps.push(`7. User authenticated: ${user.id}`);
    } catch (authError: any) {
      return NextResponse.json({
        error: "Authentication error",
        steps,
        authError: authError.message
      }, { status: 500 });
    }
    
    // Use service client for database operations
    let supabase;
    try {
      supabase = createServiceSupabaseClient();
      steps.push("8. Created service Supabase client");
    } catch (serviceError: any) {
      return NextResponse.json({
        error: "Failed to create service client",
        steps,
        serviceError: serviceError.message
      }, { status: 500 });
    }

    // Get certification details
    let certification;
    try {
      const certificationData = await supabase
        .from("certifications")
        .select("id, name, price_cents, slug, is_active")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (certificationData.error || !certificationData.data) {
        return NextResponse.json({
          error: "Certification not found",
          steps,
          certificationError: certificationData.error?.message
        }, { status: 404 });
      }

      certification = certificationData.data;
      steps.push(`9. Found certification: ${certification.name} ($${certification.price_cents / 100})`);
    } catch (certError: any) {
      return NextResponse.json({
        error: "Database error fetching certification",
        steps,
        certError: certError.message
      }, { status: 500 });
    }

    // Check if certification is free
    if (certification.price_cents === 0) {
      return NextResponse.json({
        error: "This certification is free",
        steps,
        message: "Use the enrollment endpoint instead"
      }, { status: 400 });
    }
    
    steps.push("10. Certification is paid, proceeding");

    // Check for existing active enrollment
    try {
      const existingEnrollment = await supabase
        .from("enrollments")
        .select("id, expires_at")
        .eq("user_id", user.id)
        .eq("certification_id", certification.id)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (existingEnrollment.data) {
        return NextResponse.json({
          error: "Already enrolled",
          steps,
          message: "User is already enrolled in this certification"
        }, { status: 400 });
      }
      
      steps.push("11. No existing enrollment found");
    } catch (enrollmentError: any) {
      // This is expected if no enrollment exists, so we continue
      steps.push("11. No existing enrollment (expected)");
    }

    // Prepare URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const successUrl =
      bodyData?.successUrl ||
      `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=certification&name=${encodeURIComponent(certification.name)}`;
    const cancelUrl =
      bodyData?.cancelUrl ||
      `${baseUrl}/checkout/cancel?type=certification&name=${encodeURIComponent(certification.name)}&return_url=${encodeURIComponent(`/catalog/certification/${certification.slug}`)}`;

    steps.push("12. Prepared success/cancel URLs");

    // Create Stripe checkout session
    if (!stripe) {
      return NextResponse.json({
        error: "Stripe not configured",
        steps,
        message: "Stripe instance is null"
      }, { status: 500 });
    }
    
    steps.push("13. Stripe instance available");

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: certification.name,
                description: `QuizForce Certification: ${certification.name}`,
              },
              unit_amount: certification.price_cents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: user.id,
          certification_id: certification.id,
          certification_name: certification.name,
          type: "certification",
        },
        customer_email: user.email || undefined,
      });

      steps.push(`14. Stripe session created: ${session.id}`);

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
        steps,
        success: true
      });
      
    } catch (stripeError: any) {
      return NextResponse.json({
        error: "Stripe session creation failed",
        steps,
        stripeError: stripeError.message,
        stripeCode: stripeError.code,
        stripeType: stripeError.type
      }, { status: 500 });
    }
    
  } catch (error: any) {
    return NextResponse.json({
      error: "Unexpected error",
      steps,
      unexpectedError: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export const POST = withApiErrorHandler(handleCertificationCheckout);
