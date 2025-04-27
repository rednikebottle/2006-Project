import express, { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { createReview, getReviewsForCentre, deleteReview } from '../controllers/reviewController';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

const router = express.Router();

// Create a review
router.post('/:centreId', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await createReview(req, res);
  } catch (error) {
    next(error);
  }
});

// Get reviews for a center
router.get('/:centreId', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getReviewsForCentre(req, res);
  } catch (error) {
    next(error);
  }
});

// DELETE a review
router.delete('/:reviewId', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deleteReview(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
