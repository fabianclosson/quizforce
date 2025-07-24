/**
 * Performance Optimization Utilities
 *
 * Comprehensive utilities for optimizing images, assets, caching,
 * and performance monitoring in the QuizForce application.
 */

import { StaticImageData } from "next/image";

// Image optimization configurations
export const IMAGE_OPTIMIZATION = {
  // Quality settings for different image types
  quality: {
    hero: 85,
    thumbnail: 75,
    avatar: 80,
    icon: 90,
    background: 70,
    chart: 85,
  },

  // Responsive breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },

  // Image sizes for different components
  sizes: {
    hero: "100vw",
    thumbnail: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    avatar: "(max-width: 768px) 64px, 96px",
    icon: "(max-width: 768px) 24px, 32px",
    card: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px",
    gallery: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw",
  },

  // Placeholder configurations
  placeholder: {
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",
    solid:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=",
  },
} as const;

// Asset preloading utilities
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}

// Critical resource hints
export function addResourceHint(
  type: "preload" | "prefetch" | "preconnect",
  href: string,
  as?: string
) {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = type;
  link.href = href;

  if (as) {
    link.as = as;
  }

  if (type === "preconnect") {
    link.crossOrigin = "anonymous";
  }

  document.head.appendChild(link);
}

// Performance monitoring utilities
export const PERFORMANCE_MONITORING = {
  // Core Web Vitals thresholds
  thresholds: {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
    FID: { good: 100, poor: 300 }, // First Input Delay
    CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
    TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  },

  // Measure Core Web Vitals
  measureWebVitals() {
    if (typeof window === "undefined") return;

    // Largest Contentful Paint
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log("LCP:", lastEntry.startTime);
    }).observe({ entryTypes: ["largest-contentful-paint"] });
  },
};

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  if (typeof window === "undefined") return;

  // Preconnect to external domains
  addResourceHint("preconnect", "https://fonts.googleapis.com");
  addResourceHint("preconnect", "https://fonts.gstatic.com");
  addResourceHint("preconnect", "https://api.stripe.com");

  console.log("Performance optimizations initialized");
}
