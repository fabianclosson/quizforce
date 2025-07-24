"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ThemeTest() {
  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Clean Monochrome Design
        </h1>
        <p className="text-muted-foreground mt-2">
          Inspired by shadcn/ui blocks with crisp black and white aesthetics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Light Theme</CardTitle>
            <CardDescription>
              Clean white backgrounds with sharp black text for maximum
              readability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>
              Geist font with excellent readability and modern character
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <h3 className="text-lg font-semibold">Heading</h3>
            <p className="text-muted-foreground">
              Subtitle text with perfect contrast ratios
            </p>
            <p className="text-sm">Small text remains crisp and clear</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interactive Elements</CardTitle>
            <CardDescription>
              Clean interactions with subtle gray states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="link">Link Button</Button>
            <div className="monochrome-gradient p-4 text-white rounded-lg">
              <p className="font-medium">Monochrome Accent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Design Philosophy</CardTitle>
          <CardDescription>
            Following shadcn/ui blocks aesthetic principles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Light Mode</h4>
              <p className="text-sm text-muted-foreground">
                Pure white backgrounds with near-black text create maximum
                contrast and readability. Subtle gray borders and accents
                provide structure without distraction.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Dark Mode</h4>
              <p className="text-sm text-muted-foreground">
                Deep black backgrounds with crisp white text maintain the same
                level of contrast and professional appearance in low-light
                environments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
