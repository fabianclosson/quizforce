"use client";

import React from 'react';
import { StarRating } from '@/components/ui/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { Review } from '@/types/reviews';

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to review this certification!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-b-0">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              {review.user?.avatar_url && (
                <AvatarImage src={review.user.avatar_url} />
              )}
              <AvatarFallback>
                {review.user?.first_name?.[0]?.toUpperCase() || 
                 review.user?.email?.[0]?.toUpperCase() || 
                 '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">
                    {review.user?.first_name && review.user?.last_name
                      ? `${review.user.first_name} ${review.user.last_name}`
                      : review.user?.email || 'Anonymous'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} size="sm" readonly />
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              
              {review.comment && (
                <p className="mt-3 text-gray-700 dark:text-gray-300">
                  {review.comment}
                </p>
              )}
              
              {review.updated_at !== review.created_at && (
                <p className="text-xs text-gray-500 mt-2">
                  (edited {formatDistanceToNow(new Date(review.updated_at), { addSuffix: true })})
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 