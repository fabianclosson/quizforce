import { describe, it, expect } from "@jest/globals";
import {
  calculateExamResults,
  calculateSimpleScore,
  getPerformanceLevelColor,
  getTimeEfficiencyColor,
  ScoreCalculationInput,
} from "@/lib/exam-scoring";
import {
  QuestionWithAnswers,
  UserAnswer,
  ExamAttemptDetails,
} from "@/types/exam";

// Mock data for testing
const mockQuestions: QuestionWithAnswers[] = [
  {
    id: "q1",
    practice_exam_id: "exam_1",
    knowledge_area_id: "ka_1",
    question_text: "Question 1 text",
    difficulty_level: "easy",
    question_number: 1,
    required_selections: 1,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    answers: [
      {
        id: "a1",
        question_id: "q1",
        answer_text: "Correct answer",
        is_correct: true,
        answer_letter: "A",
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "a2",
        question_id: "q1",
        answer_text: "Wrong answer",
        is_correct: false,
        answer_letter: "B",
        created_at: "2023-01-01T00:00:00Z",
      },
    ],
    knowledge_area: {
      id: "ka_1",
      name: "User Management",
      description: "User management topics",
      weight_percentage: 40,
    },
  },
  {
    id: "q2",
    practice_exam_id: "exam_1",
    knowledge_area_id: "ka_1",
    question_text: "Question 2 text",
    difficulty_level: "medium",
    question_number: 2,
    required_selections: 1,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    answers: [
      {
        id: "a3",
        question_id: "q2",
        answer_text: "Wrong answer",
        is_correct: false,
        answer_letter: "A",
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "a4",
        question_id: "q2",
        answer_text: "Correct answer",
        is_correct: true,
        answer_letter: "B",
        created_at: "2023-01-01T00:00:00Z",
      },
    ],
    knowledge_area: {
      id: "ka_1",
      name: "User Management",
      description: "User management topics",
      weight_percentage: 40,
    },
  },
  {
    id: "q3",
    practice_exam_id: "exam_1",
    knowledge_area_id: "ka_2",
    question_text: "Question 3 text",
    difficulty_level: "hard",
    question_number: 3,
    required_selections: 1,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    answers: [
      {
        id: "a5",
        question_id: "q3",
        answer_text: "Correct answer",
        is_correct: true,
        answer_letter: "A",
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "a6",
        question_id: "q3",
        answer_text: "Wrong answer",
        is_correct: false,
        answer_letter: "B",
        created_at: "2023-01-01T00:00:00Z",
      },
    ],
    knowledge_area: {
      id: "ka_2",
      name: "Data Security",
      description: "Data security topics",
      weight_percentage: 60,
    },
  },
];

const mockExamAttempt: ExamAttemptDetails = {
  id: "attempt_1",
  user_id: "user_1",
  practice_exam_id: "exam_1",
  started_at: "2023-01-01T10:00:00Z",
  completed_at: "2023-01-01T11:30:00Z",
  correct_answers: 0,
  total_questions: 3,
  time_spent_minutes: 90,
  status: "completed",
  mode: "exam" as const,
  created_at: "2023-01-01T10:00:00Z",
};

describe("Exam Scoring", () => {
  describe("calculateSimpleScore", () => {
    it("should calculate correct score for all correct answers", () => {
      const userAnswers: UserAnswer[] = [
        {
          exam_attempt_id: "attempt_1",
          question_id: "q1",
          answer_id: "a1", // correct
          time_spent_seconds: 60,
        },
        {
          exam_attempt_id: "attempt_1",
          question_id: "q2",
          answer_id: "a4", // correct
          time_spent_seconds: 90,
        },
        {
          exam_attempt_id: "attempt_1",
          question_id: "q3",
          answer_id: "a5", // correct
          time_spent_seconds: 120,
        },
      ];

      const result = calculateSimpleScore(mockQuestions, userAnswers);

      expect(result.correct).toBe(3);
      expect(result.total).toBe(3);
      expect(result.percentage).toBe(100);
    });

    it("should calculate correct score for mixed answers", () => {
      const userAnswers: UserAnswer[] = [
        {
          exam_attempt_id: "attempt_1",
          question_id: "q1",
          answer_id: "a1", // correct
          time_spent_seconds: 60,
        },
        {
          exam_attempt_id: "attempt_1",
          question_id: "q2",
          answer_id: "a3", // wrong
          time_spent_seconds: 90,
        },
        {
          exam_attempt_id: "attempt_1",
          question_id: "q3",
          answer_id: "a5", // correct
          time_spent_seconds: 120,
        },
      ];

      const result = calculateSimpleScore(mockQuestions, userAnswers);

      expect(result.correct).toBe(2);
      expect(result.total).toBe(3);
      expect(result.percentage).toBe(67);
    });

    it("should handle empty user answers", () => {
      const result = calculateSimpleScore(mockQuestions, []);

      expect(result.correct).toBe(0);
      expect(result.total).toBe(3);
      expect(result.percentage).toBe(0);
    });

    it("should handle empty questions", () => {
      const userAnswers: UserAnswer[] = [
        {
          exam_attempt_id: "attempt_1",
          question_id: "q1",
          answer_id: "a1",
          time_spent_seconds: 60,
        },
      ];

      const result = calculateSimpleScore([], userAnswers);

      expect(result.correct).toBe(0);
      expect(result.total).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe("calculateExamResults", () => {
    it("should calculate comprehensive exam results", () => {
      const userAnswers: UserAnswer[] = [
        {
          exam_attempt_id: "attempt_1",
          question_id: "q1",
          answer_id: "a1", // correct
          time_spent_seconds: 60,
        },
        {
          exam_attempt_id: "attempt_1",
          question_id: "q2",
          answer_id: "a3", // wrong
          time_spent_seconds: 90,
        },
        {
          exam_attempt_id: "attempt_1",
          question_id: "q3",
          answer_id: "a5", // correct
          time_spent_seconds: 120,
        },
      ];

      const input: ScoreCalculationInput = {
        questions: mockQuestions,
        userAnswers,
        examAttempt: mockExamAttempt,
        passingThreshold: 65,
      };

      const result = calculateExamResults(input);

      expect(result.attempt_id).toBe("attempt_1");
      expect(result.score_percentage).toBe(67);
      expect(result.correct_answers).toBe(2);
      expect(result.total_questions).toBe(3);
      expect(result.passed).toBe(true);
      expect(result.overall_performance_level).toBe("needs_improvement");
      expect(result.question_results).toHaveLength(3);
    });

    it("should correctly determine pass/fail status", () => {
      const userAnswers: UserAnswer[] = [
        {
          exam_attempt_id: "attempt_1",
          question_id: "q1",
          answer_id: "a2", // wrong
          time_spent_seconds: 60,
        },
        {
          exam_attempt_id: "attempt_1",
          question_id: "q2",
          answer_id: "a3", // wrong
          time_spent_seconds: 90,
        },
        {
          exam_attempt_id: "attempt_1",
          question_id: "q3",
          answer_id: "a6", // wrong
          time_spent_seconds: 120,
        },
      ];

      const input: ScoreCalculationInput = {
        questions: mockQuestions,
        userAnswers,
        examAttempt: mockExamAttempt,
        passingThreshold: 65,
      };

      const result = calculateExamResults(input);

      expect(result.score_percentage).toBe(0);
      expect(result.passed).toBe(false);
      expect(result.overall_performance_level).toBe("poor");
    });

    it("should calculate knowledge area scores correctly", () => {
      const userAnswers: UserAnswer[] = [
        {
          exam_attempt_id: "attempt_1",
          question_id: "q1",
          answer_id: "a1", // correct (User Management)
          time_spent_seconds: 60,
        },
        {
          exam_attempt_id: "attempt_1",
          question_id: "q2",
          answer_id: "a3", // wrong (User Management)
          time_spent_seconds: 90,
        },
        {
          exam_attempt_id: "attempt_1",
          question_id: "q3",
          answer_id: "a5", // correct (Data Security)
          time_spent_seconds: 120,
        },
      ];

      const input: ScoreCalculationInput = {
        questions: mockQuestions,
        userAnswers,
        examAttempt: mockExamAttempt,
        passingThreshold: 65,
      };

      const result = calculateExamResults(input);

      expect(result.knowledge_area_scores).toHaveLength(2);

      // Find User Management area (should be 50% - 1 correct out of 2)
      const userMgmtArea = result.knowledge_area_scores.find(
        area => area.name === "User Management"
      );
      expect(userMgmtArea).toBeDefined();
      expect(userMgmtArea!.correct_answers).toBe(1);
      expect(userMgmtArea!.total_questions).toBe(2);
      expect(userMgmtArea!.score_percentage).toBe(50);

      // Find Data Security area (should be 100% - 1 correct out of 1)
      const dataSecArea = result.knowledge_area_scores.find(
        area => area.name === "Data Security"
      );
      expect(dataSecArea).toBeDefined();
      expect(dataSecArea!.correct_answers).toBe(1);
      expect(dataSecArea!.total_questions).toBe(1);
      expect(dataSecArea!.score_percentage).toBe(100);
    });

    it("should calculate difficulty breakdown correctly", () => {
      const userAnswers: UserAnswer[] = [
        {
          exam_attempt_id: "attempt_1",
          question_id: "q1",
          answer_id: "a1", // correct (easy)
          time_spent_seconds: 60,
        },
        {
          exam_attempt_id: "attempt_1",
          question_id: "q2",
          answer_id: "a3", // wrong (medium)
          time_spent_seconds: 90,
        },
        {
          exam_attempt_id: "attempt_1",
          question_id: "q3",
          answer_id: "a5", // correct (hard)
          time_spent_seconds: 120,
        },
      ];

      const input: ScoreCalculationInput = {
        questions: mockQuestions,
        userAnswers,
        examAttempt: mockExamAttempt,
        passingThreshold: 65,
      };

      const result = calculateExamResults(input);

      expect(result.difficulty_breakdown.easy.correct).toBe(1);
      expect(result.difficulty_breakdown.easy.total).toBe(1);
      expect(result.difficulty_breakdown.easy.percentage).toBe(100);

      expect(result.difficulty_breakdown.medium.correct).toBe(0);
      expect(result.difficulty_breakdown.medium.total).toBe(1);
      expect(result.difficulty_breakdown.medium.percentage).toBe(0);

      expect(result.difficulty_breakdown.hard.correct).toBe(1);
      expect(result.difficulty_breakdown.hard.total).toBe(1);
      expect(result.difficulty_breakdown.hard.percentage).toBe(100);
    });

    it("should calculate time efficiency correctly", () => {
      // Test excellent time efficiency (1.5 minutes per question = 4.5 minutes total)
      const excellentTimeAttempt = {
        ...mockExamAttempt,
        time_spent_minutes: 5,
      };
      const input: ScoreCalculationInput = {
        questions: mockQuestions,
        userAnswers: [],
        examAttempt: excellentTimeAttempt,
        passingThreshold: 65,
      };

      const result = calculateExamResults(input);
      expect(result.time_efficiency).toBe("excellent");

      // Test rushed time efficiency (0.3 minutes per question = 0.9 minutes total)
      const rushedTimeAttempt = { ...mockExamAttempt, time_spent_minutes: 1 };
      const rushedInput: ScoreCalculationInput = {
        questions: mockQuestions,
        userAnswers: [],
        examAttempt: rushedTimeAttempt,
        passingThreshold: 65,
      };

      const rushedResult = calculateExamResults(rushedInput);
      expect(rushedResult.time_efficiency).toBe("rushed");
    });
  });

  describe("Performance level utilities", () => {
    it("should return correct performance level colors", () => {
      expect(getPerformanceLevelColor("excellent")).toContain("text-green-600");
      expect(getPerformanceLevelColor("good")).toContain("text-blue-600");
      expect(getPerformanceLevelColor("needs_improvement")).toContain(
        "text-yellow-600"
      );
      expect(getPerformanceLevelColor("poor")).toContain("text-red-600");
    });

    it("should return correct time efficiency colors", () => {
      expect(getTimeEfficiencyColor("excellent")).toBe("text-green-600");
      expect(getTimeEfficiencyColor("good")).toBe("text-blue-600");
      expect(getTimeEfficiencyColor("adequate")).toBe("text-yellow-600");
      expect(getTimeEfficiencyColor("rushed")).toBe("text-red-600");
    });
  });

  describe("Edge cases", () => {
    it("should handle questions without correct answers", () => {
      const questionsWithoutCorrectAnswer: QuestionWithAnswers[] = [
        {
          ...mockQuestions[0],
          answers: [
            {
              id: "a1",
              question_id: "q1",
              answer_text: "Answer 1",
              is_correct: false,
              answer_letter: "A",
              created_at: "2023-01-01T00:00:00Z",
            },
            {
              id: "a2",
              question_id: "q1",
              answer_text: "Answer 2",
              is_correct: false,
              answer_letter: "B",
              created_at: "2023-01-01T00:00:00Z",
            },
          ],
        },
      ];

      const input: ScoreCalculationInput = {
        questions: questionsWithoutCorrectAnswer,
        userAnswers: [],
        examAttempt: mockExamAttempt,
        passingThreshold: 65,
      };

      // Should not throw an error and should handle gracefully
      expect(() => calculateExamResults(input)).not.toThrow();
    });

    it("should handle unanswered questions", () => {
      const userAnswers: UserAnswer[] = [
        {
          exam_attempt_id: "attempt_1",
          question_id: "q1",
          answer_id: "a1", // only answer question 1
          time_spent_seconds: 60,
        },
        // Questions 2 and 3 are not answered
      ];

      const input: ScoreCalculationInput = {
        questions: mockQuestions,
        userAnswers,
        examAttempt: mockExamAttempt,
        passingThreshold: 65,
      };

      const result = calculateExamResults(input);

      expect(result.correct_answers).toBe(1);
      expect(result.total_questions).toBe(3);
      expect(result.score_percentage).toBe(33);
      expect(result.passed).toBe(false);
    });
  });
});
