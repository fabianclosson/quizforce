import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import {
  withApiErrorHandler,
  createAuthenticationError,
  createNotFoundError,
} from "@/lib/api-error-handler";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

async function handleCertificationCheckout(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    console.log("=== CHECKOUT DEBUG START ===");
    
    const resolvedParams = await params;
    const certificationId = resolvedParams.id;
    
    console.log("Certification ID:", certificationId);
    
    // Check authentication
    const serverSupabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await serverSupabase.auth.getUser();
    
    console.log("User auth check:", { 
      hasUser: !!user, 
      userId: user?.id, 
      userEmail: user?.email,
      authError: authError?.message 
    });

    if (authError || !user) {
      console.log("Authentication failed");
      throw createAuthenticationError("Authentication required for checkout");
    }

    // For now, just return a simple response to test if we get this far
    console.log("=== CHECKOUT DEBUG SUCCESS ===");
    
    return NextResponse.json({
      success: true,
      message: "Checkout debug - authentication successful",
      certificationId,
      userId: user.id,
      userEmail: user.email,
    });
    
  } catch (error) {
    console.error("=== CHECKOUT DEBUG ERROR ===", error);
    throw error;
  }
}

export const POST = withApiErrorHandler(handleCertificationCheckout);
