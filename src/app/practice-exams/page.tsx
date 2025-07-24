import type { Metadata } from "next";
import { PracticeExamsClient } from "./components/practice-exams-client";

export const metadata: Metadata = {
  title: "Practice Exams - QuizForce",
  description:
    "Take practice exams to prepare for your Salesforce certifications",
};

export default function PracticeExamsPage() {
  return <PracticeExamsClient />;
}
