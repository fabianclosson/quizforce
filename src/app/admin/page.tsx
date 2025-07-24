import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminDashboardClient } from "./admin-dashboard-client";
import { getAdminStats } from "@/lib/admin-auth";

export default async function AdminPage() {
  // Try to get initial stats server-side for better performance
  let initialStats = undefined;

  try {
    initialStats = await getAdminStats();
  } catch (error) {
    // If server-side stats fail, client will fetch them
    console.error("Failed to fetch initial admin stats:", error);
  }

  return (
    <AuthWrapper requireAuth={true} requiredRole="admin">
      <AdminLayout>
        <AdminDashboardClient initialStats={initialStats} />
      </AdminLayout>
    </AuthWrapper>
  );
}
