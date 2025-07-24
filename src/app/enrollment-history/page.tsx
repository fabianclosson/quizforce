"use client";

import React, { Suspense } from "react";
import { EnrollmentHistoryClient } from "@/components/enrollment-history";
import { EnrollmentLoadingState } from "@/components/enrollment-history";

export default function EnrollmentHistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Enrollment History
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Review all your certification and package enrollments, both active and
          expired.
        </p>
      </header>
      <main>
        <Suspense fallback={<EnrollmentLoadingState />}>
          <EnrollmentHistoryClient />
        </Suspense>
      </main>
    </div>
  );
}
