import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  addEmergencyContact,
  getEmergencyContacts,
  updateEmergencyContact,
  deleteEmergencyContact
} from '../controllers/emergencyContactController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Middleware to log route access
const logRoute = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[Emergency Contacts] ${req.method} ${req.originalUrl}`);
  next();
};

router.use(logRoute);

// CRUD routes for emergency contacts
router.post('/', addEmergencyContact as RequestHandler);
router.get('/', getEmergencyContacts as RequestHandler);
router.put('/:contactId', updateEmergencyContact as RequestHandler);
router.delete('/:contactId', deleteEmergencyContact as RequestHandler);

export default router; 