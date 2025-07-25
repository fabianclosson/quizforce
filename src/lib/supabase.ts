import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { config } from "./config";

// Determine URL/Key differently for client vs server
let browserSupabaseUrl = '';
let browserAnonKey = '';
if (typeof window !== 'undefined') {
  browserSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string || '';
  browserAnonKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string || '';
}

// Use validated environment configuration
const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

const effectiveSupabaseUrl = typeof window !== 'undefined' ? browserSupabaseUrl : supabaseUrl;
const effectiveAnonKey    = typeof window !== 'undefined' ? browserAnonKey    : supabaseAnonKey;

// Re-evaluate configuration flag with effective values
const isSupabaseConfigured = !!(effectiveSupabaseUrl && effectiveAnonKey) &&
  !effectiveSupabaseUrl.includes('placeholder') &&
  !effectiveAnonKey.includes('placeholder');

// Client-side Supabase client (for use in components)
export function createClient() {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured - using mock client');
    // Return a mock client that doesn't make actual requests
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ 
          eq: () => ({ 
            single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
          })
        })
      })
    } as any;
  }
  
  return createBrowserClient(effectiveSupabaseUrl, effectiveAnonKey);
}

// Server-side Supabase client (for use in Server Components, API routes, etc.)
export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured - using mock server client');
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({ 
          eq: () => ({ 
            single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
          })
        })
      })
    } as any;
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createServerClient(effectiveSupabaseUrl, effectiveAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

// For API routes and server actions that need service role access
export const createServiceSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase service role not configured - using mock client');
    return {
      from: () => ({
        select: () => ({ 
          eq: () => ({ 
            single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
          })
        }),
        insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        update: () => ({ 
          eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
        }),
        delete: () => ({ 
          eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
        })
      })
    } as any;
  }

  const serviceRoleKey = config.supabase.serviceRoleKey;

  return createServerClient(effectiveSupabaseUrl, serviceRoleKey, {
    cookies: {
      get() {
        return undefined;
      },
      set() {
        // Service role client doesn't need cookies
      },
      remove() {
        // Service role client doesn't need cookies
      },
    },
  });
};

// Helper to check if environment is properly configured
export const checkSupabaseConfig = () => {
  return !!(effectiveSupabaseUrl && effectiveAnonKey);
};
