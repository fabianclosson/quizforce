import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { PracticeExamForm } from "@/components/admin/practice-exam-form";
import type { Database } from "@/types/database";

type PracticeExamRow = Database["public"]["Tables"]["practice_exams"]["Row"];

interface EditPracticeExamPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getPracticeExam(id: string): Promise<PracticeExamRow | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("practice_exams")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function EditPracticeExamPage({
  params,
}: EditPracticeExamPageProps) {
  const { id } = await params;
  const practiceExamRow = await getPracticeExam(id);

  if (!practiceExamRow) {
    notFound();
  }

  // Convert database row to form-compatible format
  const practiceExam = {
    id: practiceExamRow.id,
    name: practiceExamRow.name,
    description: practiceExamRow.description || undefined, // Convert null to undefined
    certification_id: practiceExamRow.certification_id,
    question_count: practiceExamRow.question_count,
    time_limit_minutes: practiceExamRow.time_limit_minutes,
    passing_threshold_percentage: practiceExamRow.passing_threshold_percentage,
    sort_order: practiceExamRow.sort_order,
    is_active: practiceExamRow.is_active,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Practice Exam
        </h1>
        <p className="text-muted-foreground">
          Update the practice exam details below.
        </p>
      </div>

      <PracticeExamForm practiceExam={practiceExam} isEdit={true} />
    </div>
  );
}
