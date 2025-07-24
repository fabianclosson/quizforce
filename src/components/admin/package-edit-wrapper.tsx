"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { PackageForm } from "./package-form";
import { AdminCertificationPackage } from "@/types";

interface PackageEditWrapperProps {
  packageId: string;
}

export function PackageEditWrapper({ packageId }: PackageEditWrapperProps) {
  const [packageData, setPackageData] =
    useState<AdminCertificationPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/packages/${packageId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Package not found");
          }
          throw new Error("Failed to fetch package");
        }

        const data = await response.json();
        setPackageData(data.package);
      } catch (error) {
        console.error("Error fetching package:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load package"
        );
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Package...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Package
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!packageData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Package Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The requested package could not be found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <PackageForm packageData={packageData} isEdit={true} />;
}
