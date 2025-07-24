import { Suspense } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { UserList } from "@/components/admin/user-list";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          }
        >
          <UserList />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
