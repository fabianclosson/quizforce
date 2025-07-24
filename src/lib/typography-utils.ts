import { cn } from "@/lib/utils";

// Fluid typography configuration using CSS clamp
export const FLUID_TYPOGRAPHY = {
  // Body text sizes with fluid scaling
  body: {
    xs: "clamp(0.75rem, 1.5vw, 0.875rem)", // 12px → 14px
    sm: "clamp(0.875rem, 1.8vw, 1rem)", // 14px → 16px
    base: "clamp(1rem, 2vw, 1.125rem)", // 16px → 18px
    lg: "clamp(1.125rem, 2.2vw, 1.25rem)", // 18px → 20px
    xl: "clamp(1.25rem, 2.5vw, 1.5rem)", // 20px → 24px
  },

  // Heading sizes with fluid scaling
  heading: {
    h6: "clamp(1rem, 2.5vw, 1.125rem)", // 16px → 18px
    h5: "clamp(1.125rem, 3vw, 1.25rem)", // 18px → 20px
    h4: "clamp(1.25rem, 3.5vw, 1.5rem)", // 20px → 24px
    h3: "clamp(1.5rem, 4vw, 1.875rem)", // 24px → 30px
    h2: "clamp(1.875rem, 5vw, 2.25rem)", // 30px → 36px
    h1: "clamp(2.25rem, 6vw, 3rem)", // 36px → 48px
  },

  // Display sizes for hero sections
  display: {
    sm: "clamp(2.25rem, 6vw, 3rem)", // 36px → 48px
    md: "clamp(3rem, 7vw, 3.75rem)", // 48px → 60px
    lg: "clamp(3.75rem, 8vw, 4.5rem)", // 60px → 72px
    xl: "clamp(4.5rem, 9vw, 6rem)", // 72px → 96px
  },
} as const;

// Line height configuration for optimal readability
export const LINE_HEIGHTS = {
  // Tight line heights for headings
  tight: "1.1",
  snug: "1.25",

  // Comfortable line heights for body text
  normal: "1.5",
  relaxed: "1.625",
  loose: "1.75",

  // Special cases
  none: "1",
  leading: "2",
} as const;

// Letter spacing (tracking) for different text types
export const LETTER_SPACING = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
} as const;

// Maximum line lengths for optimal readability
export const LINE_LENGTHS = {
  // Optimal reading widths in characters
  narrow: "35ch", // Mobile, short content
  optimal: "45ch", // Ideal for most content
  comfortable: "65ch", // Longer content, desktop
  wide: "75ch", // Wide content areas

  // Responsive prose widths
  prose: "65ch",
  "prose-sm": "45ch",
  "prose-lg": "75ch",
} as const;

// Typography scale ratios for consistent sizing
export const SCALE_RATIOS = {
  minorSecond: 1.067,
  majorSecond: 1.125,
  minorThird: 1.2,
  majorThird: 1.25,
  perfectFourth: 1.333,
  augmentedFourth: 1.414,
  perfectFifth: 1.5,
  goldenRatio: 1.618,
} as const;

// Font weight configurations
export const FONT_WEIGHTS = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const;

// Responsive typography component classes
export const TYPOGRAPHY_COMPONENTS = {
  // Heading components with responsive scaling
  h1: cn(
    "font-bold tracking-tight",
    "text-[clamp(2.25rem,6vw,3rem)]", // Fluid h1 size
    "leading-tight",
    "max-w-[20ch]" // Prevent overly long lines
  ),

  h2: cn(
    "font-bold tracking-tight",
    "text-[clamp(1.875rem,5vw,2.25rem)]", // Fluid h2 size
    "leading-tight",
    "max-w-[25ch]"
  ),

  h3: cn(
    "font-semibold tracking-tight",
    "text-[clamp(1.5rem,4vw,1.875rem)]", // Fluid h3 size
    "leading-snug",
    "max-w-[30ch]"
  ),

  h4: cn(
    "font-semibold",
    "text-[clamp(1.25rem,3.5vw,1.5rem)]", // Fluid h4 size
    "leading-snug",
    "max-w-[35ch]"
  ),

  h5: cn(
    "font-medium",
    "text-[clamp(1.125rem,3vw,1.25rem)]", // Fluid h5 size
    "leading-normal",
    "max-w-[40ch]"
  ),

  h6: cn(
    "font-medium",
    "text-[clamp(1rem,2.5vw,1.125rem)]", // Fluid h6 size
    "leading-normal",
    "max-w-[45ch]"
  ),

  // Body text components
  body: cn(
    "text-[clamp(1rem,2vw,1.125rem)]", // Fluid body size
    "leading-relaxed",
    "max-w-[65ch]" // Optimal reading width
  ),

  "body-sm": cn(
    "text-[clamp(0.875rem,1.8vw,1rem)]", // Fluid small body
    "leading-relaxed",
    "max-w-[60ch]"
  ),

  "body-lg": cn(
    "text-[clamp(1.125rem,2.2vw,1.25rem)]", // Fluid large body
    "leading-relaxed",
    "max-w-[60ch]"
  ),

  // Display text for hero sections
  display: cn(
    "font-bold tracking-tight",
    "text-[clamp(3rem,7vw,4.5rem)]", // Fluid display size
    "leading-none",
    "max-w-[15ch]" // Short, impactful lines
  ),

  // Caption and small text
  caption: cn(
    "text-[clamp(0.75rem,1.5vw,0.875rem)]", // Fluid caption size
    "leading-normal",
    "max-w-[50ch]"
  ),

  // Quote/blockquote styling
  quote: cn(
    "text-[clamp(1.125rem,2.5vw,1.375rem)]", // Fluid quote size
    "leading-relaxed",
    "font-medium",
    "italic",
    "max-w-[55ch]"
  ),

  // Code and monospace text
  code: cn(
    "font-mono",
    "text-[clamp(0.875rem,1.8vw,1rem)]", // Fluid code size
    "leading-normal"
  ),
} as const;

// Mobile-specific typography optimizations
export const MOBILE_TYPOGRAPHY = {
  // Ensure minimum font sizes for accessibility
  minBodySize: "16px", // Prevents zoom on iOS
  minTouchTarget: "44px", // For interactive text elements

  // Mobile-optimized line lengths
  maxLineLength: "40ch", // Shorter lines for mobile

  // Mobile-specific spacing
  paragraphSpacing: "1.5rem",
  headingSpacing: "2rem",

  // Touch-friendly link styling
  linkPadding: "0.5rem",
  linkMinHeight: "44px",
} as const;

// Accessibility helpers for typography
export const A11Y_TYPOGRAPHY = {
  // Minimum contrast ratios
  contrastRatios: {
    normal: 4.5, // WCAG AA
    large: 3, // WCAG AA for large text (18pt+)
    enhanced: 7, // WCAG AAA
  },

  // Focus indicators for text elements
  focusRing:
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

  // Screen reader utilities
  srOnly: "sr-only",
  notSrOnly: "not-sr-only",
} as const;

// Utility functions for generating typography classes
export function getFluidTextSize(
  size: string,
  type: "body" | "heading" | "display" = "body"
): string {
  const typeConfig = FLUID_TYPOGRAPHY[type];
  if (size in typeConfig) {
    return `text-[${(typeConfig as any)[size]}]`;
  }
  return `text-[${size}]`; // Fallback for custom sizes
}

export function getLineHeight(height: keyof typeof LINE_HEIGHTS) {
  return `leading-[${LINE_HEIGHTS[height]}]`;
}

export function getMaxWidth(length: keyof typeof LINE_LENGTHS) {
  return `max-w-[${LINE_LENGTHS[length]}]`;
}

export function getLetterSpacing(spacing: keyof typeof LETTER_SPACING) {
  return `tracking-[${LETTER_SPACING[spacing]}]`;
}

// Generate typography classes for specific components
export function createTypographyClasses(options: {
  size?: string;
  lineHeight?: keyof typeof LINE_HEIGHTS;
  maxWidth?: keyof typeof LINE_LENGTHS;
  fontWeight?: keyof typeof FONT_WEIGHTS;
  letterSpacing?: keyof typeof LETTER_SPACING;
  className?: string;
}) {
  return cn(
    options.size && `text-[${options.size}]`,
    options.lineHeight && getLineHeight(options.lineHeight),
    options.maxWidth && getMaxWidth(options.maxWidth),
    options.fontWeight && `font-${options.fontWeight}`,
    options.letterSpacing && getLetterSpacing(options.letterSpacing),
    options.className
  );
}

// Responsive text utilities
export function responsiveText(sizes: {
  base: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}) {
  return cn(
    `text-${sizes.base}`,
    sizes.sm && `sm:text-${sizes.sm}`,
    sizes.md && `md:text-${sizes.md}`,
    sizes.lg && `lg:text-${sizes.lg}`,
    sizes.xl && `xl:text-${sizes.xl}`
  );
}

// Create prose classes for content areas
export function createProseClasses(
  variant: "sm" | "base" | "lg" | "xl" = "base"
) {
  const variants = {
    sm: cn(
      "prose prose-sm",
      "max-w-[45ch]",
      "text-[clamp(0.875rem,1.8vw,1rem)]",
      "leading-relaxed"
    ),
    base: cn(
      "prose",
      "max-w-[65ch]",
      "text-[clamp(1rem,2vw,1.125rem)]",
      "leading-relaxed"
    ),
    lg: cn(
      "prose prose-lg",
      "max-w-[60ch]",
      "text-[clamp(1.125rem,2.2vw,1.25rem)]",
      "leading-relaxed"
    ),
    xl: cn(
      "prose prose-xl",
      "max-w-[55ch]",
      "text-[clamp(1.25rem,2.5vw,1.5rem)]",
      "leading-relaxed"
    ),
  };

  return variants[variant];
}

// Generate scale-based font sizes
export function generateScale(
  baseSize: number,
  ratio: keyof typeof SCALE_RATIOS,
  steps: number
) {
  const scale = [];
  const multiplier = SCALE_RATIOS[ratio];

  for (let i = -Math.floor(steps / 2); i <= Math.floor(steps / 2); i++) {
    const size = baseSize * Math.pow(multiplier, i);
    scale.push(`${size.toFixed(3)}rem`);
  }

  return scale;
}
