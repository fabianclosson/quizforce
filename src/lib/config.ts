import { z } from "zod";

/**
 * Environment Variable Validation Schema
 * 
 * This schema validates all environment variables used in the application
 * and provides type-safe access to them with proper fallbacks.
 */

// Base environment schema
const envSchema = z.object({
  // Node.js environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Next.js specific
  NEXT_RUNTIME: z.enum(["nodejs", "edge"]).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://quizforce.com"),
  CI: z.string().optional(),
  
  // Supabase Configuration (Required in production)
  // Support both standard Next.js naming and Vercel integration naming
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL"
  }).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"
  }).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, {
    message: "SUPABASE_SERVICE_ROLE_KEY is required for server-side operations"
  }).optional(),
  
  // Vercel Supabase Integration naming (fallbacks)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_JWT_SECRET: z.string().min(1).optional(),
  
  // Stripe Configuration (Required in production for payments)
  STRIPE_SECRET_KEY: z.string().min(1, {
    message: "STRIPE_SECRET_KEY is required for payment processing"
  }).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, {
    message: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required for client-side Stripe"
  }).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, {
    message: "STRIPE_WEBHOOK_SECRET is required for webhook verification"
  }).optional(),
  
  // Optional Authentication
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  
  // Optional Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Optional SEO verification
  GOOGLE_SITE_VERIFICATION: z.string().optional(),
  YANDEX_VERIFICATION: z.string().optional(),
  YAHOO_VERIFICATION: z.string().optional(),
  
  // Optional Sentry Configuration
  SENTRY_DSN: z.string().url().optional(),
  
  // Optional Rate Limiting (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Build and Analysis
  ANALYZE: z.string().optional(),
});

/**
 * Environment Variable Validation Result
 */
type EnvValidationResult = {
  success: boolean;
  data?: z.infer<typeof envSchema>;
  errors?: string[];
};

/**
 * Validates environment variables and returns type-safe config
 */
function validateEnv(): EnvValidationResult {
  try {
    const parsed = envSchema.parse(process.env);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err) => 
        `${err.path.join(".")}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}

/**
 * Validated environment configuration
 */
const envValidation = validateEnv();

if (!envValidation.success) {
  console.error("❌ Environment variable validation failed:");
  envValidation.errors?.forEach((error) => {
    console.error(`  - ${error}`);
  });
  
  if (process.env.NODE_ENV === "production") {
    throw new Error("Invalid environment configuration. Check the logs above.");
  } else {
    console.warn("⚠️  Continuing in development mode with validation errors.");
  }
}

/**
 * Type-safe environment configuration
 * All environment variables are validated and typed
 */
export const env = envValidation.data || ({} as z.infer<typeof envSchema>);

/**
 * Configuration object with computed values and fallbacks
 */
export const config = {
  // Environment info
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  
  // Site configuration
  siteUrl: env.NEXT_PUBLIC_SITE_URL,
  
  // Supabase configuration
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '',
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_JWT_SECRET || '',
    isConfigured: !!(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL) && !!(env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY) && !!(env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_JWT_SECRET),
  },
  
  // Stripe configuration
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY || '',
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
    isConfigured: !!(env.STRIPE_SECRET_KEY && env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  },
  
  // Authentication
  auth: {
    nextAuthUrl: env.NEXTAUTH_URL || env.NEXT_PUBLIC_SITE_URL,
    nextAuthSecret: env.NEXTAUTH_SECRET,
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      isConfigured: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    },
  },
  
  // SEO verification
  seo: {
    googleVerification: env.GOOGLE_SITE_VERIFICATION,
    yandexVerification: env.YANDEX_VERIFICATION,
    yahooVerification: env.YAHOO_VERIFICATION,
  },
  
  // Monitoring
  sentry: {
    dsn: env.SENTRY_DSN,
    isConfigured: !!env.SENTRY_DSN,
  },
  
  // Rate limiting
  rateLimit: {
    redis: {
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
      isConfigured: !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
    },
  },
  
  // Security settings
  security: {
    useSecureCookies: env.NODE_ENV === "production",
    corsOrigins: env.NODE_ENV === "development" 
      ? ["http://localhost:3000", "http://127.0.0.1:3000"]
      : [env.NEXT_PUBLIC_SITE_URL],
  },
} as const;

/**
 * Runtime environment check utilities
 */
export const runtime = {
  isServer: typeof window === "undefined",
  isClient: typeof window !== "undefined",
  isEdge: process.env.NEXT_RUNTIME === "edge",
  isNodejs: process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === undefined,
} as const;

/**
 * Validates that required environment variables are present for specific features
 */
export const validateFeatureConfig = {
  payments: () => {
    // Don't throw errors during build time, only at runtime
    const isBuildTime = process.env.VERCEL_ENV === undefined && process.env.CI !== undefined;
    const isRuntimeProduction = config.isProduction && !isBuildTime;
    
    if (!config.stripe.isConfigured && isRuntimeProduction) {
      throw new Error("Stripe configuration is required for payment features in production. Please set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.");
    } else if (!config.stripe.isConfigured) {
      console.warn("⚠️  Stripe not configured. Payment features will be disabled.");
    }
  },
  
  supabase: () => {
    // Don't throw errors during build time, only at runtime
    const isBuildTime = process.env.VERCEL_ENV === undefined && process.env.CI !== undefined;
    const isRuntimeProduction = config.isProduction && !isBuildTime;
    
    if (!config.supabase.isConfigured && isRuntimeProduction) {
      throw new Error("Supabase configuration is required in production. Please set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.");
    } else if (!config.supabase.isConfigured) {
      console.warn("⚠️  Supabase not configured. Database features will be disabled.");
    }
  },
  
  googleAuth: () => {
    if (!config.auth.google.isConfigured) {
      if (config.isProduction) {
        console.warn("⚠️  Google OAuth not configured. Users will only be able to use email authentication.");
      }
    }
  },
  
  rateLimit: () => {
    if (!config.rateLimit.redis.isConfigured && config.isProduction) {
      console.warn("⚠️  Redis rate limiting not configured in production. Consider setting UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.");
    }
  },
  
  monitoring: () => {
    if (!config.sentry.isConfigured && config.isProduction) {
      console.warn("⚠️  Sentry monitoring not configured in production. Consider setting SENTRY_DSN.");
    }
  },
} as const;

// Run feature validations on import - but be more lenient during build time
const isBuildTime = typeof window === 'undefined' && (
  process.env.VERCEL === '1' || 
  process.env.CI === 'true' || 
  process.env.NODE_ENV === 'production'
) && !process.env.NEXT_RUNTIME;

if (config.isProduction && !isBuildTime) {
  try {
    validateFeatureConfig.supabase();
    validateFeatureConfig.payments();
    validateFeatureConfig.rateLimit();
    validateFeatureConfig.monitoring();
  } catch (error) {
    console.error("❌ Feature configuration error:", error);
    throw error;
  }
} else {
  // In development or build time, just run warnings
  validateFeatureConfig.supabase();
  validateFeatureConfig.payments();
  validateFeatureConfig.googleAuth();
}

// Check environment and provide fallbacks
const getEnvVar = (key: string, fallback: string = ''): string => {
  if (typeof window !== 'undefined') {
    // Client-side: only access NEXT_PUBLIC_ vars
    return key.startsWith('NEXT_PUBLIC_') 
      ? (window as any).__NEXT_DATA__?.env?.[key] || process.env[key] || fallback
      : fallback;
  }
  // Server-side: access all vars
  return process.env[key] || fallback;
};

// Use validated environment configuration
const supabaseUrl = config.supabase.url;

export default config; 