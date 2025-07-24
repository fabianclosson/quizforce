"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ImageSEOData,
  generateImageStructuredData,
  validateImageSEO,
  getImageConfig,
  IMAGE_CONFIGS,
} from "@/lib/image-seo";

interface OptimizedImageProps
  extends Omit<React.ComponentProps<typeof Image>, "alt"> {
  src: string;
  alt: string;
  type?: keyof typeof IMAGE_CONFIGS;
  structuredData?: boolean;
  showValidationWarnings?: boolean;
  fallbackSrc?: string;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  type = "thumbnail",
  structuredData = false,
  showValidationWarnings = process.env.NODE_ENV === "development",
  fallbackSrc,
  className,
  width,
  height,
  priority,
  quality,
  sizes,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Get optimized configuration for the image type
  const config = getImageConfig(type);

  // Merge props with config defaults
  const imageData: ImageSEOData = {
    src: imageSrc,
    alt,
    width: (width as number) || undefined,
    height: (height as number) || undefined,
    priority: priority ?? config.priority,
    quality:
      typeof quality === "number"
        ? quality
        : typeof config.quality === "number"
          ? config.quality
          : undefined,
    sizes: sizes ?? config.sizes,
  };

  // Validate image SEO in development
  if (showValidationWarnings && process.env.NODE_ENV === "development") {
    const validation = validateImageSEO(imageData);

    if (!validation.isValid) {
      console.error("Image SEO Errors:", validation.errors);
    }

    if (validation.warnings.length > 0) {
      console.warn("Image SEO Warnings:", validation.warnings);
    }
  }

  // Handle image load error
  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
  };

  // Generate structured data if requested
  const structuredDataScript = structuredData ? (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateImageStructuredData(imageData)),
      }}
    />
  ) : null;

  return (
    <>
      {structuredDataScript}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        priority={imageData.priority}
        quality={imageData.quality}
        sizes={imageData.sizes}
        className={cn(
          "transition-opacity duration-300",
          hasError && "opacity-75",
          className
        )}
        onError={handleError}
        {...props}
      />
    </>
  );
}

// Specialized image components for common use cases
export function HeroImage(props: Omit<OptimizedImageProps, "type">) {
  return <OptimizedImage {...props} type="hero" structuredData />;
}

export function CertificationImage(props: Omit<OptimizedImageProps, "type">) {
  return <OptimizedImage {...props} type="certification" />;
}

export function PackageImage(props: Omit<OptimizedImageProps, "type">) {
  return <OptimizedImage {...props} type="package" />;
}

export function LogoImage(props: Omit<OptimizedImageProps, "type">) {
  return <OptimizedImage {...props} type="logo" structuredData />;
}

export function IconImage(props: Omit<OptimizedImageProps, "type">) {
  return <OptimizedImage {...props} type="icon" />;
}

export function BadgeImage(props: Omit<OptimizedImageProps, "type">) {
  return <OptimizedImage {...props} type="badge" />;
}

export function ScreenshotImage(props: Omit<OptimizedImageProps, "type">) {
  return <OptimizedImage {...props} type="screenshot" />;
}
