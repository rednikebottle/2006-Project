import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        role?: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    role?: string;
  };
} 