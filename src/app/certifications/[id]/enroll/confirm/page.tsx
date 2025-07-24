import { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase";
import { notFound, redirect } from "next/navigation";
import { ConfirmEnrollClient } from "./confirm-enroll-client";

interface Params {
  params: { id: string };
}

export const metadata: Metadata = {
  title: "Confirm Enrollment – QuizForce",
};

export default async function ConfirmEnrollPage({ params }: Params) {
  const supabase = await createServerSupabaseClient();

  // Fetch certification details (name, description, price etc.)
  const { data: certification, error } = await supabase
    .from("certifications")
    .select("id, name, description, price_cents")
    .eq("id", params.id)
    .eq("is_active", true)
    .single();

  if (error || !certification) {
    notFound();
  }

  // If price > 0 just redirect to existing checkout flow (safety)
  if (certification.price_cents && certification.price_cents > 0) {
    redirect(`/certifications/${params.id}/checkout`);
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Confirm Free Enrollment</h1>
      <p className="mb-4">
        You are about to enroll in the following certification practice bundle:
      </p>
      <div className="border rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold">{certification.name}</h2>
        {certification.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {certification.description}
          </p>
        )}
      </div>
      <ConfirmEnrollClient
        certificationId={certification.id}
        certificationName={certification.name}
      />
    </div>
  );
}
