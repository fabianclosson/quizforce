"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { FormValidators } from "@/lib/validators-client";

// Use centralized validation schema
const signinSchema = FormValidators.signin;

type SigninFormData = z.infer<typeof signinSchema>;

export function SigninForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const router = useRouter();

  const form = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔐 Attempting signin with:", {
        email: data.email,
        password: "***",
      });
      const supabase = createClient();

      // Sign in the user with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      console.log("🔐 Supabase auth response:", {
        user: authData?.user?.id ? `User ID: ${authData.user.id}` : "No user",
        session: authData?.session ? "Session exists" : "No session",
        error: authError ? authError.message : "No error",
      });

      if (authError) {
        console.error("🔐 Authentication error details:", {
          message: authError.message,
          status: authError.status,
          name: authError.name,
        });
        throw authError;
      }

      if (authData.user) {
        console.log("🔐 Login successful, redirecting to dashboard");
        // Successful login, redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("🔐 Signin error:", err);
      let errorMessage = "An error occurred during signin";

      if (err instanceof Error) {
        console.log("🔐 Error details:", {
          message: err.message,
          name: err.name,
          stack: err.stack,
        });

        // Handle specific Supabase auth error messages
        if (err.message.includes("Invalid login credentials")) {
          errorMessage =
            "Invalid email or password. Please check your credentials and try again.";
        } else if (err.message.includes("Email not confirmed")) {
          errorMessage =
            "Please check your email and verify your account before signing in.";
        } else if (err.message.includes("Too many requests")) {
          errorMessage =
            "Too many login attempts. Please wait a moment and try again.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserExists = async (email: string) => {
    try {
      const supabase = createClient();
      console.log("🔍 Checking if user exists:", email);

      // Try to get user info (this won't work with regular client, but we can try password reset)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.log("🔍 Password reset error:", error);
        setDebugInfo(`Password reset attempt: ${error.message}`);
      } else {
        setDebugInfo(
          "Password reset email sent successfully - user likely exists"
        );
      }
    } catch (err) {
      console.error("🔍 Debug check error:", err);
      setDebugInfo(
        `Debug check failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your-email@example.com"
                    className="pl-10"
                    {...field}
                    disabled={isLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    {...field}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Forgot your password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true);
            try {
              const supabase = createClient();
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              });

              if (error) {
                setError(error.message);
              }
            } catch (err: unknown) {
              console.error("Google signin error:", err);
              setError("Failed to sign in with Google");
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Debug Panel */}
        <div className="mt-6 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showDebug ? "Hide" : "Show"} Debug Info
          </Button>

          {showDebug && (
            <div className="mt-3 p-3 bg-muted rounded-md text-sm">
              <div className="space-y-2">
                <p className="font-medium">Troubleshooting Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Check browser console for detailed error logs</li>
                  <li>
                    Verify you&apos;re using the correct email:{" "}
                    <strong>closson.fabian+lol@gmail.com</strong>
                  </li>
                  <li>
                    Make sure you remember the password you used during signup
                  </li>
                  <li>
                    Check if email verification was required and completed
                  </li>
                </ol>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const email = form.getValues("email");
                      if (email) {
                        checkUserExists(email);
                      } else {
                        setDebugInfo("Please enter an email address first");
                      }
                    }}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Test Account Existence
                  </Button>
                </div>

                {debugInfo && (
                  <div className="mt-2 p-2 bg-background rounded text-xs">
                    <strong>Debug Result:</strong> {debugInfo}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
