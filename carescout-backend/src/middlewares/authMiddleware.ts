// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    role?: string;
  };
}

export const verifyToken = async (token: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized - No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      role: decodedToken.role
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ error: 'Forbidden - Invalid token' });
  }
};

export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized - Authentication required' });
    return;
  }

  try {
    // Get user's custom claims to check admin role
    const { customClaims } = await admin.auth().getUser(req.user.uid);
    if (customClaims?.admin !== true) {
      res.status(403).json({ error: 'Forbidden - Admin access required' });
      return;
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};