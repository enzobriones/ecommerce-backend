import type { NextFunction, Request, Response } from "express";
import logger from "../config/logger";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error({
    path: req.path,
    method: req.method,
    statusCode,
    message,
    stack: err.stack,
  });

  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint failed
        return res.status(409).json({
          status: 'error',
          message: 'Resource already exists',
          code: 'CONFLICT',
        });
      case 'P2025': // Record not found
        return res.status(404).json({
          status: 'error',
          message: 'Resource not found',
          code: 'NOT_FOUND',
        });
      default:
        return res.status(500).json({
          status: 'error',
          message: 'Database error',
          code: 'DATABASE_ERROR',
        });
    }
  } else if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Data validation error',
      code: 'VALIDATION_ERROR',
      errors: err.errors,
    })
  }

  // Handle other errors
  return res.status(statusCode).json({
    status: 'error',
    message,
    code: 'UNKNOWN_ERROR',
  });
}

export class ApiError extends Error implements AppError {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static notFound(message = 'Recurso no encontrado') {
    return new ApiError(message, 404, 'NOT_FOUND');
  }

  static badRequest(message = 'Solicitud inválida') {
    return new ApiError(message, 400, 'BAD_REQUEST');
  }

  static unauthorized(message = 'No autorizado') {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Acceso prohibido') {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  static conflict(message = 'Conflicto con recurso existente') {
    return new ApiError(message, 409, 'CONFLICT');
  }

  static internal(message = 'Error interno del servidor') {
    return new ApiError(message, 500, 'SERVER_ERROR');
  }
}