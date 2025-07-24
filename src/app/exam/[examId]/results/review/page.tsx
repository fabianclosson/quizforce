"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ExamReviewInterface,
  ExamReviewData,
} from "@/components/exam/exam-review-interface";

// Mock data for development - will be replaced with real API calls
const mockReviewData: ExamReviewData = {
  exam_id: "exam_1",
  exam_title: "Salesforce Administrator Certification Practice Exam",
  total_questions: 10,
  correct_answers: 7,
  score_percentage: 70,
  time_taken: 1800, // 30 minutes
  questions: [
    {
      id: "q1",
      question_text:
        "Which of the following best describes a custom object in Salesforce?",
      question_type: "single_choice",
      options: [
        {
          id: "opt1",
          text: "A pre-built object provided by Salesforce",
          is_correct: false,
        },
        {
          id: "opt2",
          text: "A database table created by users to store information specific to their organization",
          is_correct: true,
        },
        {
          id: "opt3",
          text: "A report that can be customized",
          is_correct: false,
        },
        {
          id: "opt4",
          text: "A workflow rule that automates business processes",
          is_correct: false,
        },
      ],
      knowledge_area: "Data Management",
      difficulty: "medium",
      explanation:
        "Custom objects are database tables that you can create to store information that's specific to your organization. They're different from standard objects like Account, Contact, and Opportunity that come built-in with Salesforce.",
      user_answer: "opt2",
      correct_answer: "opt2",
      is_correct: true,
      time_spent: 120,
    },
    {
      id: "q2",
      question_text:
        "What is the maximum number of custom fields that can be created on a custom object?",
      question_type: "single_choice",
      options: [
        {
          id: "opt1",
          text: "500",
          is_correct: false,
        },
        {
          id: "opt2",
          text: "800",
          is_correct: true,
        },
        {
          id: "opt3",
          text: "1000",
          is_correct: false,
        },
        {
          id: "opt4",
          text: "Unlimited",
          is_correct: false,
        },
      ],
      knowledge_area: "Data Management",
      difficulty: "hard",
      explanation:
        "Custom objects can have up to 800 custom fields. This includes all field types like text, number, picklist, etc.",
      user_answer: "opt1",
      correct_answer: "opt2",
      is_correct: false,
      time_spent: 90,
    },
    {
      id: "q3",
      question_text:
        "Which of the following are valid sharing settings in Salesforce? (Select all that apply)",
      question_type: "multiple_choice",
      options: [
        {
          id: "opt1",
          text: "Private",
          is_correct: true,
        },
        {
          id: "opt2",
          text: "Public Read Only",
          is_correct: true,
        },
        {
          id: "opt3",
          text: "Public Read/Write",
          is_correct: true,
        },
        {
          id: "opt4",
          text: "Public Full Access",
          is_correct: false,
        },
      ],
      knowledge_area: "Security and Access",
      difficulty: "medium",
      explanation:
        'The valid organization-wide sharing settings are Private, Public Read Only, and Public Read/Write. There is no "Public Full Access" setting.',
      user_answer: ["opt1", "opt2", "opt4"],
      correct_answer: ["opt1", "opt2", "opt3"],
      is_correct: false,
      time_spent: 180,
    },
    {
      id: "q4",
      question_text: "What is a Junction Object in Salesforce?",
      question_type: "single_choice",
      options: [
        {
          id: "opt1",
          text: "An object that connects two other objects in a many-to-many relationship",
          is_correct: true,
        },
        {
          id: "opt2",
          text: "An object used for reporting purposes only",
          is_correct: false,
        },
        {
          id: "opt3",
          text: "A standard object provided by Salesforce",
          is_correct: false,
        },
        {
          id: "opt4",
          text: "An object that stores user preferences",
          is_correct: false,
        },
      ],
      knowledge_area: "Data Management",
      difficulty: "easy",
      explanation:
        "A junction object is a custom object with two master-detail relationships. It creates a many-to-many relationship between two other objects.",
      user_answer: "opt1",
      correct_answer: "opt1",
      is_correct: true,
      time_spent: 75,
    },
    {
      id: "q5",
      question_text: "Which tool would you use to import data into Salesforce?",
      question_type: "single_choice",
      options: [
        {
          id: "opt1",
          text: "Data Loader",
          is_correct: true,
        },
        {
          id: "opt2",
          text: "Process Builder",
          is_correct: false,
        },
        {
          id: "opt3",
          text: "Workflow Rules",
          is_correct: false,
        },
        {
          id: "opt4",
          text: "Approval Process",
          is_correct: false,
        },
      ],
      knowledge_area: "Data Management",
      difficulty: "easy",
      explanation:
        "Data Loader is the primary tool for importing large amounts of data into Salesforce. It can handle up to 5 million records.",
      user_answer: "opt1",
      correct_answer: "opt1",
      is_correct: true,
      time_spent: 60,
    },
    {
      id: "q6",
      question_text: "What is the purpose of a Profile in Salesforce?",
      question_type: "single_choice",
      options: [
        {
          id: "opt1",
          text: "To store user contact information",
          is_correct: false,
        },
        {
          id: "opt2",
          text: "To define what users can do in the application",
          is_correct: true,
        },
        {
          id: "opt3",
          text: "To create custom fields",
          is_correct: false,
        },
        {
          id: "opt4",
          text: "To generate reports",
          is_correct: false,
        },
      ],
      knowledge_area: "User Management",
      difficulty: "easy",
      explanation:
        "Profiles define what users can do in Salesforce. They control object permissions, field permissions, and system permissions.",
      user_answer: "opt2",
      correct_answer: "opt2",
      is_correct: true,
      time_spent: 45,
    },
    {
      id: "q7",
      question_text: "What is the difference between a Role and a Profile?",
      question_type: "single_choice",
      options: [
        {
          id: "opt1",
          text: "There is no difference",
          is_correct: false,
        },
        {
          id: "opt2",
          text: "Roles control what users can do, Profiles control what users can see",
          is_correct: false,
        },
        {
          id: "opt3",
          text: "Profiles control what users can do, Roles control what users can see",
          is_correct: true,
        },
        {
          id: "opt4",
          text: "Roles are only for administrators",
          is_correct: false,
        },
      ],
      knowledge_area: "User Management",
      difficulty: "medium",
      explanation:
        "Profiles control what users can do (permissions), while Roles control what users can see (record access through role hierarchy).",
      user_answer: "opt2",
      correct_answer: "opt3",
      is_correct: false,
      time_spent: 150,
    },
    {
      id: "q8",
      question_text:
        "Which of the following can be used to automate business processes in Salesforce?",
      question_type: "multiple_choice",
      options: [
        {
          id: "opt1",
          text: "Workflow Rules",
          is_correct: true,
        },
        {
          id: "opt2",
          text: "Process Builder",
          is_correct: true,
        },
        {
          id: "opt3",
          text: "Flow",
          is_correct: true,
        },
        {
          id: "opt4",
          text: "Custom Fields",
          is_correct: false,
        },
      ],
      knowledge_area: "Process Automation",
      difficulty: "easy",
      explanation:
        "Workflow Rules, Process Builder, and Flow are all automation tools in Salesforce. Custom Fields are used for data storage, not automation.",
      user_answer: ["opt1", "opt2", "opt3"],
      correct_answer: ["opt1", "opt2", "opt3"],
      is_correct: true,
      time_spent: 90,
    },
    {
      id: "q9",
      question_text:
        "What is the maximum number of workflow rules that can be active on an object?",
      question_type: "single_choice",
      options: [
        {
          id: "opt1",
          text: "50",
          is_correct: true,
        },
        {
          id: "opt2",
          text: "100",
          is_correct: false,
        },
        {
          id: "opt3",
          text: "500",
          is_correct: false,
        },
        {
          id: "opt4",
          text: "Unlimited",
          is_correct: false,
        },
      ],
      knowledge_area: "Process Automation",
      difficulty: "hard",
      explanation:
        "You can have up to 50 active workflow rules per object in Salesforce.",
      user_answer: "opt2",
      correct_answer: "opt1",
      is_correct: false,
      time_spent: 120,
    },
    {
      id: "q10",
      question_text: "Which report format shows data in rows and columns?",
      question_type: "single_choice",
      options: [
        {
          id: "opt1",
          text: "Tabular",
          is_correct: true,
        },
        {
          id: "opt2",
          text: "Summary",
          is_correct: false,
        },
        {
          id: "opt3",
          text: "Matrix",
          is_correct: false,
        },
        {
          id: "opt4",
          text: "Joined",
          is_correct: false,
        },
      ],
      knowledge_area: "Reports and Dashboards",
      difficulty: "easy",
      explanation:
        "Tabular reports show data in a simple table format with rows and columns, similar to a spreadsheet.",
      user_answer: "opt1",
      correct_answer: "opt1",
      is_correct: true,
      time_spent: 30,
    },
  ],
};

export default function ExamReviewPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.examId as string;

  const handleBackToResults = () => {
    router.push(`/exam/${examId}/results`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ExamReviewInterface
        reviewData={mockReviewData}
        onBackToResults={handleBackToResults}
      />
    </div>
  );
}
