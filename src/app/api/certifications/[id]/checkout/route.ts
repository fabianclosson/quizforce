import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceSupabaseClient } from "@/lib/supabase";
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
  const resolvedParams = await params;

  // Validate URL parameters
  const paramValidation = ApiValidationMiddleware.validateParams(
    resolvedParams,
    checkoutParamsSchema
  );

  if (!paramValidation.success) {
    throw createValidationError("Invalid certification ID", {
      errors: paramValidation.errors,
    });
  }

  // Validate request body (optional)
  let bodyData = undefined;
  const contentType = request.headers.get("content-type");
  
  if (contentType?.includes("application/json")) {
    const bodyValidation = await ApiValidationMiddleware.validateBody(
      request,
      checkoutBodySchema,
      { textFields: ["successUrl", "cancelUrl"] }
    );

    if (!bodyValidation.success) {
      throw createValidationError("Invalid request body", {
        errors: bodyValidation.errors,
      });
    }
    
    bodyData = bodyValidation.data;
  }

  const { id } = paramValidation.data!;
  const supabase = createServiceSupabaseClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw createAuthenticationError("Authentication required for checkout");
  }

  // Get certification details
  const certificationData = await withDatabaseErrorHandling(
    async () => {
      const result = await supabase
        .from("certifications")
        .select("id, name, price_cents, slug, is_active")
        .eq("id", id)
        .eq("is_active", true)
        .single();
      return result;
    },
    { operation: "fetch_certification", certificationId: id }
  );

  if (!certificationData.data || certificationData.error) {
    throw createNotFoundError(`Certification not found: ${id}`);
  }

  const certification = certificationData.data;

  // Check if certification is free
  if (certification.price_cents === 0) {
    throw createValidationError(
      "This certification is free. Use the enrollment endpoint instead."
    );
  }

  // Check for existing active enrollment
  const existingEnrollment = await withDatabaseErrorHandling(
    async () => {
      const result = await supabase
        .from("enrollments")
        .select("id, expires_at")
        .eq("user_id", user.id)
        .eq("certification_id", certification.id)
        .gte("expires_at", new Date().toISOString())
        .single();
      return result;
    },
    {
      operation: "check_active_enrollment",
      userId: user.id,
      certificationId: id,
    }
  );

  if (existingEnrollment.data) {
    throw createValidationError("Already enrolled in this certification");
  }

  // Use custom URLs if provided and valid, otherwise use defaults
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const successUrl =
    bodyData?.successUrl ||
    `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=certification&name=${encodeURIComponent(certification.name)}`;
  const cancelUrl =
    bodyData?.cancelUrl ||
    `${baseUrl}/checkout/cancel?type=certification&name=${encodeURIComponent(certification.name)}&return_url=${encodeURIComponent(`/catalog/certification/${certification.slug}`)}`;

  // Create Stripe checkout session
  const session = await withExternalApiErrorHandling(
    async () => {
      if (!stripe) {
        throw new Error("Stripe is not configured");
      }
      return await stripe.checkout.sessions.create({
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
        customer_email: user.email,
      });
    },
    "Stripe",
    {
      operation: "create_checkout_session",
      certificationId: id,
      userId: user.id,
      amount: certification.price_cents,
    }
  );

  return NextResponse.json({
    sessionId: session.id,
    url: session.url,
  });
}

export const POST = withApiErrorHandler(handleCertificationCheckout);
