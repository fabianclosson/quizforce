import type { Metadata } from "next";
import {
  generateHomeMetadata,
  generateStructuredData,
  getStructuredDataScript,
} from "@/lib/metadata";
import { LandingPageClient } from "./landing-page-client";

// Generate optimized metadata for the home page
export const metadata: Metadata = generateHomeMetadata();

// Generate structured data for the home page
const websiteData = generateStructuredData("WebSite", {});
const organizationData = generateStructuredData("Organization", {});

export default function HomePage() {
  return (
    <>
      {/* Website structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getStructuredDataScript(websiteData),
        }}
      />

      {/* Organization structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getStructuredDataScript(organizationData),
        }}
      />

      {/* Main landing page content */}
      <LandingPageClient />
    </>
  );
}
