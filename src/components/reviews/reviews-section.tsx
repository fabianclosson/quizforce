"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ReviewForm } from './review-form';
import { ReviewList } from './review-list';
import { StarRating } from '@/components/ui/star-rating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Star } from 'lucide-react';
import type { ReviewsResponse } from '@/types/reviews';

interface ReviewsSectionProps {
  certificationId: string;
}

export function ReviewsSection({ certificationId }: ReviewsSectionProps) {
  const { user } = useAuth();
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/certifications/${certificationId}/reviews`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const reviewsData: ReviewsResponse = await response.json();
      setData(reviewsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [certificationId]);

  const handleReviewSuccess = () => {
    setShowForm(false);
    fetchReviews();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Spinner size="medium" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  const { reviews, stats, user_review, can_review } = data;

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{stats.average_rating}</div>
              <StarRating rating={stats.average_rating} size="lg" readonly />
              <p className="text-sm text-gray-500 mt-2">
                Based on {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_distribution[rating] || 0;
                const percentage = stats.total_reviews > 0 
                  ? (count / stats.total_reviews) * 100 
                  : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form or Button */}
      {user && (can_review || user_review) && (
        <div>
          {showForm || user_review ? (
            <ReviewForm
              certificationId={certificationId}
              existingReview={user_review}
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full md:w-auto"
            >
              Write a Review
            </Button>
          )}
        </div>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewList reviews={reviews} />
        </CardContent>
      </Card>
    </div>
  );
} 