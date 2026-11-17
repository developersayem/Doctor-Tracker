import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("Swagger API Documentation Endpoints", () => {
  it("GET /api-docs.json should return valid OpenAPI 3.0.3 specification", async () => {
    const res = await request(app).get("/api-docs.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.info.title).toBe("Doctor Tracker REST API");
    expect(res.body.paths["/api/v1/auth/login"]).toBeDefined();
    expect(res.body.paths["/api/v1/doctors"]).toBeDefined();
    expect(res.body.paths["/api/v1/patients"]).toBeDefined();
    expect(res.body.paths["/api/v1/analytics/dashboard"]).toBeDefined();
  });

  it("GET /docs/swagger.json should return the same OpenAPI specification", async () => {
    const res = await request(app).get("/docs/swagger.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
  });

  it("GET /api-docs should serve HTML interface or redirect with slash", async () => {
    const res = await request(app).get("/api-docs/");
    expect([200, 301, 302]).toContain(res.status);
    if (res.status === 200) {
      expect(res.text).toContain("Doctor Tracker API Documentation");
      expect(res.text).toContain("swagger-ui");
    }
  });
});
