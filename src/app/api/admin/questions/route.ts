import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminVerification = await verifyAdminAccess();
    if (!adminVerification.isAdmin) {
      return NextResponse.json(
        { error: adminVerification.error || "Access denied" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const certificationId = searchParams.get("certification_id");
    const practiceExamId = searchParams.get("practice_exam_id");
    const knowledgeAreaId = searchParams.get("knowledge_area_id");
    const difficultyLevel = searchParams.get("difficulty_level");

    const offset = (page - 1) * limit;

    const supabase = createClient();

    // Build the query with joins
    let query = supabase.from("questions").select(
      `
        id,
        practice_exam_id,
        knowledge_area_id,
        question_text,
        explanation,
        difficulty_level,
        question_number,
        required_selections,
        created_at,
        updated_at,
        practice_exams!inner (
          id,
          name,
          certification_id,
          certifications!inner (
            id,
            name
          )
        ),
        knowledge_areas!inner (
          id,
          name
        )
      `,
      { count: "exact" }
    );

    // Apply filters
    if (search) {
      query = query.ilike("question_text", `%${search}%`);
    }

    if (certificationId && certificationId !== "all") {
      query = query.eq("practice_exams.certification_id", certificationId);
    }

    if (practiceExamId && practiceExamId !== "all") {
      query = query.eq("practice_exam_id", practiceExamId);
    }

    if (knowledgeAreaId && knowledgeAreaId !== "all") {
      query = query.eq("knowledge_area_id", knowledgeAreaId);
    }

    if (difficultyLevel && difficultyLevel !== "all") {
      query = query.eq("difficulty_level", difficultyLevel);
    }

    // Apply pagination and ordering
    const {
      data: questions,
      error,
      count,
    } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    // Get answer counts for each question
    const questionIds = questions?.map(q => q.id) || [];
    let answerCounts: Record<string, number> = {};

    if (questionIds.length > 0) {
      const { data: answerCountData, error: answerError } = await supabase
        .from("answers")
        .select("question_id")
        .in("question_id", questionIds);

      if (!answerError && answerCountData) {
        answerCounts = answerCountData.reduce(
          (acc, answer) => {
            acc[answer.question_id] = (acc[answer.question_id] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );
      }
    }

    // Transform the data to include answer counts and flatten the joined data
    const questionsWithAnswerCounts =
      questions?.map(question => {
        const practiceExam = Array.isArray(question.practice_exams)
          ? question.practice_exams[0]
          : question.practice_exams;
        const knowledgeArea = Array.isArray(question.knowledge_areas)
          ? question.knowledge_areas[0]
          : question.knowledge_areas;
        const certification = Array.isArray(practiceExam.certifications)
          ? practiceExam.certifications[0]
          : practiceExam.certifications;

        return {
          ...question,
          answer_count: answerCounts[question.id] || 0,
          practice_exam: {
            id: practiceExam.id,
            name: practiceExam.name,
            certification_id: practiceExam.certification_id,
            certification: {
              id: certification.id,
              name: certification.name,
            },
          },
          knowledge_area: {
            id: knowledgeArea.id,
            name: knowledgeArea.name,
          },
        };
      }) || [];

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      questions: questionsWithAnswerCounts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
      // Backwards compatibility
      totalPages,
      totalItems,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminVerification = await verifyAdminAccess();
    if (!adminVerification.isAdmin) {
      return NextResponse.json(
        { error: adminVerification.error || "Access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      practice_exam_id,
      knowledge_area_id,
      question_text,
      explanation,
      difficulty_level = "medium",
      question_number,
      required_selections = 1,
      answers = [],
    } = body;

    // Basic validation
    if (
      !practice_exam_id ||
      !knowledge_area_id ||
      !question_text ||
      !question_number
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate answers
    if (!Array.isArray(answers) || answers.length < 2) {
      return NextResponse.json(
        { error: "At least 2 answers are required" },
        { status: 400 }
      );
    }

    if (answers.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 answers allowed" },
        { status: 400 }
      );
    }

    // Check that at least one answer is correct
    const correctAnswers = answers.filter(answer => answer.is_correct);
    if (correctAnswers.length === 0) {
      return NextResponse.json(
        { error: "At least one answer must be marked as correct" },
        { status: 400 }
      );
    }

    // Validate required_selections
    if (required_selections < 1 || required_selections > 4) {
      return NextResponse.json(
        { error: "Required selections must be between 1 and 4" },
        { status: 400 }
      );
    }

    // Check that correct answers count matches required_selections
    if (correctAnswers.length !== required_selections) {
      return NextResponse.json(
        {
          error: `Number of correct answers (${correctAnswers.length}) must match required selections (${required_selections})`,
        },
        { status: 400 }
      );
    }

    // Validate answer letters are unique and valid
    const answerLetters = answers.map(answer => answer.answer_letter);
    const validLetters = ["A", "B", "C", "D", "E"];
    const uniqueLetters = new Set(answerLetters);

    if (uniqueLetters.size !== answerLetters.length) {
      return NextResponse.json(
        { error: "Answer letters must be unique" },
        { status: 400 }
      );
    }

    for (const letter of answerLetters) {
      if (!validLetters.includes(letter)) {
        return NextResponse.json(
          { error: "Invalid answer letter. Must be A, B, C, D, or E" },
          { status: 400 }
        );
      }
    }

    // Validate each answer has required text
    for (const answer of answers) {
      if (!answer.answer_text || answer.answer_text.trim().length < 2) {
        return NextResponse.json(
          { error: "Each answer must have at least 2 characters" },
          { status: 400 }
        );
      }
    }

    const supabase = createClient();

    // Verify practice exam exists
    const { data: examData, error: examError } = await supabase
      .from("practice_exams")
      .select("id, certification_id")
      .eq("id", practice_exam_id)
      .single();

    if (examError || !examData) {
      return NextResponse.json(
        { error: "Practice exam not found" },
        { status: 400 }
      );
    }

    // Verify knowledge area exists and belongs to the same certification
    const { data: areaData, error: areaError } = await supabase
      .from("knowledge_areas")
      .select("id, certification_id")
      .eq("id", knowledge_area_id)
      .eq("certification_id", examData.certification_id)
      .single();

    if (areaError || !areaData) {
      return NextResponse.json(
        { error: "Invalid knowledge area for this certification" },
        { status: 400 }
      );
    }

    // Check if question number already exists in this exam
    const { data: existingQuestion } = await supabase
      .from("questions")
      .select("id")
      .eq("practice_exam_id", practice_exam_id)
      .eq("question_number", question_number)
      .single();

    if (existingQuestion) {
      return NextResponse.json(
        { error: "Question number already exists in this exam" },
        { status: 400 }
      );
    }

    // Create the question
    const { data: question, error: insertError } = await supabase
      .from("questions")
      .insert([
        {
          practice_exam_id,
          knowledge_area_id,
          question_text,
          explanation: explanation || null,
          difficulty_level,
          question_number,
          required_selections,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Database error:", insertError);
      return NextResponse.json(
        { error: "Failed to create question" },
        { status: 500 }
      );
    }

    // Create the answers
    const answersToInsert = answers.map(answer => ({
      question_id: question.id,
      answer_text: answer.answer_text,
      explanation: answer.explanation || null,
      is_correct: answer.is_correct,
      answer_letter: answer.answer_letter,
    }));

    const { data: createdAnswers, error: answersError } = await supabase
      .from("answers")
      .insert(answersToInsert)
      .select();

    if (answersError) {
      console.error("Database error creating answers:", answersError);

      // Clean up: delete the question we just created
      await supabase.from("questions").delete().eq("id", question.id);

      return NextResponse.json(
        { error: "Failed to create answers" },
        { status: 500 }
      );
    }

    // Return the question with its answers
    const questionWithAnswers = {
      ...question,
      answers: createdAnswers,
    };

    return NextResponse.json(
      { question: questionWithAnswers },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/admin/questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
