"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, Home, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function CheckoutCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(15);

  const name = searchParams.get("name");
  const returnUrl = searchParams.get("return_url");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (returnUrl) {
            router.push(returnUrl);
          } else {
            router.push("/catalog");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, returnUrl]);

  const handleRetryPurchase = () => {
    if (returnUrl) {
      router.push(returnUrl);
    } else {
      router.push("/catalog");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Your payment was cancelled. No charges have been made to your
              account.
            </p>
            {name && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm">You were purchasing:</span>
                <Badge variant="outline">{name}</Badge>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">What happened?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• You cancelled the payment process</li>
                <li>• No charges were made to your payment method</li>
                <li>• You can try again anytime</li>
                <li>• Your cart/selection is still available</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRetryPurchase}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Try Again
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/catalog")}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse Catalog
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Redirecting back in {countdown} seconds...
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Need help? Contact our support team for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <CheckoutCancelContent />
    </Suspense>
  );
}
