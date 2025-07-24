"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  TrendingDown,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { AdminCertificationPackage } from "@/types";
import { toast } from "sonner";

interface PackageListProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function PackageList({
  searchQuery = "",
  onSearchChange,
}: PackageListProps) {
  const router = useRouter();
  const [packages, setPackages] = useState<AdminCertificationPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchPackages = async (search = "", page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/admin/packages?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }

      const data = await response.json();
      setPackages(data.packages);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages(searchTerm, pagination.page);
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
    fetchPackages(value, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchPackages(searchTerm, newPage);
  };

  const handleDeletePackage = async (
    packageId: string,
    packageName: string
  ) => {
    try {
      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete package");
      }

      toast.success(`Package "${packageName}" deleted successfully`);
      fetchPackages(searchTerm, pagination.page);
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error("Failed to delete package");
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
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Package Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Package Management
        </CardTitle>
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search packages..."
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => router.push("/admin/packages/new")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Package
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {packages.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No packages found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "No packages match your search."
                : "Get started by creating your first package."}
            </p>
            <Button
              onClick={() => router.push("/admin/packages/new")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Package
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Certifications</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Savings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map(pkg => (
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pkg.name}</div>
                          {pkg.description && (
                            <div className="text-sm text-muted-foreground">
                              {pkg.description}
                            </div>
                          )}
                          {pkg.is_featured && (
                            <Badge variant="secondary" className="mt-1">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {pkg.certification_count}{" "}
                            {pkg.certification_count === 1 ? "cert" : "certs"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {pkg.valid_months} months access
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatPrice(pkg.price_cents)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            vs {formatPrice(pkg.individual_total_cents)}{" "}
                            individual
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            {formatPrice(pkg.savings_cents)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({pkg.savings_percentage}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={pkg.is_active ? "default" : "secondary"}
                        >
                          {pkg.is_active ? (
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(pkg.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/packages/${pkg.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/packages/${pkg.id}/edit`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Package
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{pkg.name}"?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeletePackage(pkg.id, pkg.name)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {packages.length} of {pagination.total} packages
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
