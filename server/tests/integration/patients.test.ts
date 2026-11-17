import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app.js";
import { User } from "../../src/models/User.model.js";
import { Doctor } from "../../src/models/Doctor.model.js";
import { Patient } from "../../src/models/Patient.model.js";

describe("Patient Management Integration Tests", () => {
  let authToken: string;
  let attendingDoctorId: string;

  beforeEach(async () => {
    // 1. Create and login admin
    await User.create({
      name: "Admin User",
      email: "admin@test.org",
      password: "Password123!",
    });

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@test.org", password: "Password123!" });

    authToken = loginRes.body.data.token;

    // 2. Create attending doctor
    const doctor = await Doctor.create({
      name: "Dr. Lisa Cuddy",
      specialization: "Endocrinology",
      hospital: "PPTH",
      phone: "+1-555-0808",
      email: "cuddy@ppth.org",
      status: "active",
    });

    attendingDoctorId = doctor._id.toString();
  });

  it("POST /api/v1/patients should register patient with valid doctor reference", async () => {
    const res = await request(app)
      .post("/api/v1/patients")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "John Doe",
        age: 45,
        gender: "male",
        doctorId: attendingDoctorId,
        condition: "Stable",
        contactNumber: "+1-555-4321",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("John Doe");
    expect(res.body.data.condition).toBe("Stable");
    expect(res.body.data.doctorId._id.toString()).toBe(attendingDoctorId);
  });

  it("POST /api/v1/patients should reject registration if doctorId does not exist", async () => {
    const fakeDoctorId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post("/api/v1/patients")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Jane Doe",
        age: 32,
        gender: "female",
        doctorId: fakeDoctorId,
        condition: "Critical",
        contactNumber: "+1-555-9876",
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/patients should reject invalid age (< 0)", async () => {
    const res = await request(app)
      .post("/api/v1/patients")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Invalid Age Patient",
        age: -5,
        gender: "male",
        doctorId: attendingDoctorId,
        condition: "Stable",
        contactNumber: "+1-555-0000",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/v1/patients should filter by clinical condition", async () => {
    await Patient.create([
      {
        name: "Patient Critical",
        age: 60,
        gender: "male",
        doctorId: attendingDoctorId,
        condition: "Critical",
        contactNumber: "+1-555-1111",
      },
      {
        name: "Patient Stable",
        age: 30,
        gender: "female",
        doctorId: attendingDoctorId,
        condition: "Stable",
        contactNumber: "+1-555-2222",
      },
    ]);

    const res = await request(app)
      .get("/api/v1/patients?condition=Critical")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].condition).toBe("Critical");
    expect(res.body.data[0].name).toBe("Patient Critical");
  });

  it("PATCH /api/v1/patients/:id should update clinical condition", async () => {
    const patient = await Patient.create({
      name: "Patient Recovering",
      age: 25,
      gender: "other",
      doctorId: attendingDoctorId,
      condition: "Under Observation",
      contactNumber: "+1-555-3333",
    });

    const res = await request(app)
      .patch(`/api/v1/patients/${patient._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ condition: "Recovered" });

    expect(res.status).toBe(200);
    expect(res.body.data.condition).toBe("Recovered");
  });

  it("DELETE /api/v1/patients/:id should delete patient record", async () => {
    const patient = await Patient.create({
      name: "Patient to Delete",
      age: 40,
      gender: "female",
      doctorId: attendingDoctorId,
      condition: "Stable",
      contactNumber: "+1-555-4444",
    });

    const res = await request(app)
      .delete(`/api/v1/patients/${patient._id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);

    const check = await Patient.findById(patient._id);
    expect(check).toBeNull();
  });
});
