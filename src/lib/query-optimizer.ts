/**
 * Database Query Optimization Utilities
 * 
 * Provides caching, query analysis, and performance monitoring for Supabase queries.
 * Implements in-memory caching with Redis fallback, query performance tracking, and optimization recommendations.
 */

import { createClient, createServiceSupabaseClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

// Redis client (conditionally imported based on availability)
let redisClient: any = null;

// Initialize Redis if available
async function initializeRedis() {
  // Check if Redis configuration is available
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!redisUrl || !redisToken || redisClient !== null) {
    if (redisClient === null) {
      redisClient = false; // Mark as unavailable
    }
    return redisClient;
  }

  try {
    // Dynamically import Redis to avoid build issues if not available
    const Redis = (await import('ioredis')).default;
    redisClient = new Redis({
      host: redisUrl.replace('https://', '').replace('http://', ''),
      password: redisToken,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    // Test connection
    await redisClient.ping();
    console.log('✅ Redis cache connected successfully');
  } catch (error) {
    console.warn('⚠️ Redis cache not available, using in-memory cache:', error);
    redisClient = false; // Mark as unavailable
  }

  return redisClient;
}

// In-memory cache fallback
const memoryCache = new Map<string, { data: any; expires: number }>();

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in seconds
  prefix: string;
  version?: string; // For cache invalidation
}

const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Short-lived cache for frequently changing data
  user_progress: { ttl: 300, prefix: 'progress' }, // 5 minutes
  exam_attempts: { ttl: 300, prefix: 'attempts' }, // 5 minutes
  
  // Medium-lived cache for semi-static data
  practice_exams: { ttl: 1800, prefix: 'exams' }, // 30 minutes
  certifications: { ttl: 1800, prefix: 'certs' }, // 30 minutes
  user_enrollments: { ttl: 900, prefix: 'enrollments' }, // 15 minutes
  
  // Long-lived cache for static data
  knowledge_areas: { ttl: 3600, prefix: 'knowledge' }, // 1 hour
  questions: { ttl: 7200, prefix: 'questions' }, // 2 hours
  categories: { ttl: 7200, prefix: 'categories' }, // 2 hours
};

// Query performance tracking
interface QueryPerformance {
  query: string;
  table: string;
  duration: number;
  timestamp: number;
  cached: boolean;
  userId?: string;
}

const performanceLog: QueryPerformance[] = [];
const MAX_PERFORMANCE_LOG_SIZE = 1000;

/**
 * Generate cache key for a query
 */
function generateCacheKey(
  table: string,
  query: any,
  userId?: string,
  config?: CacheConfig
): string {
  const prefix = config?.prefix || table;
  const version = config?.version || 'v1';
  const queryHash = btoa(JSON.stringify(query)).slice(0, 16);
  const userPart = userId ? `_u${userId.slice(0, 8)}` : '';
  
  return `qf_${prefix}_${version}_${queryHash}${userPart}`;
}

/**
 * Get data from cache
 */
async function getFromCache(key: string): Promise<any | null> {
  try {
    // Try Redis first
    if (redisClient && redisClient !== false) {
      const cached = await redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    }
    
    // Fallback to memory cache
    const cached = memoryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    } else if (cached) {
      memoryCache.delete(key);
    }
    
    return null;
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
}

/**
 * Set data in cache
 */
async function setInCache(key: string, data: any, ttl: number): Promise<void> {
  try {
    // Try Redis first
    if (redisClient && redisClient !== false) {
      await redisClient.setex(key, ttl, JSON.stringify(data));
      return;
    }
    
    // Fallback to memory cache
    memoryCache.set(key, {
      data,
      expires: Date.now() + (ttl * 1000),
    });
    
    // Clean up memory cache if it gets too large
    if (memoryCache.size > 1000) {
      const entries = Array.from(memoryCache.entries());
      const expired = entries.filter(([_, value]) => value.expires <= Date.now());
      expired.forEach(([key]) => memoryCache.delete(key));
    }
  } catch (error) {
    console.warn('Cache write error:', error);
  }
}

/**
 * Invalidate cache entries by pattern
 */
async function invalidateCache(pattern: string): Promise<void> {
  try {
    if (redisClient && redisClient !== false) {
      const keys = await redisClient.keys(`qf_${pattern}*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    }
    
    // Clear memory cache entries matching pattern
    const regex = new RegExp(`^qf_${pattern}`);
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  } catch (error) {
    console.warn('Cache invalidation error:', error);
  }
}

/**
 * Log query performance
 */
function logQueryPerformance(
  table: string,
  query: string,
  duration: number,
  cached: boolean,
  userId?: string
): void {
  const entry: QueryPerformance = {
    query: query.slice(0, 200), // Truncate long queries
    table,
    duration,
    timestamp: Date.now(),
    cached,
    userId,
  };
  
  performanceLog.push(entry);
  
  // Keep log size manageable
  if (performanceLog.length > MAX_PERFORMANCE_LOG_SIZE) {
    performanceLog.splice(0, performanceLog.length - MAX_PERFORMANCE_LOG_SIZE);
  }
  
  // Log slow queries
  if (duration > 1000) {
    console.warn(`🐌 Slow query detected (${duration}ms):`, {
      table,
      query: query.slice(0, 100),
      cached,
    });
  }
}

/**
 * Optimized query executor with caching
 */
export class QueryOptimizer {
  private supabase: SupabaseClient;
  private userId?: string;

  constructor(supabase?: SupabaseClient, userId?: string) {
    this.supabase = supabase || createClient();
    this.userId = userId;
  }

  /**
   * Execute a cached query
   */
  async cachedQuery<T = any>(
    table: string,
    queryBuilder: (query: any) => any,
    cacheType: keyof typeof CACHE_CONFIGS,
    options: {
      bypassCache?: boolean;
      customTTL?: number;
      userId?: string;
    } = {}
  ): Promise<T> {
    const startTime = Date.now();
    const cacheConfig = CACHE_CONFIGS[cacheType];
    const userId = options.userId || this.userId;
    
    // Build the query to generate cache key
    const baseQuery = this.supabase.from(table);
    const builtQuery = queryBuilder(baseQuery);
    const queryString = JSON.stringify({
      table,
      // Extract query parameters for cache key
      method: 'select', // Assume select for now
    });
    
    const cacheKey = generateCacheKey(table, queryString, userId, cacheConfig);
    
    // Try cache first (unless bypassed)
    if (!options.bypassCache) {
      const cached = await getFromCache(cacheKey);
      if (cached) {
        const duration = Date.now() - startTime;
        logQueryPerformance(table, queryString, duration, true, userId);
        return cached;
      }
    }
    
    // Execute query
    const { data, error } = await builtQuery;
    const duration = Date.now() - startTime;
    
    if (error) {
      logQueryPerformance(table, queryString, duration, false, userId);
      throw error;
    }
    
    // Cache the result
    const ttl = options.customTTL || cacheConfig.ttl;
    await setInCache(cacheKey, data, ttl);
    
    logQueryPerformance(table, queryString, duration, false, userId);
    
    return data;
  }

  /**
   * Get user's practice exams with caching
   */
  async getUserPracticeExams(userId: string, certificationId?: string) {
    return this.cachedQuery(
      'practice_exams',
      (query) => {
        let q = query.select(`
          id,
          certification_id,
          name,
          description,
          question_count,
          time_limit_minutes,
          passing_threshold_percentage,
          certifications!certification_id (
            id,
            name,
            slug,
            price_cents,
            certification_categories!category_id (
              id,
              name,
              slug,
              icon,
              color
            )
          )
        `)
        .eq('is_active', true)
        .eq('certifications.is_active', true);
        
        if (certificationId) {
          q = q.eq('certification_id', certificationId);
        }
        
        return q.order('sort_order');
      },
      'practice_exams',
      { userId }
    );
  }

  /**
   * Get user's dashboard data with optimized queries
   */
  async getUserDashboardData(userId: string) {
    // Use Promise.all for parallel execution
    const [examsInProgress, userCertifications, recentAttempts] = await Promise.all([
      this.cachedQuery(
        'exam_attempts',
        (query) => query
          .select(`
            id,
            started_at,
            status,
            mode,
            practice_exams!inner (
              id,
              name,
              question_count,
              time_limit_minutes,
              certifications!inner (
                id,
                name,
                slug
              )
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'in_progress')
          .order('started_at', { ascending: false })
          .limit(10),
        'exam_attempts',
        { userId }
      ),
      
      this.cachedQuery(
        'enrollments',
        (query) => query
          .select(`
            id,
            enrolled_at,
            expires_at,
            certifications!inner (
              id,
              name,
              slug,
              price_cents,
              exam_count,
              total_questions,
              certification_categories!category_id (
                id,
                name,
                slug,
                icon,
                color
              )
            )
          `)
          .eq('user_id', userId)
          .gte('expires_at', new Date().toISOString())
          .order('enrolled_at', { ascending: false }),
        'user_enrollments',
        { userId }
      ),
      
      this.cachedQuery(
        'exam_attempts',
        (query) => query
          .select(`
            id,
            started_at,
            completed_at,
            score,
            status,
            practice_exams!inner (
              id,
              name,
              certifications!inner (
                id,
                name,
                slug
              )
            )
          `)
          .eq('user_id', userId)
          .in('status', ['completed', 'submitted'])
          .order('completed_at', { ascending: false })
          .limit(5),
        'exam_attempts',
        { userId, customTTL: 600 } // 10 minutes for recent attempts
      )
    ]);

    return {
      examsInProgress,
      userCertifications,
      recentAttempts,
    };
  }

  /**
   * Invalidate user-specific caches
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
      invalidateCache(`progress_*_u${userId.slice(0, 8)}`),
      invalidateCache(`attempts_*_u${userId.slice(0, 8)}`),
      invalidateCache(`enrollments_*_u${userId.slice(0, 8)}`),
    ]);
  }

  /**
   * Invalidate content caches (when admin updates data)
   */
  async invalidateContentCache(): Promise<void> {
    await Promise.all([
      invalidateCache('exams_'),
      invalidateCache('certs_'),
      invalidateCache('knowledge_'),
      invalidateCache('questions_'),
      invalidateCache('categories_'),
    ]);
  }
}

/**
 * Get query performance statistics
 */
export function getQueryPerformanceStats() {
  const now = Date.now();
  const last24h = performanceLog.filter(entry => now - entry.timestamp < 24 * 60 * 60 * 1000);
  
  const stats = {
    totalQueries: last24h.length,
    cachedQueries: last24h.filter(entry => entry.cached).length,
    averageDuration: last24h.reduce((sum, entry) => sum + entry.duration, 0) / last24h.length,
    slowQueries: last24h.filter(entry => entry.duration > 1000).length,
    tableStats: {} as Record<string, { count: number; avgDuration: number }>,
  };
  
  // Calculate per-table statistics
  const tableGroups = last24h.reduce((acc, entry) => {
    if (!acc[entry.table]) {
      acc[entry.table] = [];
    }
    acc[entry.table].push(entry);
    return acc;
  }, {} as Record<string, QueryPerformance[]>);
  
  Object.entries(tableGroups).forEach(([table, entries]) => {
    stats.tableStats[table] = {
      count: entries.length,
      avgDuration: entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length,
    };
  });
  
  return stats;
}

/**
 * Initialize the query optimizer
 */
export async function initializeQueryOptimizer(): Promise<void> {
  await initializeRedis();
  console.log('🚀 Query optimizer initialized');
}

// Create singleton instance
export const queryOptimizer = new QueryOptimizer();

// Initialize on module load
if (typeof window === 'undefined') {
  initializeQueryOptimizer().catch(console.error);
} 