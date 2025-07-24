import { NextRequest, NextResponse } from "next/server";
import { adminOnly } from "@/lib/auth-middleware";

export const GET = adminOnly(async (request: NextRequest, { user }) => {
  try {
    return NextResponse.json({
      isAdmin: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json(
      { isAdmin: false, error: "Authentication error" },
      { status: 500 }
    );
  }
});
