import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(`Error processing request ${req.method} ${req.url}:`, err);

  if (err instanceof ZodError) {
    const errorMessages = err.errors.map((e) => e.message).join('; ');
    return res.status(400).json({
      success: false,
      message: errorMessages || 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  const isProd = process.env.NODE_ENV === 'production';
  const message = err instanceof Error ? err.message : 'An unexpected error occurred';

  return res.status(500).json({
    success: false,
    message: isProd ? 'Internal server error' : message,
    ...(isProd ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });
}
