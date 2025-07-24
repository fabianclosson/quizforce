import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Touch-friendly utility functions and class configurations
 * Based on 2024 mobile touch interaction best practices
 */

/**
 * Minimum touch target size (44x44px) utilities
 */
export const touchTargetSizes = {
  // Minimum recommended touch target size
  min: "min-h-[44px] min-w-[44px]",
  // Standard button sizes that meet touch requirements
  sm: "h-10 min-w-[44px]", // 40px height, but with min-width for touch
  md: "h-11 min-w-[48px]", // 44px height
  lg: "h-12 min-w-[52px]", // 48px height
  xl: "h-14 min-w-[56px]", // 56px height
} as const;

/**
 * Touch-friendly spacing utilities
 */
export const touchSpacing = {
  // Minimum spacing between touch targets
  min: "gap-2", // 8px
  comfortable: "gap-3", // 12px
  spacious: "gap-4", // 16px
  // Padding for touch targets
  touchPadding: "px-4 py-3", // Ensures comfortable touch area
  touchPaddingSm: "px-3 py-2",
  touchPaddingLg: "px-6 py-4",
} as const;

/**
 * Enhanced visual feedback for touch interactions
 */
export const touchFeedback = {
  // Scale feedback for touch
  scale: "active:scale-95 transition-transform duration-75",
  scaleSubtle: "active:scale-[0.98] transition-transform duration-75",

  // Color feedback (replaces hover states for touch)
  primary: "active:bg-primary/90 transition-colors duration-150",
  secondary: "active:bg-secondary/80 transition-colors duration-150",
  accent: "active:bg-accent/70 transition-colors duration-150",
  destructive: "active:bg-destructive/90 transition-colors duration-150",

  // Shadow feedback
  shadow: "active:shadow-sm transition-shadow duration-150",
  shadowLift: "active:shadow-lg transition-shadow duration-150",

  // Combined feedback for interactive elements
  button: "active:scale-95 active:shadow-sm transition-all duration-150",
  card: "active:scale-[0.98] active:shadow-md transition-all duration-200",
  link: "active:opacity-70 transition-opacity duration-150",
} as const;

/**
 * Touch-optimized hover states that work on both desktop and mobile
 */
export const responsiveHover = {
  // Desktop hover + touch active states
  button:
    "hover:bg-primary/90 active:bg-primary/80 active:scale-95 transition-all duration-150",
  secondary:
    "hover:bg-secondary/80 active:bg-secondary/70 active:scale-95 transition-all duration-150",
  accent:
    "hover:bg-accent active:bg-accent/70 active:scale-[0.98] transition-all duration-150",
  destructive:
    "hover:bg-destructive/90 active:bg-destructive/80 active:scale-95 transition-all duration-150",

  // Card interactions
  card: "hover:shadow-lg active:shadow-md active:scale-[0.98] transition-all duration-200",
  cardSubtle:
    "hover:shadow-md active:shadow-sm active:scale-[0.99] transition-all duration-200",

  // Link interactions
  link: "hover:underline active:opacity-70 transition-all duration-150",
  linkSubtle:
    "hover:text-primary active:opacity-70 transition-all duration-150",
} as const;

/**
 * Touch-friendly form element configurations
 */
export const touchForm = {
  input: "h-11 px-4 py-3 text-base", // Larger height and text for mobile
  select: "h-11 px-4 py-3 text-base",
  textarea: "min-h-[88px] px-4 py-3 text-base", // Double minimum touch height
  checkbox: "h-5 w-5", // Larger checkbox
  radio: "h-5 w-5", // Larger radio button
} as const;

/**
 * Utility function to combine touch-friendly classes
 */
export function touchClass(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create touch-optimized button classes
 */
export function createTouchButton(
  variant: keyof typeof responsiveHover = "button",
  size: keyof typeof touchTargetSizes = "md"
) {
  return touchClass(
    touchTargetSizes[size],
    touchSpacing.touchPadding,
    responsiveHover[variant],
    "rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  );
}

/**
 * Create touch-optimized card classes
 */
export function createTouchCard(variant: "default" | "subtle" = "default") {
  return touchClass(
    touchSpacing.touchPadding,
    variant === "default" ? responsiveHover.card : responsiveHover.cardSubtle,
    "rounded-lg border cursor-pointer"
  );
}

/**
 * Create touch-optimized interactive list item classes
 */
export function createTouchListItem() {
  return touchClass(
    touchTargetSizes.md,
    touchSpacing.touchPadding,
    responsiveHover.accent,
    "rounded-md cursor-pointer flex items-center"
  );
}

/**
 * Prevent text selection during touch interactions
 */
export const preventTextSelect = "select-none";

/**
 * Touch-friendly navigation classes
 */
export const touchNavigation = {
  item: touchClass(
    touchTargetSizes.md,
    touchSpacing.touchPadding,
    responsiveHover.accent,
    "rounded-md font-medium"
  ),
  link: touchClass(
    touchTargetSizes.min,
    "px-3 py-2",
    responsiveHover.linkSubtle,
    "rounded-md"
  ),
} as const;
