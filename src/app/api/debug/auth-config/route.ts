import { NextResponse } from "next/server";
import { config } from "@/lib/config";

export async function GET() {
  const siteUrl = config.siteUrl;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'server-side';
  
  return NextResponse.json({
    message: "Auth Configuration Debug",
    siteUrl,
    expectedCallbackUrl: `${siteUrl}/auth/callback`,
    supabaseConfigured: config.supabase.isConfigured,
    supabaseUrl: config.supabase.url ? `${config.supabase.url.substring(0, 20)}...` : 'Not set',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
