import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";
import { createClient } from "@supabase/supabase-js";

// Create a simple client for static generation (no cookies needed)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types for database records
interface CertificationRecord {
  slug: string;
  created_at: string;
  updated_at: string | null;
}

interface PackageRecord {
  slug: string;
  created_at: string;
  updated_at: string | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const currentDate = new Date();

  // Static routes with their priorities and update frequencies
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    // Fetch dynamic routes from Supabase
    const [certificationsResult, packagesResult] = await Promise.allSettled([
      fetchCertifications(),
      fetchPackages(),
    ]);

    // Process certifications
    const certificationRoutes: MetadataRoute.Sitemap = [];
    if (
      certificationsResult.status === "fulfilled" &&
      certificationsResult.value
    ) {
      certificationRoutes.push(
        ...certificationsResult.value.map((cert: CertificationRecord) => ({
          url: `${baseUrl}/catalog/certification/${cert.slug}`,
          lastModified: new Date(cert.updated_at || cert.created_at),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }))
      );
    }

    // Process packages
    const packageRoutes: MetadataRoute.Sitemap = [];
    if (packagesResult.status === "fulfilled" && packagesResult.value) {
      packageRoutes.push(
        ...packagesResult.value.map((pkg: PackageRecord) => ({
          url: `${baseUrl}/catalog/package/${pkg.slug}`,
          lastModified: new Date(pkg.updated_at || pkg.created_at),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }))
      );
    }

    // Combine all routes
    return [...staticRoutes, ...certificationRoutes, ...packageRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return static routes only if there's an error with dynamic content
    return staticRoutes;
  }
}

/**
 * Fetch certifications for sitemap generation
 */
async function fetchCertifications(): Promise<CertificationRecord[]> {
  try {
    const { data, error } = await supabase
      .from("certifications")
      .select("slug, created_at, updated_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching certifications for sitemap:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchCertifications:", error);
    return [];
  }
}

/**
 * Fetch packages for sitemap generation
 */
async function fetchPackages(): Promise<PackageRecord[]> {
  try {
    const { data, error } = await supabase
      .from("packages")
      .select("slug, created_at, updated_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching packages for sitemap:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchPackages:", error);
    return [];
  }
}
