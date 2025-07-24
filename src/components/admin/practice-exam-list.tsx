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
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Target,
} from "lucide-react";
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

interface PracticeExam {
  id: string;
  certification_id: string;
  name: string;
  description: string;
  question_count: number;
  time_limit_minutes: number;
  passing_threshold_percentage: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  certifications: {
    id: string;
    name: string;
    slug: string;
  };
}

export function PracticeExamList() {
  const [practiceExams, setPracticeExams] = useState<PracticeExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPracticeExams = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const response = await fetch(`/api/admin/practice-exams?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch practice exams");
      }

      const data = await response.json();
      setPracticeExams(data.practiceExams || []);
    } catch (error) {
      console.error("Error fetching practice exams:", error);
      toast.error("Failed to load practice exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticeExams();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPracticeExams();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleToggleStatus = async (practiceExam: PracticeExam) => {
    try {
      const response = await fetch("/api/admin/practice-exams", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: practiceExam.id,
          is_active: !practiceExam.is_active,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update practice exam status");
      }

      toast.success(
        `Practice exam ${!practiceExam.is_active ? "activated" : "deactivated"}`
      );
      fetchPracticeExams(); // Refresh the list
    } catch (error) {
      console.error("Error updating practice exam status:", error);
      toast.error("Failed to update practice exam status");
    }
  };

  const handleDelete = async (practiceExam: PracticeExam) => {
    try {
      setDeletingId(practiceExam.id);
      const response = await fetch(
        `/api/admin/practice-exams?id=${practiceExam.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete practice exam");
      }

      toast.success("Practice exam deleted successfully");
      fetchPracticeExams(); // Refresh the list
    } catch (error) {
      console.error("Error deleting practice exam:", error);
      toast.error("Failed to delete practice exam");
    } finally {
      setDeletingId(null);
    }
  };

  const formatTimeLimit = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Practice Exams</CardTitle>
          <CardDescription>Manage practice exams</CardDescription>
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
            <CardTitle>Practice Exams</CardTitle>
            <CardDescription>
              Manage practice exams ({practiceExams.length} total)
            </CardDescription>
          </div>
          <Link href="/admin/practice-exams/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Practice Exam
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
                placeholder="Search practice exams..."
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
                  <TableHead>Certification</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Time Limit</TableHead>
                  <TableHead>Passing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {practiceExams.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {search
                        ? "No practice exams found matching your search."
                        : "No practice exams found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  practiceExams.map(practiceExam => (
                    <TableRow key={practiceExam.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{practiceExam.name}</div>
                          {practiceExam.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {practiceExam.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {practiceExam.certifications.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span>{practiceExam.question_count}</span>
                          <span className="text-muted-foreground text-sm">
                            questions
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {formatTimeLimit(practiceExam.time_limit_minutes)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Target className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {practiceExam.passing_threshold_percentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            practiceExam.is_active ? "default" : "secondary"
                          }
                        >
                          {practiceExam.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(practiceExam.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(practiceExam)}
                            title={
                              practiceExam.is_active ? "Deactivate" : "Activate"
                            }
                          >
                            {practiceExam.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Link
                            href={`/admin/practice-exams/${practiceExam.id}/edit`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit practice exam"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Delete practice exam"
                                className="text-red-600 hover:text-red-700"
                                disabled={deletingId === practiceExam.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Practice Exam
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {practiceExam.name}"? This action cannot be
                                  undone and will also delete all questions and
                                  user attempts for this exam.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(practiceExam)}
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
