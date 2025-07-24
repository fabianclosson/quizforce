"use client";

import { usePathname } from "next/navigation";
import { MainLayout } from "./main-layout";
import { AuthLayout } from "./auth-layout";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Pages that should not use the main layout (they have their own complete layout)
  const customLayoutPages = ["/"];

  // Auth pages that should use a simplified layout
  const authPages = [
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];

  // Pages that should hide the footer (using startsWith to handle sub-routes)
  const pagesWithoutFooter = [
    "/dashboard",
    "/catalog",
    "/practice-exams",
    "/community",
    "/exam",
    "/account",
    "/enrollment-history",
  ];

  // Always render consistently - no conditional mounting to prevent hydration mismatches
  if (customLayoutPages.includes(pathname)) {
    return <>{children}</>;
  }

  // Use simplified auth layout for auth pages
  if (authPages.includes(pathname)) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  // Otherwise, use the main layout (with or without footer)
  // Check if the current path starts with any of the footer-hidden paths
  const shouldHideFooter = pagesWithoutFooter.some(path =>
    pathname.startsWith(path)
  );
  return <MainLayout hideFooter={shouldHideFooter}>{children}</MainLayout>;
}
