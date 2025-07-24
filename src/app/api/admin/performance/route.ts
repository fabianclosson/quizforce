import { NextRequest, NextResponse } from "next/server";
import { adminOnly } from "@/lib/auth-middleware";
import { getQueryPerformanceStats } from "@/lib/query-optimizer";
import { createServiceSupabaseClient } from "@/lib/supabase";

export const GET = adminOnly(async (request: NextRequest, { supabase }) => {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "stats";

    const serviceSupabase = createServiceSupabaseClient();

    switch (action) {
      case "stats":
        return await getPerformanceStats();

      case "indexes":
        return await getIndexUsage(serviceSupabase);

      case "slow-queries":
        return await getSlowQueries(serviceSupabase);

      case "table-sizes":
        return await getTableSizes(serviceSupabase);

      case "unused-indexes":
        return await getUnusedIndexes(serviceSupabase);

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Performance API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance data" },
      { status: 500 }
    );
  }
});

async function getPerformanceStats() {
  try {
    const stats = getQueryPerformanceStats();
    const cacheHitRate = stats.totalQueries > 0 
      ? (stats.cachedQueries / stats.totalQueries) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalQueries: stats.totalQueries,
          cachedQueries: stats.cachedQueries,
          cacheHitRate: Math.round(cacheHitRate * 100) / 100,
          averageDuration: Math.round(stats.averageDuration * 100) / 100,
          slowQueries: stats.slowQueries,
        },
        tableStats: stats.tableStats,
        recommendations: generateRecommendations(stats),
      },
    });
  } catch (error) {
    console.error("Error getting performance stats:", error);
    return NextResponse.json(
      { error: "Failed to get performance statistics" },
      { status: 500 }
    );
  }
}

async function getIndexUsage(supabase: any) {
  try {
    const { data, error } = await supabase.rpc("get_index_usage_stats");

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch index usage data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error getting index usage:", error);
    return NextResponse.json(
      { error: "Failed to get index usage statistics" },
      { status: 500 }
    );
  }
}

async function getSlowQueries(supabase: any) {
  try {
    const { data, error } = await supabase
      .from("slow_queries")
      .select("*")
      .limit(20);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch slow queries" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error getting slow queries:", error);
    return NextResponse.json(
      { error: "Failed to get slow queries" },
      { status: 500 }
    );
  }
}

async function getTableSizes(supabase: any) {
  try {
    const { data, error } = await supabase
      .from("table_sizes")
      .select("*")
      .order("size_mb", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch table sizes" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error getting table sizes:", error);
    return NextResponse.json(
      { error: "Failed to get table sizes" },
      { status: 500 }
    );
  }
}

async function getUnusedIndexes(supabase: any) {
  try {
    const { data, error } = await supabase.rpc("get_unused_indexes");

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch unused indexes" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error getting unused indexes:", error);
    return NextResponse.json(
      { error: "Failed to get unused indexes" },
      { status: 500 }
    );
  }
}

function generateRecommendations(stats: any) {
  const recommendations = [];

  // Cache hit rate recommendations
  const cacheHitRate = stats.totalQueries > 0 
    ? (stats.cachedQueries / stats.totalQueries) * 100 
    : 0;

  if (cacheHitRate < 30) {
    recommendations.push({
      type: "cache",
      severity: "high",
      message: "Cache hit rate is low. Consider increasing cache TTL for frequently accessed data.",
      metric: `${Math.round(cacheHitRate)}%`,
    });
  }

  // Average duration recommendations
  if (stats.averageDuration > 500) {
    recommendations.push({
      type: "performance",
      severity: "high",
      message: "Average query duration is high. Consider optimizing slow queries and adding indexes.",
      metric: `${Math.round(stats.averageDuration)}ms`,
    });
  }

  // Slow queries recommendations
  if (stats.slowQueries > 0) {
    recommendations.push({
      type: "performance",
      severity: "medium",
      message: `${stats.slowQueries} slow queries detected. Review and optimize these queries.`,
      metric: `${stats.slowQueries} queries`,
    });
  }

  // Table-specific recommendations
  Object.entries(stats.tableStats).forEach(([table, tableStats]: [string, any]) => {
    if (tableStats.avgDuration > 800) {
      recommendations.push({
        type: "table",
        severity: "medium",
        message: `Table "${table}" has high average query duration. Consider adding indexes or optimizing queries.`,
        metric: `${Math.round(tableStats.avgDuration)}ms avg`,
        table,
      });
    }

    if (tableStats.count > 100) {
      recommendations.push({
        type: "cache",
        severity: "low",
        message: `Table "${table}" is frequently queried. Consider implementing more aggressive caching.`,
        metric: `${tableStats.count} queries`,
        table,
      });
    }
  });

  return recommendations;
} 