import Stripe from "stripe";
import { loadStripe, Stripe as StripeJS } from "@stripe/stripe-js";
import { config } from "./config";

// Server-side Stripe instance - only initialize if key is available
export const stripe = config.stripe.isConfigured
  ? new Stripe(config.stripe.secretKey, {
      apiVersion: "2025-06-30.basil",
      typescript: true,
    })
  : null;

// Client-side Stripe promise
let stripePromise: Promise<StripeJS | null>;

export const getStripe = () => {
  if (!stripePromise) {
    // For client-side, read directly from environment variable to bypass config validation issues
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    stripePromise = publishableKey
      ? loadStripe(publishableKey)
      : Promise.resolve(null);
  }
  return stripePromise;
};

// Stripe webhook signature verification
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string
): Stripe.Event | null => {
  if (!stripe || !config.stripe.isConfigured) {
    console.warn("Stripe not configured for webhook verification");
    return null;
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe.webhookSecret
  );
};
