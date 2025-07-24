"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  Settings,
  BarChart3,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminStats } from "@/lib/admin-auth";

interface AdminDashboardClientProps {
  initialStats?: AdminStats;
}

export function AdminDashboardClient({
  initialStats,
}: AdminDashboardClientProps) {
  const [stats, setStats] = useState<AdminStats | null>(initialStats || null);
  const [loading, setLoading] = useState(!initialStats);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialStats) {
      fetchStats();
    }
  }, [initialStats]);

  const refreshStats = () => {
    fetchStats();
  };

  if (loading && !stats) {
    return (
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            <p className="text-muted-foreground">
              System statistics and quick actions
            </p>
          </div>
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600";
      case "maintenance":
        return "text-yellow-600";
      case "offline":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getSystemStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Settings className="h-4 w-4 text-muted-foreground" />;
      case "maintenance":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      case "offline":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Settings className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            System statistics and quick actions
          </p>
        </div>
        <Button onClick={refreshStats} disabled={loading} variant="outline">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.recentSignups || 0} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Certifications
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalCertifications || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available certifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Exams Taken
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalExams || 0}</div>
            <p className="text-xs text-muted-foreground">
              Practice exams completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {getSystemStatusIcon(stats?.systemStatus || "offline")}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold capitalize ${getSystemStatusColor(stats?.systemStatus || "offline")}`}
            >
              {stats?.systemStatus || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.systemStatus === "online"
                ? "All systems operational"
                : stats?.systemStatus === "maintenance"
                  ? "Under maintenance"
                  : "System offline"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Manage user accounts, roles, and permissions.
            </p>
            <Button className="w-full" disabled>
              Manage Users
              <span className="text-xs ml-2 opacity-70">(Coming Soon)</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Content Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Add and edit certifications, exams, and questions.
            </p>
            <Button className="w-full" disabled>
              Manage Content
              <span className="text-xs ml-2 opacity-70">(Coming Soon)</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              View detailed analytics and user performance reports.
            </p>
            <Button className="w-full" disabled>
              View Analytics
              <span className="text-xs ml-2 opacity-70">(Coming Soon)</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.totalQuestions}
                </div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.recentSignups}
                </div>
                <p className="text-sm text-muted-foreground">Recent Signups</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalCertifications > 0
                    ? Math.round(
                        stats.totalQuestions / stats.totalCertifications
                      )
                    : 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Avg. Questions/Cert
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalUsers > 0
                    ? Math.round((stats.totalExams / stats.totalUsers) * 100)
                    : 0}
                  %
                </div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
