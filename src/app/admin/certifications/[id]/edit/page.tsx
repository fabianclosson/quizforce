import { Suspense } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { CertificationForm } from "@/components/admin/certification-form";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/types/database";

type CertificationRow = Database["public"]["Tables"]["certifications"]["Row"];

interface EditCertificationPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getCertification(id: string): Promise<CertificationRow | null> {
  const supabase = await createServerSupabaseClient();

  const { data: certification, error } = await supabase
    .from("certifications")
    .select(
      `
      id,
      name,
      slug,
      description,
      detailed_description,
      price_cents,
      is_active,
      is_featured,
      image_url,
      tags,
      certification_categories!inner(
        id,
        name,
        slug
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !certification) {
    return null;
  }

  return certification;
}

async function EditCertificationContent({ id }: { id: string }) {
  const certification = await getCertification(id);

  if (!certification) {
    notFound();
  }

  // Transform certification data to match form expectations
  const formData = {
    ...certification,
    category_id: certification.certification_categories[0]?.id || "",
  };

  return (
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
            Edit Certification
          </h1>
          <p className="text-muted-foreground">
            Modify the certification bundle details.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <CertificationForm
          certification={formData}
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
  );
}

export default async function EditCertificationPage({ params }: EditCertificationPageProps) {
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
          <EditCertificationContent id={id} />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
