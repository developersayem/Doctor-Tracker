import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("Health Check Endpoints", () => {
  it("GET /health should return 200 OK with system status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.uptime).toBeTypeOf("number");
    expect(res.body.timestamp).toBeDefined();
  });

  it("GET /api/health should return 200 OK", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
  });

  it("GET /non-existent-route should return 404 with standard ApiError envelope", async () => {
    const res = await request(app).get("/non-existent-route");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.statusCode).toBe(404);
  });
});
