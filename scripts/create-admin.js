#!/usr/bin/env node

/**
 * Create Admin User Script
 *
 * This script creates an admin user in the database for testing purposes.
 * Run with: node scripts/create-admin.js <email>
 */

const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables:");
  console.error("- NEXT_PUBLIC_SUPABASE_URL");
  console.error("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser(email) {
  try {
    console.log(`Creating admin user: ${email}`);

    // First, get the user from auth.users table
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    // Find user by email
    const user = authUsers.users.find(u => u.email === email);

    if (!user) {
      console.log(
        "User not found. Please sign up first, then run this script."
      );
      console.log("Steps:");
      console.log("1. Go to http://localhost:3000/auth/signup");
      console.log(`2. Sign up with email: ${email}`);
      console.log("3. Run this script again");
      process.exit(1);
    }

    console.log(`Found user with ID: ${user.id}`);

    // Check if user has profile
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError;
    }

    if (existingProfile) {
      console.log("User profile found, updating role to admin...");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      console.log(`✅ Successfully updated ${email} to admin role`);
    } else {
      console.log("Creating profile with admin role...");

      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        role: "admin",
      });

      if (insertError) {
        throw insertError;
      }

      console.log(`✅ Successfully created admin profile for ${email}`);
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/create-admin.js <email>");
  console.error("Example: node scripts/create-admin.js admin@example.com");
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error("Invalid email format");
  process.exit(1);
}

createAdminUser(email).then(() => {
  console.log("Done!");
  process.exit(0);
});
