// Application constants
export const APP_NAME = "QuizForce";
export const APP_DESCRIPTION =
  "The leading Salesforce certification practice platform";

// API routes
export const API_ROUTES = {
  AUTH: {
    SIGNUP: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    RESET_PASSWORD: "/api/auth/reset-password",
  },
  CATALOG: "/api/catalog",
  CERTIFICATIONS: "/api/certifications",
  PACKAGES: "/api/packages",
  EXAMS: "/api/exams",
  USER: {
    PROFILE: "/api/user/profile",
    ENROLLMENTS: "/api/user/enrollments",
    PURCHASES: "/api/user/purchases",
    PERFORMANCE: "/api/user/performance",
  },
} as const;

// Page routes
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  CATALOG: "/catalog",
  PRACTICE_EXAMS: "/practice-exams",
  COMMUNITY: "/community",
  ACCOUNT: "/account",
  PURCHASES: "/purchases",
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    RESET_PASSWORD: "/auth/reset-password",
  },
  ADMIN: "/admin",
} as const;

// Certification categories
export const CERTIFICATION_CATEGORIES = [
  "Associate",
  "Admin",
  "Designer",
  "Consultant",
  "Architect",
  "Marketer",
  "Developer",
  "Artificial Intelligence",
] as const;

// Category mapping for certifications based on certification names
export const CERTIFICATION_CATEGORY_MAPPING = {
  // Map certification names to categories
  administrator: "Admin",
  admin: "Admin",
  associate: "Associate",
  consultant: "Consultant",
  architect: "Architect",
  developer: "Developer",
  designer: "Designer",
  marketer: "Marketer",
  marketing: "Marketer",
  ai: "Artificial Intelligence",
  "artificial intelligence": "Artificial Intelligence",
  "data cloud": "Consultant", // Data Cloud is typically consultant-level
  platform: "Developer",
  sales: "Associate",
  service: "Associate",
} as const;

// Generate category objects with proper structure
export const CERTIFICATION_CATEGORY_OBJECTS = CERTIFICATION_CATEGORIES.map(
  (name, index) => ({
    id: `category-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    description: `${name} level Salesforce certifications`,
    icon: null,
    color: "#0176D3",
    sort_order: index,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
);

// User roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

// Exam settings
export const EXAM_SETTINGS = {
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  PERFORMANCE_THRESHOLDS: {
    STRONG: 80,
    GOOD: 65,
    NEEDS_IMPROVEMENT: 0,
  },
} as const;

// Payment settings
export const PAYMENT_SETTINGS = {
  CURRENCY: "USD",
  ACCESS_PERIOD_MONTHS: 12,
} as const;
