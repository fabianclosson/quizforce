"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Package,
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Star,
  TrendingDown,
  Users,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { AdminCertificationPackage } from "@/types";
import { toast } from "sonner";

interface PackageDetailProps {
  packageId: string;
}

export function PackageDetail({ packageId }: PackageDetailProps) {
  const router = useRouter();
  const [packageData, setPackageData] =
    useState<AdminCertificationPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeletePackage = async () => {
    if (!packageData) return;

    try {
      setDeleting(true);

      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete package");
      }

      toast.success(`Package "${packageData.name}" deleted successfully`);
      router.push("/admin/packages");
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error("Failed to delete package");
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  if (error || !packageData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {error || "Package Not Found"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {error || "The requested package could not be found."}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/packages")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Packages
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/packages")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Packages
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {packageData.name}
            </h1>
            <p className="text-muted-foreground">
              Package details and configuration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/packages/${packageId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Package
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Package
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Package</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{packageData.name}"? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletePackage}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Package Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-sm">{packageData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Slug
                  </label>
                  <p className="text-sm font-mono">{packageData.slug}</p>
                </div>
              </div>

              {packageData.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-sm">{packageData.description}</p>
                </div>
              )}

              {packageData.detailed_description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Detailed Description
                  </label>
                  <p className="text-sm whitespace-pre-wrap">
                    {packageData.detailed_description}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={packageData.is_active ? "default" : "secondary"}
                    >
                      {packageData.is_active ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                    {packageData.is_featured && (
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Access Duration
                  </label>
                  <p className="text-sm">{packageData.valid_months} months</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Sort Order
                  </label>
                  <p className="text-sm">{packageData.sort_order}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created
                  </label>
                  <p className="text-sm">
                    {formatDate(packageData.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="text-sm">
                    {formatDate(packageData.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Included Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Included Certifications ({packageData.certification_count})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {packageData.certifications &&
              packageData.certifications.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Certification</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Exams</TableHead>
                        <TableHead className="text-right">
                          Individual Price
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packageData.certifications.map(cert => (
                        <TableRow key={cert.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{cert.name}</div>
                              {cert.description && (
                                <div className="text-sm text-muted-foreground">
                                  {cert.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {cert.category && (
                              <Badge variant="outline">
                                {cert.category.name}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {cert.exam_count} exams
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-medium">
                              {formatPrice(cert.price_cents)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No certifications
                  </h3>
                  <p className="text-muted-foreground">
                    This package doesn't include any certifications yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Package Price:
                  </span>
                  <span className="font-medium text-lg">
                    {formatPrice(packageData.price_cents)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Individual Total:
                  </span>
                  <span className="font-medium">
                    {formatPrice(packageData.individual_total_cents)}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Savings:</span>
                    <div className="text-right">
                      <div className="font-medium text-green-600 flex items-center gap-1">
                        <TrendingDown className="h-4 w-4" />
                        {formatPrice(packageData.savings_cents)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({packageData.savings_percentage}% off)
                      </div>
                    </div>
                  </div>
                </div>

                {packageData.discount_percentage > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Additional Discount:
                    </span>
                    <span className="font-medium text-orange-600">
                      {packageData.discount_percentage}%
                    </span>
                  </div>
                )}
              </div>

              {packageData.savings_cents > 0 && (
                <div className="rounded-lg bg-green-50 p-3 text-green-800">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Excellent value package!
                    </span>
                  </div>
                  <p className="text-xs mt-1">
                    Customers save {formatPrice(packageData.savings_cents)}{" "}
                    compared to buying individually.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Package Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Certifications:
                  </span>
                  <span className="font-medium">
                    {packageData.certification_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Access Duration:
                  </span>
                  <span className="font-medium">
                    {packageData.valid_months} months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge
                    variant={packageData.is_active ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {packageData.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {packageData.is_featured && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Featured:
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Yes
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
