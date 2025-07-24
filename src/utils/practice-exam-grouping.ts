import {
  PracticeExamWithStatus,
  GroupedPracticeExams,
  PracticeExamSortOptions,
} from "@/types/practice-exams";

/**
 * Group practice exams by certification
 */
export function groupExamsByCertification(
  exams: PracticeExamWithStatus[]
): GroupedPracticeExams[] {
  const certificationMap = new Map<string, GroupedPracticeExams>();

  for (const exam of exams) {
    const certificationId = exam.certification.id;

    if (!certificationMap.has(certificationId)) {
      certificationMap.set(certificationId, {
        certification: {
          id: exam.certification.id,
          name: exam.certification.name,
          slug: exam.certification.slug,
          category: exam.certification.category,
          price_cents: exam.certification.price_cents,
          exam_count: exam.certification.exam_count,
          total_questions: exam.certification.total_questions,
        },
        exams: [],
        is_enrolled: exam.is_enrolled,
      });
    }

    certificationMap.get(certificationId)!.exams.push(exam);
  }

  return Array.from(certificationMap.values());
}

/**
 * Group practice exams by category
 */
export function groupExamsByCategory(
  exams: PracticeExamWithStatus[]
): Record<string, GroupedPracticeExams[]> {
  const categoryMap = new Map<string, GroupedPracticeExams[]>();

  // First group by certification
  const certificationGroups = groupExamsByCertification(exams);

  // Then group certifications by category
  for (const group of certificationGroups) {
    const categoryName = group.certification.category.name;

    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, []);
    }

    categoryMap.get(categoryName)!.push(group);
  }

  return Object.fromEntries(categoryMap);
}

/**
 * Sort grouped exams by certification name
 */
export function sortGroupedExamsByCertification(
  groupedExams: GroupedPracticeExams[],
  direction: "asc" | "desc" = "asc"
): GroupedPracticeExams[] {
  return groupedExams.sort((a, b) => {
    const comparison = a.certification.name.localeCompare(b.certification.name);
    return direction === "asc" ? comparison : -comparison;
  });
}

/**
 * Sort exams within each certification group
 */
export function sortExamsWithinGroups(
  groupedExams: GroupedPracticeExams[],
  sort: PracticeExamSortOptions
): GroupedPracticeExams[] {
  return groupedExams.map(group => ({
    ...group,
    exams: sortExams(group.exams, sort),
  }));
}

/**
 * Sort individual exams based on sort options
 */
export function sortExams(
  exams: PracticeExamWithStatus[],
  sort: PracticeExamSortOptions
): PracticeExamWithStatus[] {
  return exams.sort((a, b) => {
    switch (sort.field) {
      case "name":
        return sort.direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);

      case "status":
        const statusOrder = { in_progress: 0, not_started: 1, completed: 2 };
        return sort.direction === "asc"
          ? statusOrder[a.status] - statusOrder[b.status]
          : statusOrder[b.status] - statusOrder[a.status];

      case "score":
        const aScore = a.best_score || 0;
        const bScore = b.best_score || 0;
        return sort.direction === "asc" ? aScore - bScore : bScore - aScore;

      case "updated_at":
        const aDate = new Date(a.updated_at).getTime();
        const bDate = new Date(b.updated_at).getTime();
        return sort.direction === "asc" ? aDate - bDate : bDate - aDate;

      case "category":
        const categoryComparison = a.certification.category.name.localeCompare(
          b.certification.category.name
        );
        return sort.direction === "asc"
          ? categoryComparison
          : -categoryComparison;

      default:
        return a.sort_order - b.sort_order;
    }
  });
}

/**
 * Filter grouped exams by enrollment status
 */
export function filterGroupsByEnrollment(
  groupedExams: GroupedPracticeExams[],
  enrolledOnly: boolean = false
): GroupedPracticeExams[] {
  if (!enrolledOnly) return groupedExams;

  return groupedExams.filter(group => group.is_enrolled);
}

/**
 * Filter grouped exams by exam status
 */
export function filterGroupsByExamStatus(
  groupedExams: GroupedPracticeExams[],
  status?: "not_started" | "in_progress" | "completed"
): GroupedPracticeExams[] {
  if (!status) return groupedExams;

  return groupedExams
    .map(group => ({
      ...group,
      exams: group.exams.filter(exam => exam.status === status),
    }))
    .filter(group => group.exams.length > 0);
}

/**
 * Get exam statistics for a group of certifications
 */
export function getGroupedExamStats(groupedExams: GroupedPracticeExams[]) {
  const stats = {
    total_certifications: groupedExams.length,
    total_exams: 0,
    enrolled_certifications: 0,
    completed_exams: 0,
    in_progress_exams: 0,
    not_started_exams: 0,
    average_score: 0,
    best_score: 0,
  };

  let totalScores = 0;
  let scoreCount = 0;
  const allScores: number[] = [];

  for (const group of groupedExams) {
    stats.total_exams += group.exams.length;

    if (group.is_enrolled) {
      stats.enrolled_certifications++;
    }

    for (const exam of group.exams) {
      switch (exam.status) {
        case "completed":
          stats.completed_exams++;
          break;
        case "in_progress":
          stats.in_progress_exams++;
          break;
        case "not_started":
          stats.not_started_exams++;
          break;
      }

      if (exam.best_score !== undefined) {
        totalScores += exam.best_score;
        scoreCount++;
        allScores.push(exam.best_score);
      }
    }
  }

  if (scoreCount > 0) {
    stats.average_score = Math.round(totalScores / scoreCount);
    stats.best_score = Math.max(...allScores);
  }

  return stats;
}

/**
 * Find exams that are ready to be taken (enrolled and not completed)
 */
export function getAvailableExams(
  groupedExams: GroupedPracticeExams[]
): PracticeExamWithStatus[] {
  const availableExams: PracticeExamWithStatus[] = [];

  for (const group of groupedExams) {
    if (group.is_enrolled) {
      const readyExams = group.exams.filter(
        exam => exam.status === "not_started" || exam.status === "in_progress"
      );
      availableExams.push(...readyExams);
    }
  }

  return availableExams;
}

/**
 * Get next recommended exam based on user progress
 */
export function getNextRecommendedExam(
  groupedExams: GroupedPracticeExams[]
): PracticeExamWithStatus | null {
  // Priority order: in_progress > not_started (enrolled) > not_started (free)

  // First, look for in-progress exams
  for (const group of groupedExams) {
    if (group.is_enrolled) {
      const inProgressExam = group.exams.find(
        exam => exam.status === "in_progress"
      );
      if (inProgressExam) return inProgressExam;
    }
  }

  // Then, look for not-started exams in enrolled certifications
  for (const group of groupedExams) {
    if (group.is_enrolled) {
      const notStartedExam = group.exams.find(
        exam => exam.status === "not_started"
      );
      if (notStartedExam) return notStartedExam;
    }
  }

  // Finally, look for free exams that haven't been started
  for (const group of groupedExams) {
    if (group.certification.price_cents === 0) {
      const freeExam = group.exams.find(exam => exam.status === "not_started");
      if (freeExam) return freeExam;
    }
  }

  return null;
}
