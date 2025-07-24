import { Suspense } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { UserDetail } from "@/components/admin/user-detail";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AdminLayout>
      <div className="container mx-auto px-6 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          }
        >
          <UserDetail userId={id} />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
