"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight } from "lucide-react";

// Metadata is handled by layout.tsx for Client Components

export default function CommunityPage() {
  const handleRequestAccess = () => {
    // Google Form for Salesforce Certified Slack Community access
    const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLScVWSPxT77vMUom_KtM4qqy27iXw3wHz7I8RJRa9QOS-fwpnA/viewform?usp=header";

    try {
      window.open(googleFormUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open Google Form link:", error);
      // Fallback: navigate in current tab if popup fails
      window.location.href = googleFormUrl;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-8 w-8" />
            </div>
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              Free
            </Badge>
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Join our Salesforce Certified Slack Community
        </h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect with thousands of certified Salesforce professionals, share
          knowledge, get real-time help, and accelerate your certification
          journey together.
        </p>

        <Button
          size="lg"
          onClick={handleRequestAccess}
          className="hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg"
        >
          Request Access
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
