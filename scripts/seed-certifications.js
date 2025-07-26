#!/usr/bin/env node

/**
 * Seed Certifications Script
 *
 * This script adds sample certification data for testing the admin interface.
 * Run with: node scripts/seed-certifications.js
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

// First, create categories
const sampleCategories = [
  {
    name: "Administrator",
    slug: "admins",
    description: "Salesforce Administrator certifications and practice exams",
    icon: "shield-check",
    color: "#0176D3",
    sort_order: 1,
  },
  {
    name: "Developer",
    slug: "developers", 
    description: "Platform Developer certifications and practice exams",
    icon: "code",
    color: "#00A1E0",
    sort_order: 2,
  },
  {
    name: "Consultant",
    slug: "consultants",
    description: "Consultant certifications and practice exams", 
    icon: "users",
    color: "#0D9488",
    sort_order: 3,
  },
  {
    name: "Architect",
    slug: "architects",
    description: "Technical Architect certifications and practice exams",
    icon: "building",
    color: "#7C3AED", 
    sort_order: 4,
  },
  {
    name: "Associate",
    slug: "associates",
    description: "Salesforce Associate certifications and practice exams",
    icon: "academic-cap",
    color: "#059669",
    sort_order: 5,
  },
  {
    name: "Marketer",
    slug: "marketers",
    description: "Marketing Cloud certifications and practice exams",
    icon: "megaphone",
    color: "#DC2626",
    sort_order: 6,
  },
];

const sampleCertifications = [
  {
    name: "Salesforce Administrator Practice Bundle",
    slug: "salesforce-administrator-practice-bundle",
    description:
      "Complete practice exam bundle for Salesforce Administrator certification",
    detailed_description:
      "Master the Salesforce Administrator exam with our comprehensive practice bundle featuring 3 full-length exams with 180 questions total.",
    category_slug: "admin", // Fixed: Use actual database slug
    price_cents: 4999, // $49.99
    exam_count: 3,
    total_questions: 180,
    is_active: true,
    is_featured: true,
  },
  {
    name: "Platform Developer I Practice Bundle",
    slug: "platform-developer-i-practice-bundle",
    description:
      "Essential practice exams for Platform Developer I certification",
    detailed_description:
      "Build your development skills with practice exams covering Apex, Visualforce, and Lightning Platform fundamentals.",
    category_slug: "developer", // Fixed: Use actual database slug
    price_cents: 5999, // $59.99
    exam_count: 2,
    total_questions: 120,
    is_active: true,
    is_featured: false,
  },
  {
    name: "Sales Cloud Consultant Practice Bundle",
    slug: "sales-cloud-consultant-practice-bundle",
    description: "Practice exams for Sales Cloud Consultant certification",
    detailed_description:
      "Prepare for the Sales Cloud Consultant exam with real-world scenarios and comprehensive question coverage.",
    category_slug: "consultant", // Fixed: Use actual database slug
    price_cents: 6999, // $69.99
    exam_count: 2,
    total_questions: 120,
    is_active: true,
    is_featured: true,
  },
  {
    name: "Associate Practice Bundle (Free)",
    slug: "associate-practice-bundle-free",
    description: "Free practice exam for Salesforce Associate certification",
    detailed_description:
      "Get started with Salesforce certifications with our free Associate practice exam.",
    category_slug: "associate", // Fixed: Use actual database slug
    price_cents: 0, // Free
    exam_count: 1,
    total_questions: 60,
    is_active: true,
    is_featured: false,
  },
  {
    name: "Marketing Cloud Email Specialist Bundle",
    slug: "marketing-cloud-email-specialist-bundle",
    description:
      "Practice exams for Marketing Cloud Email Specialist certification",
    detailed_description:
      "Master Marketing Cloud Email Studio with targeted practice questions and scenarios.",
    category_slug: "marketer", // Fixed: Use actual database slug
    price_cents: 4999, // $49.99
    exam_count: 2,
    total_questions: 120,
    is_active: false, // Inactive for testing
    is_featured: false,
  },
];

async function seedCertifications() {
  try {
    console.log("Starting certification seeding...");

    // Get existing categories
    console.log("1. Fetching existing categories...");
    const { data: categories, error: categoriesError } = await supabase
      .from("certification_categories")
      .select("id, slug");

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    console.log(`Found ${categories.length} existing categories`);

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    // Prepare certifications with proper category IDs
    console.log("2. Seeding certifications...");
    const certificationsToInsert = sampleCertifications.map(cert => {
      const categoryId = categoryMap[cert.category_slug];
      if (!categoryId) {
        console.warn(`⚠️ Category '${cert.category_slug}' not found for certification '${cert.name}'`);
        return null;
      }
      
      return {
        name: cert.name,
        slug: cert.slug,
        description: cert.description,
        detailed_description: cert.detailed_description,
        category_id: categoryId,
        price_cents: cert.price_cents,
        exam_count: cert.exam_count,
        total_questions: cert.total_questions,
        is_active: cert.is_active,
        is_featured: cert.is_featured,
      };
    }).filter(Boolean); // Remove null entries

    // Insert certifications
    const { data: insertedCertifications, error: insertError } = await supabase
      .from("certifications")
      .upsert(certificationsToInsert, {
        onConflict: "slug",
        ignoreDuplicates: false,
      })
      .select();

    if (insertError) {
      throw new Error(
        `Failed to insert certifications: ${insertError.message}`
      );
    }

    console.log(
      `✅ Successfully seeded ${insertedCertifications.length} certifications:`
    );
    insertedCertifications.forEach(cert => {
      console.log(
        `   - ${cert.name} (${cert.is_active ? "Active" : "Inactive"})`
      );
    });

    console.log("\n🎉 Certification seeding completed successfully!");
    console.log(
      "You can now view the certifications in the admin dashboard at /admin/certifications"
    );
  } catch (error) {
    console.error("❌ Error seeding certifications:", error.message);
    process.exit(1);
  }
}

// Run the seeding
seedCertifications();
