import { NextRequest, NextResponse } from "next/server";
import {
  generateOGImageSVG,
  type OGImageOptions,
} from "@/lib/og-image-generator";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract parameters
    const title = searchParams.get("title") || "QuizForce";
    const subtitle = searchParams.get("subtitle") || undefined;
    const type =
      (searchParams.get("type") as OGImageOptions["type"]) || "default";
    const format = searchParams.get("format") || "svg";

    // Validate title length
    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title too long (max 100 characters)" },
        { status: 400 }
      );
    }

    // Generate SVG
    const svg = generateOGImageSVG({
      title,
      subtitle,
      type,
    });

    // Return based on format
    if (format === "svg") {
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // For other formats, return SVG data URL
    const base64 = Buffer.from(svg).toString("base64");
    const dataUrl = `data:image/svg+xml;base64,${base64}`;

    return NextResponse.json({
      svg,
      dataUrl,
      width: 1200,
      height: 630,
    });
  } catch (error) {
    console.error("Error generating OG image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}

// Support OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
