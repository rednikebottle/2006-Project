import express, { RequestHandler } from 'express';
import { 
  getCenters, 
  getCenter, 
  createCenter, 
  updateCenter, 
  deleteCenter,
  getCenterChildren,
  bookCenter
} from '../controllers/centersController';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getCenters as RequestHandler);
router.get('/:id', getCenter as RequestHandler);
router.get('/:id/children', getCenterChildren as RequestHandler);

// Authenticated routes
router.post('/:id/book', authenticate, bookCenter as RequestHandler);

// Admin only routes
router.post('/', authenticate, requireAdmin, createCenter as RequestHandler);
router.put('/:id', authenticate, requireAdmin, updateCenter as RequestHandler);
router.delete('/:id', authenticate, requireAdmin, deleteCenter as RequestHandler);

export default router; 