// src/routes/auth.ts
import express, { Request, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { register, login, resendVerification } from '../controllers/authController';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/resend-verification', resendVerification);

// Protected routes
router.get('/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }
  
  res.json({ 
    user: {
      uid: req.user.uid,
      role: req.user.role
    }
  });
});

export default router;