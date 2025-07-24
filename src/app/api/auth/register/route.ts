import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase";
import { validate, respond } from "@/lib/api-validation-helpers";

export async function POST(request: NextRequest) {
  try {
    // Validate the request body using the new validation system
    const validation = await validate.auth.register(request);

    if (!validation.success) {
      return respond.error(
        validation.errors || [],
        400,
        "Registration validation failed"
      );
    }

    const { firstName, lastName, email, password } = validation.data!;

    // Create Supabase client
    const supabase = createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return respond.error(
        [
          {
            field: "email",
            message: "An account with this email already exists",
          },
        ],
        409,
        "Account already exists"
      );
    }

    // Create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      console.error("Auth signup error:", authError);
      return respond.error(
        [{ field: "auth", message: "Failed to create account" }],
        500,
        "Registration failed"
      );
    }

    if (!authData.user) {
      return respond.error(
        [{ field: "auth", message: "Failed to create user account" }],
        500,
        "Registration failed"
      );
    }

    // Create profile record
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Note: User auth account was created but profile failed
      // In production, you might want to implement cleanup
      return respond.error(
        [{ field: "profile", message: "Failed to create user profile" }],
        500,
        "Registration partially failed"
      );
    }

    return respond.success(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          firstName,
          lastName,
        },
        needsEmailConfirmation: !authData.user.email_confirmed_at,
      },
      201,
      "Account created successfully"
    );
  } catch (error) {
    console.error("Registration error:", error);
    return respond.error(
      [{ field: "server", message: "Internal server error" }],
      500,
      "Registration failed"
    );
  }
}
