import { lazy } from "react";

// Dashboard Components - Large components with complex data fetching
export const DashboardOverview = lazy(() =>
  import("@/components/dashboard/dashboard-overview").then(module => ({
    default: module.DashboardOverview,
  }))
);

export const ExamsInProgress = lazy(() =>
  import("@/components/dashboard/exams-in-progress").then(module => ({
    default: module.ExamsInProgress,
  }))
);

export const UserCertifications = lazy(() =>
  import("@/components/dashboard/user-certifications").then(module => ({
    default: module.UserCertifications,
  }))
);

// Exam Components - Heavy interactive components
export const PracticeExamList = lazy(() =>
  import("@/components/exam/practice-exam-list").then(module => ({
    default: module.PracticeExamList,
  }))
);

export const PracticeExamTable = lazy(() =>
  import("@/components/exam/practice-exam-table").then(module => ({
    default: module.PracticeExamTable,
  }))
);

export const ExamResultsSummary = lazy(() =>
  import("@/components/exam/exam-results-summary").then(module => ({
    default: module.ExamResultsSummary,
  }))
);

export const PreExamPage = lazy(() =>
  import("@/components/exam/pre-exam-page").then(module => ({
    default: module.PreExamPage,
  }))
);

// Catalog Components - Data-heavy listing components
export const CatalogGrid = lazy(() =>
  import("@/components/catalog/catalog-grid").then(module => ({
    default: module.CatalogGrid,
  }))
);

export const CatalogFilters = lazy(() =>
  import("@/components/catalog/catalog-filters").then(module => ({
    default: module.CatalogFilters,
  }))
);

// Exam Interface - Very large interactive component
export const ExamInterface = lazy(() =>
  import("@/components/exam/exam-interface").then(module => ({
    default: module.ExamInterface,
  }))
);

export const ExamReviewInterface = lazy(() =>
  import("@/components/exam/exam-review-interface").then(module => ({
    default: module.ExamReviewInterface,
  }))
);

export const KnowledgeAreaBreakdown = lazy(() =>
  import("@/components/exam/knowledge-area-breakdown").then(module => ({
    default: module.KnowledgeAreaBreakdown,
  }))
);

export const ExamSubmissionDialog = lazy(() =>
  import("@/components/exam/exam-submission-dialog").then(module => ({
    default: module.ExamSubmissionDialog,
  }))
);
