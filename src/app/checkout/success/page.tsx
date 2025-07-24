"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");
  const name = searchParams.get("name");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Thank you for your purchase! Your payment has been processed
              successfully.
            </p>
            {name && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm">You now have access to:</span>
                <Badge variant="secondary">{name}</Badge>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">What&apos;s Next?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • Access your{" "}
                  {type === "package" ? "package" : "certification"} in your
                  dashboard
                </li>
                <li>• Start practicing with our exam questions</li>
                <li>• Track your progress and identify weak areas</li>
                <li>• Get ready to pass your certification!</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full"
                size="lg"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Redirecting to dashboard in {countdown} seconds...
            </p>
          </div>

          {sessionId && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Session ID: {sessionId}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
