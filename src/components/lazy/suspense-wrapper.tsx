"use client";

import React, { Suspense, ReactNode } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  type?: "spinner" | "skeleton" | "card" | "dashboard" | "table" | "custom";
  className?: string;
}

// Loading fallback components for different UI patterns
const LoadingFallbacks = {
  spinner: (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="lg" />
    </div>
  ),

  skeleton: (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 w-full" />
    </div>
  ),

  card: (
    <Card className="animate-pulse">
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  ),

  dashboard: (
    <div className="space-y-6">
      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-2 p-4 border rounded-lg">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  ),

  table: (
    <div className="rounded-md border">
      <div className="h-12 border-b bg-muted/50 animate-pulse" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 border-b flex items-center px-4 space-x-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/8" />
          <Skeleton className="h-4 w-1/8" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  ),
};

export function SuspenseWrapper({
  children,
  fallback,
  type = "spinner",
  className,
}: SuspenseWrapperProps) {
  const defaultFallback =
    fallback ||
    (type === "custom" ? LoadingFallbacks.spinner : LoadingFallbacks[type]) ||
    LoadingFallbacks.spinner;

  return (
    <Suspense fallback={<div className={className}>{defaultFallback}</div>}>
      {children}
    </Suspense>
  );
}

// Specialized wrappers for common use cases
export function DashboardSuspense({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <SuspenseWrapper type="dashboard" className={className}>
      {children}
    </SuspenseWrapper>
  );
}

export function TableSuspense({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <SuspenseWrapper type="table" className={className}>
      {children}
    </SuspenseWrapper>
  );
}

export function CardSuspense({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <SuspenseWrapper type="card" className={className}>
      {children}
    </SuspenseWrapper>
  );
}
