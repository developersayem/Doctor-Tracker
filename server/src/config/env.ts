import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

/**
 * Environment variables schema definition using Zod.
 * Validates critical runtime configurations at startup to prevent silent failures.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5001),
  MONGO_URI: z
    .string()
    .min(1, "MongoDB connection URI is required")
    .default(
      process.env.NODE_ENV === "test"
        ? "mongodb://127.0.0.1:27017/doctor_tracker_test"
        : "mongodb://127.0.0.1:27017/doctor_tracker"
    ),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long for cryptographic security")
    .default("default_development_jwt_secret_must_be_over_32_characters_long"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL").default("http://localhost:3000"),
  ADMIN_NAME: z.string().default("Super Administrator"),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email").default("admin@doctortracker.com"),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters").default("Admin@123456"),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables detected at startup:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }

  return parsed.data;
};

export const env = parseEnv();
export type EnvConfig = z.infer<typeof envSchema>;
