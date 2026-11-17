import { describe, it, expect } from "vitest";
import { ApiError } from "../../src/utils/ApiError.js";

describe("ApiError Utility Unit Tests", () => {
  it("should create an ApiError instance with correct statusCode and message", () => {
    const error = new ApiError(400, "Invalid payload format");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Invalid payload format");
    expect(error.isOperational).toBe(true);
  });

  it("should support badRequest static factory", () => {
    const error = ApiError.badRequest("Validation failed", [{ field: "email", message: "Invalid email" }]);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Validation failed");
    expect(error.errors).toHaveLength(1);
  });

  it("should support unauthorized static factory", () => {
    const error = ApiError.unauthorized("Access denied");
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Access denied");
  });

  it("should support forbidden static factory", () => {
    const error = ApiError.forbidden();
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe("Forbidden resource access");
  });

  it("should support notFound static factory", () => {
    const error = ApiError.notFound("Doctor not found");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Doctor not found");
  });

  it("should support conflict static factory", () => {
    const error = ApiError.conflict("Email already in use");
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe("Email already in use");
  });
});
