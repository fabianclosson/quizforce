import { Metadata } from "next";
import { PackageDetail } from "@/components/admin/package-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "Package Details | QuizForce Admin",
    description: `View package ${id} details`,
  };
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <PackageDetail packageId={id} />
    </div>
  );
}
