'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCheckoutPackage } from '@/hooks/use-checkout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function PackageCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;
  
  const { mutate: checkout, isPending, error } = useCheckoutPackage();

  useEffect(() => {
    // Initiate checkout immediately when page loads
    checkout(packageId);
  }, [packageId, checkout]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4 h-12 w-12" />
          <h2 className="text-xl font-semibold">Redirecting to checkout...</h2>
          <p className="mt-2 text-muted-foreground">
            Please wait while we prepare your secure payment session.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Checkout Error</AlertTitle>
          <AlertDescription className="mt-2">
            {error.message || 'Failed to create checkout session. Please try again.'}
          </AlertDescription>
        </Alert>
        
        <div className="mt-6 flex gap-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
          >
            Go Back
          </Button>
          <Button
            onClick={() => checkout(packageId)}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // This should rarely be shown as checkout redirects immediately
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner className="h-12 w-12" />
    </div>
  );
} 