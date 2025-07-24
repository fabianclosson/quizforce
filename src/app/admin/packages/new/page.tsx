import { Metadata } from "next";
import { PackageForm } from "@/components/admin/package-form";

export const metadata: Metadata = {
  title: "Create Package | QuizForce Admin",
  description: "Create a new certification package",
};

export default function NewPackagePage() {
  return (
    <div className="container mx-auto py-6">
      <PackageForm />
    </div>
  );
}
