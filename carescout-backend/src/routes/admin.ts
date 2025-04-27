import express from 'express';
import { 
  getUsers,
  updateUserRole,
  getStatistics,
  getReports
} from '../controllers/adminController';

const router = express.Router();

// Get all users
router.get('/users', getUsers);

// Update user role
router.put('/users/:id/role', updateUserRole);

// Get system statistics
router.get('/statistics', getStatistics);

// Get various reports
router.get('/reports', getReports);

export default router; 