import { Suspense } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { KnowledgeAreaList } from "@/components/admin/knowledge-area-list";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminKnowledgeAreasPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Knowledge Area Management
          </h1>
          <p className="text-muted-foreground">
            Manage knowledge areas and their weightings for each certification.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          }
        >
          <KnowledgeAreaList />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
