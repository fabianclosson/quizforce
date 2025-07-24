"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  HelpCircle,
  FileQuestion,
  BookOpen,
} from "lucide-react";

// Types based on database schema
interface Question {
  id: string;
  practice_exam_id: string;
  knowledge_area_id: string;
  question_text: string;
  explanation: string | null;
  difficulty_level: "easy" | "medium" | "hard";
  question_number: number;
  required_selections: number;
  created_at: string;
  updated_at: string;
  // Joined data
  practice_exam: {
    id: string;
    name: string;
    certification_id: string;
    certification: {
      id: string;
      name: string;
    };
  };
  knowledge_area: {
    id: string;
    name: string;
  };
  answer_count: number;
}

interface Certification {
  id: string;
  name: string;
}

interface PracticeExam {
  id: string;
  name: string;
  certification_id: string;
}

interface KnowledgeArea {
  id: string;
  name: string;
  certification_id: string;
}

export function QuestionList() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [practiceExams, setPracticeExams] = useState<PracticeExam[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCertification, setSelectedCertification] =
    useState<string>("all");
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const itemsPerPage = 20;

  // Load initial data (certifications for filter)
  useEffect(() => {
    loadCertifications();
  }, []);

  // Load practice exams when certification changes
  useEffect(() => {
    if (selectedCertification && selectedCertification !== "all") {
      loadPracticeExams(selectedCertification);
      loadKnowledgeAreas(selectedCertification);
    } else {
      setPracticeExams([]);
      setKnowledgeAreas([]);
      setSelectedExam("all");
      setSelectedArea("all");
    }
  }, [selectedCertification]);

  // Load questions when filters change
  useEffect(() => {
    loadQuestions();
  }, [
    currentPage,
    searchTerm,
    selectedCertification,
    selectedExam,
    selectedArea,
    selectedDifficulty,
  ]);

  const loadCertifications = async () => {
    try {
      const response = await fetch("/api/admin/certifications");
      if (!response.ok) throw new Error("Failed to load certifications");
      const data = await response.json();
      setCertifications(data.certifications || []);
    } catch (error) {
      console.error("Error loading certifications:", error);
      toast.error("Failed to load certifications");
    }
  };

  const loadPracticeExams = async (certificationId: string) => {
    try {
      const response = await fetch(
        `/api/admin/practice-exams?certification_id=${certificationId}`
      );
      if (!response.ok) throw new Error("Failed to load practice exams");
      const data = await response.json();
      setPracticeExams(data.practiceExams || []);
    } catch (error) {
      console.error("Error loading practice exams:", error);
      toast.error("Failed to load practice exams");
    }
  };

  const loadKnowledgeAreas = async (certificationId: string) => {
    try {
      const response = await fetch(
        `/api/admin/knowledge-areas?certification_id=${certificationId}`
      );
      if (!response.ok) throw new Error("Failed to load knowledge areas");
      const data = await response.json();
      setKnowledgeAreas(data.knowledgeAreas || []);
    } catch (error) {
      console.error("Error loading knowledge areas:", error);
      toast.error("Failed to load knowledge areas");
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }
      if (selectedCertification !== "all") {
        params.append("certification_id", selectedCertification);
      }
      if (selectedExam !== "all") {
        params.append("practice_exam_id", selectedExam);
      }
      if (selectedArea !== "all") {
        params.append("knowledge_area_id", selectedArea);
      }
      if (selectedDifficulty !== "all") {
        params.append("difficulty_level", selectedDifficulty);
      }

      const response = await fetch(`/api/admin/questions?${params}`);
      if (!response.ok) throw new Error("Failed to load questions");

      const data = await response.json();
      setQuestions(data.questions || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Failed to load questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      setDeleting(questionId);
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      toast.success("Question deleted successfully");
      loadQuestions(); // Reload the list
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    } finally {
      setDeleting(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCertification("all");
    setSelectedExam("all");
    setSelectedArea("all");
    setSelectedDifficulty("all");
    setCurrentPage(1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileQuestion className="h-4 w-4" />
          <span>
            {totalItems} question{totalItems !== 1 ? "s" : ""} total
          </span>
        </div>

        <Button
          onClick={() => router.push("/admin/questions/new")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Question
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter questions by search term, certification, exam, knowledge
            area, or difficulty
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Certification Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Certification</label>
              <Select
                value={selectedCertification}
                onValueChange={setSelectedCertification}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Certifications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Certifications</SelectItem>
                  {certifications.map(cert => (
                    <SelectItem key={cert.id} value={cert.id}>
                      {cert.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Practice Exam Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Practice Exam</label>
              <Select
                value={selectedExam}
                onValueChange={setSelectedExam}
                disabled={selectedCertification === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Exams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  {practiceExams.map(exam => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Knowledge Area Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Knowledge Area</label>
              <Select
                value={selectedArea}
                onValueChange={setSelectedArea}
                disabled={selectedCertification === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {knowledgeAreas.map(area => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select
                value={selectedDifficulty}
                onValueChange={setSelectedDifficulty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No questions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ||
                selectedCertification !== "all" ||
                selectedExam !== "all" ||
                selectedArea !== "all" ||
                selectedDifficulty !== "all"
                  ? "No questions match your current filters."
                  : "Get started by creating your first question."}
              </p>
              <Button
                onClick={() => router.push("/admin/questions/new")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Question
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Certification</TableHead>
                    <TableHead>Practice Exam</TableHead>
                    <TableHead>Knowledge Area</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Answers</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map(question => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">
                        {question.question_number}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="truncate font-medium">
                            {question.question_text}
                          </p>
                          {question.explanation && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              Has explanation
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            question.required_selections === 1
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }
                        >
                          {question.required_selections === 1
                            ? "Single"
                            : `Multi (${question.required_selections})`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          {question.practice_exam.certification.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileQuestion className="h-4 w-4 text-muted-foreground" />
                          {question.practice_exam.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {question.knowledge_area.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getDifficultyColor(
                            question.difficulty_level
                          )}
                        >
                          {question.difficulty_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {question.answer_count} answer
                          {question.answer_count !== 1 ? "s" : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/questions/${question.id}`)
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View question</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/admin/questions/${question.id}/edit`
                              )
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit question</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                disabled={deleting === question.id}
                              >
                                {deleting === question.id ? (
                                  <LoadingSpinner className="h-4 w-4" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span className="sr-only">Delete question</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Question
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this question?
                                  This action cannot be undone and will also
                                  delete all associated answers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(question.id)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="flex items-center text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                    {totalItems} questions
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
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
    </div>
  );
}
