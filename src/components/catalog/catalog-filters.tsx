"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import type { CertificationCategory } from "@/types/catalog";

interface CatalogFiltersProps {
  categories: CertificationCategory[];
  selectedCategory: string;
  priceFilter: "all" | "free" | "premium";
  enrollmentFilter: "all" | "enrolled" | "not_enrolled";
  onCategoryChange: (category: string) => void;
  onPriceFilterChange: (price: "all" | "free" | "premium") => void;
  onEnrollmentFilterChange: (enrollment: "all" | "enrolled" | "not_enrolled") => void;
}

export function CatalogFilters({
  categories,
  selectedCategory,
  priceFilter,
  enrollmentFilter,
  onCategoryChange,
  onPriceFilterChange,
  onEnrollmentFilterChange,
}: CatalogFiltersProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-3">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
          Categories
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onCategoryChange("all")}
          >
            All Categories
          </Button>
          {categories.map(category => (
            <Button
              key={category.id}
              variant={
                selectedCategory === category.slug ? "default" : "outline"
              }
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => onCategoryChange(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
          Price
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={priceFilter === "all" ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onPriceFilterChange("all")}
          >
            All Prices
          </Button>
          <Button
            variant={priceFilter === "free" ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onPriceFilterChange("free")}
          >
            Free
          </Button>
          <Button
            variant={priceFilter === "premium" ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onPriceFilterChange("premium")}
          >
            Premium
          </Button>
        </div>
      </div>

      {/* Enrollment Filter - Only show if user is authenticated */}
      {user && (
        <div>
          <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
            Enrollment
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={enrollmentFilter === "all" ? "default" : "outline"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => onEnrollmentFilterChange("all")}
            >
              All Items
            </Button>
            <Button
              variant={enrollmentFilter === "enrolled" ? "default" : "outline"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => onEnrollmentFilterChange("enrolled")}
            >
              My Enrolled
            </Button>
            <Button
              variant={enrollmentFilter === "not_enrolled" ? "default" : "outline"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => onEnrollmentFilterChange("not_enrolled")}
            >
              Not Enrolled
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
