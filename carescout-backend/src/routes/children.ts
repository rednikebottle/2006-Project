import express, { RequestHandler } from 'express';
import { 
  getChildren, 
  getChild, 
  createChild, 
  updateChild, 
  deleteChild 
} from '../controllers/childrenController';

const router = express.Router();

// Get all children for the current user
router.get('/', getChildren as RequestHandler);

// Get a specific child
router.get('/:id', getChild as RequestHandler);

// Create a new child
router.post('/', createChild as RequestHandler);

// Update a child
router.put('/:id', updateChild as RequestHandler);

// Delete a child
router.delete('/:id', deleteChild as RequestHandler);

export default router; 