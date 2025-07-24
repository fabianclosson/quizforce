import type { Metadata } from "next";
import {
  generateCatalogMetadata,
  generateStructuredData,
  getStructuredDataScript,
} from "@/lib/metadata";
import { CatalogPageClient } from "./catalog-page-client";

// Generate optimized metadata for the catalog page
export const metadata: Metadata = generateCatalogMetadata();

// Generate structured data for the catalog page
const catalogData = generateStructuredData("Organization", {});

export default function CatalogPage() {
  return (
    <>
      {/* Catalog structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getStructuredDataScript(catalogData),
        }}
      />
      <CatalogPageClient />
    </>
  );
}
