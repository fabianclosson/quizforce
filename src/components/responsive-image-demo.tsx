"use client";

import React from "react";
import {
  ResponsiveImage,
  HeroImage,
  CardImage,
  ResponsiveAvatarImage,
  ThumbnailImage,
  RESPONSIVE_SIZES,
  ASPECT_RATIOS,
} from "@/components/ui/responsive-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ResponsiveImageDemo() {
  // Sample image URLs for demonstration
  const sampleImages = {
    hero: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&h=640&fit=crop",
    card: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    thumbnail:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200&h=200&fit=crop",
  };

  return (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Responsive Image Components</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Next.js 15 optimized responsive images with automatic WebP/AVIF
          conversion, proper aspect ratios, and mobile-first responsive sizing.
        </p>
      </div>

      {/* Hero Image Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Hero Image
            <Badge variant="secondary">Priority Loading</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Full-width banner with 3:1 aspect ratio, priority loading for
            above-the-fold content.
          </p>
        </CardHeader>
        <CardContent>
          <HeroImage
            src={sampleImages.hero}
            alt="Hero banner showcasing responsive design"
            width={1920}
            height={640}
          />
          <div className="mt-4 text-xs text-muted-foreground">
            <strong>Sizes:</strong> {RESPONSIVE_SIZES.full}
            <br />
            <strong>Aspect Ratio:</strong> {ASPECT_RATIOS.banner} (3:1)
          </div>
        </CardContent>
      </Card>

      {/* Card Images Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Card Images Grid</CardTitle>
          <p className="text-sm text-muted-foreground">
            Responsive grid with 3:2 aspect ratio cards, optimized for different
            screen sizes.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <CardImage
                  src={sampleImages.card}
                  alt={`Card image ${i}`}
                  width={400}
                  height={300}
                />
                <div className="text-sm">
                  <h3 className="font-medium">Card Title {i}</h3>
                  <p className="text-muted-foreground">
                    Responsive card with optimized image loading
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <strong>Sizes:</strong> {RESPONSIVE_SIZES.card}
            <br />
            <strong>Aspect Ratio:</strong> {ASPECT_RATIOS.card} (3:2)
          </div>
        </CardContent>
      </Card>

      {/* Avatar Images */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar Images</CardTitle>
          <p className="text-sm text-muted-foreground">
            Circular avatars with responsive sizing and object-cover for perfect
            cropping.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16">
                <ResponsiveAvatarImage
                  src={sampleImages.avatar}
                  alt="User avatar small"
                  width={64}
                  height={64}
                />
              </div>
              <p className="text-xs text-muted-foreground">Small (64px)</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-24 h-24">
                <ResponsiveAvatarImage
                  src={sampleImages.avatar}
                  alt="User avatar medium"
                  width={96}
                  height={96}
                />
              </div>
              <p className="text-xs text-muted-foreground">Medium (96px)</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-32 h-32">
                <ResponsiveAvatarImage
                  src={sampleImages.avatar}
                  alt="User avatar large"
                  width={128}
                  height={128}
                />
              </div>
              <p className="text-xs text-muted-foreground">Large (128px)</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <strong>Sizes:</strong> {RESPONSIVE_SIZES.avatar}
            <br />
            <strong>Aspect Ratio:</strong> {ASPECT_RATIOS.square} (1:1)
            <br />
            <strong>Object Fit:</strong> cover
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Images */}
      <Card>
        <CardHeader>
          <CardTitle>Thumbnail Images</CardTitle>
          <p className="text-sm text-muted-foreground">
            Small square thumbnails with rounded corners for galleries and
            previews.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <ThumbnailImage
                key={i}
                src={sampleImages.thumbnail}
                alt={`Thumbnail ${i}`}
                width={96}
                height={96}
              />
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <strong>Sizes:</strong> {RESPONSIVE_SIZES.thumbnail}
            <br />
            <strong>Aspect Ratio:</strong> {ASPECT_RATIOS.square} (1:1)
          </div>
        </CardContent>
      </Card>

      {/* Custom Responsive Image */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Responsive Image</CardTitle>
          <p className="text-sm text-muted-foreground">
            Custom configuration with video aspect ratio and blur placeholder.
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveImage
            src={sampleImages.card}
            alt="Custom responsive image with video aspect ratio"
            width={800}
            height={450}
            aspectRatio="video"
            sizes="content"
            rounded="lg"
            showBlurPlaceholder
            className="shadow-lg"
          />
          <div className="mt-4 text-xs text-muted-foreground">
            <strong>Sizes:</strong> {RESPONSIVE_SIZES.content}
            <br />
            <strong>Aspect Ratio:</strong> {ASPECT_RATIOS.video} (16:9)
            <br />
            <strong>Features:</strong> Blur placeholder, rounded corners, shadow
          </div>
        </CardContent>
      </Card>

      {/* Configuration Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Reference</CardTitle>
          <p className="text-sm text-muted-foreground">
            Available responsive sizes and aspect ratios for the image
            components.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Responsive Sizes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {Object.entries(RESPONSIVE_SIZES).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between p-2 bg-muted rounded"
                >
                  <span className="font-mono text-primary">{key}</span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Aspect Ratios</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {Object.entries(ASPECT_RATIOS).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between p-2 bg-muted rounded"
                >
                  <span className="font-mono text-primary">{key}</span>
                  <span className="text-muted-foreground font-mono">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Features */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Features</CardTitle>
          <p className="text-sm text-muted-foreground">
            Built-in optimizations for better loading performance and user
            experience.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <h4 className="font-medium">Automatic Optimizations</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• WebP/AVIF format conversion</li>
                <li>• Responsive image generation</li>
                <li>• Lazy loading by default</li>
                <li>• Layout shift prevention</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Developer Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• TypeScript support</li>
                <li>• Preset components</li>
                <li>• Customizable sizing</li>
                <li>• Tailwind CSS integration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
