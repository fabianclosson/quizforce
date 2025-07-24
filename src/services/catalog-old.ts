import type {
  CertificationCategory,
  Certification,
  CertificationPackage,
  CatalogFilters,
  CatalogResponse,
  CatalogItem,
} from "@/types/catalog";
import { createClient } from "@/lib/supabase";

// Create Supabase client instance
const supabase = createClient();

/**
 * Fetch all active certification categories
 */
export async function getCategories(): Promise<CertificationCategory[]> {
  try {
    const response = await fetch("/api/catalog/categories");
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

/**
 * Fetch certifications with optional filtering
 */
export async function getCertifications(filters: CatalogFilters = {}): Promise<{
  certifications: Certification[];
  total: number;
}> {
  const { category, priceType = "all", search, page = 1, limit = 12 } = filters;

  let query = supabase
    .from("certifications")
    .select(
      `
      *,
      certification_categories!inner(*)
    `,
      { count: "exact" }
    )
    .eq("is_active", true);

  // Apply filters
  if (category && category !== "all") {
    query = query.eq("certification_categories.slug", category);
  }

  if (priceType === "free") {
    query = query.eq("price_cents", 0);
  } else if (priceType === "premium") {
    query = query.gt("price_cents", 0);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  // Order by featured first, then by name
  query = query.order("is_featured", { ascending: false });
  query = query.order("name", { ascending: true });

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching certifications:", error);
    throw new Error("Failed to fetch certifications");
  }

  return {
    certifications: data || [],
    total: count || 0,
  };
}

/**
 * Fetch certification packages with optional filtering
 */
export async function getPackages(filters: CatalogFilters = {}): Promise<{
  packages: CertificationPackage[];
  total: number;
}> {
  const { search, page = 1, limit = 12 } = filters;

  let query = supabase
    .from("certification_packages")
    .select(
      `
      *,
      package_certifications!inner(
        certification:certifications(
          *,
          certification_categories(*)
        )
      )
    `,
      { count: "exact" }
    )
    .eq("is_active", true);

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  // Order by featured first, then by sort order
  query = query.order("is_featured", { ascending: false });
  query = query.order("sort_order", { ascending: true });

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching packages:", error);
    throw new Error("Failed to fetch packages");
  }

  // Transform the data to include certification count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const packages = (data || []).map((pkg: any) => ({
    ...pkg,
    certification_count: pkg.package_certifications?.length || 0,
    certifications:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pkg.package_certifications?.map((pc: any) => pc.certification) || [],
  }));

  return {
    packages,
    total: count || 0,
  };
}

/**
 * Get a single certification by slug
 */
export async function getCertificationBySlug(
  slug: string
): Promise<Certification | null> {
  const { data, error } = await supabase
    .from("certifications")
    .select(
      `
      *,
      certification_categories(*)
    `
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching certification:", error);
    return null;
  }

  return data;
}

/**
 * Get a single package by slug
 */
export async function getPackageBySlug(
  slug: string
): Promise<CertificationPackage | null> {
  const { data, error } = await supabase
    .from("certification_packages")
    .select(
      `
      *,
      package_certifications(
        certification:certifications(
          *,
          certification_categories(*)
        )
      )
    `
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching package:", error);
    return null;
  }

  // Transform the data
  const pkg = {
    ...data,
    certification_count: data.package_certifications?.length || 0,
    certifications:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.package_certifications?.map((pc: any) => pc.certification) || [],
  };

  return pkg;
}

/**
 * Hook for combined catalog search (certifications + packages)
 */
export async function searchCatalog(
  filters: CatalogFilters = {}
): Promise<CatalogResponse> {
  try {
    const params = new URLSearchParams();

    if (filters.category) params.append("category", filters.category);
    if (filters.priceType) params.append("priceType", filters.priceType);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(`/api/catalog/search?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to search catalog");
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching catalog:", error);
    throw new Error("Failed to search catalog");
  }
}

/**
 * Convert certifications and packages to unified catalog items for display
 */
export function toCatalogItems(
  certifications: Certification[],
  packages: CertificationPackage[]
): CatalogItem[] {
  const certItems: CatalogItem[] = certifications.map(cert => ({
    id: cert.id,
    name: cert.name,
    slug: cert.slug,
    description: cert.description,
    price_cents: cert.price_cents,
    type: "certification" as const,
    category: cert.category,
    exam_count: cert.exam_count,
    total_questions: cert.total_questions,
    is_featured: cert.is_featured,
  }));

  const packageItems: CatalogItem[] = packages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    description: pkg.description,
    price_cents: pkg.price_cents,
    type: "package" as const,
    certification_count: pkg.certification_count,
    is_featured: pkg.is_featured,
    discount_percentage: pkg.discount_percentage,
  }));

  // Combine and sort by featured first, then by name
  return [...certItems, ...packageItems].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get featured items for homepage/promotional displays
 */
export async function getFeaturedItems(): Promise<{
  certifications: Certification[];
  packages: CertificationPackage[];
}> {
  const [certifications, packages] = await Promise.all([
    getCertifications({ limit: 6 }).then(result =>
      result.certifications.filter(cert => cert.is_featured)
    ),
    getPackages({ limit: 3 }).then(result =>
      result.packages.filter(pkg => pkg.is_featured)
    ),
  ]);

  return {
    certifications,
    packages,
  };
}
