"use client";

import { AdminLayout } from "@/components/admin/admin-layout";
import { CertificationForm } from "@/components/admin/certification-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCertificationPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/certifications">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Certifications
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Certification
            </h1>
            <p className="text-muted-foreground">
              Add a new certification bundle to the platform.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl">
          <CertificationForm
            onSave={async data => {
              // Handle save logic
              console.log("Save certification:", data);
            }}
            onCancel={() => {
              // Handle cancel logic
              window.history.back();
            }}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
