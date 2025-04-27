import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarIcon } from "lucide-react";
import { auth } from '@/lib/firebase-config';

interface Review {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  userId: string;
}

interface ReviewSectionProps {
  centreId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewSection({ centreId, onReviewSubmitted }: ReviewSectionProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    fetchReviews();
    checkBookingStatus();
  }, [centreId]);

  const checkBookingStatus = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        console.error('No authentication token available');
        setCanReview(false);
        return;
      }

      const response = await fetch(`http://localhost:3001/api/bookings/check-status/${centreId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        console.error('User not authorized to check booking status');
        setCanReview(false);
        return;
      }

      if (!response.ok) {
        console.error('Failed to check booking status:', response.status);
        setCanReview(false);
        return;
      }

      const data = await response.json();
      setCanReview(data.hasCompletedBooking || false);
    } catch (error) {
      console.error('Error checking booking status:', error);
      setCanReview(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setFetchError('Please log in to view reviews');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/reviews/${centreId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        setFetchError('You are not authorized to view these reviews');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid reviews data format');
      }

      setReviews(data);
      setFetchError(null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setFetchError('Failed to load reviews');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setError('Please log in to submit a review');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/reviews/${centreId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          text: reviewText.trim()
        }),
      });

      if (response.status === 403) {
        setError('You are not authorized to submit a review');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const newReview = await response.json();
      setReviews(prev => [newReview, ...prev]);
      setRating(0);
      setReviewText('');
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      setError('Failed to submit review. Please try again.');
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Write a Review</h3>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`p-1 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              <StarIcon className="h-6 w-6" />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Write your review here..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="min-h-[100px]"
        />
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        <Button 
          onClick={handleSubmitReview} 
          disabled={loading || rating === 0 || !reviewText.trim() || !canReview}
        >
          {loading ? 'Submitting...' : canReview ? 'Submit Review' : 'Complete a booking to review'}
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Reviews</h3>
        {fetchError ? (
          <p className="text-red-500 text-sm">{fetchError}</p>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-4 w-4 ${
                        review.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm">{review.text}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 