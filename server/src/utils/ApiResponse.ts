import { Response } from "express";

/**
 * Standardized API response format for all JSON responses.
 * Guarantees a predictable structure across all controllers.
 */
export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: T;
  public readonly meta?: {
    page?: number;
    limit?: number;
    totalDocs?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    [key: string]: unknown;
  };

  constructor(
    statusCode: number,
    message: string = "Success",
    data?: T,
    meta?: ApiResponse["meta"]
  ) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
    if (meta !== undefined) {
      this.meta = meta;
    }
  }

  /**
   * Sends the structured response via Express response object.
   */
  send(res: Response): Response {
    return res.status(this.statusCode).json(this);
  }
}
