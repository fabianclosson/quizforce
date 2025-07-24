import { Suspense } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { QuestionList } from "@/components/admin/question-list";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminQuestionsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Question Management
          </h1>
          <p className="text-muted-foreground">
            Manage practice exam questions and their answer choices.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          }
        >
          <QuestionList />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
