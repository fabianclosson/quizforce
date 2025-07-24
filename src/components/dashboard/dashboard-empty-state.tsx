"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Trophy,
  Target,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardEmptyStateProps {
  className?: string;
}

export function DashboardEmptyState({ className }: DashboardEmptyStateProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Empty State Card */}
      <Card className="text-center py-16 border-dashed border-2">
        <CardContent className="space-y-6">
          {/* Icon and Title */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <Trophy className="h-10 w-10 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold mb-4">
              Welcome to QuizForce!
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start your Salesforce certification journey today. Practice with
              real exam questions and boost your career.
            </p>
          </div>

          {/* Stats Preview */}
          <div className="flex items-center justify-center gap-6 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">500+</div>
              <div className="text-xs text-muted-foreground">
                Practice Questions
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">15+</div>
              <div className="text-xs text-muted-foreground">
                Certifications
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">90%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Link href="/catalog">
                <BookOpen className="h-5 w-5 mr-2" />
                Browse Certifications
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>

            <p className="text-sm text-muted-foreground">
              Or start with a{" "}
              <Link
                href="/catalog?filter=free"
                className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4"
              >
                free practice exam
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feature Highlights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="text-center p-6 hover:shadow-md transition-shadow">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">Practice Exams</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Realistic exam simulations with detailed explanations for every
            question.
          </p>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </Card>

        <Card className="text-center p-6 hover:shadow-md transition-shadow">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
            <Trophy className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Track Progress</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Monitor your learning journey with detailed analytics and insights.
          </p>
          <Badge variant="secondary" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            Real-time
          </Badge>
        </Card>

        <Card className="text-center p-6 hover:shadow-md transition-shadow">
          <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">Study Materials</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comprehensive study guides and resources for all certification
            levels.
          </p>
          <Badge variant="secondary" className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            Expert-curated
          </Badge>
        </Card>
      </div>

      {/* Popular Certifications Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Popular Certifications</h3>
            <Button variant="outline" size="sm" asChild>
              <Link href="/catalog">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  Salesforce Administrator
                </div>
                <div className="text-xs text-muted-foreground">
                  Most popular • Beginner friendly
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Free
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Platform Developer I</div>
                <div className="text-xs text-muted-foreground">
                  High demand • Intermediate
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Premium
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
