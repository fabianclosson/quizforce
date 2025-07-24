"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QuizForceLogo } from "@/components/ui/quizforce-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  User,
  CreditCard,
  LogOut,
  Home,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Navigation items
const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "View your progress and stats",
  },
  {
    name: "Catalog",
    href: "/catalog",
    icon: BookOpen,
    description: "Browse certifications and packages",
  },
  {
    name: "Practice Exams",
    href: "/practice",
    icon: GraduationCap,
    description: "Take practice exams",
  },
  {
    name: "Community",
    href: "/community",
    icon: Users,
    description: "Connect with other learners",
  },
];

interface MobileNavProps {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 px-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center px-6 py-4 border-b">
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={handleLinkClick}
            >
              <QuizForceLogo
                size={26}
                withText={true}
                textClassName="text-foreground"
              />
            </Link>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-4">
            {user ? (
              <>
                {/* User Profile Section */}
                <div className="flex items-center space-x-3 pb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user.avatarUrl}
                      alt={user.firstName || ""}
                    />
                    <AvatarFallback>
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    {user.firstName && user.lastName && (
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.firstName} {user.lastName}
                      </p>
                    )}
                    {user.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Navigation */}
                <nav className="space-y-2">
                  {navigationItems.map(item => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <Separator className="my-4" />

                {/* Account Actions */}
                <div className="space-y-2">
                  <Link
                    href="/account"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <User className="h-4 w-4" />
                    <span>My Account</span>
                  </Link>
                  <Link
                    href="/enrollment-history"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Enrollment History</span>
                  </Link>
                  <button className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Public Navigation */}
                <nav className="space-y-2">
                  <Link
                    href="/"
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === "/"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                  <Link
                    href="/catalog"
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === "/catalog"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Catalog</span>
                  </Link>
                  <Link
                    href="/community"
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === "/community"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    <span>Community</span>
                  </Link>
                </nav>

                <Separator className="my-4" />

                {/* Auth Buttons */}
                <div className="space-y-2">
                  <Link
                    href="/auth/signin"
                    onClick={handleLinkClick}
                    className="block"
                  >
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={handleLinkClick}
                    className="block"
                  >
                    <Button className="w-full hover:bg-white hover:text-black hover:border-black transition-all duration-300 hover:shadow-lg">
                      Start Free Practice
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="font-medium">
                  QuizForce v1.0 • Made with ❤️ for learners
                </p>
                <p className="text-xs text-muted-foreground">
                  © 2024 QuizForce
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
