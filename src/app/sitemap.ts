import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";

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
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Return static routes only for now
  // Dynamic routes can be added later via a separate dynamic sitemap or ISR
  return staticRoutes;
}
