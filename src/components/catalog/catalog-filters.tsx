"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
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
                  onClick={() => onCategoryChange(category.slug)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Filter */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
              Price
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={priceFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => onPriceFilterChange("all")}
              >
                All Prices
              </Button>
              <Button
                variant={priceFilter === "free" ? "default" : "outline"}
                size="sm"
                onClick={() => onPriceFilterChange("free")}
              >
                Free
              </Button>
              <Button
                variant={priceFilter === "premium" ? "default" : "outline"}
                size="sm"
                onClick={() => onPriceFilterChange("premium")}
              >
                Premium
              </Button>
            </div>
          </div>

          {/* Enrollment Filter - Only show if user is authenticated */}
          {user && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
                  Enrollment Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={enrollmentFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onEnrollmentFilterChange("all")}
                  >
                    All Items
                  </Button>
                  <Button
                    variant={enrollmentFilter === "enrolled" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onEnrollmentFilterChange("enrolled")}
                  >
                    My Enrolled Certifications
                  </Button>
                  <Button
                    variant={enrollmentFilter === "not_enrolled" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onEnrollmentFilterChange("not_enrolled")}
                  >
                    Not Enrolled
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
