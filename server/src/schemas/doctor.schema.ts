import { z } from "zod";

export const normalizeDoctorStatus = (val: unknown): unknown => {
  if (typeof val !== "string") return val;
  const trimmed = val.trim();
  if (trimmed === "") return undefined; // empty string → omit filter
  const clean = trimmed.toLowerCase().replace(/[\s_]/g, "-");
  if (clean === "active") return "active";
  if (clean === "on-leave" || clean === "leave" || clean === "inactive") return "on-leave";
  return trimmed;
};

/**
 * Validation schema for creating a new doctor record.
 */
export const createDoctorSchema = z.object({
  name: z
    .string({ required_error: "Doctor name is required" })
    .min(3, "Name must be at least 3 characters long")
    .max(120, "Name cannot exceed 120 characters")
    .trim(),
  specialization: z
    .string({ required_error: "Specialization is required" })
    .min(2, "Specialization must be at least 2 characters")
    .trim(),
  hospital: z
    .string()
    .trim()
    .optional(),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Phone number cannot contain letters, only numbers are allowed")
    .optional(),
  contactNumber: z
    .string()
    .trim()
    .min(7, "Contact number is too short")
    .max(20, "Contact number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Contact number cannot contain letters, only numbers are allowed")
    .optional(),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Email must include '@' and be a valid email address"),
  status: z.preprocess(normalizeDoctorStatus, z.enum(["active", "on-leave"])).default("active"),
  yearsOfExperience: z.coerce.number().int().min(0, "Experience cannot be negative").max(70, "Experience cannot exceed 70").optional(),
  maxCapacity: z.coerce.number().int().min(1, "Capacity must be at least 1").max(100, "Capacity cannot exceed 100").optional(),
  bio: z.string().trim().optional(),
});

/**
 * Validation schema for updating doctor metadata.
 */
export const updateDoctorSchema = createDoctorSchema.partial();

/**
 * Validation schema for URL route parameters with MongoDB ObjectId.
 */
export const doctorIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format. Expected 24-character hexadecimal ObjectId"),
});

/**
 * Validation schema for querying and filtering doctors.
 */
export const doctorQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  specialization: z.string().optional(),
  hospital: z.string().optional(),
  status: z.preprocess(normalizeDoctorStatus, z.enum(["active", "on-leave"]).optional()),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(["name", "specialization", "hospital", "createdAt", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type DoctorQueryParams = z.infer<typeof doctorQuerySchema>;
