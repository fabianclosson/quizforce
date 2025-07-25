import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log("Testing Supabase connection...");
    
    // Test 1: Simple query to certifications table
    const { data: certs, error: certsError } = await supabase
      .from("certifications")
      .select("id, name")
      .limit(5);
    
    console.log("Certifications query result:", { 
      count: certs?.length || 0, 
      error: certsError?.message || null,
      data: certs
    });
    
    // Test 2: Simple query to certification_categories table
    const { data: categories, error: categoriesError } = await supabase
      .from("certification_categories")
      .select("id, name")
      .limit(5);
    
    console.log("Categories query result:", { 
      count: categories?.length || 0, 
      error: categoriesError?.message || null,
      data: categories
    });
    
    // Test 3: Simple query to practice_exams table
    const { data: exams, error: examsError } = await supabase
      .from("practice_exams")
      .select("id, name, is_active")
      .limit(5);
    
    console.log("Practice exams query result:", { 
      count: exams?.length || 0, 
      error: examsError?.message || null,
      data: exams
    });

    return NextResponse.json({
      success: true,
      results: {
        certifications: {
          count: certs?.length || 0,
          error: certsError?.message || null,
          data: certs
        },
        categories: {
          count: categories?.length || 0,
          error: categoriesError?.message || null,
          data: categories
        },
        practice_exams: {
          count: exams?.length || 0,
          error: examsError?.message || null,
          data: exams
        }
      }
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      { error: "Test failed", details: error },
      { status: 500 }
    );
  }
} 