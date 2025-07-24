import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import {
  enrollmentHistoryService,
  ExtendedEnrollmentHistoryItem,
  EnrollmentHistoryOptions,
  EnrollmentHistoryResponse,
} from "@/services/enrollment-history";

// Query keys for React Query
export const enrollmentHistoryKeys = {
  all: ["enrollment-history"] as const,
  lists: () => [...enrollmentHistoryKeys.all, "list"] as const,
  list: (userId: string, options?: EnrollmentHistoryOptions) =>
    [...enrollmentHistoryKeys.lists(), userId, options] as const,
  details: () => [...enrollmentHistoryKeys.all, "detail"] as const,
  detail: (userId: string, enrollmentId: string) =>
    [...enrollmentHistoryKeys.details(), userId, enrollmentId] as const,
};

/**
 * Hook to fetch enrollment history with pagination and filtering
 */
export function useEnrollmentHistory(options?: EnrollmentHistoryOptions) {
  const { user } = useAuth();

  return useQuery({
    queryKey: enrollmentHistoryKeys.list(user?.id || "", options),
    queryFn: async (): Promise<EnrollmentHistoryResponse> => {
      if (!user?.id) {
        return { items: [], total: 0, has_more: false };
      }
      return enrollmentHistoryService.getEnrollmentHistory(user.id, options);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch a single enrollment by ID
 */
export function useEnrollment(enrollmentId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: enrollmentHistoryKeys.detail(user?.id || "", enrollmentId),
    queryFn: async (): Promise<ExtendedEnrollmentHistoryItem | null> => {
      if (!user?.id || !enrollmentId) {
        return null;
      }
      return enrollmentHistoryService.getEnrollmentById(user.id, enrollmentId);
    },
    enabled: !!user?.id && !!enrollmentId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get enrollment statistics
 */
export function useEnrollmentStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...enrollmentHistoryKeys.all, "stats", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          totalEnrollments: 0,
          totalSpent: 0,
          activeEnrollments: 0,
          expiredEnrollments: 0,
          freeEnrollments: 0,
          paidEnrollments: 0,
          currency: "USD",
        };
      }

      // Fetch all enrollments to calculate stats
      const response = await enrollmentHistoryService.getEnrollmentHistory(
        user.id,
        {
          limit: 1000, // Get all enrollments for stats
        }
      );

      const stats = response.items.reduce(
        (acc, item) => {
          acc.totalEnrollments++;

          if (item.payment) {
            acc.paidEnrollments++;
            acc.totalSpent += item.payment.final_amount_cents;
          } else {
            acc.freeEnrollments++;
          }

          if (item.access_status === "active") {
            acc.activeEnrollments++;
          } else if (item.access_status === "expired") {
            acc.expiredEnrollments++;
          }

          return acc;
        },
        {
          totalEnrollments: 0,
          totalSpent: 0,
          activeEnrollments: 0,
          expiredEnrollments: 0,
          freeEnrollments: 0,
          paidEnrollments: 0,
          currency: response.items[0]?.payment?.currency || "USD",
        }
      );

      return stats;
    },
    enabled: !!user?.id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to download a receipt (for paid enrollments)
 */
export function useDownloadReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      // Call the receipt API endpoint
      const response = await fetch(`/api/receipts/${paymentId}`, {
        method: "GET",
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to download receipt");
      }

      // Create a blob and download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${paymentId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    },
    onSuccess: () => {
      // Optionally invalidate queries or show success message
    },
    onError: error => {
      console.error("Receipt download failed:", error);
    },
  });
}

/**
 * Hook to invalidate enrollment history queries
 */
export function useInvalidateEnrollmentHistory() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentHistoryKeys.all });
    },
    invalidateList: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: enrollmentHistoryKeys.lists(),
      });
    },
    invalidateDetail: (userId: string, enrollmentId: string) => {
      queryClient.invalidateQueries({
        queryKey: enrollmentHistoryKeys.detail(userId, enrollmentId),
      });
    },
  };
}

// Utility functions for working with enrollment data
export const enrollmentUtils = {
  /**
   * Format currency amount from cents
   */
  formatCurrency: (amountCents: number, currency = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amountCents / 100);
  },

  /**
   * Format enrollment date
   */
  formatDate: (dateString: string): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  },

  /**
   * Get status color for UI
   */
  getStatusColor: (status: "active" | "expired" | "pending"): string => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50";
      case "expired":
        return "text-red-600 bg-red-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  },

  /**
   * Get status label for display
   */
  getStatusLabel: (status: "active" | "expired" | "pending"): string => {
    switch (status) {
      case "active":
        return "Active";
      case "expired":
        return "Expired";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  },

  /**
   * Get source label for display
   */
  getSourceLabel: (source: "purchase" | "free" | "package"): string => {
    switch (source) {
      case "purchase":
        return "Purchase";
      case "free":
        return "Free";
      case "package":
        return "Package";
      default:
        return "Unknown";
    }
  },

  /**
   * Get source color for UI
   */
  getSourceColor: (source: "purchase" | "free" | "package"): string => {
    switch (source) {
      case "purchase":
        return "text-blue-600 bg-blue-50";
      case "free":
        return "text-green-600 bg-green-50";
      case "package":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  },

  /**
   * Calculate days until expiration
   */
  getDaysUntilExpiration: (expiresAt: string): number => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Check if enrollment is expiring soon (within 30 days)
   */
  isExpiringSoon: (expiresAt: string): boolean => {
    const daysUntilExpiration =
      enrollmentUtils.getDaysUntilExpiration(expiresAt);
    return daysUntilExpiration > 0 && daysUntilExpiration <= 30;
  },
};

// Re-export types for external use
export type {
  EnrollmentHistoryOptions,
  ExtendedEnrollmentHistoryItem,
  EnrollmentHistoryResponse,
} from "@/services/enrollment-history";
