export interface Review {
  id: string;
  user_id: string;
  certification_id: string;
  rating: number; // 1-5
  comment: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  user?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    [key: number]: number; // e.g., { 1: 5, 2: 10, 3: 15, 4: 20, 5: 30 }
  };
}

export interface ReviewFormData {
  rating: number;
  comment?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
  user_review?: Review | null; // Current user's review if exists
  can_review: boolean; // Whether current user can submit a review
} 