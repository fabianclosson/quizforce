"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <Select
          value={selectedCategory || "all"}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Price
        </label>
        <Select value={priceFilter} onValueChange={onPriceFilterChange}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="All Prices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Level Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Level
        </label>
        <Select value={levelFilter} onValueChange={onLevelFilterChange}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Foundational">Foundational</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Product
        </label>
        <Select value={productFilter} onValueChange={onProductFilterChange}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="All Products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="Agentforce">Agentforce</SelectItem>
            <SelectItem value="Commerce Cloud">Commerce Cloud</SelectItem>
            <SelectItem value="CRM Analytics">CRM Analytics</SelectItem>
            <SelectItem value="Data Cloud">Data Cloud</SelectItem>
            <SelectItem value="Experience Cloud">Experience Cloud</SelectItem>
            <SelectItem value="Industry Solutions">Industry Solutions</SelectItem>
            <SelectItem value="MuleSoft">MuleSoft</SelectItem>
            <SelectItem value="Net Zero Cloud">Net Zero Cloud</SelectItem>
            <SelectItem value="Sales Cloud">Sales Cloud</SelectItem>
            <SelectItem value="Salesforce Platform">Salesforce Platform</SelectItem>
            <SelectItem value="Service Cloud">Service Cloud</SelectItem>
            <SelectItem value="Slack">Slack</SelectItem>
            <SelectItem value="Tableau">Tableau</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enrollment Filter - Only show for authenticated users */}
      {user && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enrollment
          </label>
          <Select
            value={enrollmentFilter}
            onValueChange={onEnrollmentFilterChange}
          >
            <SelectTrigger size="sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="enrolled">Enrolled</SelectItem>
              <SelectItem value="not_enrolled">Not Enrolled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}