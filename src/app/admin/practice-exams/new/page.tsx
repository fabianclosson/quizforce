import { Metadata } from "next";
import { PracticeExamForm } from "@/components/admin/practice-exam-form";

export const metadata: Metadata = {
  title: "Create Practice Exam | QuizForce Admin",
  description: "Create a new practice exam",
};

export default function NewPracticeExamPage() {
  return (
    <div className="container mx-auto py-6">
      <PracticeExamForm />
    </div>
  );
}
