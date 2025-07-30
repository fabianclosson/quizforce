import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock process.env before importing config
const originalEnv = process.env;

// Helper to set environment variables for testing
const setEnv = (env: Record<string, string>) => {
  process.env = { ...originalEnv, ...env };
};

// Helper to clear environment variables
const clearEnv = () => {
  process.env = { ...originalEnv };
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('NEXT_PUBLIC_') || 
        key.startsWith('STRIPE_') || 
        key.startsWith('SUPABASE_') ||
        key.startsWith('GOOGLE_') ||
        key.startsWith('SENTRY_') ||
        key.startsWith('UPSTASH_')) {
      delete process.env[key];
    }
  });
};

describe('Environment Configuration', () => {
  beforeEach(() => {
    // Clear module cache to ensure fresh imports
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Required Variables', () => {
    it('should validate successfully with all required variables', () => {
      setEnv({
        NODE_ENV: 'development',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        STRIPE_SECRET_KEY: 'sk_test_123',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
      });

      expect(() => {
        require('../config');
      }).not.toThrow();
    });

    it('should throw error when required Supabase variables are missing', () => {
      setEnv({
        NODE_ENV: 'production',
        STRIPE_SECRET_KEY: 'sk_test_123',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
      });

      expect(() => {
        require('../config');
      }).toThrow('Invalid environment configuration');
    });

    it('should throw error when required Stripe variables are missing', () => {
      setEnv({
        NODE_ENV: 'production',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      });

      expect(() => {
        require('../config');
      }).toThrow('Invalid environment configuration');
    });

    it('should validate URL format for Supabase URL', () => {
      setEnv({
        NODE_ENV: 'production',
        NEXT_PUBLIC_SUPABASE_URL: 'invalid-url',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        STRIPE_SECRET_KEY: 'sk_test_123',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
      });

      expect(() => {
        require('../config');
      }).toThrow('Invalid environment configuration');
    });
  });

  describe('Optional Variables', () => {
    it('should work with minimal required configuration', () => {
      setEnv({
        NODE_ENV: 'development',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        STRIPE_SECRET_KEY: 'sk_test_123',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
      });

      const { config } = require('../config');
      
      expect(config.siteUrl).toBe('https://quizforce.ai'); // Default value
      expect(config.auth.google.isConfigured).toBe(false);
      expect(config.sentry.isConfigured).toBe(false);
      expect(config.rateLimit.redis.isConfigured).toBe(false);
    });

    it('should enable features when optional variables are present', () => {
      setEnv({
        NODE_ENV: 'development',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        STRIPE_SECRET_KEY: 'sk_test_123',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
        GOOGLE_CLIENT_ID: 'test-google-id',
        GOOGLE_CLIENT_SECRET: 'test-google-secret',
        SENTRY_DSN: 'https://test@sentry.io/123',
        UPSTASH_REDIS_REST_URL: 'https://test.upstash.io',
        UPSTASH_REDIS_REST_TOKEN: 'test-token',
      });

      const { config } = require('../config');
      
      expect(config.auth.google.isConfigured).toBe(true);
      expect(config.sentry.isConfigured).toBe(true);
      expect(config.rateLimit.redis.isConfigured).toBe(true);
    });
  });

  describe('Feature Validation', () => {
    it('should validate payment configuration', () => {
      setEnv({
        NODE_ENV: 'development',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        STRIPE_SECRET_KEY: 'sk_test_123',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
      });

      const { validateFeatureConfig } = require('../config');
      
      expect(() => {
        validateFeatureConfig.payments();
      }).not.toThrow();
    });

    it('should throw error for unconfigured payments', () => {
      setEnv({
        NODE_ENV: 'development',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        STRIPE_SECRET_KEY: '',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: '',
        STRIPE_WEBHOOK_SECRET: '',
      });

      const { validateFeatureConfig } = require('../config');
      
      expect(() => {
        validateFeatureConfig.payments();
      }).toThrow('Stripe configuration is required');
    });
  });

  describe('Runtime Environment', () => {
    it('should correctly identify environment types', () => {
      setEnv({
        NODE_ENV: 'production',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        STRIPE_SECRET_KEY: 'sk_test_123',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
      });

      const { config, runtime } = require('../config');
      
      expect(config.isProduction).toBe(true);
      expect(config.isDevelopment).toBe(false);
      expect(config.security.useSecureCookies).toBe(true);
      expect(runtime.isServer).toBe(typeof window === "undefined"); // Jest runs in Node.js environment
    });
  });

  describe('Development Mode Behavior', () => {
    it('should not throw in development mode with validation errors', () => {
      // Mock console methods to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      setEnv({
        NODE_ENV: 'development',
        // Missing required variables
      });

      expect(() => {
        require('../config');
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Environment variable validation failed')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Continuing in development mode')
      );

      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });
}); 