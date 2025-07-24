#!/usr/bin/env node

/**
 * Seed Questions Script
 *
 * This script adds sample questions to practice exams for testing purposes.
 * Run with: node scripts/seed-questions.js
 */

const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables:");
  console.error("- NEXT_PUBLIC_SUPABASE_URL");
  console.error("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample questions for Salesforce Administrator certification
const sampleQuestions = [
  {
    text: "A user wants to create a report that shows all opportunities that were created in the last 30 days. Which report type should they use?",
    type: "multiple_choice",
    explanation:
      "Opportunities report type allows filtering by creation date and provides all opportunity-related fields needed for analysis.",
    points: 1,
    answers: [
      { text: "Opportunities report", is_correct: true },
      { text: "Activities report", is_correct: false },
      { text: "Accounts and Contacts report", is_correct: false },
      { text: "Custom report type", is_correct: false },
    ],
  },
  {
    text: "Which of the following are standard objects in Salesforce? (Choose 3)",
    type: "multiple_select",
    explanation:
      "Account, Contact, and Opportunity are all standard objects that come out-of-the-box with Salesforce. Product Category is not a standard object.",
    points: 2,
    answers: [
      { text: "Account", is_correct: true },
      { text: "Contact", is_correct: true },
      { text: "Opportunity", is_correct: true },
      { text: "Product Category", is_correct: false },
    ],
  },
  {
    text: "What is the maximum number of characters allowed in a text field?",
    type: "multiple_choice",
    explanation:
      "Standard text fields in Salesforce can contain up to 255 characters. For longer text, you would use a Text Area or Long Text Area field.",
    points: 1,
    answers: [
      { text: "255", is_correct: true },
      { text: "500", is_correct: false },
      { text: "1000", is_correct: false },
      { text: "No limit", is_correct: false },
    ],
  },
  {
    text: "A sales manager wants to ensure that all opportunities above $10,000 require approval before they can be closed won. What should an administrator configure?",
    type: "multiple_choice",
    explanation:
      "Approval processes allow you to set up automated approval workflows based on criteria like opportunity amount.",
    points: 2,
    answers: [
      { text: "Approval Process", is_correct: true },
      { text: "Workflow Rule", is_correct: false },
      { text: "Validation Rule", is_correct: false },
      { text: "Process Builder", is_correct: false },
    ],
  },
  {
    text: "Which security model controls access to records in Salesforce?",
    type: "multiple_choice",
    explanation:
      "Organization-Wide Defaults (OWD) set the baseline level of access users have to records they don't own.",
    points: 1,
    answers: [
      { text: "Organization-Wide Defaults", is_correct: true },
      { text: "Field-Level Security", is_correct: false },
      { text: "Page Layouts", is_correct: false },
      { text: "Record Types", is_correct: false },
    ],
  },
];

async function seedQuestions() {
  try {
    console.log("🌱 Starting to seed sample questions...");

    // Get the Salesforce Administrator certification
    const { data: certification, error: certError } = await supabase
      .from("certifications")
      .select("id, name")
      .eq("name", "Salesforce Administrator Practice Bundle")
      .single();

    if (certError) {
      console.error("Error finding certification:", certError);
      console.log(
        "Make sure you've run the certification seeding script first:"
      );
      console.log("node scripts/seed-certifications.js");
      process.exit(1);
    }

    console.log(`📚 Found certification: ${certification.name}`);

    // Get or create knowledge area
    let { data: knowledgeArea, error: kaError } = await supabase
      .from("knowledge_areas")
      .select("id")
      .eq("certification_id", certification.id)
      .eq("name", "Administration Fundamentals")
      .single();

    if (kaError && kaError.code === "PGRST116") {
      // Create knowledge area if it doesn't exist
      console.log("📋 Creating knowledge area...");
      const { data: newKA, error: createKAError } = await supabase
        .from("knowledge_areas")
        .insert({
          certification_id: certification.id,
          name: "Administration Fundamentals",
          description: "Core administration concepts and practices",
          weight_percentage: 100,
          sort_order: 1,
        })
        .select()
        .single();

      if (createKAError) {
        throw createKAError;
      }
      knowledgeArea = newKA;
    } else if (kaError) {
      throw kaError;
    }

    console.log("📋 Using knowledge area: Administration Fundamentals");

    // Get or create practice exam
    let { data: practiceExam, error: peError } = await supabase
      .from("practice_exams")
      .select("id")
      .eq("certification_id", certification.id)
      .eq("name", "Administrator Fundamentals Practice Exam")
      .single();

    if (peError && peError.code === "PGRST116") {
      // Create practice exam if it doesn't exist
      console.log("📝 Creating practice exam...");
      const { data: newPE, error: createPEError } = await supabase
        .from("practice_exams")
        .insert({
          certification_id: certification.id,
          name: "Administrator Fundamentals Practice Exam",
          description:
            "Test your knowledge of Salesforce administration basics",
          question_count: sampleQuestions.length,
          time_limit_minutes: 60,
          passing_threshold_percentage: 70,
          is_active: true,
          sort_order: 1,
        })
        .select()
        .single();

      if (createPEError) {
        throw createPEError;
      }
      practiceExam = newPE;
    } else if (peError) {
      throw peError;
    }

    console.log(
      "📝 Using practice exam: Administrator Fundamentals Practice Exam"
    );

    // Clear existing questions for this exam (for re-running script)
    const { error: deleteError } = await supabase
      .from("questions")
      .delete()
      .eq("practice_exam_id", practiceExam.id);

    if (deleteError) {
      console.log(
        "Note: Could not clear existing questions:",
        deleteError.message
      );
    }

    // Insert questions
    console.log("❓ Adding sample questions...");

    for (let i = 0; i < sampleQuestions.length; i++) {
      const questionData = sampleQuestions[i];

      // Insert question
      const { data: question, error: questionError } = await supabase
        .from("questions")
        .insert({
          practice_exam_id: practiceExam.id,
          knowledge_area_id: knowledgeArea.id,
          question_text: questionData.text,
          explanation: questionData.explanation,
          difficulty_level: "medium",
          question_number: i + 1,
        })
        .select()
        .single();

      if (questionError) {
        throw questionError;
      }

      // Insert answers
      const answerLetters = ["A", "B", "C", "D", "E"];
      for (let j = 0; j < questionData.answers.length; j++) {
        const answerData = questionData.answers[j];

        const { error: answerError } = await supabase.from("answers").insert({
          question_id: question.id,
          answer_text: answerData.text,
          is_correct: answerData.is_correct,
          answer_letter: answerLetters[j],
        });

        if (answerError) {
          throw answerError;
        }
      }

      console.log(
        `   ✅ Added question ${i + 1}: ${questionData.text.substring(0, 50)}...`
      );
    }

    console.log("\n🎉 Successfully seeded sample questions!");
    console.log("\n📊 Summary:");
    console.log(`   • Certification: ${certification.name}`);
    console.log(`   • Practice Exam: ${practiceExam.name}`);
    console.log(`   • Questions Added: ${sampleQuestions.length}`);
    console.log(`   • Knowledge Area: ${knowledgeArea.name}`);

    console.log("\n🔗 Next Steps:");
    console.log("1. Sign up as a user");
    console.log(
      "2. Make yourself an admin with: node scripts/create-admin.js <your-email>"
    );
    console.log("3. Access admin panel at: http://localhost:3000/admin");
    console.log("4. Test the certification flow!");
  } catch (error) {
    console.error("❌ Error seeding questions:", error);
    process.exit(1);
  }
}

seedQuestions().then(() => {
  console.log("\n✨ Seeding completed!");
  process.exit(0);
});
