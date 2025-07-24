/**
 * Dashboard Data Hooks
 *
 * React Query hooks for fetching and managing user dashboard data
 * including exam progress, certifications, and statistics.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import {
  getDashboardData,
  getExamsInProgress,
  getUserCertifications,
  getDashboardStats,
  getRecentActivity,
} from "@/services/dashboard";

// Query keys for consistent caching
export const dashboardKeys = {
  all: ["dashboard"] as const,
  data: () => [...dashboardKeys.all, "data"] as const,
  examsInProgress: () => [...dashboardKeys.all, "exams-in-progress"] as const,
  certifications: () => [...dashboardKeys.all, "certifications"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  activity: () => [...dashboardKeys.all, "activity"] as const,
};

/**
 * Hook to fetch complete dashboard data
 */
export function useDashboardData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: getDashboardData,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch exams currently in progress
 */
export function useExamsInProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: dashboardKeys.examsInProgress(),
    queryFn: () => getExamsInProgress(user?.id || ""),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for active exams)
    gcTime: 5 * 60 * 1000,
    retry: 3,
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds for active exams
    refetchIntervalInBackground: false,
  });
}

/**
 * Hook to fetch user certifications
 */
export function useUserCertifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: dashboardKeys.certifications(),
    queryFn: () => getUserCertifications(user?.id || ""),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => getDashboardStats(user?.id || ""),
    enabled: !!user?.id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to fetch recent activity
 */
export function useRecentActivity() {
  const { user } = useAuth();

  return useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: () => getRecentActivity(user?.id || ""),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to refresh all dashboard data
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  return {
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    refreshData: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.data() });
    },
    refreshExams: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.examsInProgress(),
      });
    },
    refreshCertifications: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.certifications(),
      });
    },
    refreshStats: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
    },
  };
}

/**
 * Hook to get dashboard loading states
 */
export function useDashboardLoadingStates() {
  const dashboardData = useDashboardData();
  const examsInProgress = useExamsInProgress();
  const userCertifications = useUserCertifications();
  const dashboardStats = useDashboardStats();

  return {
    isLoading:
      dashboardData.isLoading ||
      examsInProgress.isLoading ||
      userCertifications.isLoading ||
      dashboardStats.isLoading,
    isError:
      dashboardData.isError ||
      examsInProgress.isError ||
      userCertifications.isError ||
      dashboardStats.isError,
    error:
      dashboardData.error ||
      examsInProgress.error ||
      userCertifications.error ||
      dashboardStats.error,
    isSuccess:
      dashboardData.isSuccess &&
      examsInProgress.isSuccess &&
      userCertifications.isSuccess &&
      dashboardStats.isSuccess,
  };
}
