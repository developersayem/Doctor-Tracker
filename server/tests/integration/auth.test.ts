import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { User } from "../../src/models/User.model.js";

describe("Authentication Integration Tests", () => {
  const adminCredentials = {
    name: "Admin Tester",
    email: "test.admin@hospital.org",
    password: "Password123!",
  };

  beforeEach(async () => {
    await User.create(adminCredentials);
  });

  it("POST /api/v1/auth/login with valid credentials should return token and user profile", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: adminCredentials.email,
        password: adminCredentials.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(adminCredentials.email);
    expect(res.body.data.user.name).toBe(adminCredentials.name);
    // Password must be stripped
    expect(res.body.data.user.password).toBeUndefined();
    // Cookie must be set
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain("token=");
  });

  it("POST /api/v1/auth/login with incorrect password should return 401 Unauthorized", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: adminCredentials.email,
        password: "WrongPassword999",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/auth/login with invalid email format should return 400 Bad Request", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "not-an-email",
        password: "Password123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it("GET /api/v1/auth/me should reject unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/auth/me should return user details when Bearer token is provided", async () => {
    // 1. Login to get token
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: adminCredentials.email,
        password: adminCredentials.password,
      });
    const token = loginRes.body.data.token;

    // 2. Access /me with token
    const meRes = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe(adminCredentials.email);
  });

  it("POST /api/v1/auth/logout should clear authentication cookie", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: adminCredentials.email,
        password: adminCredentials.password,
      });
    const token = loginRes.body.data.token;

    const logoutRes = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
  });
});
