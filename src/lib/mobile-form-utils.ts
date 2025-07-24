import { cn } from "@/lib/utils";

// Input types that trigger specific mobile keyboards
export const MOBILE_INPUT_TYPES = {
  email: "email",
  password: "password",
  tel: "tel",
  number: "number",
  search: "search",
  url: "url",
  text: "text",
  date: "date",
  time: "time",
  datetime: "datetime-local",
} as const;

// Input modes for fine-grained keyboard control
export const INPUT_MODES = {
  none: "none",
  text: "text",
  decimal: "decimal",
  numeric: "numeric",
  tel: "tel",
  search: "search",
  email: "email",
  url: "url",
} as const;

// Autocomplete values for better user experience
export const AUTOCOMPLETE_VALUES = {
  // Name fields
  name: "name",
  firstName: "given-name",
  lastName: "family-name",
  middleName: "additional-name",
  nickname: "nickname",

  // Contact information
  email: "email",
  phone: "tel",
  mobile: "tel-national",

  // Address fields
  address: "street-address",
  addressLine1: "address-line1",
  addressLine2: "address-line2",
  city: "address-level2",
  state: "address-level1",
  country: "country",
  postalCode: "postal-code",

  // Authentication
  username: "username",
  currentPassword: "current-password",
  newPassword: "new-password",

  // Payment
  cardNumber: "cc-number",
  cardExpiry: "cc-exp",
  cardCvc: "cc-csc",
  cardName: "cc-name",

  // Organization
  organization: "organization",
  jobTitle: "organization-title",

  // Other
  birthday: "bday",
  url: "url",
  off: "off", // Disable autocomplete
} as const;

// Mobile-specific input configuration presets
export const MOBILE_INPUT_PRESETS = {
  email: {
    type: MOBILE_INPUT_TYPES.email,
    inputMode: INPUT_MODES.email,
    autoComplete: AUTOCOMPLETE_VALUES.email,
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: false,
  },
  password: {
    type: MOBILE_INPUT_TYPES.password,
    inputMode: INPUT_MODES.text,
    autoComplete: AUTOCOMPLETE_VALUES.currentPassword,
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: false,
  },
  newPassword: {
    type: MOBILE_INPUT_TYPES.password,
    inputMode: INPUT_MODES.text,
    autoComplete: AUTOCOMPLETE_VALUES.newPassword,
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: false,
  },
  phone: {
    type: MOBILE_INPUT_TYPES.tel,
    inputMode: INPUT_MODES.tel,
    autoComplete: AUTOCOMPLETE_VALUES.phone,
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: false,
  },
  number: {
    type: MOBILE_INPUT_TYPES.number,
    inputMode: INPUT_MODES.numeric,
    autoComplete: AUTOCOMPLETE_VALUES.off,
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: false,
  },
  decimal: {
    type: MOBILE_INPUT_TYPES.number,
    inputMode: INPUT_MODES.decimal,
    autoComplete: AUTOCOMPLETE_VALUES.off,
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: false,
    step: "0.01",
  },
  search: {
    type: MOBILE_INPUT_TYPES.search,
    inputMode: INPUT_MODES.search,
    autoComplete: AUTOCOMPLETE_VALUES.off,
    autoCapitalize: "none",
    autoCorrect: "on",
    spellCheck: true,
  },
  name: {
    type: MOBILE_INPUT_TYPES.text,
    inputMode: INPUT_MODES.text,
    autoComplete: AUTOCOMPLETE_VALUES.name,
    autoCapitalize: "words",
    autoCorrect: "off",
    spellCheck: false,
  },
  firstName: {
    type: MOBILE_INPUT_TYPES.text,
    inputMode: INPUT_MODES.text,
    autoComplete: AUTOCOMPLETE_VALUES.firstName,
    autoCapitalize: "words",
    autoCorrect: "off",
    spellCheck: false,
  },
  lastName: {
    type: MOBILE_INPUT_TYPES.text,
    inputMode: INPUT_MODES.text,
    autoComplete: AUTOCOMPLETE_VALUES.lastName,
    autoCapitalize: "words",
    autoCorrect: "off",
    spellCheck: false,
  },
  address: {
    type: MOBILE_INPUT_TYPES.text,
    inputMode: INPUT_MODES.text,
    autoComplete: AUTOCOMPLETE_VALUES.address,
    autoCapitalize: "words",
    autoCorrect: "on",
    spellCheck: false,
  },
  city: {
    type: MOBILE_INPUT_TYPES.text,
    inputMode: INPUT_MODES.text,
    autoComplete: AUTOCOMPLETE_VALUES.city,
    autoCapitalize: "words",
    autoCorrect: "on",
    spellCheck: false,
  },
  url: {
    type: MOBILE_INPUT_TYPES.url,
    inputMode: INPUT_MODES.url,
    autoComplete: AUTOCOMPLETE_VALUES.url,
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: false,
  },
  date: {
    type: MOBILE_INPUT_TYPES.date,
    inputMode: INPUT_MODES.none,
    autoComplete: AUTOCOMPLETE_VALUES.off,
  },
  time: {
    type: MOBILE_INPUT_TYPES.time,
    inputMode: INPUT_MODES.none,
    autoComplete: AUTOCOMPLETE_VALUES.off,
  },
} as const;

// Touch target size utilities
export const TOUCH_TARGET_SIZES = {
  small: "h-10 min-h-[40px]", // 40px minimum
  medium: "h-11 min-h-[44px]", // 44px recommended
  large: "h-12 min-h-[48px]", // 48px comfortable
  xl: "h-14 min-h-[56px]", // 56px large
} as const;

// Mobile form spacing utilities
export const MOBILE_FORM_SPACING = {
  fieldGap: "space-y-4 sm:space-y-6", // Larger gaps on mobile
  labelMargin: "mb-2 sm:mb-1.5", // More space on mobile
  errorMargin: "mt-1.5 sm:mt-1", // Clear error spacing
  buttonMargin: "mt-6 sm:mt-4", // Prominent button spacing
} as const;

// Validation timing utilities
export const VALIDATION_TIMING = {
  // Delay validation to avoid interrupting user typing
  debounceMs: 300,
  // Don't validate until user has finished interacting with field
  validateOnBlur: true,
  // Don't show errors immediately on focus
  showErrorsOnSubmit: true,
} as const;

// Mobile-friendly error message positioning
export const ERROR_STYLES = {
  container: "min-h-[1.25rem] mt-1.5", // Reserve space to prevent layout shift
  message: "text-sm text-destructive font-medium", // Clear, readable errors
  icon: "h-4 w-4 text-destructive inline mr-1.5", // Visual error indicator
} as const;

// Accessibility helpers
export const A11Y_HELPERS = {
  // ARIA attributes for form fields
  getFieldAria: (fieldName: string, hasError: boolean, errorId?: string) => ({
    "aria-label": fieldName,
    "aria-invalid": hasError,
    "aria-describedby": hasError && errorId ? errorId : undefined,
  }),

  // Generate unique IDs for form fields
  generateFieldId: (formId: string, fieldName: string) =>
    `${formId}-${fieldName}`,
  generateErrorId: (formId: string, fieldName: string) =>
    `${formId}-${fieldName}-error`,

  // Screen reader announcements
  getErrorAnnouncement: (fieldName: string, errorMessage: string) =>
    `Error in ${fieldName}: ${errorMessage}`,
};

// Mobile form field configuration helper
export function getMobileFieldConfig(
  preset: keyof typeof MOBILE_INPUT_PRESETS
) {
  return MOBILE_INPUT_PRESETS[preset];
}

// Combine touch optimization classes
export function getMobileTouchClasses(
  size: keyof typeof TOUCH_TARGET_SIZES = "medium"
) {
  return cn(
    TOUCH_TARGET_SIZES[size],
    "px-4 py-3", // Comfortable padding for touch
    "text-base", // 16px to prevent zoom on iOS
    "touch-manipulation", // Optimize touch events
    "select-none" // Prevent text selection on labels/buttons
  );
}

// Form container classes for mobile optimization
export function getMobileFormClasses() {
  return cn(
    "w-full max-w-md mx-auto", // Optimal width for mobile forms
    MOBILE_FORM_SPACING.fieldGap,
    "px-4 sm:px-6" // Comfortable side padding
  );
}

// Button classes for mobile forms
export function getMobileButtonClasses(
  variant: "primary" | "secondary" = "primary"
) {
  const baseClasses = cn(
    TOUCH_TARGET_SIZES.large,
    "w-full", // Full width on mobile
    "px-6 py-3",
    "text-base font-medium",
    "rounded-lg",
    "transition-all duration-200",
    "touch-manipulation",
    "active:scale-[0.98]" // Subtle feedback
  );

  if (variant === "primary") {
    return cn(
      baseClasses,
      "bg-primary text-primary-foreground",
      "hover:bg-primary/90",
      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none"
    );
  }

  return cn(
    baseClasses,
    "bg-secondary text-secondary-foreground border border-input",
    "hover:bg-secondary/80",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:pointer-events-none"
  );
}

// Input validation helpers
export const INPUT_VALIDATION = {
  // Email validation regex (more permissive for better UX)
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Phone validation (basic format check)
  phone: /^[\+]?[\d\s\-\(\)]{10,}$/,

  // Password strength indicators
  password: {
    minLength: 8,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/,
    hasNumber: /\d/,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
  },

  // URL validation
  url: /^https?:\/\/.+\..+/,
};

// Progressive enhancement helpers
export const PROGRESSIVE_ENHANCEMENT = {
  // Check if device supports specific input types
  supportsInputType: (type: string) => {
    const input = document.createElement("input");
    input.setAttribute("type", type);
    return input.type === type;
  },

  // Check if device has touch capability
  isTouchDevice: () => {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - legacy property
      navigator.msMaxTouchPoints > 0
    );
  },

  // Check viewport size for mobile-specific optimizations
  isMobileViewport: () => {
    return window.innerWidth < 768; // Tailwind's sm breakpoint
  },

  // Check if device prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },
};

// Form analytics helpers for optimization
export const FORM_ANALYTICS = {
  // Track form field focus times
  trackFieldFocus: (fieldName: string) => {
    // Implementation would depend on analytics service
    console.log(`Field focused: ${fieldName}`);
  },

  // Track form completion rates
  trackFormProgress: (
    formName: string,
    completedFields: number,
    totalFields: number
  ) => {
    const percentage = (completedFields / totalFields) * 100;
    console.log(`Form progress: ${formName} - ${percentage}%`);
  },

  // Track validation errors
  trackValidationError: (fieldName: string, errorType: string) => {
    console.log(`Validation error: ${fieldName} - ${errorType}`);
  },
};
