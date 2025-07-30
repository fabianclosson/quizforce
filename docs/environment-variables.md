# Environment Variables Configuration

This document outlines all environment variables used in the QuizForce application and how to configure them properly.

## Overview

The application uses a centralized configuration system with runtime validation powered by [Zod](https://zod.dev/). This ensures type safety and provides clear error messages for misconfigured environments.

## Configuration Files

- **`src/lib/config.ts`** - Central configuration with validation
- **`.env.local`** - Local development environment variables
- **`.env.example`** - Example environment file (template)

## Required Variables

These variables are **required** for the application to function:

### Supabase Configuration

```bash
# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Your Supabase anonymous/public key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Your Supabase service role key (server-side operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get these:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Settings > API
4. Copy the values from the API section

### Stripe Configuration

```bash
# Stripe secret key (server-side)
STRIPE_SECRET_KEY=sk_test_51234567890abcdef

# Stripe publishable key (client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef

# Stripe webhook secret (webhook verification)
STRIPE_WEBHOOK_SECRET=whsec_test_123
```

**How to get these:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your API keys
3. For webhooks, go to Webhooks section and copy the signing secret

## Optional Variables

These variables enhance functionality but are not required:

### Site Configuration

```bash
# Your site URL (defaults to https://quizforce.ai)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Authentication

```bash
# NextAuth URL (defaults to NEXT_PUBLIC_SITE_URL)
NEXTAUTH_URL=http://localhost:3000

# NextAuth secret (for JWT signing)
NEXTAUTH_SECRET=your_secure_secret_key
```

### Google OAuth

```bash
# Google OAuth client ID
GOOGLE_CLIENT_ID=your_google_client_id

# Google OAuth client secret
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**How to get these:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials

### SEO Verification

```bash
# Google Search Console verification
GOOGLE_SITE_VERIFICATION=your_verification_code

# Yandex Webmaster verification
YANDEX_VERIFICATION=your_verification_code

# Yahoo verification
YAHOO_VERIFICATION=your_verification_code
```

### Monitoring

```bash
# Sentry DSN for error tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**How to get this:**
1. Create account at [Sentry.io](https://sentry.io/)
2. Create a new project
3. Copy the DSN from project settings

### Rate Limiting

```bash
# Upstash Redis URL (for production rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io

# Upstash Redis token
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

**How to get these:**
1. Create account at [Upstash](https://upstash.com/)
2. Create a Redis database
3. Copy the REST URL and token

## Development vs Production

### Development Setup

1. Copy `.env.example` to `.env.local`
2. Fill in required Supabase and Stripe **test** keys
3. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
4. Optional variables can be omitted

### Production Setup

1. Use **live** Stripe keys (not test keys)
2. Set proper `NEXT_PUBLIC_SITE_URL` for your domain
3. Configure Redis for rate limiting (recommended)
4. Set up Sentry for monitoring (recommended)
5. Generate secure `NEXTAUTH_SECRET`

## Validation and Error Handling

The application validates all environment variables at startup:

### Validation Features

- **Type Safety**: All variables are typed using Zod schemas
- **Required Validation**: Missing required variables cause startup failure
- **Format Validation**: URLs must be valid, keys must meet minimum length
- **Clear Errors**: Descriptive error messages for invalid configurations

### Error Examples

```bash
❌ Environment variable validation failed:
  - NEXT_PUBLIC_SUPABASE_URL: Required
  - STRIPE_SECRET_KEY: String must contain at least 1 character(s)
  - NEXT_PUBLIC_SITE_URL: Invalid url
```

### Development Mode

In development, validation warnings are logged but don't stop the application:

```bash
⚠️  Continuing in development mode with validation errors.
⚠️  Redis rate limiting not configured in production.
⚠️  Sentry monitoring not configured in production.
```

## Feature Toggles

Features are automatically enabled/disabled based on environment variables:

| Feature | Enabled When | Fallback |
|---------|--------------|----------|
| Payments | Stripe keys present | Disabled |
| Google Auth | Google OAuth keys present | Email/password only |
| Rate Limiting | Redis configured | Memory-based |
| Monitoring | Sentry DSN present | Console logging |

## Usage in Code

Import the validated configuration:

```typescript
import { config, env, runtime, validateFeatureConfig } from '@/lib/config';

// Type-safe access to environment variables
const supabaseUrl = config.supabase.url;
const isProduction = config.isProduction;

// Check if features are configured
if (config.stripe.isConfigured) {
  // Stripe is available
}

// Runtime environment checks
if (runtime.isServer) {
  // Server-side code
}

// Validate feature requirements
try {
  validateFeatureConfig.payments();
  // Payments are properly configured
} catch (error) {
  // Handle missing configuration
}
```

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use test keys** in development
3. **Rotate secrets** regularly in production
4. **Limit API key permissions** where possible
5. **Use environment-specific configurations**

## Troubleshooting

### Common Issues

1. **Build fails with "Invalid environment configuration"**
   - Check that all required variables are set
   - Verify URLs are properly formatted
   - Ensure no trailing spaces in values

2. **Stripe payments not working**
   - Verify you're using the correct keys (test vs live)
   - Check webhook secret matches Stripe dashboard
   - Ensure webhook endpoint is accessible

3. **Supabase connection errors**
   - Verify project URL is correct
   - Check that service role key has proper permissions
   - Ensure RLS policies allow your operations

### Debug Mode

Set `NODE_ENV=development` to see detailed configuration logs and validation warnings.

## Migration from Direct `process.env`

If migrating from direct `process.env` usage:

```typescript
// Old way
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// New way
import { config } from '@/lib/config';
const url = config.supabase.url;
```

Benefits:
- Type safety
- Runtime validation  
- Centralized configuration
- Better error messages
- Feature toggle support 