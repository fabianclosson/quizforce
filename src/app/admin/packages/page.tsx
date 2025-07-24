import { Metadata } from "next";
import { PackageList } from "@/components/admin/package-list";

export const metadata: Metadata = {
  title: "Package Management | QuizForce Admin",
  description: "Manage certification packages in the admin dashboard",
};

export default function AdminPackagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Package Management
        </h1>
        <p className="text-muted-foreground">
          Create and manage certification packages for your platform.
        </p>
      </div>

      <PackageList />
    </div>
  );
}
