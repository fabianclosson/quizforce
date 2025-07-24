"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface EnrollmentButtonProps {
  type: "certification" | "package";
  id: string;
  name: string;
  isFree: boolean;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function EnrollmentButton({
  type,
  id,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  name,
  isFree,
  className,
  variant = "default",
  size = "default",
}: EnrollmentButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = React.useState<boolean | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Check enrollment status
  React.useEffect(() => {
    const checkEnrollment = async () => {
      if (!user) {
        setIsEnrolled(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/certifications/${id}/enrollment-status`
        );

        if (response.ok) {
          const data = await response.json();
          setIsEnrolled(data.isEnrolled || false);
        } else {
          // If endpoint doesn't exist or returns error, assume not enrolled
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error("Error checking enrollment:", error);
        setIsEnrolled(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEnrollment();
  }, [id, user]);

  const handleClick = () => {
    if (isEnrolled) {
      // If already enrolled, go to dashboard
      router.push("/dashboard");
      return;
    }

    if (isFree) {
      // Redirect to intermediate confirmation screen for free items
      if (type === "certification") {
        router.push(`/certifications/${id}/enroll/confirm`);
      } else {
        // For packages we currently keep original immediate flow (can extend later)
        router.push(`/packages/${id}`);
      }
    } else {
      // For paid items fall back to sign-in (actual checkout flow will handle post-login)
      router.push("/auth/signin");
    }
  };

  // Determine button text and state
  let buttonText = "Enroll";
  let buttonVariant = variant;
  let isDisabled = false;

  if (isLoading) {
    buttonText = "Loading...";
    isDisabled = true;
  } else if (isEnrolled) {
    buttonText = "Enrolled";
    buttonVariant = "outline";
    isDisabled = true;
  } else if (!isFree) {
    buttonText = "Sign In to Purchase";
  }

  return (
    <Button
      variant={buttonVariant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {buttonText}
    </Button>
  );
}
