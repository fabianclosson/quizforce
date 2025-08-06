import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    stripe: {
      isConfigured: config.stripe.isConfigured,
      hasSecretKey: !!config.stripe.secretKey,
      hasPublishableKey: !!config.stripe.publishableKey,
      hasWebhookSecret: !!config.stripe.webhookSecret,
      secretKeyLength: config.stripe.secretKey.length,
      publishableKeyLength: config.stripe.publishableKey.length,
      webhookSecretLength: config.stripe.webhookSecret.length,
    },
    envVars: {
      hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasStripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasStripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      stripeSecretKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
      stripePublishableKeyLength: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.length || 0,
      stripeWebhookSecretLength: process.env.STRIPE_WEBHOOK_SECRET?.length || 0,
    }
  });
} 