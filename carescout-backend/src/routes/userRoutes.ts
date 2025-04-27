// src/routes/userRoutes.ts
import express, { Request, Response } from 'express';
import { authenticate } from '../middlewares/authMiddleware';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    role?: string;
  };
}

const router = express.Router();

router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;