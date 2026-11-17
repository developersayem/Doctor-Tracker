import { z } from "zod";

export const patientConditions = ["Critical", "Stable", "Under Observation", "Recovered"] as const;
export const patientGenders = ["male", "female", "other"] as const;

export const normalizePatientCondition = (val: unknown): unknown => {
  if (typeof val !== "string") return val;
  const clean = val.toLowerCase().replace(/_/g, " ").trim();
  if (clean.includes("critical") || clean.includes("acute") || clean.includes("arrest")) return "Critical";
  if (clean.includes("observation") || clean.includes("arrhythmia")) return "Under Observation";
  if (
    clean.includes("stable") ||
    clean.includes("hypertension") ||
    clean.includes("diabetes") ||
    clean.includes("pneumonia") ||
    clean.includes("fracture") ||
    clean.includes("routine")
  )
    return "Stable";
  if (clean.includes("recovered") || clean.includes("discharge")) return "Recovered";
  for (const c of patientConditions) {
    if (c.toLowerCase() === clean) return c;
  }
  return val;
};

export const normalizePatientGender = (val: unknown): unknown => {
  if (typeof val !== "string") return val;
  const clean = val.toLowerCase().trim();
  if (clean === "male" || clean === "female" || clean === "other") return clean;
  return val;
};

/**
 * Validation schema for registering a new patient.
 */
export const createPatientSchema = z.object({
  name: z
    .string({ required_error: "Patient name is required" })
    .min(2, "Name must be at least 2 characters long")
    .max(120, "Name cannot exceed 120 characters")
    .trim(),
  age: z
    .number({ required_error: "Patient age is required" })
    .int("Age must be an integer")
    .min(0, "Age cannot be negative")
    .max(150, "Age cannot exceed 150"),
  gender: z.preprocess(
    normalizePatientGender,
    z.enum(patientGenders, {
      required_error: "Gender is required",
      invalid_type_error: "Gender must be male, female, or other",
    })
  ),
  doctorId: z
    .string({ required_error: "Doctor ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format. Expected 24-character hexadecimal ObjectId"),
  condition: z.preprocess(
    normalizePatientCondition,
    z.enum(patientConditions, {
      required_error: "Clinical condition is required",
    })
  ).default("Stable"),
  contactNumber: z
    .string({ required_error: "Contact number is required" })
    .trim()
    .min(7, "Contact number is too short")
    .max(20, "Contact number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Contact number cannot contain letters, only numbers are allowed"),
  admissionDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Invalid date format"))
    .optional(),
});

/**
 * Validation schema for updating existing patient details.
 */
export const updatePatientSchema = createPatientSchema.partial();

/**
 * Validation schema for URL route parameters with MongoDB ObjectId.
 */
export const patientIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Patient ID format. Expected 24-character hexadecimal ObjectId"),
});

/**
 * Validation schema for querying and filtering patients.
 */
export const patientQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  doctorId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format")
    .optional(),
  condition: z.preprocess(normalizePatientCondition, z.enum(patientConditions)).optional(),
  gender: z.preprocess(normalizePatientGender, z.enum(patientGenders)).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dateField: z.enum(["createdAt", "admissionDate"]).optional(),
  sortBy: z.enum(["name", "age", "admissionDate", "createdAt", "condition"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientQueryParams = z.infer<typeof patientQuerySchema>;
