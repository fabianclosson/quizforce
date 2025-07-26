import { createServiceSupabaseClient } from "@/lib/supabase";

type Certification = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  detailed_description: string | null;
  price_cents: number;
  exam_count: number;
  total_questions: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  certification_categories: {
    name: string;
    slug: string;
    description: string;
    icon: string | null;
    color: string;
    sort_order: number;
  } | null;
  practice_exams: {
    id: string;
    question_count: number;
  }[] | null;
};

export default async function SimpleTestPage() {
  try {
    const supabase = createServiceSupabaseClient();
    
    // Fetch certifications directly
    const { data: certifications, error } = await supabase
      .from("certifications")
      .select(`
        id,
        name,
        slug,
        description,
        detailed_description,
        price_cents,
        exam_count,
        total_questions,
        is_active,
        is_featured,
        created_at,
        updated_at,
        certification_categories (
          name,
          slug,
          description,
          icon,
          color,
          sort_order
        ),
        practice_exams (
          id,
          question_count
        )
      `)
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
          <div className="text-red-500">
            <p>Error: {error.message}</p>
          </div>
        </div>
      );
    }

    const typedCertifications = certifications as Certification[];

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Simple Test Page - Direct Database Query</h1>
        <p className="mb-4">Found {typedCertifications?.length || 0} certifications:</p>
        
        <div className="space-y-4">
          {typedCertifications?.map((cert) => (
            <div key={cert.id} className="border p-4 rounded-lg">
              <h2 className="text-xl font-semibold">{cert.name}</h2>
              <p className="text-gray-600">Category: {cert.certification_categories?.name}</p>
              <p className="text-gray-600">Exam Count: {cert.exam_count}</p>
              <p className="text-gray-600">Total Questions: {cert.total_questions}</p>
              <p className="text-gray-600">Practice Exams: {cert.practice_exams?.length || 0}</p>
              <p className="text-gray-600">Active: {cert.is_active ? 'Yes' : 'No'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
        <div className="text-red-500">
          <p>Catch Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
} 