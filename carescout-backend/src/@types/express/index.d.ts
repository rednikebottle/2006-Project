import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: {
      uid: string;
      role?: string;
    };
  }
} 