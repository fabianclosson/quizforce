import type {
  CertificationCategory,
  Certification,
  CertificationPackage,
  CatalogFilters,
  CatalogResponse,
  CatalogItem,
} from "@/types/catalog";

/**
 * Fetch all certification categories
 */
export async function getCategories(): Promise<CertificationCategory[]> {
  try {
    const response = await fetch("/api/catalog/categories");
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const data = await response.json();
    return data.categories || [];
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
  try {
    const params = new URLSearchParams();

    if (filters.category) params.append("category", filters.category);
    if (filters.priceType) params.append("priceType", filters.priceType);
    if (filters.enrollmentFilter) params.append("enrollmentFilter", filters.enrollmentFilter);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(
      `/api/catalog/certifications?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch certifications");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching certifications:", error);
    throw new Error("Failed to fetch certifications");
  }
}

/**
 * Fetch certification packages with optional filtering
 */
export async function getPackages(filters: CatalogFilters = {}): Promise<{
  packages: CertificationPackage[];
  total: number;
}> {
  // For now, return empty packages since we're focusing on certifications
  return {
    packages: [],
    total: 0,
  };
}

/**
 * Combined catalog search - returns both certifications and packages
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

    const [categoriesResponse, searchResponse] = await Promise.all([
      fetch("/api/catalog/categories"),
      fetch(`/api/catalog/search?${params.toString()}`),
    ]);

    if (!categoriesResponse.ok || !searchResponse.ok) {
      throw new Error("Failed to search catalog");
    }

    const categoriesData = await categoriesResponse.json();
    const searchData = await searchResponse.json();

    return {
      certifications: searchData.certifications || [],
      packages: searchData.packages || [],
      categories: categoriesData.categories || [],
      pagination: searchData.pagination || {
        page: filters.page || 1,
        limit: filters.limit || 12,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error) {
    console.error("Error searching catalog:", error);
    throw new Error("Failed to search catalog");
  }
}

/**
 * Convert items to unified catalog item format
 */
export function toCatalogItems(
  certifications: Certification[],
  packages: CertificationPackage[]
): CatalogItem[] {
  const certItems: CatalogItem[] = certifications.map(cert => ({
    ...cert,
    type: "certification" as const,
    category: cert.category,
  }));

  const packageItems: CatalogItem[] = packages.map(pkg => ({
    ...pkg,
    type: "package" as const,
    category: undefined, // Packages don't have a single category
  }));

  return [...certItems, ...packageItems];
}

/**
 * Get a single certification by slug (placeholder)
 */
export async function getCertificationBySlug(
  slug: string
): Promise<Certification | null> {
  // TODO: Implement API route for single certification
  return null;
}

/**
 * Get a single package by slug (placeholder)
 */
export async function getPackageBySlug(
  slug: string
): Promise<CertificationPackage | null> {
  // TODO: Implement API route for single package
  return null;
}

/**
 * Get featured items (placeholder)
 */
export async function getFeaturedItems(): Promise<{
  certifications: Certification[];
  packages: CertificationPackage[];
}> {
  try {
    const response = await fetch("/api/catalog/search?featured=true");
    if (!response.ok) {
      throw new Error("Failed to fetch featured items");
    }

    const data = await response.json();
    return {
      certifications: data.certifications || [],
      packages: data.packages || [],
    };
  } catch (error) {
    console.error("Error fetching featured items:", error);
    return {
      certifications: [],
      packages: [],
    };
  }
}
