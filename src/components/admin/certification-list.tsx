"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Brain } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
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

interface Certification {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  exam_count: number;
  total_questions: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  certification_categories: {
    id: string;
    name: string;
    slug: string;
  };
}

export function CertificationList() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const response = await fetch(`/api/admin/certifications?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch certifications");
      }

      const data = await response.json();
      setCertifications(data.certifications || []);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      toast.error("Failed to load certifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCertifications();
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleToggleStatus = async (certification: Certification) => {
    try {
      const response = await fetch("/api/admin/certifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: certification.id,
          is_active: !certification.is_active,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update certification status");
      }

      toast.success(
        `Certification ${!certification.is_active ? "activated" : "deactivated"}`
      );
      fetchCertifications(); // Refresh the list
    } catch (error) {
      console.error("Error updating certification status:", error);
      toast.error("Failed to update certification status");
    }
  };

  const handleDelete = async (certification: Certification) => {
    try {
      setDeletingId(certification.id);
      const response = await fetch(
        `/api/admin/certifications?id=${certification.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete certification");
      }

      toast.success("Certification deleted successfully");
      fetchCertifications(); // Refresh the list
    } catch (error) {
      console.error("Error deleting certification:", error);
      toast.error("Failed to delete certification");
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (priceCents: number) => {
    if (priceCents === 0) return "Free";
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Certifications</CardTitle>
          <CardDescription>Manage certification bundles</CardDescription>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Certifications</CardTitle>
            <CardDescription>
              Manage certification bundles ({certifications.length} total)
            </CardDescription>
          </div>
          <Link href="/admin/certifications/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Certification
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certifications..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Exams</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certifications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {search
                        ? "No certifications found matching your search."
                        : "No certifications found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  certifications.map(certification => (
                    <TableRow key={certification.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {certification.name}
                          </div>
                          {certification.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {certification.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {certification.certification_categories.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            certification.price_cents === 0
                              ? "text-green-600"
                              : ""
                          }
                        >
                          {formatPrice(certification.price_cents)}
                        </span>
                      </TableCell>
                      <TableCell>{certification.exam_count}</TableCell>
                      <TableCell>{certification.total_questions}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              certification.is_active ? "default" : "secondary"
                            }
                          >
                            {certification.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {certification.is_featured && (
                            <Badge
                              variant="outline"
                              className="text-yellow-600"
                            >
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(certification.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/certifications/${certification.id}/knowledge-areas`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Manage knowledge areas"
                            >
                              <Brain className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(certification)}
                            title={
                              certification.is_active
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            {certification.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Link
                            href={`/admin/certifications/${certification.id}/edit`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit certification"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Delete certification"
                                className="text-red-600 hover:text-red-700"
                                disabled={deletingId === certification.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Certification
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {certification.name}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(certification)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
