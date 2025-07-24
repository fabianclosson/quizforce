import {
  ExamResults,
  UserAnswer,
  QuestionWithAnswers,
  ExamAttemptDetails,
} from "@/types/exam";

export interface ScoreCalculationInput {
  questions: QuestionWithAnswers[];
  userAnswers: UserAnswer[];
  examAttempt: ExamAttemptDetails;
  passingThreshold: number; // percentage (e.g., 65 for 65%)
}

export interface KnowledgeAreaScore {
  id: string;
  name: string;
  weight_percentage: number;
  correct_answers: number;
  total_questions: number;
  score_percentage: number;
  performance_level: "excellent" | "good" | "needs_improvement" | "poor";
}

export interface DetailedExamResults extends ExamResults {
  knowledge_area_scores: KnowledgeAreaScore[];
  overall_performance_level:
    | "excellent"
    | "good"
    | "needs_improvement"
    | "poor";
  time_efficiency: "excellent" | "good" | "adequate" | "rushed";
  difficulty_breakdown: {
    easy: { correct: number; total: number; percentage: number };
    medium: { correct: number; total: number; percentage: number };
    hard: { correct: number; total: number; percentage: number };
  };
}

/**
 * Calculate comprehensive exam results including scores, knowledge area breakdown, and performance metrics
 */
export function calculateExamResults(
  input: ScoreCalculationInput
): DetailedExamResults {
  const { questions, userAnswers, examAttempt, passingThreshold } = input;

  // Build a map of user answers for quick lookup (supporting multiple answers per question)
  const userAnswerMap = new Map<string, UserAnswer[]>();
  userAnswers.forEach(answer => {
    if (answer.question_id && answer.answer_id) {
      const questionId = answer.question_id;
      if (!userAnswerMap.has(questionId)) {
        userAnswerMap.set(questionId, []);
      }
      userAnswerMap.get(questionId)!.push(answer);
    }
  });

  // Calculate basic scores
  let correctAnswers = 0;
  const totalQuestions = questions.length;
  const questionResults: ExamResults["question_results"] = [];

  // Process each question
  questions.forEach(question => {
    const userAnswersForQuestion = userAnswerMap.get(question.id) || [];
    const correctAnswersList = question.answers.filter(
      answer => answer.is_correct
    );
    const requiredSelections = question.required_selections;

    // Validate question data consistency
    if (correctAnswersList.length !== requiredSelections) {
      console.warn(
        `Question ${question.id}: required_selections (${requiredSelections}) doesn't match correct answers count (${correctAnswersList.length})`
      );
    }

    if (correctAnswersList.length === 0) {
      console.warn(`No correct answers found for question ${question.id}`);
      return;
    }

    // Determine if answer is correct based on question type
    let isCorrect = false;
    const primaryCorrectAnswerId = correctAnswersList[0]?.id;
    const userSelectedIds = userAnswersForQuestion
      .map(ua => ua.answer_id)
      .filter(Boolean) as string[];

    if (requiredSelections === 1) {
      // Single-answer question: user must select exactly the one correct answer
      isCorrect =
        userSelectedIds.length === 1 &&
        correctAnswersList.some(ca => ca.id === userSelectedIds[0]);
    } else {
      // Multi-answer question: user must select exactly the required number of correct answers and no incorrect ones
      const correctAnswerIds = correctAnswersList.map(ca => ca.id);
      const allSelectedAnswersAreCorrect = userSelectedIds.every(id =>
        correctAnswerIds.includes(id)
      );
      const allCorrectAnswersSelected = correctAnswerIds.every(id =>
        userSelectedIds.includes(id)
      );
      const exactlyRequiredNumber =
        userSelectedIds.length === requiredSelections;

      isCorrect =
        allSelectedAnswersAreCorrect &&
        allCorrectAnswersSelected &&
        exactlyRequiredNumber;
    }

    if (isCorrect) {
      correctAnswers++;
    }

    // Calculate total time spent on this question
    const totalTimeSpent = userAnswersForQuestion.reduce(
      (sum, ua) => sum + (ua.time_spent_seconds || 0),
      0
    );

    questionResults.push({
      question_id: question.id,
      question_number: question.question_number,
      user_answer_id: userAnswersForQuestion[0]?.answer_id, // For backward compatibility
      correct_answer_id: primaryCorrectAnswerId,
      is_correct: isCorrect,
      time_spent_seconds: totalTimeSpent,
      knowledge_area: question.knowledge_area.name,
    });
  });

  // Calculate overall score percentage
  const scorePercentage =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;
  const passed = scorePercentage >= passingThreshold;

  // Calculate knowledge area scores
  const knowledgeAreaScores = calculateKnowledgeAreaScores(
    questions,
    userAnswerMap
  );

  // Calculate difficulty breakdown
  const difficultyBreakdown = calculateDifficultyBreakdown(
    questions,
    userAnswerMap
  );

  // Determine overall performance level
  const overallPerformanceLevel = getPerformanceLevel(scorePercentage);

  // Calculate time efficiency
  const timeEfficiency = calculateTimeEfficiency(
    examAttempt.time_spent_minutes || 0,
    questions.length
  );

  // Calculate total time spent
  const totalTimeSpent =
    examAttempt.time_spent_minutes ||
    Math.round(
      questionResults.reduce(
        (sum, result) => sum + result.time_spent_seconds,
        0
      ) / 60
    );

  return {
    attempt_id: examAttempt.id,
    score_percentage: scorePercentage,
    correct_answers: correctAnswers,
    total_questions: totalQuestions,
    passed,
    time_spent_minutes: totalTimeSpent,
    question_results: questionResults,
    knowledge_area_scores: knowledgeAreaScores,
    overall_performance_level: overallPerformanceLevel,
    time_efficiency: timeEfficiency,
    difficulty_breakdown: difficultyBreakdown,
  };
}

/**
 * Calculate scores for each knowledge area
 */
function calculateKnowledgeAreaScores(
  questions: QuestionWithAnswers[],
  userAnswerMap: Map<string, UserAnswer[]>
): KnowledgeAreaScore[] {
  // Group questions by knowledge area
  const knowledgeAreaMap = new Map<
    string,
    {
      area: QuestionWithAnswers["knowledge_area"];
      questions: QuestionWithAnswers[];
    }
  >();

  questions.forEach(question => {
    const areaId = question.knowledge_area.id;
    if (!knowledgeAreaMap.has(areaId)) {
      knowledgeAreaMap.set(areaId, {
        area: question.knowledge_area,
        questions: [],
      });
    }
    knowledgeAreaMap.get(areaId)!.questions.push(question);
  });

  // Calculate scores for each area
  const knowledgeAreaScores: KnowledgeAreaScore[] = [];

  knowledgeAreaMap.forEach(({ area, questions: areaQuestions }) => {
    let correctAnswers = 0;
    const totalQuestions = areaQuestions.length;

    areaQuestions.forEach(question => {
      const userAnswersForQuestion = userAnswerMap.get(question.id) || [];
      const correctAnswersList = question.answers.filter(
        answer => answer.is_correct
      );
      const requiredSelections = question.required_selections;

      // Use the same scoring logic as main function
      let isCorrect = false;
      const userSelectedIds = userAnswersForQuestion
        .map(ua => ua.answer_id)
        .filter(Boolean) as string[];

      if (requiredSelections === 1) {
        // Single-answer question
        isCorrect =
          userSelectedIds.length === 1 &&
          correctAnswersList.some(ca => ca.id === userSelectedIds[0]);
      } else {
        // Multi-answer question
        const correctAnswerIds = correctAnswersList.map(ca => ca.id);
        const allSelectedAnswersAreCorrect = userSelectedIds.every(id =>
          correctAnswerIds.includes(id)
        );
        const allCorrectAnswersSelected = correctAnswerIds.every(id =>
          userSelectedIds.includes(id)
        );
        const exactlyRequiredNumber =
          userSelectedIds.length === requiredSelections;

        isCorrect =
          allSelectedAnswersAreCorrect &&
          allCorrectAnswersSelected &&
          exactlyRequiredNumber;
      }

      if (isCorrect) {
        correctAnswers++;
      }
    });

    const scorePercentage =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    const performanceLevel = getPerformanceLevel(scorePercentage);

    knowledgeAreaScores.push({
      id: area.id,
      name: area.name,
      weight_percentage: area.weight_percentage,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      score_percentage: scorePercentage,
      performance_level: performanceLevel,
    });
  });

  // Sort by weight percentage (descending) for consistent display
  return knowledgeAreaScores.sort(
    (a, b) => b.weight_percentage - a.weight_percentage
  );
}

/**
 * Calculate performance breakdown by difficulty level
 */
function calculateDifficultyBreakdown(
  questions: QuestionWithAnswers[],
  userAnswerMap: Map<string, UserAnswer[]>
) {
  const breakdown = {
    easy: { correct: 0, total: 0, percentage: 0 },
    medium: { correct: 0, total: 0, percentage: 0 },
    hard: { correct: 0, total: 0, percentage: 0 },
  };

  questions.forEach(question => {
    const difficulty = question.difficulty_level;
    const userAnswersForQuestion = userAnswerMap.get(question.id) || [];
    const correctAnswersList = question.answers.filter(
      answer => answer.is_correct
    );
    const requiredSelections = question.required_selections;

    breakdown[difficulty].total++;

    // Use the same scoring logic as main function
    let isCorrect = false;
    const userSelectedIds = userAnswersForQuestion
      .map(ua => ua.answer_id)
      .filter(Boolean) as string[];

    if (requiredSelections === 1) {
      // Single-answer question
      isCorrect =
        userSelectedIds.length === 1 &&
        correctAnswersList.some(ca => ca.id === userSelectedIds[0]);
    } else {
      // Multi-answer question
      const correctAnswerIds = correctAnswersList.map(ca => ca.id);
      const allSelectedAnswersAreCorrect = userSelectedIds.every(id =>
        correctAnswerIds.includes(id)
      );
      const allCorrectAnswersSelected = correctAnswerIds.every(id =>
        userSelectedIds.includes(id)
      );
      const exactlyRequiredNumber =
        userSelectedIds.length === requiredSelections;

      isCorrect =
        allSelectedAnswersAreCorrect &&
        allCorrectAnswersSelected &&
        exactlyRequiredNumber;
    }

    if (isCorrect) {
      breakdown[difficulty].correct++;
    }
  });

  // Calculate percentages
  Object.keys(breakdown).forEach(difficulty => {
    const key = difficulty as keyof typeof breakdown;
    const { correct, total } = breakdown[key];
    breakdown[key].percentage =
      total > 0 ? Math.round((correct / total) * 100) : 0;
  });

  return breakdown;
}

/**
 * Determine performance level based on score percentage
 */
function getPerformanceLevel(
  scorePercentage: number
): "excellent" | "good" | "needs_improvement" | "poor" {
  if (scorePercentage >= 90) return "excellent";
  if (scorePercentage >= 75) return "good";
  if (scorePercentage >= 60) return "needs_improvement";
  return "poor";
}

/**
 * Calculate time efficiency based on time spent and question count
 */
function calculateTimeEfficiency(
  timeSpentMinutes: number,
  questionCount: number
): "excellent" | "good" | "adequate" | "rushed" {
  if (questionCount === 0) return "adequate";

  const averageTimePerQuestion = timeSpentMinutes / questionCount;

  // Typical exam allows 1.5 minutes per question
  // Excellent: 1.0-1.5 minutes per question
  // Good: 0.75-1.0 minutes per question
  // Adequate: 0.5-0.75 minutes per question
  // Rushed: < 0.5 minutes per question

  if (averageTimePerQuestion >= 1.0) return "excellent";
  if (averageTimePerQuestion >= 0.75) return "good";
  if (averageTimePerQuestion >= 0.5) return "adequate";
  return "rushed";
}

/**
 * Get color class for performance level
 */
export function getPerformanceLevelColor(
  level: "excellent" | "good" | "needs_improvement" | "poor"
): string {
  switch (level) {
    case "excellent":
      return "text-green-600 bg-green-50 border-green-200";
    case "good":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "needs_improvement":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "poor":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

/**
 * Get color class for time efficiency
 */
export function getTimeEfficiencyColor(
  efficiency: "excellent" | "good" | "adequate" | "rushed"
): string {
  switch (efficiency) {
    case "excellent":
      return "text-green-600";
    case "good":
      return "text-blue-600";
    case "adequate":
      return "text-yellow-600";
    case "rushed":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

/**
 * Simple score calculation for basic use cases
 */
export function calculateSimpleScore(
  questions: QuestionWithAnswers[],
  userAnswers: UserAnswer[]
): { correct: number; total: number; percentage: number } {
  const userAnswerMap = new Map<string, UserAnswer>();
  userAnswers.forEach(answer => {
    if (answer.question_id && answer.answer_id) {
      userAnswerMap.set(answer.question_id, answer);
    }
  });

  let correctAnswers = 0;
  const totalQuestions = questions.length;

  questions.forEach(question => {
    const userAnswer = userAnswerMap.get(question.id);
    const correctAnswer = question.answers.find(answer => answer.is_correct);

    if (correctAnswer && userAnswer?.answer_id === correctAnswer.id) {
      correctAnswers++;
    }
  });

  const percentage =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  return {
    correct: correctAnswers,
    total: totalQuestions,
    percentage,
  };
}
