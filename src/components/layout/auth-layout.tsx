import React from "react";
import Link from "next/link";
import { QuizForceLogo } from "@/components/ui/quizforce-logo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Simple Header - Just Logo */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <QuizForceLogo size={26} withText={true} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
