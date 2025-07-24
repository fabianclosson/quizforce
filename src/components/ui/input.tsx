import * as React from "react";

import { cn } from "@/lib/utils";
import {
  getMobileFieldConfig,
  getMobileTouchClasses,
  MOBILE_INPUT_PRESETS,
  PROGRESSIVE_ENHANCEMENT,
} from "@/lib/mobile-form-utils";

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size"> {
  touchOptimized?: boolean;
  mobilePreset?: keyof typeof MOBILE_INPUT_PRESETS;
  inputSize?: "sm" | "md" | "lg";
}

function Input({
  className,
  type,
  touchOptimized = false,
  mobilePreset,
  inputSize = "md",
  ...props
}: InputProps) {
  // Apply mobile preset configuration if specified
  const mobileConfig = mobilePreset ? getMobileFieldConfig(mobilePreset) : {};

  // Merge mobile config with props, giving priority to explicit props
  const finalProps = {
    ...mobileConfig,
    ...props,
    type: type || (mobileConfig as any).type || "text",
  };

  // Determine if we should use touch optimization
  const shouldOptimizeForTouch =
    touchOptimized ||
    (typeof window !== "undefined" &&
      (PROGRESSIVE_ENHANCEMENT.isTouchDevice() ||
        PROGRESSIVE_ENHANCEMENT.isMobileViewport()));

  // Size-based classes
  const sizeClasses = {
    sm: shouldOptimizeForTouch
      ? "h-10 px-3 py-2 text-base"
      : "h-8 px-2 py-1 text-sm",
    md: shouldOptimizeForTouch
      ? "h-11 px-4 py-3 text-base"
      : "h-9 px-3 py-1 text-base md:text-sm",
    lg: shouldOptimizeForTouch
      ? "h-12 px-4 py-3 text-base"
      : "h-10 px-4 py-2 text-base",
  };

  return (
    <input
      data-slot="input"
      className={cn(
        // Base styles
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",

        // Size and touch optimization
        sizeClasses[inputSize],

        // Touch optimizations
        shouldOptimizeForTouch && [
          "touch-manipulation", // Optimize touch events
          "text-base", // Prevent zoom on iOS (16px minimum)
        ],

        // Focus states
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",

        // Error states
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",

        // File input specific styles
        "file:h-7 file:text-sm",
        shouldOptimizeForTouch && "file:h-8 file:text-base",

        className
      )}
      {...finalProps}
    />
  );
}

export { Input };
