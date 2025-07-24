"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QuizForceLogo } from "@/components/ui/quizforce-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Menu,
  Home,
  Users,
  BookOpen,
  Package,
  FileQuestion,
  BarChart3,
  Settings,
  LogOut,
  Brain,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  disabled?: boolean;
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
    description: "Overview and statistics",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage user accounts",
  },
  {
    title: "Certifications",
    href: "/admin/certifications",
    icon: BookOpen,
    description: "Manage certifications",
  },
  {
    title: "Packages",
    href: "/admin/packages",
    icon: Package,
    description: "Manage certification packages",
  },
  {
    title: "Practice Exams",
    href: "/admin/practice-exams",
    icon: FileQuestion,
    description: "Manage practice exams",
  },
  {
    title: "Knowledge Areas",
    href: "/admin/knowledge-areas",
    icon: Brain,
    description: "Manage knowledge areas",
  },
  {
    title: "Questions",
    href: "/admin/questions",
    icon: FileQuestion,
    description: "Manage exam questions",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "View detailed analytics",
    disabled: true,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "System settings",
    disabled: true,
  },
];

function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className={cn("flex h-full flex-col bg-card", className)}>
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <QuizForceLogo size={26} />
          <span
            className="text-lg font-semibold italic text-black"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            QuizForce Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <div className="space-y-1">
          {navigation.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <div key={item.href}>
                {item.disabled ? (
                  <div
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed opacity-50",
                      "bg-muted/30"
                    )}
                    title={`${item.title} - Coming Soon`}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Coming Soon
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs opacity-70">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Sign Out */}
      <div className="border-t p-4">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

function AdminHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center space-x-4">
        {/* Mobile menu trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <AdminSidebar />
          </SheetContent>
        </Sheet>

        {/* Breadcrumb or page title can go here */}
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </div>
      </div>

      {/* Header actions can go here */}
      <div className="flex items-center space-x-4">
        {/* Future: notifications, user menu, etc. */}
      </div>
    </header>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-80 md:flex-col">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
