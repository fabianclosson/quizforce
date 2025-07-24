"use client";

import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

interface QueryProviderProps {
  children: ReactNode;
}

// Advanced cache configuration for different data types
const CACHE_CONFIG = {
  // Static data that rarely changes
  static: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours (previously cacheTime)
  },

  // User-specific data
  user: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },

  // Real-time data
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  },

  // Heavy computation results
  computed: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
};

// Global error handler for queries
const queryCache = new QueryCache({
  onError: (error, query) => {
    // Only show error toasts for background refetches, not initial loads
    if (query.state.data !== undefined) {
      toast.error(`Something went wrong: ${error.message}`);
    }

    // Log errors for monitoring
    console.error("Query error:", error, "Query key:", query.queryKey);
  },
});

// Global error handler for mutations
const mutationCache = new MutationCache({
  onError: (error, variables, context, mutation) => {
    toast.error(`Action failed: ${error.message}`);

    // Log mutation errors
    console.error("Mutation error:", error, "Variables:", variables);
  },

  onSuccess: (data, variables, context, mutation) => {
    // Show success toast for important mutations
    const mutationKey = mutation.options.mutationKey?.[0];

    if (
      mutationKey &&
      ["create", "update", "delete"].some(action =>
        String(mutationKey).includes(action)
      )
    ) {
      toast.success("Action completed successfully!");
    }
  },
});

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache,
        mutationCache,
        defaultOptions: {
          queries: {
            // Default cache configuration
            staleTime: 2 * 60 * 1000, // 2 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)

            // Retry configuration
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors (client errors)
              if (error instanceof Error && "status" in error) {
                const status = (error as any).status;
                if (status >= 400 && status < 500) {
                  return false;
                }
              }

              // Retry up to 3 times with exponential backoff
              return failureCount < 3;
            },

            retryDelay: attemptIndex =>
              Math.min(1000 * 2 ** attemptIndex, 30000),

            // Background refetch configuration
            refetchOnWindowFocus: false,
            refetchOnReconnect: "always",
            refetchOnMount: true,

            // Network mode configuration
            networkMode: "online",

            // Placeholder data configuration
            placeholderData: (previousData: any) => previousData,
          },

          mutations: {
            // Default mutation configuration
            retry: 1,

            // Network mode for mutations
            networkMode: "online",

            // Throw on error for better error boundaries
            throwOnError: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

// Export cache configurations for use in hooks
export { CACHE_CONFIG };

// Helper function to create query keys with consistent structure
export function createQueryKey(entity: string, params?: Record<string, any>) {
  return params ? [entity, params] : [entity];
}

// Helper function to invalidate related queries
export function invalidateQueries(
  queryClient: QueryClient,
  patterns: string[]
) {
  patterns.forEach(pattern => {
    queryClient.invalidateQueries({
      queryKey: [pattern],
    });
  });
}

// Prefetch helper for critical data
export function prefetchCriticalData(queryClient: QueryClient) {
  // Prefetch user profile data
  queryClient.prefetchQuery({
    queryKey: ["user", "profile"],
    staleTime: CACHE_CONFIG.user.staleTime,
  });

  // Prefetch dashboard data
  queryClient.prefetchQuery({
    queryKey: ["dashboard", "overview"],
    staleTime: CACHE_CONFIG.user.staleTime,
  });
}
