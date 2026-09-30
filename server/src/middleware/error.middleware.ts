import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { ENV } from '../config/env.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`🚨 [ERROR] ${req.method} ${req.originalUrl}:`, err);

  // Return formatted generic error without leaking sensitive stack traces in production
  sendError(
    res,
    message,
    statusCode,
    ENV.NODE_ENV === 'development' ? { stack: err.stack, details: err } : null
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
};
