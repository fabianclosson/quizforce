"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { QuizForceLogo } from "@/components/ui/quizforce-logo";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Logo + Navigation */}
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <QuizForceLogo size={26} withText={true} />
            </Link>
            <nav className="hidden md:flex md:gap-6">
              <Button variant="ghost" asChild>
                <Link href="/catalog">Catalog</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/community">Community</Link>
              </Button>
            </nav>
          </div>

          {/* Right side: Authentication buttons */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button
              asChild
              className="hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg"
            >
              <Link href="/auth/signup">
                Start Free Practice
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AuthenticatedNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Logo + Navigation */}
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <QuizForceLogo size={26} withText={true} />
            </Link>
            <nav className="hidden md:flex md:gap-6">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/catalog">Catalog</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/community">Community</Link>
              </Button>
            </nav>
          </div>

          {/* Right side: Dashboard button + User menu */}
          <div className="flex items-center gap-4">
            <Button
              asChild
              className="hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg"
            >
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
