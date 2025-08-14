"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, BookOpen } from "lucide-react";
import { useCategories, useCatalogSearch } from "@/hooks/use-catalog";
import { useUserEnrollments } from "@/hooks/use-enrollment";
import { useAuth } from "@/contexts/auth-context";
import type { CatalogFilters } from "@/types/catalog";
import {
  CatalogGrid,
  CatalogFilters as CatalogFiltersComponent,
} from "@/components/catalog";

const ITEMS_PER_PAGE = 12;

export function CatalogPageClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPriceType, setSelectedPriceType] = useState<"all" | "free" | "premium">("all");
  const [selectedLevel, setSelectedLevel] = useState<"all" | "Foundational" | "Intermediate" | "Advanced">("all");
  const [selectedProduct, setSelectedProduct] = useState<"all" | "Agentforce" | "Commerce Cloud" | "CRM Analytics" | "Data Cloud" | "Experience Cloud" | "Industry Solutions" | "MuleSoft" | "Net Zero Cloud" | "Sales Cloud" | "Salesforce Platform" | "Service Cloud" | "Slack" | "Tableau">("all");
  const [selectedEnrollmentFilter, setSelectedEnrollmentFilter] = useState<"all" | "enrolled" | "not_enrolled">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuth();

  // Build filters object
  const filters: CatalogFilters = useMemo(
    () => ({
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
      priceType: selectedPriceType === "all" ? undefined : selectedPriceType,
      level: selectedLevel === "all" ? undefined : selectedLevel,
      product: selectedProduct === "all" ? undefined : selectedProduct,
      enrollmentFilter: selectedEnrollmentFilter === "all" ? undefined : selectedEnrollmentFilter,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    }),
    [searchTerm, selectedCategory, selectedPriceType, selectedLevel, selectedProduct, selectedEnrollmentFilter, currentPage]
  );

  // Fetch data using React Query hooks
  const {
    data: catalogData,
    isLoading,
    error,
  } = useCatalogSearch(filters);

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
  } = useUserEnrollments();

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle category filter
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Handle level filter
  const handleLevelChange = (level: "all" | "Foundational" | "Intermediate" | "Advanced") => {
    setSelectedLevel(level);
    setCurrentPage(1);
  };

  // Handle product filter
  const handleProductChange = (product: "all" | "Agentforce" | "Commerce Cloud" | "CRM Analytics" | "Data Cloud" | "Experience Cloud" | "Industry Solutions" | "MuleSoft" | "Net Zero Cloud" | "Sales Cloud" | "Salesforce Platform" | "Service Cloud" | "Slack" | "Tableau") => {
    setSelectedProduct(product);
    setCurrentPage(1);
  };

  // Handle price type filter
  const handlePriceTypeChange = (priceType: "all" | "free" | "premium") => {
    setSelectedPriceType(priceType);
    setCurrentPage(1);
  };

  // Handle enrollment filter
  const handleEnrollmentFilterChange = (enrollmentFilter: "all" | "enrolled" | "not_enrolled") => {
    setSelectedEnrollmentFilter(enrollmentFilter);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedPriceType("all");
    setSelectedLevel("all");
    setSelectedProduct("all");
    setSelectedEnrollmentFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedPriceType !== "all" || selectedLevel !== "all" || selectedProduct !== "all" || selectedEnrollmentFilter !== "all";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Catalog</h1>
        <p className="text-gray-600">
          Browse our comprehensive collection of Salesforce certification practice exams
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search certifications and packages..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filters */}
        <div className={`mt-4 ${showFilters ? "block" : "hidden lg:block"}`}>
          <Card>
            <CardContent className="p-4">
              <CatalogFiltersComponent
                categories={categories || []}
                selectedCategory={selectedCategory}
                priceFilter={selectedPriceType}
                levelFilter={selectedLevel}
                productFilter={selectedProduct}
                enrollmentFilter={selectedEnrollmentFilter}
                onCategoryChange={handleCategoryChange}
                onPriceFilterChange={handlePriceTypeChange}
                onLevelFilterChange={handleLevelChange}
                onProductFilterChange={handleProductChange}
                onEnrollmentFilterChange={handleEnrollmentFilterChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results */}
      <CatalogGrid
        certifications={catalogData?.certifications || []}
        packages={catalogData?.packages || []}
        isLoading={isLoading}
        pagination={catalogData?.pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
