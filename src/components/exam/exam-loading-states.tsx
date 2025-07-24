import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Clock, Save, Send } from "lucide-react";

export function ExamLoadingState() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Loading */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>

            <div className="flex items-center gap-4">
              {/* Auto-save status skeleton */}
              <div className="flex items-center gap-2 text-sm">
                <Save className="h-4 w-4 text-muted-foreground" />
                <Skeleton className="h-4 w-16" />
              </div>

              {/* Timer skeleton */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Skeleton className="h-5 w-12" />
              </div>

              {/* Submit button skeleton */}
              <Skeleton className="h-9 w-24" />
            </div>
          </div>

          {/* Progress bar skeleton */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="w-full h-2 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main content loading */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question display skeleton */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question text skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>

                {/* Answer options skeleton */}
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 border rounded-lg"
                    >
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation sidebar skeleton */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Navigation buttons skeleton */}
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
                <Skeleton className="h-9 w-full" />

                {/* Question palette skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-8" />
                    ))}
                  </div>
                </div>

                {/* Legend skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuestionLoadingState() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-4">
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground">Loading question...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SubmissionLoadingState() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Submitting Your Exam</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your submission...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AutoSaveLoadingState() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="relative">
        <Save className="h-4 w-4" />
        <div className="absolute -top-1 -right-1">
          <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
        </div>
      </div>
      <span className="text-yellow-600">Saving...</span>
    </div>
  );
}

export function ConnectionErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="rounded-full bg-orange-100 dark:bg-orange-950 p-4 w-fit mx-auto">
            <Clock className="h-8 w-8 text-orange-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Connection Lost</h2>
            <p className="text-muted-foreground">
              We've lost connection to the server. Your progress has been saved
              locally.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Reconnect
            </button>
            <p className="text-xs text-muted-foreground">
              Your exam timer continues to run while reconnecting
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DataSyncErrorState({
  onRetry,
  onContinueOffline,
}: {
  onRetry: () => void;
  onContinueOffline: () => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-1">
              <Save className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="font-medium text-orange-800 dark:text-orange-200">
                Sync Failed
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Unable to save your progress to the server. You can continue
                offline.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onRetry}
                  className="text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-1 rounded hover:bg-orange-300 dark:hover:bg-orange-700 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={onContinueOffline}
                  className="text-xs text-orange-600 hover:text-orange-800 dark:hover:text-orange-400 transition-colors"
                >
                  Continue Offline
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
