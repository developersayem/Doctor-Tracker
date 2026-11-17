import { Request, Response, NextFunction } from "express";
import { authenticateUser, getUserProfile } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { env } from "../config/env.js";

/**
 * Controller: Authenticate Administrator & dispatch JWT token.
 * POST /api/v1/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authenticateUser(email, password);

    // Set secure HTTP-Only cookie for CSRF protection and seamless frontend auth
    res.cookie("token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    new ApiResponse(200, "Authentication successful", { user, token }).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get currently logged in administrator profile.
 * GET /api/v1/auth/me
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await getUserProfile(userId);

    new ApiResponse(200, "Current user profile fetched successfully", { user }).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Log out administrator and invalidate cookie session.
 * POST /api/v1/auth/logout
 */
export const logout = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    });

    new ApiResponse(200, "Logged out successfully").send(res);
  } catch (error) {
    next(error);
  }
};
