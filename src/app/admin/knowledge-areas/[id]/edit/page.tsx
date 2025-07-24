import { AdminLayout } from "@/components/admin/admin-layout";
import { KnowledgeAreaEditForm } from "@/components/admin/knowledge-area-edit-form";

interface EditKnowledgeAreaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditKnowledgeAreaPage({
  params,
}: EditKnowledgeAreaPageProps) {
  const { id } = await params;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Knowledge Area
          </h1>
          <p className="text-muted-foreground">
            Update the knowledge area details and weightings.
          </p>
        </div>

        <KnowledgeAreaEditForm knowledgeAreaId={id} />
      </div>
    </AdminLayout>
  );
}
