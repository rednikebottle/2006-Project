import { User } from 'firebase/auth';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
} 