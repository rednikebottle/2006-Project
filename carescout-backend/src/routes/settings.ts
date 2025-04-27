import express, { RequestHandler } from 'express';
import { 
  getUserSettings,
  updateUserSettings,
  updatePassword,
  deleteAccount
} from '../controllers/settingsController';

const router = express.Router();

// Get user settings
router.get('/', getUserSettings as RequestHandler);

// Update user settings
router.put('/', updateUserSettings as RequestHandler);

// Update password
router.put('/password', updatePassword as RequestHandler);

// Delete account
router.delete('/', deleteAccount as RequestHandler);

export default router; 