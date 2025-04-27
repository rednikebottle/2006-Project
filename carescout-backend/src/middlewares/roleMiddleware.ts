// src/middlewares/roleMiddleware.ts
import { Request, Response, NextFunction } from 'express';

type Role = 'admin' | 'manager' | 'parent' | 'staff'; // Adjust based on your needs

export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - No user data' });
    }

    const userRole = req.user.role as Role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }

    next();
  };
};