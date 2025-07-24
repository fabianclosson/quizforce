import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PreExamData,
  ExamSessionData,
  StartExamRequest,
  StartExamResponse,
  SaveAnswerRequest,
} from "@/types/exam";
import { createClient } from "@/lib/supabase";

// Mock data for development - will be replaced with real API calls
const mockPreExamData: PreExamData = {
  practice_exam: {
    id: "exam_1",
    name: "Salesforce Administrator Practice Exam 1",
    description:
      "Test your knowledge of Salesforce administration fundamentals including user management, data security, and automation.",
    question_count: 60,
    time_limit_minutes: 90,
    passing_threshold_percentage: 65,
    certification: {
      name: "Salesforce Administrator",
      category: {
        name: "Administration",
        color: "blue",
      },
    },
  },
  user_status: {
    is_enrolled: true,
    previous_attempts: 2,
    best_score: 78,
    can_retake: true,
  },
  knowledge_areas: [
    {
      id: "ka_1",
      name: "User Management",
      weight_percentage: 20,
      question_count: 12,
    },
    {
      id: "ka_2",
      name: "Data Security",
      weight_percentage: 15,
      question_count: 9,
    },
    {
      id: "ka_3",
      name: "Process Automation",
      weight_percentage: 25,
      question_count: 15,
    },
    {
      id: "ka_4",
      name: "Reports and Dashboards",
      weight_percentage: 20,
      question_count: 12,
    },
    {
      id: "ka_5",
      name: "Data Management",
      weight_percentage: 20,
      question_count: 12,
    },
  ],
};

// Mock questions data for development
const mockQuestions = [
  {
    id: "q1",
    practice_exam_id: "exam_1",
    knowledge_area_id: "ka_1",
    question_text:
      "Which of the following is the correct way to create a new user in Salesforce?",
    explanation:
      "Creating users in Salesforce requires proper permissions and following the correct navigation path. The Setup menu provides access to user management functionality.",
    difficulty_level: "easy" as const,
    question_number: 1,
    required_selections: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    answers: [
      {
        id: "a1",
        question_id: "q1",
        answer_text: "Setup → Users → New User",
        explanation:
          "This is the correct path to create new users in Salesforce.",
        is_correct: true,
        answer_letter: "A" as const,
        created_at: new Date().toISOString(),
      },
      {
        id: "a2",
        question_id: "q1",
        answer_text: "Home → Users → Add User",
        explanation: "Users cannot be created from the Home tab.",
        is_correct: false,
        answer_letter: "B" as const,
        created_at: new Date().toISOString(),
      },
      {
        id: "a3",
        question_id: "q1",
        answer_text: "App Launcher → User Management",
        explanation:
          "While the App Launcher can access many features, user creation is done through Setup.",
        is_correct: false,
        answer_letter: "C" as const,
        created_at: new Date().toISOString(),
      },
      {
        id: "a4",
        question_id: "q1",
        answer_text: "Reports → User Reports → New",
        explanation: "Reports are for viewing data, not creating users.",
        is_correct: false,
        answer_letter: "D" as const,
        created_at: new Date().toISOString(),
      },
    ],
    knowledge_area: {
      id: "ka_1",
      name: "User Management",
      description: "Managing users, profiles, and permissions",
      weight_percentage: 20,
    },
  },
  {
    id: "q2",
    practice_exam_id: "exam_1",
    knowledge_area_id: "ka_2",
    question_text:
      "What is the maximum number of custom fields that can be created on a standard object?",
    explanation:
      "Salesforce has specific limits on the number of custom fields per object to maintain system performance and data integrity.",
    difficulty_level: "medium" as const,
    question_number: 2,
    required_selections: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    answers: [
      {
        id: "a5",
        question_id: "q2",
        answer_text: "500",
        explanation: "500 is too high for custom fields on standard objects.",
        is_correct: false,
        answer_letter: "A" as const,
        created_at: new Date().toISOString(),
      },
      {
        id: "a6",
        question_id: "q2",
        answer_text: "800",
        explanation:
          "This is the correct limit for custom fields on standard objects.",
        is_correct: true,
        answer_letter: "B" as const,
        created_at: new Date().toISOString(),
      },
      {
        id: "a7",
        question_id: "q2",
        answer_text: "1000",
        explanation:
          "1000 is the limit for custom objects, not standard objects.",
        is_correct: false,
        answer_letter: "C" as const,
        created_at: new Date().toISOString(),
      },
      {
        id: "a8",
        question_id: "q2",
        answer_text: "Unlimited",
        explanation:
          "There are always limits in Salesforce to maintain performance.",
        is_correct: false,
        answer_letter: "D" as const,
        created_at: new Date().toISOString(),
      },
    ],
    knowledge_area: {
      id: "ka_2",
      name: "Data Security",
      description: "Data security, sharing, and field-level security",
      weight_percentage: 15,
    },
  },
  {
    id: "q3",
    practice_exam_id: "exam_1",
    knowledge_area_id: "ka_3",
    question_text:
      "Which automation tool would be most appropriate for creating a complex business process that requires user interaction at multiple steps?",
    explanation:
      "Different automation tools in Salesforce serve different purposes. Understanding when to use each tool is crucial for effective process automation.",
    difficulty_level: "hard" as const,
    question_number: 3,
    required_selections: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    answers: [
      {
        id: "a9",
        question_id: "q3",
        answer_text: "Workflow Rules",
        explanation:
          "Workflow rules are limited and don't support complex user interactions.",
        is_correct: false,
        answer_letter: "A" as const,
        created_at: new Date().toISOString(),
      },
      {
        id: "a10",
        question_id: "q3",
        answer_text: "Process Builder",
        explanation:
          "Process Builder is powerful but has limitations for complex user interactions.",
        is_correct: false,
        answer_letter: "B" as const,
        created_at: new Date().toISOString(),
      },
      {
        id: "a11",
        question_id: "q3",
        answer_text: "Flow Builder",
        explanation:
          "Flow Builder is the most appropriate tool for complex processes requiring user interaction at multiple steps.",
        is_correct: true,
        answer_letter: "C" as const,
        created_at: new Date().toISOString(),
      },
      {
        id: "a12",
        question_id: "q3",
        answer_text: "Apex Triggers",
        explanation:
          "Apex triggers are for automated processes, not user interactions.",
        is_correct: false,
        answer_letter: "D" as const,
        created_at: new Date().toISOString(),
      },
    ],
    knowledge_area: {
      id: "ka_3",
      name: "Process Automation",
      description: "Workflow rules, process builder, and flow automation",
      weight_percentage: 25,
    },
  },
];

// Update the mockSessionData to include the questions
const mockSessionData: ExamSessionData = {
  attempt: {
    id: "attempt_1",
    user_id: "user_1",
    practice_exam_id: "exam_1",
    started_at: new Date().toISOString(),
    correct_answers: 0,
    total_questions: 60,
    time_spent_minutes: 0,
    status: "in_progress",
    mode: "exam" as const,
    created_at: new Date().toISOString(),
  },
  questions: mockQuestions, // Add the mock questions
  user_answers: [],
  current_question_index: 0,
  time_remaining_seconds: 5400, // 90 minutes
  is_flagged: {},
};

// Hook to fetch pre-exam data
export function usePreExamData(examId: string) {
  return useQuery({
    queryKey: ["pre-exam", examId],
    queryFn: async (): Promise<PreExamData> => {
      const response = await fetch(`/api/practice-exams/${examId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch exam data");
      }

      return response.json();
    },
    enabled: !!examId,
  });
}

// Hook to fetch exam session data
export function useExamSession(
  attemptId: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["exam-session", attemptId],
    queryFn: async (): Promise<ExamSessionData> => {
      if (!attemptId) throw new Error("Attempt ID is required");

      const response = await fetch(`/api/exam/session/${attemptId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get exam session");
      }

      return response.json();
    },
    enabled: !!attemptId && options?.enabled !== false,
  });
}

// Hook to start an exam
export function useStartExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: StartExamRequest
    ): Promise<StartExamResponse> => {
      const response = await fetch("/api/exam/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start exam");
      }

      return response.json();
    },
    onSuccess: data => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["exam-session"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["user-enrollments"] });
    },
  });
}

// Hook to restart an exam (abandon current attempts and start fresh)
export function useRestartExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: StartExamRequest
    ): Promise<StartExamResponse> => {
      // First, abandon any in-progress attempts
      const restartResponse = await fetch("/api/exam/restart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ practice_exam_id: request.practice_exam_id }),
      });

      if (!restartResponse.ok) {
        const errorData = await restartResponse.json();
        throw new Error(errorData.error || "Failed to restart exam");
      }

      // Then start a new exam
      const startResponse = await fetch("/api/exam/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json();
        throw new Error(
          errorData.error || "Failed to start exam after restart"
        );
      }

      return startResponse.json();
    },
    onSuccess: data => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["exam-session"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["user-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["practice-exams"] });
    },
  });
}

// Hook to save an answer
export function useSaveAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      examAttemptId,
      questionId,
      answerId,
      answerIds,
      timeSpent,
    }: {
      examAttemptId: string;
      questionId: string;
      answerId?: string;
      answerIds?: string[];
      timeSpent: number;
    }) => {
      const request: SaveAnswerRequest = {
        exam_attempt_id: examAttemptId,
        question_id: questionId,
        answer_id: answerId,
        answer_ids: answerIds,
        time_spent_seconds: timeSpent,
      };

      const response = await fetch("/api/exam/save-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save answer");
      }

      return response.json();
    },
    onSuccess: () => {
      // Update the exam session cache
      queryClient.invalidateQueries({ queryKey: ["exam-session"] });
    },
  });
}

// Hook to submit exam
export function useSubmitExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examAttemptId }: { examAttemptId: string }) => {
      const response = await fetch("/api/exam/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_attempt_id: examAttemptId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit exam");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh dashboard and practice exams
      queryClient.invalidateQueries({ queryKey: ["exam-session"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }); // Invalidate all dashboard queries
      queryClient.invalidateQueries({ queryKey: ["practice-exams"] });
      queryClient.invalidateQueries({ queryKey: ["user-enrollments"] });
    },
  });
}
