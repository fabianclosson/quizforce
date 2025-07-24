/**
 * Dashboard Overview Component
 *
 * Main dashboard component that displays user statistics, exams in progress,
 * certifications, and recent activity.
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExamsInProgress } from "./exams-in-progress";
import { UserCertifications } from "./user-certifications";
import { DashboardEmptyState } from "./dashboard-empty-state";
import { DashboardLoadingState } from "./dashboard-loading-state";
import { DashboardErrorState } from "./dashboard-error-state";
import {
  useDashboardData,
  useDashboardStats,
  useRefreshDashboard,
} from "@/hooks/use-dashboard";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export function DashboardOverview() {
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboardData();
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const { refreshAll } = useRefreshDashboard();

  const isLoading = isDashboardLoading || isStatsLoading;

  if (dashboardError) {
    return <DashboardErrorState error={dashboardError} onRetry={refreshAll} />;
  }

  // Show comprehensive empty state for completely new users
  const hasNoData =
    !isLoading &&
    !dashboardData?.exams_in_progress?.length &&
    !dashboardData?.user_certifications?.length &&
    (!stats?.total_certifications || stats.total_certifications === 0);

  if (hasNoData) {
    return <DashboardEmptyState />;
  }

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your certification progress and exam performance
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Certifications
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.total_certifications || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Exams
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.total_exams_taken || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.in_progress_certifications || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Active exams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.average_score ? `${stats.average_score}%` : "N/A"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Across all exams</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Exams in Progress */}
        <ExamsInProgress maxItems={5} />

        {/* User Certifications */}
        <UserCertifications maxItems={5} />
      </div>
    </div>
  );
}
