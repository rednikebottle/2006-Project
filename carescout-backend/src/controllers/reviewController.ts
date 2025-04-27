import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// Temporary placeholder implementations
export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { centreId } = req.params;
  const { rating, text } = req.body;
  const userId = req.user?.uid;

  // Validate input
  if (!rating || !text) {
    res.status(400).json({ error: 'Rating and review text are required' });
    return;
  }

  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Rating must be between 1 and 5' });
    return;
  }

  // Check if user has a booking with this center
  const bookingsSnapshot = await db.collection('bookings')
    .where('userId', '==', userId)
    .where('centerId', '==', centreId)
    .get();

  if (bookingsSnapshot.empty) {
    res.status(403).json({ error: 'You can only review centers after making a booking' });
    return;
  }

  // Check if any booking is eligible for review (completed or past end date)
  const now = new Date();
  const hasEligibleBooking = bookingsSnapshot.docs.some(doc => {
    const booking = doc.data();
    console.log('[ReviewController] Checking booking:', booking);
    const endDate = new Date(booking.endDate);
    return booking.status === 'completed' || endDate < now;
  });

  if (!hasEligibleBooking) {
    res.status(403).json({ error: 'You can only review centers after your booking has completed or ended' });
    return;
  }

  // Create the review
  const review = {
    userId,
    centreId,
    rating,
    text,
    createdAt: new Date().toISOString(),
    status: 'approved'  // Changed from 'pending' to 'approved'
  };

  const docRef = await db.collection('reviews').add(review);
  
  res.status(201).json({
    id: docRef.id,
    ...review
  });
};

export const getReviewsForCentre = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { centreId } = req.params;

  try {
    // First try with the indexed query
    const reviewsSnapshot = await db.collection('reviews')
      .where('centreId', '==', centreId)
      .where('status', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(reviews);
  } catch (error: any) {
    console.log('[Reviews] Error details:', error.code, error.message);
    
    // Check if the error is about the index being built
    if (error.code === 9 && error.message?.includes('index')) {
      console.log('[Reviews] Index still building, falling back to simple query');
      
      // Fallback to fetching all reviews for the center first
      const reviewsSnapshot = await db.collection('reviews')
        .where('centreId', '==', centreId)
        .get();

      // Then filter and sort in memory
      const reviews = reviewsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((review: any) => review.status === 'approved')
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

      res.json(reviews);
      return;
    }
    
    throw error;
  }
};

export const deleteReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { reviewId } = req.params;
  const userId = req.user?.uid;

  // Get the review
  const reviewDoc = await db.collection('reviews').doc(reviewId).get();

  if (!reviewDoc.exists) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  const review = reviewDoc.data();

  // Check ownership
  if (review?.userId !== userId) {
    res.status(403).json({ error: 'Not authorized to delete this review' });
    return;
  }

  // Delete the review
  await db.collection('reviews').doc(reviewId).delete();
  
  res.json({ success: true });
};