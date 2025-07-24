import { Metadata } from "next";
import { PackageEditWrapper } from "@/components/admin/package-edit-wrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "Edit Package | QuizForce Admin",
    description: `Edit package ${id}`,
  };
}

export default async function EditPackagePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <PackageEditWrapper packageId={id} />
    </div>
  );
}
