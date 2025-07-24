"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PurchaseHistoryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new enrollment history page
    router.replace("/enrollment-history");
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Redirecting to Enrollment History...
          </p>
        </div>
      </div>
    </div>
  );
}
