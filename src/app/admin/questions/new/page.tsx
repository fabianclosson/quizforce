import { Suspense } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { QuestionForm } from "@/components/admin/question-form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function NewQuestionPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Question</h1>
          <p className="text-muted-foreground">
            Add a new practice exam question with multiple choice answers.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          }
        >
          <QuestionForm mode="create" />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
