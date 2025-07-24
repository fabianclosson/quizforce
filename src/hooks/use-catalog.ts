import { useQuery, UseQueryResult } from "@tanstack/react-query";
import type {
  CertificationCategory,
  Certification,
  CertificationPackage,
  CatalogFilters,
  CatalogResponse,
} from "@/types/catalog";
import {
  getCategories,
  getCertifications,
  getPackages,
  searchCatalog,
  getCertificationBySlug,
  getPackageBySlug,
  getFeaturedItems,
} from "@/services/catalog";

// Query keys for React Query
export const catalogKeys = {
  all: ["catalog"] as const,
  categories: () => [...catalogKeys.all, "categories"] as const,
  certifications: (filters?: CatalogFilters) =>
    [...catalogKeys.all, "certifications", filters] as const,
  packages: (filters?: CatalogFilters) =>
    [...catalogKeys.all, "packages", filters] as const,
  search: (filters?: CatalogFilters) =>
    [...catalogKeys.all, "search", filters] as const,
  certification: (slug: string) =>
    [...catalogKeys.all, "certification", slug] as const,
  package: (slug: string) => [...catalogKeys.all, "package", slug] as const,
  featured: () => [...catalogKeys.all, "featured"] as const,
};

/**
 * Hook to fetch all certification categories
 */
export function useCategories(): UseQueryResult<
  CertificationCategory[],
  Error
> {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
  });
}

/**
 * Hook to fetch certifications with optional filtering
 */
export function useCertifications(filters?: CatalogFilters): UseQueryResult<
  {
    certifications: Certification[];
    total: number;
  },
  Error
> {
  return useQuery({
    queryKey: catalogKeys.certifications(filters),
    queryFn: () => getCertifications(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch certification packages with optional filtering
 */
export function usePackages(filters?: CatalogFilters): UseQueryResult<
  {
    packages: CertificationPackage[];
    total: number;
  },
  Error
> {
  return useQuery({
    queryKey: catalogKeys.packages(filters),
    queryFn: () => getPackages(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for combined catalog search (certifications + packages)
 */
export function useCatalogSearch(
  filters?: CatalogFilters
): UseQueryResult<CatalogResponse, Error> {
  return useQuery({
    queryKey: catalogKeys.search(filters),
    queryFn: () => searchCatalog(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single certification by slug
 */
export function useCertification(
  slug: string,
  enabled = true
): UseQueryResult<Certification | null, Error> {
  return useQuery({
    queryKey: catalogKeys.certification(slug),
    queryFn: () => getCertificationBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single package by slug
 */
export function usePackage(
  slug: string,
  enabled = true
): UseQueryResult<CertificationPackage | null, Error> {
  return useQuery({
    queryKey: catalogKeys.package(slug),
    queryFn: () => getPackageBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch featured items for homepage/promotional displays
 */
export function useFeaturedItems(): UseQueryResult<
  {
    certifications: Certification[];
    packages: CertificationPackage[];
  },
  Error
> {
  return useQuery({
    queryKey: catalogKeys.featured(),
    queryFn: getFeaturedItems,
    staleTime: 10 * 60 * 1000, // 10 minutes - featured items are stable
  });
}
