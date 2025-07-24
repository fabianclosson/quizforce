"use client";

import React from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

// Common responsive image sizes for different use cases
export const RESPONSIVE_SIZES = {
  // Full width images (hero, banners)
  full: "100vw",
  // Content images (articles, cards)
  content: "(min-width: 1024px) 50vw, (min-width: 768px) 75vw, 100vw",
  // Card images in grids
  card: "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  // Avatar/profile images
  avatar: "(min-width: 768px) 128px, 96px",
  // Thumbnail images
  thumbnail: "(min-width: 768px) 96px, 64px",
  // Icon-sized images
  icon: "48px",
} as const;

// Common aspect ratios
export const ASPECT_RATIOS = {
  square: "1/1",
  video: "16/9",
  photo: "4/3",
  banner: "3/1",
  card: "3/2",
} as const;

interface ResponsiveImageProps extends Omit<ImageProps, "sizes"> {
  /**
   * Responsive sizes - use predefined sizes or custom string
   */
  sizes?: keyof typeof RESPONSIVE_SIZES | string;
  /**
   * Aspect ratio for the image container
   */
  aspectRatio?: keyof typeof ASPECT_RATIOS | string;
  /**
   * Whether to add rounded corners
   */
  rounded?: boolean | "sm" | "md" | "lg" | "xl" | "full";
  /**
   * Object fit behavior
   */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  /**
   * Loading strategy
   */
  loading?: "lazy" | "eager";
  /**
   * Whether this image is above the fold (adds priority)
   */
  priority?: boolean;
  /**
   * Custom container className
   */
  containerClassName?: string;
  /**
   * Show blur placeholder while loading
   */
  showBlurPlaceholder?: boolean;
}

export function ResponsiveImage({
  sizes = "content",
  aspectRatio,
  rounded = false,
  objectFit = "cover",
  loading = "lazy",
  priority = false,
  containerClassName,
  showBlurPlaceholder = false,
  className,
  alt,
  ...props
}: ResponsiveImageProps) {
  // Determine the sizes value
  const sizesValue =
    (sizes as keyof typeof RESPONSIVE_SIZES) in RESPONSIVE_SIZES
      ? RESPONSIVE_SIZES[sizes as keyof typeof RESPONSIVE_SIZES]
      : sizes;

  // Determine rounded class
  const roundedClass = (() => {
    if (!rounded) return "";
    if (rounded === true) return "rounded-md";
    if (rounded === "full") return "rounded-full";
    return `rounded-${rounded}`;
  })();

  // Get aspect ratio value
  const aspectRatioValue =
    aspectRatio &&
    ((aspectRatio as keyof typeof ASPECT_RATIOS) in ASPECT_RATIOS
      ? ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS]
      : aspectRatio);

  // Container classes for aspect ratio and styling
  const containerClasses = cn(
    "relative overflow-hidden",
    aspectRatioValue && `aspect-[${aspectRatioValue}]`,
    roundedClass,
    containerClassName
  );

  // Image classes for object fit and additional styling
  const imageClasses = cn(
    "transition-opacity duration-300",
    objectFit === "cover" && "object-cover",
    objectFit === "contain" && "object-contain",
    objectFit === "fill" && "object-fill",
    objectFit === "none" && "object-none",
    objectFit === "scale-down" && "object-scale-down",
    className
  );

  // If no aspect ratio is specified, render image directly
  if (!aspectRatio) {
    return (
      <Image
        {...props}
        alt={alt}
        sizes={sizesValue}
        loading={loading}
        priority={priority}
        className={cn(imageClasses, roundedClass)}
        placeholder={showBlurPlaceholder ? "blur" : "empty"}
      />
    );
  }

  // Render with aspect ratio container
  return (
    <div className={containerClasses}>
      <Image
        {...props}
        alt={alt}
        sizes={sizesValue}
        loading={loading}
        priority={priority}
        fill
        className={imageClasses}
        placeholder={showBlurPlaceholder ? "blur" : "empty"}
      />
    </div>
  );
}

// Preset components for common use cases
export function HeroImage(
  props: Omit<ResponsiveImageProps, "sizes" | "priority" | "aspectRatio">
) {
  return (
    <ResponsiveImage {...props} sizes="full" priority aspectRatio="banner" />
  );
}

export function CardImage(
  props: Omit<ResponsiveImageProps, "sizes" | "aspectRatio">
) {
  return <ResponsiveImage {...props} sizes="card" aspectRatio="card" />;
}

export function ResponsiveAvatarImage(
  props: Omit<ResponsiveImageProps, "sizes" | "aspectRatio" | "rounded">
) {
  return (
    <ResponsiveImage
      {...props}
      sizes="avatar"
      aspectRatio="square"
      rounded="full"
      objectFit="cover"
    />
  );
}

export function ThumbnailImage(
  props: Omit<ResponsiveImageProps, "sizes" | "aspectRatio">
) {
  return (
    <ResponsiveImage
      {...props}
      sizes="thumbnail"
      aspectRatio="square"
      rounded="md"
    />
  );
}
