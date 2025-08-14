"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import type { CertificationCategory } from "@/types/catalog";

interface CatalogFiltersProps {
  categories: CertificationCategory[];
  selectedCategory: string;
  priceFilter: "all" | "free" | "premium";
  levelFilter: "all" | "Foundational" | "Intermediate" | "Advanced";
  productFilter: "all" | "Agentforce" | "Commerce Cloud" | "CRM Analytics" | "Data Cloud" | "Experience Cloud" | "Industry Solutions" | "MuleSoft" | "Net Zero Cloud" | "Sales Cloud" | "Salesforce Platform" | "Service Cloud" | "Slack" | "Tableau";
  enrollmentFilter: "all" | "enrolled" | "not_enrolled";
  onCategoryChange: (category: string) => void;
  onPriceFilterChange: (price: "all" | "free" | "premium") => void;
  onLevelFilterChange: (level: "all" | "Foundational" | "Intermediate" | "Advanced") => void;
  onProductFilterChange: (product: "all" | "Agentforce" | "Commerce Cloud" | "CRM Analytics" | "Data Cloud" | "Experience Cloud" | "Industry Solutions" | "MuleSoft" | "Net Zero Cloud" | "Sales Cloud" | "Salesforce Platform" | "Service Cloud" | "Slack" | "Tableau") => void;
  onEnrollmentFilterChange: (enrollment: "all" | "enrolled" | "not_enrolled") => void;
}

export function CatalogFilters({
  categories,
  selectedCategory,
  priceFilter,
  levelFilter,
  productFilter,
  enrollmentFilter,
  onCategoryChange,
  onPriceFilterChange,
  onLevelFilterChange,
  onProductFilterChange,
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

      {/* Level Filter */}
      <div>
        <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
          Level
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={levelFilter === "all" ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onLevelFilterChange("all")}
          >
            All Levels
          </Button>
          <Button
            variant={levelFilter === "Foundational" ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onLevelFilterChange("Foundational")}
          >
            Foundational
          </Button>
          <Button
            variant={levelFilter === "Intermediate" ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onLevelFilterChange("Intermediate")}
          >
            Intermediate
          </Button>
          <Button
            variant={levelFilter === "Advanced" ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onLevelFilterChange("Advanced")}
          >
            Advanced
          </Button>
        </div>
      </div>

      {/* Product Filter */}
      <div>
        <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
          Product
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <Button variant={productFilter === "all" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("all")}>All Products</Button>
          <Button variant={productFilter === "Agentforce" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("Agentforce")}>Agentforce</Button>
          <Button variant={productFilter === "Commerce Cloud" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("Commerce Cloud")}>Commerce Cloud</Button>
          <Button variant={productFilter === "CRM Analytics" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("CRM Analytics")}>CRM Analytics</Button>
          <Button variant={productFilter === "Data Cloud" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("Data Cloud")}>Data Cloud</Button>
          <Button variant={productFilter === "Experience Cloud" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("Experience Cloud")}>Experience Cloud</Button>
          <Button variant={productFilter === "Industry Solutions" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("Industry Solutions")}>Industry Solutions</Button>
          <Button variant={productFilter === "MuleSoft" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("MuleSoft")}>MuleSoft</Button>
          <Button variant={productFilter === "Net Zero Cloud" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("Net Zero Cloud")}>Net Zero Cloud</Button>
          <Button variant={productFilter === "Sales Cloud" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("Sales Cloud")}>Sales Cloud</Button>
          <Button variant={productFilter === "Salesforce Platform" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("Salesforce Platform")}>Salesforce Platform</Button>
          <Button variant={productFilter === "Service Cloud" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("Service Cloud")}>Service Cloud</Button>
          <Button variant={productFilter === "Slack" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("Slack")}>Slack</Button>
          <Button variant={productFilter === "Tableau" ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onProductFilterChange("Tableau")}>Tableau</Button>
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
