import { createServiceSupabaseClient } from "@/lib/supabase";

export default async function TestCatalogPage() {
  try {
    const supabase = createServiceSupabaseClient();
    
    // Fetch categories
    const { data: categories } = await supabase
      .from("certification_categories")
      .select("name, slug, description, icon, color, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    // Fetch certifications with practice exams
    const { data: certifications } = await supabase
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
        certification_categories!inner(
          name,
          slug,
          description,
          icon,
          color,
          sort_order
        ),
        practice_exams!inner(
          id,
          question_count
        )
      `)
      .eq("is_active", true)
      .eq("practice_exams.is_active", true)
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true });

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Test Catalog Page</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Categories ({categories?.length || 0})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories?.map((category) => (
              <div key={category.slug} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Certifications ({certifications?.length || 0})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications?.map((cert) => (
              <div key={cert.id} className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{cert.name}</h3>
                <p className="text-gray-600 mb-4">{cert.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Exams: {cert.exam_count}</span>
                  <span>Questions: {cert.total_questions}</span>
                  <span>Price: ${(cert.price_cents / 100).toFixed(2)}</span>
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  Category: {cert.certification_categories?.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Test catalog error:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-red-600">Error Loading Test Catalog</h1>
        <pre className="bg-gray-100 p-4 rounded">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
} 