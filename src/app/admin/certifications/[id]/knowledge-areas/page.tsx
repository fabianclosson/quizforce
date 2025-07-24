import { AdminLayout } from "@/components/admin/admin-layout";
import { CertificationKnowledgeAreas } from "@/components/admin/certification-knowledge-areas";

interface CertificationKnowledgeAreasPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CertificationKnowledgeAreasPage({
  params,
}: CertificationKnowledgeAreasPageProps) {
  const { id } = await params;

  return (
    <AdminLayout>
      <CertificationKnowledgeAreas certificationId={id} />
    </AdminLayout>
  );
}
