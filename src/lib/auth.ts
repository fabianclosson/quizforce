import { createClient } from "./supabase";
import { type User } from "@supabase/supabase-js";

// Auth response type for consistent error handling
export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User | null;
}

// User metadata type
export interface UserMetadata {
  [key: string]: unknown;
}

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  metadata?: UserMetadata
): Promise<AuthResponse> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {},
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
};

// Sign in with email and password
export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
};

// Sign in with Google OAuth
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // OAuth redirect happens, so we return success here
    return { success: true };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
};

// Sign out
export const signOut = async (): Promise<AuthResponse> => {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<AuthResponse> => {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
};

// Update password
export const updatePassword = async (
  newPassword: string
): Promise<AuthResponse> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
};

// Get current session
export const getCurrentSession = async () => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

// Get current user
export const getCurrentUser = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return !!session?.user;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const supabase = createClient();
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
};
