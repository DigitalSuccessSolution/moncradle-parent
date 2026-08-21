'use client';

import React, { useEffect, useState } from 'react';
import { Star, User, ChevronDown, ChevronUp } from 'lucide-react';
import { getMealReviews, getProductReviews, getDoctorReviews, getDeliveryPartnerReviews, ReviewTargetType } from '@/lib/api/reviewsApi';
import { format } from 'date-fns';

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  parentId?: {
    name?: string;
    profileImage?: string;
  } | string;
}

interface ReviewSectionProps {
  targetId: string;
  targetType: ReviewTargetType;
  title?: string;
}

export default function ReviewSection({ targetId, targetType, title = 'Customer Reviews' }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        let data: Review[] = [];
        if (targetType === 'meal') {
          data = await getMealReviews(targetId);
        } else if (targetType === 'product') {
          data = await getProductReviews(targetId);
        } else if (targetType === 'doctor') {
          data = await getDoctorReviews(targetId);
        } else if (targetType === 'deliveryPartner') {
          data = await getDeliveryPartnerReviews(targetId);
        }
        setReviews(data);
      } catch (err: any) {
        console.error('Failed to fetch reviews:', err);
        setError('Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };

    if (targetId) {
      fetchReviews();
    }
  }, [targetId, targetType]);

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  return (
    <div className="py-6">
      <div 
        className="flex items-center justify-between mb-2 cursor-pointer select-none" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="font-bold text-gray-900 text-xl">{title === 'Customer Reviews' ? 'Ratings and reviews' : title}</h3>
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <span className="font-bold text-gray-900 text-base">{averageRating}</span>
            <Star className="w-3.5 h-3.5 text-green-600 fill-green-600 mx-1" />
            <span>based on {totalReviews} rating{totalReviews !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <button 
          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 transition-colors hover:bg-gray-200"
          aria-label="Toggle reviews"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-6">
          {reviews.length === 0 ? (
            <div className="py-8 text-center text-gray-500 border-t border-gray-100">
              <p className="text-sm font-medium">No reviews yet.</p>
              <p className="text-xs mt-1">Be the first to review this {targetType}!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => {
                // Extract user name, fallback to "Moncradel User"
                let userName = 'Moncradel User';
                if (review.parentId && typeof review.parentId === 'object' && review.parentId.name) {
                  userName = review.parentId.name;
                }

                return (
                  <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{userName}</h4>
                          <p className="text-xs text-gray-500">
                            {review.createdAt ? format(new Date(review.createdAt), 'MMM dd, yyyy') : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-yellow-700">{review.rating}</span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed mt-2">{review.comment}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
