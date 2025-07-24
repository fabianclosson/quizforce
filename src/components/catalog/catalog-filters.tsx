"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CertificationCategory } from "@/types/catalog";

interface CatalogFiltersProps {
  categories: CertificationCategory[];
  selectedCategory: string;
  priceFilter: "all" | "free" | "premium";
  onCategoryChange: (category: string) => void;
  onPriceFilterChange: (price: "all" | "free" | "premium") => void;
}

export function CatalogFilters({
  categories,
  selectedCategory,
  priceFilter,
  onCategoryChange,
  onPriceFilterChange,
}: CatalogFiltersProps) {
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
        </div>
      </CardContent>
    </Card>
  );
}
