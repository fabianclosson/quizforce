import React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function LoadingSpinner({
  size = "md",
  className,
  children,
}: LoadingSpinnerProps) {
  // Map old size names to new spinner sizes
  const sizeMap = {
    sm: "small" as const,
    md: "medium" as const,
    lg: "large" as const,
  };

  return (
    <Spinner size={sizeMap[size]} className={className}>
      {children}
    </Spinner>
  );
}
