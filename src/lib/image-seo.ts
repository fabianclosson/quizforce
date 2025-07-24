import { siteConfig } from "./metadata";

export interface ImageSEOData {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export interface ImageStructuredData {
  "@context": string;
  "@type": string;
  contentUrl: string;
  description: string;
  name?: string;
  caption?: string;
  width?: number;
  height?: number;
  license?: string;
  copyrightHolder?: string;
  encodingFormat?: string;
}

/**
 * Generate structured data for images
 */
export function generateImageStructuredData(
  imageData: ImageSEOData,
  additionalData?: Partial<ImageStructuredData>
): ImageStructuredData {
  const fullUrl = imageData.src.startsWith("http")
    ? imageData.src
    : `${siteConfig.url}${imageData.src}`;

  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: fullUrl,
    description: imageData.alt,
    name: imageData.title || imageData.alt,
    caption: imageData.caption,
    width: imageData.width,
    height: imageData.height,
    license: "https://creativecommons.org/licenses/by/4.0/",
    copyrightHolder: siteConfig.author,
    encodingFormat: getImageFormat(imageData.src),
    ...additionalData,
  };
}

/**
 * Get image format from file extension
 */
function getImageFormat(src: string): string {
  const extension = src.split(".").pop()?.toLowerCase();
  const formatMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
    svg: "image/svg+xml",
    gif: "image/gif",
  };
  return formatMap[extension || "jpg"] || "image/jpeg";
}

/**
 * Generate optimized alt text for different image types
 */
export function generateAltText(
  type:
    | "certification"
    | "package"
    | "logo"
    | "icon"
    | "screenshot"
    | "badge"
    | "hero",
  context: {
    name?: string;
    category?: string;
    action?: string;
    description?: string;
  }
): string {
  const { name, category, action, description } = context;

  switch (type) {
    case "certification":
      return `${name} certification${category ? ` in ${category}` : ""} practice exam`;

    case "package":
      return `${name} certification bundle${category ? ` for ${category}` : ""} practice package`;

    case "logo":
      return `${name || siteConfig.name} logo`;

    case "icon":
      return `${name || action || "Feature"} icon`;

    case "screenshot":
      return `Screenshot of ${name || "application interface"}${description ? ` - ${description}` : ""}`;

    case "badge":
      return `${name} certification badge${category ? ` for ${category}` : ""}`;

    case "hero":
      return `${name || "Hero image"} - ${description || "Main banner image"}`;

    default:
      return description || name || "Image";
  }
}

/**
 * Generate responsive image sizes attribute
 */
export function generateImageSizes(
  breakpoints: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    large?: string;
  } = {}
): string {
  const {
    mobile = "100vw",
    tablet = "50vw",
    desktop = "33vw",
    large = "25vw",
  } = breakpoints;

  return [
    `(max-width: 640px) ${mobile}`,
    `(max-width: 768px) ${tablet}`,
    `(max-width: 1024px) ${desktop}`,
    large,
  ].join(", ");
}

/**
 * Predefined image configurations for common use cases
 */
export const IMAGE_CONFIGS = {
  hero: {
    sizes: "100vw",
    priority: true,
    quality: 85,
  },

  certification: {
    sizes: generateImageSizes({
      mobile: "100vw",
      tablet: "50vw",
      desktop: "33vw",
    }),
    priority: false,
    quality: 80,
  },

  package: {
    sizes: generateImageSizes({
      mobile: "100vw",
      tablet: "50vw",
      desktop: "33vw",
    }),
    priority: false,
    quality: 80,
  },

  logo: {
    sizes: "200px",
    priority: true,
    quality: 90,
  },

  icon: {
    sizes: "24px",
    priority: false,
    quality: 90,
  },

  badge: {
    sizes: "100px",
    priority: false,
    quality: 85,
  },

  screenshot: {
    sizes: generateImageSizes({
      mobile: "100vw",
      tablet: "75vw",
      desktop: "50vw",
    }),
    priority: false,
    quality: 75,
  },

  thumbnail: {
    sizes: generateImageSizes({
      mobile: "50vw",
      tablet: "25vw",
      desktop: "20vw",
    }),
    priority: false,
    quality: 75,
  },
} as const;

/**
 * Get optimized image configuration for a specific type
 */
export function getImageConfig(
  type: keyof typeof IMAGE_CONFIGS,
  overrides?: Partial<ImageSEOData>
): Partial<ImageSEOData> {
  return {
    ...IMAGE_CONFIGS[type],
    ...overrides,
  };
}

/**
 * Validate image SEO data for common issues
 */
export function validateImageSEO(imageData: ImageSEOData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!imageData.src) {
    errors.push("Image src is required");
  }

  if (!imageData.alt) {
    errors.push("Alt text is required for accessibility and SEO");
  }

  // Alt text quality checks
  if (imageData.alt) {
    if (imageData.alt.length < 10) {
      warnings.push(
        "Alt text is very short - consider adding more descriptive text"
      );
    }

    if (imageData.alt.length > 125) {
      warnings.push(
        "Alt text is very long - consider shortening for better accessibility"
      );
    }

    if (
      imageData.alt.toLowerCase().includes("image of") ||
      imageData.alt.toLowerCase().includes("picture of")
    ) {
      warnings.push('Avoid redundant phrases like "image of" in alt text');
    }
  }

  // Dimension checks
  if (imageData.width && imageData.height) {
    const aspectRatio = imageData.width / imageData.height;

    if (aspectRatio < 0.5 || aspectRatio > 3) {
      warnings.push("Unusual aspect ratio - ensure image displays properly");
    }
  } else {
    warnings.push(
      "Width and height not specified - consider adding for better performance"
    );
  }

  // File format checks
  if (imageData.src) {
    const extension = imageData.src.split(".").pop()?.toLowerCase();

    if (!["webp", "avif", "png", "jpg", "jpeg"].includes(extension || "")) {
      warnings.push(
        "Consider using modern image formats like WebP or AVIF for better performance"
      );
    }

    if (["bmp", "tiff", "gif"].includes(extension || "")) {
      warnings.push(
        "Image format may not be optimal for web - consider WebP or AVIF"
      );
    }
  }

  // Quality checks
  if (imageData.quality && (imageData.quality < 60 || imageData.quality > 95)) {
    warnings.push("Image quality outside recommended range (60-95)");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate SEO-friendly image file names
 */
export function generateImageFileName(
  type:
    | "certification"
    | "package"
    | "logo"
    | "icon"
    | "screenshot"
    | "badge"
    | "hero",
  context: {
    name?: string;
    category?: string;
    variant?: string;
  },
  format: "webp" | "avif" | "png" | "jpg" = "webp"
): string {
  const { name, category, variant } = context;

  // Convert to SEO-friendly format
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const parts: string[] = [];

  // Add type prefix
  parts.push(type);

  // Add category if provided
  if (category) {
    parts.push(slugify(category));
  }

  // Add name if provided
  if (name) {
    parts.push(slugify(name));
  }

  // Add variant if provided
  if (variant) {
    parts.push(slugify(variant));
  }

  return `${parts.join("-")}.${format}`;
}

/**
 * Generate image sitemap entries for SEO
 */
export function generateImageSitemapEntries(images: ImageSEOData[]): Array<{
  loc: string;
  caption?: string;
  title?: string;
}> {
  return images.map(image => {
    const fullUrl = image.src.startsWith("http")
      ? image.src
      : `${siteConfig.url}${image.src}`;

    return {
      loc: fullUrl,
      caption: image.caption || image.alt,
      title: image.title,
    };
  });
}

/**
 * Image SEO optimization tips and best practices
 */
export const IMAGE_OPTIMIZATION_TIPS = {
  altText: [
    "Be descriptive and specific",
    "Keep it under 125 characters",
    'Avoid redundant phrases like "image of"',
    "Include relevant keywords naturally",
    "Describe the function, not just appearance",
  ],

  fileNames: [
    "Use descriptive, keyword-rich file names",
    "Separate words with hyphens",
    "Keep file names concise but meaningful",
    "Include primary keyword at the beginning",
  ],

  formats: [
    "Use WebP for better compression and quality",
    "Consider AVIF for even better compression",
    "Fallback to PNG for transparency needs",
    "Use JPEG only for complex photos",
  ],

  performance: [
    "Compress images without losing quality",
    "Use responsive images with srcset",
    "Implement lazy loading for below-fold images",
    "Prioritize above-fold images",
    "Use appropriate image dimensions",
  ],

  seo: [
    "Add structured data for important images",
    "Include images in sitemap",
    "Use captions when helpful for context",
    "Ensure images are crawlable (not blocked)",
    "Optimize for Core Web Vitals",
  ],
} as const;
