import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { User } from "../../src/models/User.model.js";
import { Doctor } from "../../src/models/Doctor.model.js";
import { Patient } from "../../src/models/Patient.model.js";

describe("Analytics Engine ($facet Pipeline) Integration Tests", () => {
  let authToken: string;

  beforeEach(async () => {
    // 1. Admin auth
    await User.create({
      name: "Admin User",
      email: "admin@test.org",
      password: "Password123!",
    });

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@test.org", password: "Password123!" });

    authToken = loginRes.body.data.token;

    // 2. Doctors
    const doc1 = await Doctor.create({
      name: "Dr. Alpha",
      specialization: "Cardiology",
      hospital: "Metro Health",
      phone: "+1-555-1001",
      email: "alpha@metro.org",
      status: "active",
    });

    const doc2 = await Doctor.create({
      name: "Dr. Beta",
      specialization: "Neurology",
      hospital: "City General",
      phone: "+1-555-1002",
      email: "beta@city.org",
      status: "on-leave",
    });

    // 3. Patients (2 under doc1, 1 under doc2)
    const today = new Date();
    await Patient.create([
      {
        name: "Patient One",
        age: 50,
        gender: "male",
        doctorId: doc1._id,
        condition: "Critical",
        contactNumber: "+1-555-0001",
        admissionDate: today,
      },
      {
        name: "Patient Two",
        age: 35,
        gender: "female",
        doctorId: doc1._id,
        condition: "Stable",
        contactNumber: "+1-555-0002",
        admissionDate: today,
      },
      {
        name: "Patient Three",
        age: 22,
        gender: "other",
        doctorId: doc2._id,
        condition: "Recovered",
        contactNumber: "+1-555-0003",
        admissionDate: today,
      },
    ]);
  });

  it("GET /api/v1/analytics/dashboard should return comprehensive metrics in single round-trip", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/dashboard")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { kpis, patientsPerDoctor, conditionDistribution, admissionTrends } = res.body.data;

    // Check KPIs
    expect(kpis.totalDoctors).toBe(2);
    expect(kpis.activeDoctors).toBe(1);
    expect(kpis.totalPatients).toBe(3);
    expect(kpis.criticalPatients).toBe(1);
    expect(kpis.stablePatients).toBe(1);
    expect(kpis.recoveredPatients).toBe(1);
    expect(kpis.avgPatientsPerDoctor).toBe(3); // 3 total patients / 1 active doctor = 3.0

    // Check Workloads
    expect(patientsPerDoctor.length).toBeGreaterThanOrEqual(1);
    const topDoc = patientsPerDoctor[0];
    expect(topDoc.doctorName).toBe("Dr. Alpha");
    expect(topDoc.patientCount).toBe(2);

    // Check Conditions
    expect(conditionDistribution).toHaveLength(4);
    const criticalCond = conditionDistribution.find((c: { condition: string }) => c.condition === "Critical");
    expect(criticalCond.count).toBe(1);
    expect(criticalCond.percentage).toBeCloseTo(33.3, 0);

    // Check Admission Trends
    expect(admissionTrends.length).toBeGreaterThanOrEqual(1);
    expect(admissionTrends[0].count).toBe(3);
  });
});
