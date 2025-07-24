import { Suspense } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PracticeExamList } from "@/components/admin/practice-exam-list";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminPracticeExamsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Practice Exam Management
          </h1>
          <p className="text-muted-foreground">
            Manage practice exams and their settings.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          }
        >
          <PracticeExamList />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
