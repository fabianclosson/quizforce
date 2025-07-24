import { Suspense } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { CertificationList } from "@/components/admin/certification-list";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminCertificationsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Certification Management
          </h1>
          <p className="text-muted-foreground">
            Manage certification bundles and their settings.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          }
        >
          <CertificationList />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
