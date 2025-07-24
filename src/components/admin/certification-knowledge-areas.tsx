"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Progress } from "@/components/ui/progress";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  ArrowLeft,
  Brain,
  BookOpen,
  Percent,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { KnowledgeAreaForm } from "./knowledge-area-form";

interface KnowledgeArea {
  id: string;
  certification_id: string;
  name: string;
  description: string | null;
  weight_percentage: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface Certification {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface CertificationKnowledgeAreasProps {
  certificationId: string;
}

export function CertificationKnowledgeAreas({
  certificationId,
}: CertificationKnowledgeAreasProps) {
  const [certification, setCertification] = useState<Certification | null>(
    null
  );
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKnowledgeArea, setSelectedKnowledgeArea] =
    useState<KnowledgeArea | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  // Calculate completion metrics
  const totalWeight = knowledgeAreas.reduce(
    (sum, area) => sum + area.weight_percentage,
    0
  );
  const isComplete = totalWeight === 100;
  const completionProgress = Math.min(totalWeight, 100);

  // Filter knowledge areas based on search
  const filteredKnowledgeAreas = knowledgeAreas.filter(
    area =>
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (area.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const fetchCertification = async () => {
    try {
      const response = await fetch(
        `/api/admin/certifications/${certificationId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch certification");
      }

      const data = await response.json();
      setCertification(data.certification);
    } catch (err) {
      console.error("Failed to fetch certification:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load certification"
      );
    }
  };

  const fetchKnowledgeAreas = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        certification_id: certificationId,
        limit: "100", // Get all for this certification
      });

      const response = await fetch(
        `/api/admin/knowledge-areas?${queryParams}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch knowledge areas");
      }

      const data = await response.json();
      setKnowledgeAreas(data.knowledge_areas || []);
    } catch (err) {
      console.error("Failed to fetch knowledge areas:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load knowledge areas"
      );
    } finally {
      setLoading(false);
    }
  };

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
        throw new Error("Failed to delete knowledge area");
      }

      toast.success("Knowledge area deleted successfully");
      fetchKnowledgeAreas(); // Refresh the list
      setDeleteDialogOpen(false);
      setSelectedKnowledgeArea(null);
    } catch (err) {
      console.error("Failed to delete knowledge area:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete knowledge area"
      );
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (knowledgeArea: KnowledgeArea) => {
    setSelectedKnowledgeArea(knowledgeArea);
    setDeleteDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    fetchKnowledgeAreas(); // Refresh the list
  };

  const formatWeight = (weight: number) => `${weight}%`;

  const getWeightColor = (totalWeight: number) => {
    if (totalWeight < 80) return "text-yellow-600";
    if (totalWeight === 100) return "text-green-600";
    if (totalWeight > 100) return "text-red-600";
    return "text-blue-600";
  };

  useEffect(() => {
    fetchCertification();
    fetchKnowledgeAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificationId]);

  if (loading && !certification) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/certifications")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Certifications
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Brain className="h-8 w-8" />
          Knowledge Areas
        </h1>
        <p className="text-muted-foreground">
          Manage knowledge areas for{" "}
          <span className="font-medium">{certification?.name}</span>
        </p>
      </div>

      {/* Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Completion Status
          </CardTitle>
          <CardDescription>
            Track the total weight percentage for this certification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Weight</span>
              <span
                className={`text-lg font-bold ${getWeightColor(totalWeight)}`}
              >
                {totalWeight}%
              </span>
            </div>
            <Progress value={completionProgress} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {knowledgeAreas.length} knowledge area
                {knowledgeAreas.length !== 1 ? "s" : ""}
              </span>
              <span>
                {isComplete
                  ? "✅ Complete"
                  : totalWeight > 100
                    ? "⚠️ Over 100%"
                    : "🔄 In Progress"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Actions */}
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
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Knowledge Area
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Knowledge Area</DialogTitle>
              <DialogDescription>
                Create a new knowledge area for {certification?.name}
              </DialogDescription>
            </DialogHeader>
            <KnowledgeAreaForm
              mode="create"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              knowledgeArea={{ certification_id: certificationId } as any}
              onSave={async () => {
                // The form will handle the API call
                handleCreateSuccess();
              }}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Knowledge Areas List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Knowledge Areas
          </CardTitle>
          <CardDescription>
            Manage the knowledge areas for this certification
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
          ) : filteredKnowledgeAreas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Brain className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm
                  ? "No knowledge areas found"
                  : "No knowledge areas yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Get started by creating the first knowledge area for this certification"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Knowledge Area
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKnowledgeAreas
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map(area => (
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
                        <Badge variant="secondary" className="gap-1">
                          <Percent className="h-3 w-3" />
                          {formatWeight(area.weight_percentage)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {area.sort_order}
                        </span>
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
