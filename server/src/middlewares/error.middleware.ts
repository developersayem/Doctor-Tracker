import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

/**
 * Global centralized error-handling middleware.
 * Formats errors consistently and ensures security by hiding sensitive stack traces in production.
 */
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: unknown[] | undefined;

  // Handle known operational API errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // Handle Mongoose Invalid ObjectId CastError
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid format for resource identifier '${err.path}': ${err.value}`;
  }
  // Handle Mongoose Schema Validation Error
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Database validation error";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }
  // Handle MongoDB Duplicate Key Error (Code 11000)
  else if ((err as { code?: number }).code === 11000) {
    statusCode = 409;
    const duplicateKey = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue || {})[0];
    message = duplicateKey
      ? `A record with this ${duplicateKey} already exists.`
      : "Duplicate record conflict.";
  }
  // Generic unhandled exception
  else if (err.message) {
    message = err.message;
  }

  // Log unhandled non-operational server errors in development
  if (statusCode === 500 && env.NODE_ENV !== "test") {
    console.error("🔥 Unhandled Server Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * 404 Handler for undefined API routes.
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
};
