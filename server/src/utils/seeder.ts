import mongoose from "mongoose";
import { User } from "../models/User.model.js";
import { Doctor } from "../models/Doctor.model.js";
import { Patient, PatientCondition, PatientGender } from "../models/Patient.model.js";
import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { env } from "../config/env.js";

const doctorsData = [
  {
    name: "Dr. Sarah Jenkins",
    specialization: "Cardiology",
    hospital: "City General Hospital",
    phone: "+1-555-0101",
    email: "sarah.jenkins@cityhospital.org",
    status: "active" as const,
  },
  {
    name: "Dr. Marcus Chen",
    specialization: "Neurology",
    hospital: "Central Medical Center",
    phone: "+1-555-0102",
    email: "marcus.chen@centralmed.org",
    status: "active" as const,
  },
  {
    name: "Dr. Elena Rostova",
    specialization: "Pediatrics",
    hospital: "Metro Health Hospital",
    phone: "+1-555-0103",
    email: "elena.rostova@metrohealth.org",
    status: "active" as const,
  },
  {
    name: "Dr. David Kim",
    specialization: "Orthopedics",
    hospital: "Memorial Health System",
    phone: "+1-555-0104",
    email: "david.kim@memorialhealth.org",
    status: "active" as const,
  },
  {
    name: "Dr. Aisha Patel",
    specialization: "Oncology",
    hospital: "City General Hospital",
    phone: "+1-555-0105",
    email: "aisha.patel@cityhospital.org",
    status: "active" as const,
  },
  {
    name: "Dr. Robert Torres",
    specialization: "Dermatology",
    hospital: "Central Medical Center",
    phone: "+1-555-0106",
    email: "robert.torres@centralmed.org",
    status: "active" as const,
  },
  {
    name: "Dr. James Wilson",
    specialization: "General Surgery",
    hospital: "Metro Health Hospital",
    phone: "+1-555-0107",
    email: "james.wilson@metrohealth.org",
    status: "active" as const,
  },
  {
    name: "Dr. Emily Watson",
    specialization: "Nephrology",
    hospital: "Memorial Health System",
    phone: "+1-555-0108",
    email: "emily.watson@memorialhealth.org",
    status: "active" as const,
  },
  {
    name: "Dr. Tariq Al-Mansoor",
    specialization: "Endocrinology",
    hospital: "City General Hospital",
    phone: "+1-555-0109",
    email: "tariq.almansoor@cityhospital.org",
    status: "active" as const,
  },
  {
    name: "Dr. Laura Schmidt",
    specialization: "Pulmonology",
    hospital: "Central Medical Center",
    phone: "+1-555-0110",
    email: "laura.schmidt@centralmed.org",
    status: "active" as const,
  },
  {
    name: "Dr. Benjamin Vance",
    specialization: "Psychiatry",
    hospital: "Metro Health Hospital",
    phone: "+1-555-0111",
    email: "benjamin.vance@metrohealth.org",
    status: "on-leave" as const,
  },
  {
    name: "Dr. Maria Santos",
    specialization: "Obstetrics & Gynecology",
    hospital: "Memorial Health System",
    phone: "+1-555-0112",
    email: "maria.santos@memorialhealth.org",
    status: "active" as const,
  },
  {
    name: "Dr. Jonathan Hayes",
    specialization: "Gastroenterology",
    hospital: "City General Hospital",
    phone: "+1-555-0113",
    email: "jonathan.hayes@cityhospital.org",
    status: "active" as const,
  },
  {
    name: "Dr. Rachel Adams",
    specialization: "Hematology",
    hospital: "Central Medical Center",
    phone: "+1-555-0114",
    email: "rachel.adams@centralmed.org",
    status: "active" as const,
  },
  {
    name: "Dr. Kevin Patel",
    specialization: "Ophthalmology",
    hospital: "Metro Health Hospital",
    phone: "+1-555-0115",
    email: "kevin.patel@metrohealth.org",
    status: "active" as const,
  },
];

const sampleFirstNames = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
  "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
];

const sampleLastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
];

const conditions: PatientCondition[] = ["Critical", "Stable", "Under Observation", "Recovered"];
const genders: PatientGender[] = ["male", "female", "other"];

/**
 * Executes full database seed operations.
 */
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting Doctor Tracker database seeding...");
    await connectDatabase();

    // 1. Clean existing records
    console.log("🧹 Purging existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
    ]);

    // 2. Seed Super Administrator
    console.log("👤 Creating default administrator account...");
    const admin = await User.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`   Admin Created: ${admin.email}`);

    // 3. Seed Doctors
    console.log("🩺 Creating initial doctor profiles...");
    const createdDoctors = await Doctor.insertMany(doctorsData);
    console.log(`   Created ${createdDoctors.length} doctors.`);

    // 4. Seed Patients with realistic distributions across doctors & dates
    console.log("🏥 Generating realistic patient records...");
    const patientsToInsert = [];
    const totalPatientsToCreate = 65;

    for (let i = 0; i < totalPatientsToCreate; i++) {
      const assignedDoctor = createdDoctors[i % createdDoctors.length];
      const firstName = sampleFirstNames[Math.floor(Math.random() * sampleFirstNames.length)];
      const lastName = sampleLastNames[Math.floor(Math.random() * sampleLastNames.length)];
      const age = Math.floor(Math.random() * 75) + 5; // Ages 5 to 80
      const gender = genders[Math.floor(Math.random() * genders.length)];
      
      // Condition weight: More Stable/Observing than Critical
      const randCondition = Math.random();
      let condition: PatientCondition = "Stable";
      if (randCondition < 0.15) condition = "Critical";
      else if (randCondition < 0.45) condition = "Under Observation";
      else if (randCondition < 0.75) condition = "Stable";
      else condition = "Recovered";

      // Distribute admission dates across past 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const admissionDate = new Date();
      admissionDate.setDate(admissionDate.getDate() - daysAgo);

      patientsToInsert.push({
        name: `${firstName} ${lastName}`,
        age,
        gender,
        doctorId: assignedDoctor._id,
        condition,
        contactNumber: `+1-555-${String(1000 + i).padStart(4, "0")}`,
        admissionDate,
        createdAt: admissionDate,
      });
    }

    const createdPatients = await Patient.insertMany(patientsToInsert);
    console.log(`   Created ${createdPatients.length} patient records.`);

    console.log("\n============================================");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("============================================");
    console.log(`🔑 Login Email:    ${env.ADMIN_EMAIL}`);
    console.log(`🔑 Login Password: ${env.ADMIN_PASSWORD}`);
    console.log(`🩺 Doctors:        ${createdDoctors.length}`);
    console.log(`🏥 Patients:       ${createdPatients.length}`);
    console.log("============================================\n");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

// Execute if run directly
seedDatabase();
