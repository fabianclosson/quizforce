"use client";

import React from "react";
import { Navbar } from "./navbar";

interface MainLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export function MainLayout({ children, hideFooter = false }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Contains navigation - Simplified to match landing page */}
      <header>
        <Navbar />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 w-full">
        {children}
      </main>

      {/* Footer - Only render if not hidden */}
      {!hideFooter && (
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-center">
            <span>
              © 2025 QuizForce, by{" "}
              <a 
                href="https://x.com/FabWorks" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500 transition-colors"
              >
                FabWorks
              </a>
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}
