import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import apiClient from "@/lib/api-client";

interface EnrollmentResponse {
  success: boolean;
  message: string;
  enrollment?: {
    id: string;
    certification_id: string;
    certification_name?: string;
    enrolled_at: string;
    expires_at: string;
  };
  enrollments?: Array<{
    id: string;
    certification_id: string;
    enrolled_at: string;
    expires_at: string;
  }>;
  package?: {
    id: string;
    name: string;
  };
  skipped_enrollments?: number;
}

interface EnrollmentStatusResponse {
  enrolled: boolean;
  active?: boolean;
  fully_enrolled?: boolean;
  active_enrollments?: number;
  total_certifications?: number;
  enrollment?: {
    id: string;
    enrolled_at: string;
    expires_at: string;
    source: string;
    package_id?: string;
  };
  enrollments?: Array<{
    id: string;
    certification_id: string;
    enrolled_at: string;
    expires_at: string;
    source: string;
  }>;
  message?: string;
}

interface UserEnrollment {
  id: string;
  enrolled_at: string;
  expires_at: string;
  source: string;
  package_id?: string;
  certification: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price_cents: number;
    certification_categories: { name: string; icon: string | null } | null;
    practice_exams: Array<{
      id: string;
      name: string;
      question_count: number;
      passing_threshold_percentage: number;
      time_limit_minutes: number;
      is_active: boolean;
      attempt_status?: "start" | "continue" | "restart";
      current_attempt_id?: string;
      current_attempt_mode?: "exam" | "practice";
      last_score?: number;
      attempt_count?: number;
      best_score?: number;
      best_score_passed?: boolean;
    }>;
  };
}

interface UserEnrollmentsResponse {
  enrollments: UserEnrollment[];
  total_count: number;
}

// Hook for fetching user enrollments
export function useUserEnrollments() {
  const { user } = useAuth();

  return useQuery<UserEnrollmentsResponse, Error>({
    queryKey: ["user-enrollments", user?.id],
    queryFn: async () => {
      if (!user) {
        // Return empty data for unauthenticated users instead of throwing error
        return { enrollments: [], total_count: 0 };
      }

      return apiClient<UserEnrollmentsResponse>("/api/user/enrollments");
    },
    enabled: !!user,
    retry: (failureCount, error) => {
      // Don't retry authentication errors
      if (error.message === "Authentication required") {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    // Provide initial data for smoother UX
    initialData: { enrollments: [], total_count: 0 },
    // Prevent showing stale data when user changes
    staleTime: 0,
  });
}

// Hook for checking certification enrollment status
export function useCertificationEnrollmentStatus(certificationId: string) {
  const { user } = useAuth();

  return useQuery<EnrollmentStatusResponse, Error>({
    queryKey: ["enrollment-status", "certification", certificationId],
    queryFn: async () => {
      if (!user) {
        // Return not enrolled for unauthenticated users
        return { enrolled: false };
      }

      return apiClient<EnrollmentStatusResponse>(
        `/api/certifications/${certificationId}/enroll`
      );
    },
    enabled: !!user && !!certificationId,
    retry: (failureCount, error) => {
      // Don't retry authentication errors
      if (error.message === "Authentication required") {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    // Provide initial data for smoother UX
    initialData: { enrolled: false },
    // Prevent showing stale data when user changes
    staleTime: 0,
  });
}

// Hook for checking package enrollment status
export function usePackageEnrollmentStatus(packageId: string) {
  const { user } = useAuth();

  return useQuery<EnrollmentStatusResponse, Error>({
    queryKey: ["enrollment-status", "package", packageId],
    queryFn: async () => {
      if (!user) {
        // Return not enrolled for unauthenticated users
        return { enrolled: false };
      }
      return apiClient<EnrollmentStatusResponse>(
        `/api/packages/${packageId}/enroll`
      );
    },
    enabled: !!user && !!packageId,
    retry: (failureCount, error) => {
      // Don't retry authentication errors
      if (error.message === "Authentication required") {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    // Provide initial data for smoother UX
    initialData: { enrolled: false },
    // Prevent showing stale data when user changes
    staleTime: 0,
  });
}

// The enrollCertification function has been moved to src/app/actions/enrollment.ts
// as a server action for a more robust and simplified implementation.

// Hook for enrolling in a package
export function useEnrollPackage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<EnrollmentResponse, Error, string>({
    mutationFn: async (packageId: string) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      return apiClient<EnrollmentResponse>(
        `/api/packages/${packageId}/enroll`,
        {
          method: "POST",
        }
      );
    },
    onSuccess: (data, packageId) => {
      // Invalidate enrollment status queries
      queryClient.invalidateQueries({
        queryKey: ["enrollment-status", "package", packageId],
      });

      // Invalidate user enrollments
      queryClient.invalidateQueries({
        queryKey: ["user-enrollments", user?.id],
      });

      // Invalidate catalog queries to update enrollment state
      queryClient.invalidateQueries({
        queryKey: ["package", packageId],
      });

      // If enrollments were created, invalidate individual certification queries
      if (data.enrollments) {
        data.enrollments.forEach(enrollment => {
          queryClient.invalidateQueries({
            queryKey: [
              "enrollment-status",
              "certification",
              enrollment.certification_id,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["certification", enrollment.certification_id],
          });
        });
      }
    },
  });
}
