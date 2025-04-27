import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof Error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Something went wrong'
    });
  }
};
