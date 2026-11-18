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
    yearsOfExperience: 14,
    maxCapacity: 25,
    bio: "Senior Interventional Cardiologist specializing in acute coronary syndrome and structural heart diseases.",
  },
  {
    name: "Dr. Marcus Chen",
    specialization: "Neurology",
    hospital: "Central Medical Center",
    phone: "+1-555-0102",
    email: "marcus.chen@centralmed.org",
    status: "active" as const,
    yearsOfExperience: 11,
    maxCapacity: 20,
    bio: "Board-certified Neurologist focusing on neurodegenerative disorders, stroke rehabilitation, and epilepsy management.",
  },
  {
    name: "Dr. Elena Rostova",
    specialization: "Pediatrics",
    hospital: "Metro Health Hospital",
    phone: "+1-555-0103",
    email: "elena.rostova@metrohealth.org",
    status: "active" as const,
    yearsOfExperience: 8,
    maxCapacity: 30,
    bio: "Pediatric specialist with extensive experience in neonatal intensive care and developmental pediatrics.",
  },
  {
    name: "Dr. David Kim",
    specialization: "Orthopedics",
    hospital: "Memorial Health System",
    phone: "+1-555-0104",
    email: "david.kim@memorialhealth.org",
    status: "active" as const,
    yearsOfExperience: 16,
    maxCapacity: 22,
    bio: "Orthopedic surgeon specializing in joint replacement, sports injury trauma, and arthroscopic reconstructions.",
  },
  {
    name: "Dr. Aisha Patel",
    specialization: "Oncology",
    hospital: "City General Hospital",
    phone: "+1-555-0105",
    email: "aisha.patel@cityhospital.org",
    status: "active" as const,
    yearsOfExperience: 12,
    maxCapacity: 18,
    bio: "Clinical oncologist leading precision chemotherapy protocols and multidisciplinary cancer therapy boards.",
  },
  {
    name: "Dr. Robert Torres",
    specialization: "Dermatology",
    hospital: "Central Medical Center",
    phone: "+1-555-0106",
    email: "robert.torres@centralmed.org",
    status: "active" as const,
    yearsOfExperience: 7,
    maxCapacity: 28,
    bio: "Dermatologist with clinical focus on immunological skin disorders, dermatopathology, and laser skin treatments.",
  },
  {
    name: "Dr. James Wilson",
    specialization: "General Surgery",
    hospital: "Metro Health Hospital",
    phone: "+1-555-0107",
    email: "james.wilson@metrohealth.org",
    status: "active" as const,
    yearsOfExperience: 19,
    maxCapacity: 15,
    bio: "Chief of Surgery specializing in advanced minimally invasive laparoscopy and emergency trauma surgeries.",
  },
  {
    name: "Dr. Emily Watson",
    specialization: "Nephrology",
    hospital: "Memorial Health System",
    phone: "+1-555-0108",
    email: "emily.watson@memorialhealth.org",
    status: "active" as const,
    yearsOfExperience: 9,
    maxCapacity: 20,
    bio: "Nephrologist dedicated to chronic kidney disease management, hemodialysis care, and renal transplantation.",
  },
  {
    name: "Dr. Tariq Al-Mansoor",
    specialization: "Endocrinology",
    hospital: "City General Hospital",
    phone: "+1-555-0109",
    email: "tariq.almansoor@cityhospital.org",
    status: "active" as const,
    yearsOfExperience: 15,
    maxCapacity: 24,
    bio: "Consultant endocrinologist with focus on diabetic neuropathy, metabolic syndrome, and thyroid disorders.",
  },
  {
    name: "Dr. Laura Schmidt",
    specialization: "Pulmonology",
    hospital: "Central Medical Center",
    phone: "+1-555-0110",
    email: "laura.schmidt@centralmed.org",
    status: "active" as const,
    yearsOfExperience: 6,
    maxCapacity: 22,
    bio: "Pulmonary critical care specialist managing acute respiratory distress, asthma, and sleep medicine.",
  },
  {
    name: "Dr. Benjamin Vance",
    specialization: "Psychiatry",
    hospital: "Metro Health Hospital",
    phone: "+1-555-0111",
    email: "benjamin.vance@metrohealth.org",
    status: "on-leave" as const,
    yearsOfExperience: 10,
    maxCapacity: 20,
    bio: "Adult psychiatrist providing psychotherapy, mood stabilization, and holistic psychiatric rehabilitation.",
  },
  {
    name: "Dr. Maria Santos",
    specialization: "Obstetrics & Gynecology",
    hospital: "Memorial Health System",
    phone: "+1-555-0112",
    email: "maria.santos@memorialhealth.org",
    status: "active" as const,
    yearsOfExperience: 13,
    maxCapacity: 26,
    bio: "OB/GYN specializing in high-risk maternal-fetal medicine, prenatal health, and gynecological surgery.",
  },
  {
    name: "Dr. Jonathan Hayes",
    specialization: "Gastroenterology",
    hospital: "City General Hospital",
    phone: "+1-555-0113",
    email: "jonathan.hayes@cityhospital.org",
    status: "active" as const,
    yearsOfExperience: 18,
    maxCapacity: 20,
    bio: "Gastroenterologist and therapeutic endoscopist specializing in inflammatory bowel disease (IBD) and hepatology.",
  },
  {
    name: "Dr. Rachel Adams",
    specialization: "Hematology",
    hospital: "Central Medical Center",
    phone: "+1-555-0114",
    email: "rachel.adams@centralmed.org",
    status: "active" as const,
    yearsOfExperience: 5,
    maxCapacity: 22,
    bio: "Hematologist focused on coagulopathy, bone marrow transplants, and chronic anemia syndromes.",
  },
  {
    name: "Dr. Kevin Patel",
    specialization: "Ophthalmology",
    hospital: "Metro Health Hospital",
    phone: "+1-555-0115",
    email: "kevin.patel@metrohealth.org",
    status: "active" as const,
    yearsOfExperience: 22,
    maxCapacity: 30,
    bio: "Senior Ophthalmic Surgeon with over two decades of experience in cataract microsurgery and retinal laser procedures.",
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
 * Seeds dataset into MongoDB.
 * If isAuto = true, only runs if collections are currently empty.
 */
export const seedDataset = async (isAuto = false): Promise<void> => {
  try {
    if (isAuto) {
      const count = await Doctor.countDocuments();
      if (count > 0) {
        return; // Already populated
      }
      console.log("🌱 Database is unpopulated. Auto-seeding initial clinical dataset...");
    } else {
      console.log("🌱 Starting Doctor Tracker database seeding...");
      await connectDatabase();
      console.log("🧹 Purging existing collections...");
      await Promise.all([
        User.deleteMany({}),
        Doctor.deleteMany({}),
        Patient.deleteMany({}),
      ]);
    }

    // 1. Seed Super Administrator
    const adminEmail = (env.ADMIN_EMAIL || "admin@doctortracker.com").toLowerCase().trim();
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: env.ADMIN_NAME || "Super Administrator",
        email: adminEmail,
        password: env.ADMIN_PASSWORD || "Admin@123456",
        role: "admin",
      });
      console.log(`   Admin Created: ${adminEmail}`);
    }

    // 2. Seed Doctors
    console.log("🩺 Creating initial doctor profiles...");
    const createdDoctors = await Doctor.insertMany(doctorsData);
    console.log(`   Created ${createdDoctors.length} doctors.`);

    // 3. Seed Patients with realistic distributions across doctors & dates
    console.log("🏥 Generating realistic patient records...");
    const patientsToInsert = [];
    const totalPatientsToCreate = 65;

    for (let i = 0; i < totalPatientsToCreate; i++) {
      const assignedDoctor = createdDoctors[i % createdDoctors.length];
      const firstName = sampleFirstNames[Math.floor(Math.random() * sampleFirstNames.length)];
      const lastName = sampleLastNames[Math.floor(Math.random() * sampleLastNames.length)];
      const age = Math.floor(Math.random() * 75) + 5;
      const gender = genders[Math.floor(Math.random() * genders.length)];
      
      const randCondition = Math.random();
      let condition: PatientCondition = "Stable";
      if (randCondition < 0.15) condition = "Critical";
      else if (randCondition < 0.45) condition = "Under Observation";
      else if (randCondition < 0.75) condition = "Stable";
      else condition = "Recovered";

      const daysAgo = Math.floor(Math.random() * 30);
      const admissionDate = new Date();
      admissionDate.setDate(admissionDate.getDate() - daysAgo);

      const clinicalNotesByCondition: Record<PatientCondition, string[]> = {
        Critical: [
          "Patient admitted with acute distress. Transferred to ICU care; vitals under continuous electronic monitoring.",
          "Emergency intake required oxygen administration. Cardiac telemetry and arterial blood gas monitored.",
          "Acute onset of severe symptoms. Administered intravenous medication; close hemodynamic oversight maintained.",
        ],
        "Under Observation": [
          "Patient admitted for post-procedure telemetry and 24-hour observation. Pain managed effectively.",
          "Continuous vital stats monitoring in step-down unit. Diagnostic ultrasound and lab panel pending review.",
          "Observation for cardiac rhythm stability and medication response. Blood pressure trending toward normal.",
        ],
        Stable: [
          "Routine clinical intake. Patient reports well-controlled symptoms on current outpatient medication regimen.",
          "Follow-up consultation for chronic symptom management. Routine lab work normal, continuing standard protocol.",
          "Patient ambulatory and conversational. Vital signs within acceptable limits; routine monitoring ongoing.",
        ],
        Recovered: [
          "Clinical course completed satisfactorily. Follow-up diagnostic markers resolved; discharge plan approved.",
          "Patient responded excellently to antibiotic and supportive therapy. Discharge summary and prescriptions issued.",
          "Post-surgical recovery complete. Patient cleared for return to normal daily activities with 30-day follow-up.",
        ],
      };

      const conditionNotes = clinicalNotesByCondition[condition];
      const notes = conditionNotes[Math.floor(Math.random() * conditionNotes.length)];

      patientsToInsert.push({
        name: `${firstName} ${lastName}`,
        age,
        gender,
        doctorId: assignedDoctor._id,
        condition,
        contactNumber: `+1-555-${String(1000 + i).padStart(4, "0")}`,
        admissionDate,
        notes,
        createdAt: admissionDate,
      });
    }

    const createdPatients = await Patient.insertMany(patientsToInsert);
    console.log(`   Created ${createdPatients.length} patient records.`);

    console.log("\n============================================");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("============================================\n");
  } catch (error) {
    console.error("❌ Database seeding error:", error);
    if (!isAuto) process.exit(1);
  } finally {
    if (!isAuto) {
      await disconnectDatabase();
      process.exit(0);
    }
  }
};

// If run directly from CLI (npm run seed)
const isMain = process.argv[1]?.endsWith("seeder.ts") || process.argv[1]?.endsWith("seeder.js");
if (isMain) {
  seedDataset(false);
}
