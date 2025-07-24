import { MetadataRoute } from "next";
import { siteConfig } from "./metadata";

export interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}

export interface StaticRoute {
  path: string;
  changeFrequency: SitemapEntry["changeFrequency"];
  priority: number;
}

/**
 * Static routes configuration for the application
 */
export const STATIC_ROUTES: StaticRoute[] = [
  {
    path: "/",
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    path: "/catalog",
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    path: "/about",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/pricing",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/contact",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    path: "/privacy",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    path: "/terms",
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

/**
 * Generate static routes for sitemap
 */
export function generateStaticRoutes(
  baseUrl: string = siteConfig.url
): MetadataRoute.Sitemap {
  const currentDate = new Date();

  return STATIC_ROUTES.map(route => ({
    url: route.path === "/" ? baseUrl : `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

/**
 * Generate dynamic routes for certifications
 */
export function generateCertificationRoutes(
  certifications: Array<{
    slug: string;
    created_at: string;
    updated_at: string | null;
  }>,
  baseUrl: string = siteConfig.url
): MetadataRoute.Sitemap {
  return certifications.map(cert => ({
    url: `${baseUrl}/catalog/certification/${cert.slug}`,
    lastModified: new Date(cert.updated_at || cert.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}

/**
 * Generate dynamic routes for packages
 */
export function generatePackageRoutes(
  packages: Array<{
    slug: string;
    created_at: string;
    updated_at: string | null;
  }>,
  baseUrl: string = siteConfig.url
): MetadataRoute.Sitemap {
  return packages.map(pkg => ({
    url: `${baseUrl}/catalog/package/${pkg.slug}`,
    lastModified: new Date(pkg.updated_at || pkg.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}

/**
 * Generate category routes (for future use)
 */
export function generateCategoryRoutes(
  categories: Array<{ slug: string; updated_at?: string }>,
  baseUrl: string = siteConfig.url
): MetadataRoute.Sitemap {
  return categories.map(category => ({
    url: `${baseUrl}/catalog/category/${category.slug}`,
    lastModified: category.updated_at
      ? new Date(category.updated_at)
      : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
}

/**
 * Validate sitemap entries
 */
export function validateSitemapEntry(entry: MetadataRoute.Sitemap[0]): boolean {
  // Check URL validity
  try {
    new URL(entry.url);
  } catch {
    return false;
  }

  // Check priority range
  if (
    entry.priority !== undefined &&
    (entry.priority < 0 || entry.priority > 1)
  ) {
    return false;
  }

  return true;
}

/**
 * Filter and validate sitemap entries
 */
export function sanitizeSitemapEntries(
  entries: MetadataRoute.Sitemap
): MetadataRoute.Sitemap {
  return entries.filter(validateSitemapEntry);
}

/**
 * Sort sitemap entries by priority (highest first)
 */
export function sortSitemapByPriority(
  entries: MetadataRoute.Sitemap
): MetadataRoute.Sitemap {
  return [...entries].sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

/**
 * Get sitemap statistics
 */
export function getSitemapStats(entries: MetadataRoute.Sitemap) {
  const totalUrls = entries.length;
  const priorityDistribution = entries.reduce(
    (acc, entry) => {
      const priority = entry.priority || 0;
      const range =
        priority >= 0.8 ? "high" : priority >= 0.5 ? "medium" : "low";
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const changeFrequencyDistribution = entries.reduce(
    (acc, entry) => {
      const freq = entry.changeFrequency || "unknown";
      acc[freq] = (acc[freq] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalUrls,
    priorityDistribution,
    changeFrequencyDistribution,
    lastGenerated: new Date().toISOString(),
  };
}

/**
 * Generate robots.txt content programmatically
 */
export function generateRobotsTxt(sitemapUrl?: string): string {
  const sitemap = sitemapUrl || `${siteConfig.url}/sitemap.xml`;

  return `# QuizForce Robots.txt
# This file tells search engine crawlers which pages or files they can or can't request from your site.

# Allow all crawlers to access public content
User-agent: *
Allow: /

# Disallow private and sensitive areas
Disallow: /api/
Disallow: /dashboard/
Disallow: /admin/
Disallow: /account/
Disallow: /auth/
Disallow: /exam/
Disallow: /_next/
Disallow: /error-test
Disallow: /performance-test

# Allow specific API endpoints that are beneficial for SEO
Allow: /api/og

# Block access to authentication and user-specific pages
Disallow: /login
Disallow: /register
Disallow: /reset-password
Disallow: /profile
Disallow: /settings

# Block search and filter URLs to prevent duplicate content
Disallow: /catalog?*
Disallow: /catalog/*?*

# Allow important static pages
Allow: /about
Allow: /pricing
Allow: /contact
Allow: /privacy
Allow: /terms

# Sitemap location
Sitemap: ${sitemap}

# Crawl delay (optional, can help with server load)
Crawl-delay: 1`;
}
