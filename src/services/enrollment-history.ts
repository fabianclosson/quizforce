import { createClient } from "@/lib/supabase";

// Extended enrollment history item with additional fields for UI
export interface ExtendedEnrollmentHistoryItem {
  id: string;
  certification_id: string;
  enrolled_at: string;
  expires_at: string;
  source: "purchase" | "free" | "package";
  package_id?: string;
  access_status: "active" | "expired" | "pending";
  days_remaining?: number;
  certification: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price_cents: number;
    certification_categories: {
      name: string;
      icon: string | null;
    } | null;
    practice_exams: Array<{
      id: string;
      name: string;
      question_count: number;
      passing_threshold_percentage: number;
      time_limit_minutes: number;
      is_active: boolean;
    }>;
  };
  payment?: {
    id: string;
    status: string;
    final_amount_cents: number;
    currency: string;
    created_at: string;
    receipt_url?: string;
  };
  package?: {
    id: string;
    name: string;
    description: string;
  };
}

// Enrollment history filters and pagination
export interface EnrollmentHistoryFilters {
  status?: "active" | "expired" | "pending";
  source?: "purchase" | "free" | "package";
  date_from?: string;
  date_to?: string;
}

export interface EnrollmentHistoryOptions {
  filters?: EnrollmentHistoryFilters;
  limit?: number;
  offset?: number;
  sort_by?: "enrolled_at" | "expires_at" | "certification_name";
  sort_order?: "asc" | "desc";
}

export interface EnrollmentHistoryResponse {
  items: ExtendedEnrollmentHistoryItem[];
  total: number;
  has_more: boolean;
}

/**
 * Service for managing enrollment history data
 */
export class EnrollmentHistoryService {
  private supabase = createClient();

  /**
   * Fetch enrollment history for the authenticated user
   */
  async getEnrollmentHistory(
    userId: string,
    options: EnrollmentHistoryOptions = {}
  ): Promise<EnrollmentHistoryResponse> {
    const {
      filters = {},
      limit = 20,
      offset = 0,
      sort_by = "enrolled_at",
      sort_order = "desc",
    } = options;

    try {
      // Build the query with joins to get all necessary data
      let query = this.supabase
        .from("enrollments")
        .select(
          `
          *,
          certification:certifications (
            id,
            name,
            slug,
            description,
            price_cents,
            certification_categories (
              name,
              icon
            ),
            practice_exams (
              id,
              name,
              question_count,
              passing_threshold_percentage,
              time_limit_minutes,
              is_active
            )
          )
        `
        )
        .eq("user_id", userId);

      // Apply filters
      if (filters.source) {
        query = query.eq("source", filters.source);
      }

      if (filters.date_from) {
        query = query.gte("enrolled_at", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("enrolled_at", filters.date_to);
      }

      // Apply sorting
      const sort_column =
        sort_by === "certification_name" ? "certification.name" : sort_by;
      query = query.order(sort_column, { ascending: sort_order === "asc" });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: enrollments, error: enrollmentsError } = await query;

      if (enrollmentsError) {
        throw new Error(
          `Failed to fetch enrollments: ${enrollmentsError.message}`
        );
      }

      if (!enrollments || enrollments.length === 0) {
        return { items: [], total: 0, has_more: false };
      }

      // Get total count for pagination
      const { count, error: countError } = await this.supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError) {
        throw new Error(`Failed to get total count: ${countError.message}`);
      }

      // Process enrollment items
      const enrollmentItems = await Promise.all(
        enrollments.map(async enrollment => {
          const accessInfo = this.calculateAccessInfo(enrollment);

          // Get payment info if enrollment was from a purchase
          let paymentInfo = null;
          if (enrollment.source === "purchase") {
            paymentInfo = await this.getPaymentInfo(enrollment.id);
          }

          // Get package info if enrollment was from a package
          let packageInfo = null;
          if (enrollment.package_id) {
            packageInfo = await this.getPackageInfo(enrollment.package_id);
          }

          return {
            id: enrollment.id,
            certification_id: enrollment.certification_id,
            enrolled_at: enrollment.enrolled_at,
            expires_at: enrollment.expires_at,
            source: enrollment.source,
            package_id: enrollment.package_id,
            access_status: accessInfo.status,
            days_remaining: accessInfo.days_remaining,
            certification: enrollment.certification,
            payment: paymentInfo || undefined,
            package: packageInfo || undefined,
          };
        })
      );

      // Apply access status filter if specified
      const filteredItems = filters.status
        ? enrollmentItems.filter(item => item.access_status === filters.status)
        : enrollmentItems;

      return {
        items: filteredItems,
        total: count || 0,
        has_more: offset + limit < (count || 0),
      };
    } catch (error) {
      console.error("Error fetching enrollment history:", error);
      throw error;
    }
  }

  /**
   * Get payment information for an enrollment
   */
  private async getPaymentInfo(enrollmentId: string) {
    try {
      const { data: payment, error } = await this.supabase
        .from("payments")
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .eq("status", "completed")
        .single();

      if (error || !payment) {
        return null;
      }

      return {
        id: payment.id,
        status: payment.status,
        final_amount_cents: payment.final_amount_cents,
        currency: payment.currency,
        created_at: payment.created_at,
        receipt_url: this.generateReceiptUrl(payment.id),
      };
    } catch (error) {
      console.error("Error fetching payment info:", error);
      return null;
    }
  }

  /**
   * Get package information for an enrollment
   */
  private async getPackageInfo(packageId: string) {
    try {
      const { data: packageData, error } = await this.supabase
        .from("certification_packages")
        .select("id, name, description")
        .eq("id", packageId)
        .single();

      if (error || !packageData) {
        return null;
      }

      return packageData;
    } catch (error) {
      console.error("Error fetching package info:", error);
      return null;
    }
  }

  /**
   * Calculate access status and expiration info
   */
  private calculateAccessInfo(enrollment: any): {
    status: "active" | "expired" | "pending";
    days_remaining?: number;
  } {
    const now = new Date();
    const expiresAt = new Date(enrollment.expires_at);
    const isActive = expiresAt > now;

    const daysRemaining = isActive
      ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : undefined;

    return {
      status: isActive ? "active" : "expired",
      days_remaining: daysRemaining,
    };
  }

  /**
   * Generate receipt URL for a payment
   */
  private generateReceiptUrl(paymentId: string): string {
    return `/api/receipts/${paymentId}`;
  }

  /**
   * Get a single enrollment by ID
   */
  async getEnrollmentById(
    userId: string,
    enrollmentId: string
  ): Promise<ExtendedEnrollmentHistoryItem | null> {
    try {
      const { data: enrollment, error } = await this.supabase
        .from("enrollments")
        .select(
          `
          *,
          certification:certifications (
            id,
            name,
            slug,
            description,
            price_cents,
            certification_categories (
              name,
              icon
            ),
            practice_exams (
              id,
              name,
              question_count,
              passing_threshold_percentage,
              time_limit_minutes,
              is_active
            )
          )
        `
        )
        .eq("id", enrollmentId)
        .eq("user_id", userId)
        .single();

      if (error || !enrollment) {
        return null;
      }

      const accessInfo = this.calculateAccessInfo(enrollment);

      // Get payment info if enrollment was from a purchase
      let paymentInfo = null;
      if (enrollment.source === "purchase") {
        paymentInfo = await this.getPaymentInfo(enrollment.id);
      }

      // Get package info if enrollment was from a package
      let packageInfo = null;
      if (enrollment.package_id) {
        packageInfo = await this.getPackageInfo(enrollment.package_id);
      }

      return {
        id: enrollment.id,
        certification_id: enrollment.certification_id,
        enrolled_at: enrollment.enrolled_at,
        expires_at: enrollment.expires_at,
        source: enrollment.source,
        package_id: enrollment.package_id,
        access_status: accessInfo.status,
        days_remaining: accessInfo.days_remaining,
        certification: enrollment.certification,
        payment: paymentInfo || undefined,
        package: packageInfo || undefined,
      };
    } catch (error) {
      console.error("Error fetching enrollment by ID:", error);
      return null;
    }
  }

  /**
   * Get a single enrollment by payment ID (for receipt generation)
   */
  async getEnrollmentByPaymentId(
    userId: string,
    paymentId: string
  ): Promise<ExtendedEnrollmentHistoryItem | null> {
    try {
      // First, get the enrollment ID from the payment
      const { data: payment, error: paymentError } = await this.supabase
        .from("payments")
        .select("enrollment_id")
        .eq("id", paymentId)
        .eq("status", "completed")
        .single();

      if (paymentError || !payment) {
        return null;
      }

      // Then get the full enrollment data
      return await this.getEnrollmentById(userId, payment.enrollment_id);
    } catch (error) {
      console.error("Error fetching enrollment by payment ID:", error);
      return null;
    }
  }
}

// Export singleton instance
export const enrollmentHistoryService = new EnrollmentHistoryService();
