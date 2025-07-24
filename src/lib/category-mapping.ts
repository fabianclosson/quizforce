import {
  CERTIFICATION_CATEGORY_MAPPING,
  CERTIFICATION_CATEGORY_OBJECTS,
} from "./constants";
import type { CertificationCategory } from "@/types/catalog";

/**
 * Maps a certification name to the appropriate category
 */
export function mapCertificationToCategory(
  certificationName: string
): CertificationCategory {
  const lowerName = certificationName.toLowerCase();

  // Check each mapping key to see if it's present in the certification name
  for (const [key, categoryName] of Object.entries(
    CERTIFICATION_CATEGORY_MAPPING
  )) {
    if (lowerName.includes(key)) {
      const category = CERTIFICATION_CATEGORY_OBJECTS.find(
        cat => cat.name === categoryName
      );
      if (category) {
        return category;
      }
    }
  }

  // Default to Associate if no specific match found
  return (
    CERTIFICATION_CATEGORY_OBJECTS.find(cat => cat.name === "Associate") ||
    CERTIFICATION_CATEGORY_OBJECTS[0]
  );
}

/**
 * Get all available categories for display
 */
export function getAllCategories(): CertificationCategory[] {
  return CERTIFICATION_CATEGORY_OBJECTS;
}

/**
 * Get category by slug
 */
export function getCategoryBySlug(
  slug: string
): CertificationCategory | undefined {
  return CERTIFICATION_CATEGORY_OBJECTS.find(cat => cat.slug === slug);
}

/**
 * Get category by name
 */
export function getCategoryByName(
  name: string
): CertificationCategory | undefined {
  return CERTIFICATION_CATEGORY_OBJECTS.find(cat => cat.name === name);
}
