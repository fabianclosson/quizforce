"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  CreditCard,
  Settings,
  LogOut,
  ArrowRight,
} from "lucide-react";
import { QuizForceLogo } from "@/components/ui/quizforce-logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts";
import { LogoutButton } from "@/components/auth/logout-button";

interface NavbarProps {
  showMobileMenu?: boolean;
}

export function Navbar({ showMobileMenu = true }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map(name => name.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <QuizForceLogo size={26} withText={true} />
              </Link>
            </div>
            <nav className="hidden md:flex md:gap-6 md:ml-8">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/catalog">Catalog</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/practice-exams">Practice Exams</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/community">Community</Link>
              </Button>
            </nav>
          </div>

          {/* Right side */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url}
                          alt={user.email || "User"}
                        />
                        <AvatarFallback>
                          {user.email ? getInitials(user.email) : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.full_name ||
                            `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() ||
                            user.email?.split("@")[0] ||
                            "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/enrollment-history"
                        className="cursor-pointer"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Enrollment History</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="hover:bg-white hover:text-black hover:border-black transition-all duration-300 hover:shadow-lg"
                >
                  <Link href="/auth/signup">
                    Start Free Practice
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          {showMobileMenu && (
            <div className="-mr-2 flex items-center md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <X className="block h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && isOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link href="/catalog" onClick={() => setIsOpen(false)}>
                Catalog
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link href="/practice-exams" onClick={() => setIsOpen(false)}>
                Practice Exams
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link href="/community" onClick={() => setIsOpen(false)}>
                Community
              </Link>
            </Button>
          </div>
          {user ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url}
                      alt={user.email || "User"}
                    />
                    <AvatarFallback>
                      {user.email ? getInitials(user.email) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-foreground">
                    {user.user_metadata?.full_name ||
                      `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() ||
                      user.email?.split("@")[0] ||
                      "User"}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/account"
                  className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/enrollment-history"
                  className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Enrollment History
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1 px-4">
                <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Start Free Practice</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
