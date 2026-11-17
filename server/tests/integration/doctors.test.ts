import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { User } from "../../src/models/User.model.js";
import { Doctor } from "../../src/models/Doctor.model.js";
import { Patient } from "../../src/models/Patient.model.js";

describe("Doctor Management Integration Tests", () => {
  let authToken: string;

  beforeEach(async () => {
    // Create admin and authenticate
    await User.create({
      name: "Admin User",
      email: "admin@test.org",
      password: "Password123!",
    });

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@test.org", password: "Password123!" });

    authToken = loginRes.body.data.token;
  });

  const sampleDoctor = {
    name: "Dr. Gregory House",
    specialization: "Diagnostic Medicine",
    hospital: "Princeton-Plainsboro",
    phone: "+1-555-0999",
    email: "house@ppth.org",
    status: "active" as const,
  };

  it("POST /api/v1/doctors should create a new doctor profile", async () => {
    const res = await request(app)
      .post("/api/v1/doctors")
      .set("Authorization", `Bearer ${authToken}`)
      .send(sampleDoctor);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(sampleDoctor.name);
    expect(res.body.data.specialization).toBe(sampleDoctor.specialization);
  });

  it("POST /api/v1/doctors should reject duplicate doctor email with 409 Conflict", async () => {
    await Doctor.create(sampleDoctor);

    const res = await request(app)
      .post("/api/v1/doctors")
      .set("Authorization", `Bearer ${authToken}`)
      .send(sampleDoctor);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/v1/doctors should list doctors with pagination and patient counts", async () => {
    const doc1 = await Doctor.create(sampleDoctor);
    const doc2 = await Doctor.create({
      ...sampleDoctor,
      name: "Dr. James Wilson",
      email: "wilson@ppth.org",
      specialization: "Oncology",
    });

    // Assign a patient to doc1
    await Patient.create({
      name: "Patient A",
      age: 40,
      gender: "male",
      doctorId: doc1._id,
      condition: "Stable",
      contactNumber: "+1-555-1111",
    });

    const res = await request(app)
      .get("/api/v1/doctors?page=1&limit=10")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.totalDocs).toBe(2);

    const foundDoc1 = res.body.data.find((d: { email: string }) => d.email === doc1.email);
    expect(foundDoc1.patientCount).toBe(1);
  });

  it("GET /api/v1/doctors should filter by search keyword", async () => {
    await Doctor.create(sampleDoctor);
    await Doctor.create({
      ...sampleDoctor,
      name: "Dr. Allison Cameron",
      email: "cameron@ppth.org",
      specialization: "Immunology",
    });

    const res = await request(app)
      .get("/api/v1/doctors?search=Immunology")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe("Dr. Allison Cameron");
  });

  it("GET /api/v1/doctors/:id should return doctor with assigned patients array", async () => {
    const doctor = await Doctor.create(sampleDoctor);
    await Patient.create({
      name: "Patient Zero",
      age: 28,
      gender: "female",
      doctorId: doctor._id,
      condition: "Critical",
      contactNumber: "+1-555-2222",
    });

    const res = await request(app)
      .get(`/api/v1/doctors/${doctor._id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id.toString()).toBe(doctor._id.toString());
    expect(res.body.data.patients).toHaveLength(1);
    expect(res.body.data.patients[0].name).toBe("Patient Zero");
  });

  it("PATCH /api/v1/doctors/:id should update doctor fields", async () => {
    const doctor = await Doctor.create(sampleDoctor);

    const res = await request(app)
      .patch(`/api/v1/doctors/${doctor._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ status: "on-leave", hospital: "Metropolitan Clinic" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("on-leave");
    expect(res.body.data.hospital).toBe("Metropolitan Clinic");
  });

  it("DELETE /api/v1/doctors/:id should delete doctor and clean up assigned patients", async () => {
    const doctor = await Doctor.create(sampleDoctor);
    await Patient.create({
      name: "Patient X",
      age: 50,
      gender: "male",
      doctorId: doctor._id,
      condition: "Recovered",
      contactNumber: "+1-555-3333",
    });

    const res = await request(app)
      .delete(`/api/v1/doctors/${doctor._id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);

    const checkDoctor = await Doctor.findById(doctor._id);
    expect(checkDoctor).toBeNull();

    const checkPatients = await Patient.countDocuments({ doctorId: doctor._id });
    expect(checkPatients).toBe(0);
  });
});
