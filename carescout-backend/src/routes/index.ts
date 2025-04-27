import express from 'express';
import authRoutes from './auth';
import childrenRoutes from './children';
import centersRoutes from './centers';
import adminRoutes from './admin';
import settingsRoutes from './settings';
import chatRoutes from './chatRoutes';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/children', authenticate, childrenRoutes);
router.use('/centers', authenticate, centersRoutes);
router.use('/admin', authenticate, adminRoutes);
router.use('/settings', authenticate, settingsRoutes);
router.use('/chats', authenticate, chatRoutes);

export default router;
