import express, { RequestHandler } from 'express';
import { getChildReports, getUserChildrenReports } from '../controllers/reportsController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get reports for a specific child
router.get('/child/:childId', getChildReports as RequestHandler);

// Get reports for all children of the authenticated user
router.get('/user/children', getUserChildrenReports as RequestHandler);

export default router; 