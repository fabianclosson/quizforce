import { useMutation } from "@tanstack/react-query";
import { getStripe } from "@/lib/stripe";

interface CheckoutResponse {
  sessionId: string;
  url: string;
}

interface CheckoutError {
  error: string;
}

// Certification checkout hook
export const useCheckoutCertification = () => {
  return useMutation<CheckoutResponse, Error, string>({
    mutationFn: async (certificationId: string) => {
      const response = await fetch(
        `/api/certifications/${certificationId}/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData: CheckoutError = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const data: CheckoutResponse = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error(
          "Payment system is not configured. Please contact support."
        );
      }

      if (data.sessionId) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (error) {
          throw new Error(error.message || "Failed to redirect to checkout");
        }
      } else {
        throw new Error("No checkout session created");
      }

      return data;
    },
  });
};

// Package checkout hook
export const useCheckoutPackage = () => {
  return useMutation<CheckoutResponse, Error, string>({
    mutationFn: async (packageId: string) => {
      const response = await fetch(`/api/packages/${packageId}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData: CheckoutError = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const data: CheckoutResponse = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error(
          "Payment system is not configured. Please contact support."
        );
      }

      if (data.sessionId) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (error) {
          throw new Error(error.message || "Failed to redirect to checkout");
        }
      } else {
        throw new Error("No checkout session created");
      }

      return data;
    },
  });
};
