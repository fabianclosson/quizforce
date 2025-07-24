import { AdminLayout } from "@/components/admin/admin-layout";
import { KnowledgeAreaForm } from "@/components/admin/knowledge-area-form";

export default function NewKnowledgeAreaPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Knowledge Area
          </h1>
          <p className="text-muted-foreground">
            Add a new knowledge area to a certification with its weighting.
          </p>
        </div>

        <KnowledgeAreaForm mode="create" />
      </div>
    </AdminLayout>
  );
}
