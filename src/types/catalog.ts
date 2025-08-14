export interface CertificationCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  detailed_description: string | null;
  category_id: string;
  price_cents: number;
  exam_count: number;
  total_questions: number;
  level: "Foundational" | "Intermediate" | "Advanced";
  product: "Agentforce" | "Commerce Cloud" | "CRM Analytics" | "Data Cloud" | "Experience Cloud" | "Industry Solutions" | "MuleSoft" | "Net Zero Cloud" | "Sales Cloud" | "Salesforce Platform" | "Service Cloud" | "Slack" | "Tableau";
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: CertificationCategory;
}

export interface CertificationPackage {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  detailed_description: string | null;
  price_cents: number;
  discount_percentage: number;
  is_active: boolean;
  is_featured: boolean;
  valid_months: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined data
  certifications?: Certification[];
  certification_count?: number;
}

export interface CatalogFilters {
  category?: string;
  priceType?: "free" | "premium" | "all";
  level?: "Foundational" | "Intermediate" | "Advanced" | "all";
  product?: "Agentforce" | "Commerce Cloud" | "CRM Analytics" | "Data Cloud" | "Experience Cloud" | "Industry Solutions" | "MuleSoft" | "Net Zero Cloud" | "Sales Cloud" | "Salesforce Platform" | "Service Cloud" | "Slack" | "Tableau" | "all";
  search?: string;
  enrollmentFilter?: "all" | "enrolled" | "not_enrolled";
  page?: number;
  limit?: number;
}

export interface CatalogResponse {
  certifications: Certification[];
  packages: CertificationPackage[];
  categories: CertificationCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// For display purposes
export interface CatalogItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  type: "certification" | "package";
  category?: CertificationCategory;
  exam_count?: number;
  total_questions?: number;
  certification_count?: number;
  is_featured: boolean;
  discount_percentage?: number;
}
