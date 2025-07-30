import { createServerSupabaseClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

// Helper function to parse full name into first and last names
function parseFullName(fullName: string): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: "", lastName: "" };
  
  const nameParts = fullName.trim().split(" ");
  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: "" };
  }
  
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  return { firstName, lastName };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Use configured site URL instead of request origin to ensure custom domain redirects
  const siteUrl = config.siteUrl;

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      try {
        // Check if user has a profile
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single();

        // If no profile exists, create one with parsed name data
        if (!existingProfile) {
          const userMetadata = data.user.user_metadata || {};
          const fullName = userMetadata.full_name || userMetadata.name || "";
          const { firstName, lastName } = parseFullName(fullName);

          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email: data.user.email,
              first_name: firstName || null,
              last_name: lastName || null,
              avatar_url: userMetadata.avatar_url || userMetadata.picture || null,
              role: "user",
              email_verified: true,
              marketing_consent: false,
              account_status: "active",
            });

          if (profileError) {
            console.error("Error creating profile after OAuth:", profileError);
          }
        } else {
          // Update existing profile if name fields are empty
          const userMetadata = data.user.user_metadata || {};
          const shouldUpdateName = !existingProfile.first_name && !existingProfile.last_name;
          
          if (shouldUpdateName) {
            const fullName = userMetadata.full_name || userMetadata.name || "";
            const { firstName, lastName } = parseFullName(fullName);
            
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                first_name: firstName || null,
                last_name: lastName || null,
                avatar_url: userMetadata.avatar_url || userMetadata.picture || existingProfile.avatar_url,
              })
              .eq("id", data.user.id);

            if (updateError) {
              console.error("Error updating profile after OAuth:", updateError);
            }
          }
        }
      } catch (profileError) {
        console.error("Error handling profile during OAuth callback:", profileError);
        // Don't block the authentication flow for profile errors
      }

      return NextResponse.redirect(`${siteUrl}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`);
}
