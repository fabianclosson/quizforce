/**
 * Rate Limiting for Next.js 15
 *
 * This module provides flexible rate limiting with support for both
 * in-memory (development) and Redis-based (production) backends.
 */

import { NextRequest } from "next/server";

// Rate limiting configuration
export interface RateLimitConfig {
  requests: number;
  windowMs: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Rate limit result
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// In-memory store for development
interface MemoryEntry {
  count: number;
  resetTime: number;
}

class MemoryStore {
  private store = new Map<string, MemoryEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
          if (now > entry.resetTime) {
            this.store.delete(key);
          }
        }
      },
      5 * 60 * 1000
    );
  }

  async increment(
    key: string,
    windowMs: number
  ): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const resetTime = now + windowMs;
    const existing = this.store.get(key);

    if (!existing || now > existing.resetTime) {
      // New window or expired entry
      const entry = { count: 1, resetTime };
      this.store.set(key, entry);
      return entry;
    } else {
      // Increment existing entry
      existing.count++;
      this.store.set(key, existing);
      return existing;
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global memory store instance
const memoryStore = new MemoryStore();

/**
 * Redis-based rate limiter (for production)
 * Requires @upstash/redis and @upstash/ratelimit packages
 */
class RedisRateLimiter {
  private ratelimit: unknown;

  constructor() {
    try {
      // Dynamic import to avoid errors if packages aren't installed
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Ratelimit } = require("@upstash/ratelimit");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Redis } = require("@upstash/redis");
      const { config } = require("./config");

      if (config.rateLimit.redis.isConfigured) {
        const redis = new Redis({
          url: config.rateLimit.redis.url,
          token: config.rateLimit.redis.token,
        });

        this.ratelimit = new Ratelimit({
          redis,
          limiter: Ratelimit.fixedWindow(10, "10 s"), // Default config
          analytics: true,
        });
      }
    } catch (error) {
      console.warn("Redis rate limiter not available:", error);
    }
  }

  async limit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    if (!this.ratelimit) {
      throw new Error("Redis rate limiter not configured");
    }

    try {
      // Type assertion since we're using dynamic imports
      const result = await (
        this.ratelimit as {
          limit: (key: string) => Promise<{
            success: boolean;
            limit: number;
            remaining: number;
            reset: number;
          }>;
        }
      ).limit(key);

      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        retryAfter: result.success
          ? undefined
          : Math.ceil((result.reset - Date.now()) / 1000),
      };
    } catch (error) {
      console.error("Redis rate limit error:", error);
      // Fallback to allowing the request if Redis fails
      return {
        success: true,
        limit: config.requests,
        remaining: config.requests - 1,
        reset: Date.now() + config.windowMs,
      };
    }
  }

  isAvailable(): boolean {
    return !!this.ratelimit;
  }
}

// Global Redis limiter instance
const redisLimiter = new RedisRateLimiter();

/**
 * Create a rate limiter with the specified configuration
 *
 * @param config - Rate limiting configuration
 * @returns Rate limiter function
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (key: string): Promise<RateLimitResult> => {
    // Use Redis in production if available, otherwise fall back to memory
    const { config: appConfig } = require("./config");
    if (redisLimiter.isAvailable() && appConfig.isProduction) {
      return redisLimiter.limit(key, config);
    }

    // Memory-based rate limiting
    const { count, resetTime } = await memoryStore.increment(
      key,
      config.windowMs
    );
    const now = Date.now();
    const remaining = Math.max(0, config.requests - count);
    const success = count <= config.requests;

    return {
      success,
      limit: config.requests,
      remaining,
      reset: resetTime,
      retryAfter: success ? undefined : Math.ceil((resetTime - now) / 1000),
    };
  };
}

/**
 * Get client identifier from request
 *
 * @param request - Next.js request object
 * @param useUserId - Whether to include user ID if available
 * @returns Client identifier string
 */
export function getClientIdentifier(
  request: NextRequest,
  useUserId = false
): string {
  // Try to get IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";

  // For authenticated requests, you can include user ID
  if (useUserId) {
    const userId = request.headers.get("x-user-id"); // You'll need to set this in your auth middleware
    if (userId) {
      return `user:${userId}`;
    }
  }

  return `ip:${ip}`;
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // General API endpoints
  api: createRateLimiter({
    requests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many API requests, please try again later",
  }),

  // Authentication endpoints (stricter)
  auth: createRateLimiter({
    requests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many authentication attempts, please try again later",
  }),

  // Password reset (very strict)
  passwordReset: createRateLimiter({
    requests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many password reset attempts, please try again later",
  }),

  // Stripe checkout (moderate)
  checkout: createRateLimiter({
    requests: 10,
    windowMs: 10 * 60 * 1000, // 10 minutes
    message: "Too many checkout attempts, please try again later",
  }),

  // File uploads (strict)
  upload: createRateLimiter({
    requests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many upload attempts, please try again later",
  }),
};

/**
 * Rate limiting middleware helper
 *
 * @param limiter - Rate limiter function
 * @param getKey - Function to extract key from request
 * @returns Middleware function
 */
export function withRateLimit(
  limiter: (key: string) => Promise<RateLimitResult>,
  getKey: (request: NextRequest) => string = req => getClientIdentifier(req)
) {
  return async (request: NextRequest) => {
    const key = getKey(request);
    const result = await limiter(key);

    if (!result.success) {
      const headers = new Headers({
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
      });

      if (result.retryAfter) {
        headers.set("Retry-After", result.retryAfter.toString());
      }

      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers,
        }
      );
    }

    return null; // Continue processing
  };
}

/**
 * Apply rate limiting to API route handlers
 *
 * @param handler - Original API route handler
 * @param limiter - Rate limiter function
 * @param getKey - Function to extract key from request
 * @returns Enhanced handler with rate limiting
 */
export function rateLimit<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>,
  limiter: (key: string) => Promise<RateLimitResult>,
  getKey: (request: NextRequest) => string = req => getClientIdentifier(req)
) {
  return async (...args: T): Promise<Response> => {
    const request = args[0] as NextRequest;
    const key = getKey(request);
    const result = await limiter(key);

    if (!result.success) {
      const headers = new Headers({
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
      });

      if (result.retryAfter) {
        headers.set("Retry-After", result.retryAfter.toString());
      }

      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers,
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = await handler(...args);
    response.headers.set("X-RateLimit-Limit", result.limit.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", result.reset.toString());

    return response;
  };
}
