"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Search,
  Brain,
  BookOpen,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import type { KnowledgeArea } from "@/types/database";

interface KnowledgeAreaWithCertification extends KnowledgeArea {
  certification: {
    name: string;
    slug: string;
  };
}

interface KnowledgeAreaListResponse {
  knowledge_areas: KnowledgeAreaWithCertification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function KnowledgeAreaList() {
  const [knowledgeAreas, setKnowledgeAreas] = useState<
    KnowledgeAreaWithCertification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKnowledgeArea, setSelectedKnowledgeArea] =
    useState<KnowledgeAreaWithCertification | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchKnowledgeAreas = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(
        `/api/admin/knowledge-areas?${queryParams}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch knowledge areas: ${response.status}`);
      }

      const data: KnowledgeAreaListResponse = await response.json();
      setKnowledgeAreas(data.knowledge_areas);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch knowledge areas:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load knowledge areas"
      );
      toast.error("Failed to load knowledge areas");
    } finally {
      setLoading(false);
    }
  };

  // Fetch knowledge areas on component mount and when dependencies change
  useEffect(() => {
    fetchKnowledgeAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchKnowledgeAreas();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!selectedKnowledgeArea) return;

    try {
      setDeleting(true);
      const response = await fetch(
        `/api/admin/knowledge-areas/${selectedKnowledgeArea.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete knowledge area: ${response.status}`);
      }

      toast.success("Knowledge area deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedKnowledgeArea(null);
      fetchKnowledgeAreas(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete knowledge area:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete knowledge area"
      );
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (knowledgeArea: KnowledgeAreaWithCertification) => {
    setSelectedKnowledgeArea(knowledgeArea);
    setDeleteDialogOpen(true);
  };

  const formatWeight = (weight: number) => `${weight}%`;

  if (loading && knowledgeAreas.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and create button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search knowledge areas..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Link href="/admin/knowledge-areas/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Knowledge Area
          </Button>
        </Link>
      </div>

      {/* Main content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Knowledge Areas
          </CardTitle>
          <CardDescription>
            Manage knowledge areas and their weightings for certifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-destructive mb-2">
                Error loading knowledge areas
              </div>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchKnowledgeAreas} variant="outline">
                Try Again
              </Button>
            </div>
          ) : knowledgeAreas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Brain className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No knowledge areas found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Get started by creating your first knowledge area"}
              </p>
              {!searchTerm && (
                <Link href="/admin/knowledge-areas/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Knowledge Area
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Certification</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {knowledgeAreas.map(area => (
                    <TableRow key={area.id}>
                      <TableCell>
                        <div className="font-medium">{area.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-muted-foreground">
                          {area.description || "No description"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {area.certification.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <Percent className="h-3 w-3" />
                          {formatWeight(area.weight_percentage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/knowledge-areas/${area.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/knowledge-areas/${area.id}/edit`}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(area)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination info */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} knowledge areas
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPagination(prev => ({
                          ...prev,
                          page: prev.page - 1,
                        }));
                        fetchKnowledgeAreas();
                      }}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPagination(prev => ({
                          ...prev,
                          page: prev.page + 1,
                        }));
                        fetchKnowledgeAreas();
                      }}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Area</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedKnowledgeArea?.name}"?
              This action cannot be undone. Any questions linked to this
              knowledge area may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
