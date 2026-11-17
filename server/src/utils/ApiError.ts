/**
 * Custom operational API Error class representing predictable HTTP errors.
 * Formats structured errors with status codes and optional contextual validation messages.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(
    statusCode: number,
    message: string = "An unexpected error occurred",
    errors?: unknown[],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Convenient static factory helpers
  static badRequest(message: string = "Bad Request", errors?: unknown[]) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string = "Unauthorized access") {
    return new ApiError(401, message);
  }

  static forbidden(message: string = "Forbidden resource access") {
    return new ApiError(403, message);
  }

  static notFound(message: string = "Requested resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message: string = "Resource conflict detected") {
    return new ApiError(409, message);
  }

  static internal(message: string = "Internal server error") {
    return new ApiError(500, message);
  }
}
