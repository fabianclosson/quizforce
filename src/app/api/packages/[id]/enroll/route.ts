import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import {
  withApiErrorHandler,
  createNotFoundError,
} from "@/lib/api-error-handler";
import type { Certification } from "@/types/database";

interface RouteParams {
  params: {
    id: string;
  };
}

async function handlePackageEnrollment(
  request: NextRequest,
  { params }: RouteParams
) {
  const packageId = params.id;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "Authentication required to enroll in a package",
        message: "Please log in to enroll.",
      },
      { status: 401 }
    );
  }

  const packageCertifications = await withApiErrorHandler(
    async () => {
      const result = await supabase
        .from("package_certifications")
        .select("certification_id, certifications(id, name, is_active)")
        .eq("package_id", packageId);
      return result;
    },
    { operation: "fetch_package_certifications", packageId }
  );

  if (packageCertifications.error) {
    throw createNotFoundError("Failed to fetch package certification details");
  }

  if (!packageCertifications.data || packageCertifications.data.length === 0) {
    throw createNotFoundError(
      "Package not found or contains no certifications"
    );
  }

  // Filter only active certifications
  const activeCertifications = packageCertifications.data.filter(pc => {
    const cert = pc.certifications as unknown as Certification | null;
    return cert && cert.is_active;
  });

  if (activeCertifications.length === 0) {
    return NextResponse.json(
      {
        message:
          "No active certifications available for enrollment in this package.",
      },
      { status: 200 }
    );
  }

  // Check for existing enrollments
  const certificationIds = activeCertifications.map(
    (pc: { certification_id: string }) => pc.certification_id
  );

  const { data: activeEnrollments } = await withApiErrorHandler(
    async () => {
      return supabase
        .from("enrollments")
        .select("certification_id")
        .eq("user_id", user.id)
        .in("certification_id", certificationIds)
        .gte("expires_at", new Date().toISOString());
    },
    {
      operation: "check_active_enrollments",
      userId: user.id,
      certificationIds,
    }
  );

  // Create enrollments for certifications not already enrolled
  const enrollmentsToCreate = activeCertifications.filter(
    (pc: { certification_id: string }) =>
      !activeEnrollments?.some(
        ae => ae.certification_id === pc.certification_id
      )
  );

  if (enrollmentsToCreate.length > 0) {
    const newEnrollments = enrollmentsToCreate.map(
      (pc: { certification_id: string }) => ({
        user_id: user.id,
        certification_id: pc.certification_id,
        purchase_price_cents: 0,
        source: "package" as const,
        package_id: packageId,
      })
    );

    const createdEnrollments = await withApiErrorHandler(
      async () => {
        return supabase.from("enrollments").insert(newEnrollments).select();
      },
      { operation: "create_enrollments", userId: user.id }
    );

    if (createdEnrollments.error) {
      throw createNotFoundError("Failed to create new enrollments");
    }
  }

  return NextResponse.json({
    message: "Enrollment successful",
    enrolled_count: enrollmentsToCreate.length,
  });
}

async function getPackageEnrollmentStatus(
  request: NextRequest,
  { params }: RouteParams
) {
  const packageId = params.id;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ isEnrolled: false }, { status: 401 });
  }

  const packageCertifications = await withApiErrorHandler(
    async () => {
      const result = await supabase
        .from("package_certifications")
        .select("certification_id, certifications(id, name, is_active)")
        .eq("package_id", packageId);
      return result;
    },
    { operation: "fetch_package_certifications", packageId }
  );

  if (packageCertifications.error) {
    throw createNotFoundError("Failed to fetch package details");
  }

  if (!packageCertifications.data || packageCertifications.data.length === 0) {
    throw createNotFoundError("Package not found or has no certifications");
  }

  // Filter only active certifications
  const activeCertifications = packageCertifications.data.filter(pc => {
    const cert = pc.certifications as unknown as Certification | null;
    return cert && cert.is_active;
  });

  if (activeCertifications.length === 0) {
    return NextResponse.json(
      {
        enrolled: false,
        message: "No active certifications in this package",
      },
      { status: 200 }
    );
  }

  // Check for existing enrollments for the active certifications
  const activeCertificationIds = activeCertifications.map(
    (pc: { certification_id: string }) => pc.certification_id
  );

  if (activeCertificationIds.length === 0) {
    return NextResponse.json(
      {
        enrolled: false,
        message: "No active certifications in this package",
      },
      { status: 200 }
    );
  }

  const existingEnrollments = await withApiErrorHandler(
    async () => {
      const result = await supabase
        .from("enrollments")
        .select("certification_id")
        .eq("user_id", user.id)
        .in("certification_id", activeCertificationIds);
      return result;
    },
    {
      operation: "check_existing_enrollments",
      userId: user.id,
      certificationIds: activeCertificationIds,
    }
  );

  if (existingEnrollments.error) {
    throw createNotFoundError("Failed to check enrollment status");
  }

  const enrolledCertificationIds = new Set(
    existingEnrollments.data?.map(
      (e: { certification_id: string }) => e.certification_id
    ) || []
  );

  const allEnrolled = activeCertifications.every(
    (pc: { certification_id: string }) =>
      enrolledCertificationIds.has(pc.certification_id)
  );

  return NextResponse.json(
    {
      isEnrolled: allEnrolled,
      fully_enrolled: allEnrolled,
      active_enrollments: activeCertifications.length,
      total_certifications: activeCertifications.length,
      enrollments: activeCertifications.map(
        (enrollment: { certification_id: string }) => ({
          certification_id: enrollment.certification_id,
        })
      ),
    },
    { status: 200 }
  );
}

export const POST = withApiErrorHandler(handlePackageEnrollment);
export const GET = withApiErrorHandler(getPackageEnrollmentStatus);
