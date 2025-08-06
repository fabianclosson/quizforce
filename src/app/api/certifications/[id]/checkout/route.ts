import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { config } from "@/lib/config";
import {
  withApiErrorHandler,
  createAuthenticationError,
  createNotFoundError,
} from "@/lib/api-error-handler";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

async function handleCertificationCheckout(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    console.log("=== CHECKOUT DEBUG START ===");
    
    const resolvedParams = await params;
    const certificationId = resolvedParams.id;
    
    console.log("Certification ID:", certificationId);
    
    // Debug Stripe configuration
    console.log("=== STRIPE CONFIGURATION DEBUG ===");
    console.log("Environment variables check:", {
      hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasStripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasStripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      stripeSecretKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
      stripePublishableKeyLength: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.length || 0,
    });
    
    console.log("Config object check:", {
      stripeIsConfigured: config.stripe.isConfigured,
      hasSecretKey: !!config.stripe.secretKey,
      hasPublishableKey: !!config.stripe.publishableKey,
      hasWebhookSecret: !!config.stripe.webhookSecret,
      secretKeyLength: config.stripe.secretKey.length,
      publishableKeyLength: config.stripe.publishableKey.length,
    });
    
    // Check authentication
    const serverSupabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await serverSupabase.auth.getUser();
    
    console.log("User auth check:", { 
      hasUser: !!user, 
      userId: user?.id, 
      userEmail: user?.email,
      authError: authError?.message 
    });

    if (authError || !user) {
      console.log("Authentication failed");
      throw createAuthenticationError("Authentication required for checkout");
    }

    // For now, just return a simple response to test if we get this far
    console.log("=== CHECKOUT DEBUG SUCCESS ===");
    
    return NextResponse.json({
      success: true,
      message: "Checkout debug - authentication successful",
      certificationId,
      userId: user.id,
      userEmail: user.email,
      stripeConfigured: config.stripe.isConfigured,
    });
    
  } catch (error) {
    console.error("=== CHECKOUT DEBUG ERROR ===", error);
    throw error;
  }
}

export const POST = withApiErrorHandler(handleCertificationCheckout);
