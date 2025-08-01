import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { ReviewsResponse, ReviewFormData } from "@/types/reviews";

// GET /api/certifications/[id]/reviews - Get all reviews for a certification
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const certificationId = params.id;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Get all reviews with user information
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles!user_id (
          id,
          email,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('certification_id', certificationId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Calculate stats
    const stats = {
      average_rating: 0,
      total_reviews: reviews?.length || 0,
      rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum: number, review: any) => {
        stats.rating_distribution[review.rating as keyof typeof stats.rating_distribution]++;
        return sum + review.rating;
      }, 0);
      stats.average_rating = Number((totalRating / reviews.length).toFixed(1));
    }

    // Check if user can review
    let canReview = false;
    let userReview = null;

    if (user) {
      // Check if user is enrolled
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('certification_id', certificationId)
        .eq('payment_status', 'succeeded')
        .single();

      canReview = !!enrollment;

      // Find user's review if exists
      userReview = reviews?.find((r: any) => r.user_id === user.id) || null;
    }

    const response: ReviewsResponse = {
      reviews: reviews || [],
      stats,
      user_review: userReview,
      can_review: canReview && !userReview
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/certifications/[id]/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/certifications/[id]/reviews - Create or update a review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const certificationId = params.id;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is enrolled
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('certification_id', certificationId)
      .eq('payment_status', 'succeeded')
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: 'You must be enrolled in this certification to leave a review' },
        { status: 403 }
      );
    }

    // Parse request body
    const body: ReviewFormData = await request.json();
    const { rating, comment } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('certification_id', certificationId)
      .single();

    let result;

    if (existingReview) {
      // Update existing review
      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating,
          comment: comment || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReview.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating review:', error);
        return NextResponse.json(
          { error: 'Failed to update review' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new review
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          certification_id: certificationId,
          rating,
          comment: comment || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
          { error: 'Failed to create review' },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json(result, { status: existingReview ? 200 : 201 });
  } catch (error) {
    console.error('Error in POST /api/certifications/[id]/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/certifications/[id]/reviews - Delete user's review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const certificationId = params.id;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Delete the review (RLS will ensure user can only delete their own)
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('user_id', user.id)
      .eq('certification_id', certificationId);

    if (error) {
      console.error('Error deleting review:', error);
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/certifications/[id]/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 