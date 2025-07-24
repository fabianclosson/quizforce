/**
 * Centralized utility functions for UI components
 * Use these instead of creating duplicate functions in individual components
 */

// Re-export formatPrice from utils for convenience
export { formatPrice } from "./utils";

/**
 * Get CSS classes for difficulty level styling
 */
export function getDifficultyColor(level: string): string {
  switch (level.toLowerCase()) {
    case "beginner":
    case "easy":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "intermediate":
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    case "advanced":
    case "hard":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
  }
}

/**
 * Get CSS class for difficulty indicator dot
 */
export function getDifficultyDotColor(level: string): string {
  switch (level.toLowerCase()) {
    case "beginner":
    case "easy":
      return "bg-green-500";
    case "intermediate":
    case "medium":
      return "bg-yellow-500";
    case "advanced":
    case "hard":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

/**
 * Format percentage with consistent styling
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Format exam duration in minutes to human readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Generate user initials from full name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word: string) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Common status badge variants mapping
 */
export const statusVariants = {
  active: "default",
  inactive: "secondary",
  pending: "outline",
  completed: "default",
  in_progress: "default",
  expired: "destructive",
  cancelled: "destructive",
  published: "default",
  draft: "secondary",
  archived: "secondary",
} as const;

/**
 * Get appropriate badge variant for a status
 */
export function getStatusVariant(
  status: string
): "default" | "secondary" | "outline" | "destructive" {
  const normalizedStatus = status
    .toLowerCase()
    .replace(/[^a-z]/g, "_") as keyof typeof statusVariants;
  return statusVariants[normalizedStatus] || "outline";
}
