import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { ValidationPatterns } from "@/lib/validators";
import { z } from "zod";
import {
  withApiErrorHandler,
  createAuthenticationError,
  createNotFoundError,
  createValidationError,
  createInternalServerError,
  withExternalApiErrorHandling,
} from "@/lib/api-error-handler";

// Validation schema for package checkout
const checkoutParamsSchema = z.object({
  id: ValidationPatterns.uuid,
});

// Optional body schema for additional checkout options
const checkoutBodySchema = z
  .object({
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
  })
  .optional();

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

async function handlePackageCheckout(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id: packageId } = await params;
  const supabase = createServiceSupabaseClient();

  // Validate parameters
  const validatedParams = checkoutParamsSchema.parse({ id: packageId });

  // Parse and validate request body if present
  let body = {};
  if (request.headers.get("content-type")?.includes("application/json")) {
    try {
      body = await request.json();
    } catch {
      throw createValidationError("Invalid JSON in request body");
    }
  }
  const validatedBody = checkoutBodySchema.parse(body);

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw createAuthenticationError(
      "Authentication required to purchase packages"
    );
  }

  // Get package details with certifications
  const { data: packageData, error: packageError } = await supabase
    .from("packages")
    .select(
      `
      *,
      package_certifications (
        certification_id,
        certifications (
          id,
          name,
          price_cents
        )
      )
    `
    )
    .eq("id", validatedParams.id)
    .eq("active", true)
    .single();

  if (packageError) {
    if (packageError.code === "PGRST116") {
      throw createNotFoundError("Package not found or not available");
    }
    throw createInternalServerError("Failed to fetch package details", {
      error: packageError,
    });
  }

  if (!packageData) {
    throw createNotFoundError("Package not found or not available");
  }

  // Check if user already has active enrollments for all certifications in the package
  const certificationIds = packageData.package_certifications.map(
    (pc: { certification_id: string }) => pc.certification_id
  );

  if (certificationIds.length === 0) {
    throw createValidationError("Package contains no certifications");
  }

  const { data: existingEnrollments, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("certification_id")
    .eq("user_id", user.id)
    .in("certification_id", certificationIds)
    .gte("expires_at", new Date().toISOString());

  if (enrollmentError) {
    throw createInternalServerError("Failed to check existing enrollments", {
      error: enrollmentError,
    });
  }

  const existingCertificationIds =
    existingEnrollments?.map(
      (e: { certification_id: string }) => e.certification_id
    ) || [];
  const newCertificationIds = certificationIds.filter(
    (id: string) => !existingCertificationIds.includes(id)
  );

  if (newCertificationIds.length === 0) {
    throw createValidationError(
      "You are already enrolled in all certifications in this package"
    );
  }

  // Create Stripe checkout session
  const origin = request.headers.get("origin") || "http://localhost:3000";
  const successUrl = validatedBody?.successUrl || `${origin}/checkout/success`;
  const cancelUrl = validatedBody?.cancelUrl || `${origin}/checkout/cancel`;

  try {
    const session = await withExternalApiErrorHandling(() => {
      if (!stripe) {
        throw new Error("Stripe is not configured");
      }
      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: packageData.name,
                description:
                  packageData.description ||
                  `Access to ${certificationIds.length} certifications`,
                images: packageData.image_url
                  ? [packageData.image_url]
                  : undefined,
              },
              unit_amount: packageData.price_cents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: user.email,
        metadata: {
          user_id: user.id,
          package_id: packageData.id,
          package_name: packageData.name,
          certification_ids: newCertificationIds.join(","),
          type: "package",
        },
      });
    }, "Stripe checkout session creation");

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      packageName: packageData.name,
      certificationCount: newCertificationIds.length,
      amount: packageData.price_cents,
    });
  } catch {
    throw createInternalServerError("Failed to create checkout session", {
      packageId: validatedParams.id,
      userId: user.id,
    });
  }
}

export const POST = withApiErrorHandler(handlePackageCheckout);
