import { Request, Response, NextFunction } from "express";
import { getDashboardAnalytics } from "../services/analytics.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Controller: Retrieve consolidated dashboard analytics and visual chart datasets.
 * GET /api/v1/analytics/dashboard
 */
export const getDashboardMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const range = typeof req.query.range === "string" ? req.query.range : "30D";
    const analytics = await getDashboardAnalytics(range);
    new ApiResponse(200, "Dashboard analytics retrieved successfully", analytics).send(res);
  } catch (error) {
    next(error);
  }
};
