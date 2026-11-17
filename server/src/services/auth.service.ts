import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User.model.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { AuthUserPayload } from "../middlewares/auth.middleware.js";

/**
 * Generates signed JWT authentication token for a user.
 */
export const generateToken = (user: IUser): string => {
  const payload: AuthUserPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as unknown as number,
  });
};

/**
 * Authenticates an administrator with email and password.
 */
export const authenticateUser = async (email: string, password: string) => {
  // Query user including the password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password credentials.");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password credentials.");
  }

  const token = generateToken(user);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Retrieves the current authenticated user details.
 */
export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound("User account not found.");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};
