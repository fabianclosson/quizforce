"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, User, Settings } from "lucide-react";

export default function ThemeDemo() {
  const [email, setEmail] = useState("");

  return (
    <div className="space-y-12 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Clean White Interface
        </h1>
        <p className="text-muted-foreground text-lg">
          Minimal black and white aesthetic inspired by modern design principles
        </p>
      </div>

      {/* Interface Examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-6">QuizForce Components</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <CardTitle>Study Dashboard</CardTitle>
                </div>
                <CardDescription>
                  Track your Salesforce certification progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Progress</span>
                    <Badge variant="secondary">75%</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-foreground h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Profile</CardTitle>
                </div>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge>Administrator</Badge>
                  <Badge variant="outline">Certified</Badge>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>Preferences</CardTitle>
                </div>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full">
                    Update Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Form Example */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Form Elements</h3>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Access your QuizForce account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <Button className="w-full">Sign In</Button>
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Button Variants */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Button Styles</h3>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
