import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyWebhookSignature } from "@/lib/stripe";
import { createServiceSupabaseClient } from "@/lib/supabase";
import {
  withApiErrorHandler,
  createValidationError,
  createInternalServerError,
} from "@/lib/api-error-handler";
import type Stripe from "stripe";
import { SupabaseClient } from "@supabase/supabase-js";

async function handleStripeWebhook(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    throw createValidationError("Missing Stripe signature header");
  }

  // Verify webhook signature
  let event: Stripe.Event | null;
  try {
    event = verifyWebhookSignature(body, signature);
  } catch {
    throw createValidationError("Invalid Stripe webhook signature", {
      signature: signature.substring(0, 20) + "...",
    });
  }

  if (!event) {
    throw createValidationError("Could not verify webhook signature");
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true, eventType: event.type });
}

export const POST = withApiErrorHandler(handleStripeWebhook);

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  if (event.type !== "checkout.session.completed") {
    throw createValidationError(
      "Invalid event type for checkout session handler"
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const supabase = createServiceSupabaseClient();

  console.log("Processing checkout session:", session.id);

  // Extract metadata
  const metadata = session.metadata;
  const userId = metadata?.user_id;
  const type = metadata?.type; // 'certification' or 'package'

  if (!userId || !type) {
    throw createValidationError("Missing required metadata in Stripe session", {
      sessionId: session.id,
      metadata: metadata || {},
    });
  }

  if (type === "certification") {
    await handleCertificationPurchase(supabase, session, metadata);
  } else if (type === "package") {
    await handlePackagePurchase(supabase, session, metadata);
  } else {
    throw createValidationError("Unknown purchase type in Stripe session", {
      type,
      sessionId: session.id,
    });
  }
}

async function handleCertificationPurchase(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const userId = metadata.user_id;
  const certificationId = metadata.certification_id;
  const certificationName = metadata.certification_name;

  if (!certificationId) {
    throw createValidationError(
      "Missing certification_id in Stripe session metadata",
      {
        sessionId: session.id,
        metadata,
      }
    );
  }

  console.log(
    `Processing certification purchase: ${certificationId} for user: ${userId}`
  );

  // Create payment record first
  const paymentData = {
    user_id: userId,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id,
    stripe_session_id: session.id,
    product_type: "certification",
    product_id: certificationId,
    product_name: certificationName || "Certification",
    amount_cents: session.amount_total,
    currency: session.currency || "usd",
    final_amount_cents: session.amount_total,
    status: "completed",
    completed_at: new Date().toISOString(),
    metadata: {
      stripe_session: session.id,
      payment_intent: session.payment_intent,
    },
  };

  const { error: paymentError } = await supabase
    .from("payments")
    .insert(paymentData);
  if (paymentError) {
    throw createInternalServerError(
      "Failed to create payment record for certification purchase",
      { error: paymentError }
    );
  }

  // Check if enrollment already exists
  const { data: existingEnrollment, error: checkError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("certification_id", certificationId)
    .gte("expires_at", new Date().toISOString())
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    throw createInternalServerError("Failed to check existing enrollment", {
      error: checkError,
    });
  }

  if (existingEnrollment) {
    console.log("Enrollment already exists, skipping creation");
    return;
  }

  // Create enrollment
  const enrollmentData = {
    user_id: userId,
    certification_id: certificationId,
    enrolled_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    purchase_price_cents: session.amount_total,
    source: "stripe_payment",
    stripe_session_id: session.id,
  };

  const { error: enrollmentError } = await supabase
    .from("enrollments")
    .insert(enrollmentData);
  if (enrollmentError) {
    throw createInternalServerError(
      "Failed to create enrollment for certification purchase",
      { error: enrollmentError }
    );
  }

  console.log(
    `Successfully created certification payment and enrollment for user ${userId}`
  );
}

async function handlePackagePurchase(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const userId = metadata.user_id;
  const packageId = metadata.package_id;
  const packageName = metadata.package_name;
  const certificationIds = metadata.certification_ids?.split(",") || [];

  if (!packageId) {
    throw createValidationError(
      "Missing package_id in Stripe session metadata",
      {
        sessionId: session.id,
        metadata,
      }
    );
  }

  if (certificationIds.length === 0) {
    throw createValidationError(
      "No certification IDs found in package metadata",
      {
        sessionId: session.id,
        packageId,
        metadata,
      }
    );
  }

  console.log(`Processing package purchase: ${packageId} for user: ${userId}`);
  console.log(`Certifications in package: ${certificationIds.join(", ")}`);

  // Create payment record first
  const paymentData = {
    user_id: userId,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id,
    stripe_session_id: session.id,
    product_type: "package",
    product_id: packageId,
    product_name: packageName || "Package",
    amount_cents: session.amount_total,
    currency: session.currency || "usd",
    final_amount_cents: session.amount_total,
    status: "completed",
    completed_at: new Date().toISOString(),
    metadata: {
      stripe_session: session.id,
      payment_intent: session.payment_intent,
      certification_ids: certificationIds,
    },
  };

  const { error: paymentError } = await supabase
    .from("payments")
    .insert(paymentData);
  if (paymentError) {
    throw createInternalServerError(
      "Failed to create payment record for package purchase",
      { error: paymentError }
    );
  }

  // Check for existing enrollments
  const { data: existingEnrollments, error: checkError } = await supabase
    .from("enrollments")
    .select("certification_id")
    .eq("user_id", userId)
    .in("certification_id", certificationIds)
    .gte("expires_at", new Date().toISOString());

  if (checkError) {
    throw createInternalServerError(
      "Failed to check existing enrollments for package",
      { error: checkError }
    );
  }

  const existingCertificationIds =
    existingEnrollments?.map(e => e.certification_id) || [];
  const newCertificationIds = certificationIds.filter(
    id => !existingCertificationIds.includes(id)
  );

  if (newCertificationIds.length === 0) {
    console.log("All certifications already enrolled, skipping creation");
    return;
  }

  // Create enrollments for new certifications
  const enrollmentsToCreate = newCertificationIds.map(
    (certificationId: string) => ({
      user_id: userId,
      certification_id: certificationId,
      enrolled_at: new Date().toISOString(),
      expires_at: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(), // 1 year
      purchase_price_cents: Math.floor(
        (session.amount_total || 0) / certificationIds.length
      ), // Distribute cost
      source: "stripe_payment",
      package_id: packageId,
      stripe_session_id: session.id,
    })
  );

  const { error: enrollmentError } = await supabase
    .from("enrollments")
    .insert(enrollmentsToCreate);
  if (enrollmentError) {
    throw createInternalServerError(
      "Failed to create enrollments for package purchase",
      { error: enrollmentError }
    );
  }

  console.log(
    `Successfully created package payment and ${
      enrollmentsToCreate.length
    } enrollments for user ${userId}`
  );
}
