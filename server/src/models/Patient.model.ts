import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type PatientCondition = "Critical" | "Stable" | "Under Observation" | "Recovered";
export type PatientGender = "male" | "female" | "other";

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: PatientGender;
  doctorId: Types.ObjectId;
  condition: PatientCondition;
  contactNumber: string;
  admissionDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      minlength: [2, "Patient name must be at least 2 characters long"],
      maxlength: [120, "Patient name cannot exceed 120 characters"],
      index: true,
    },
    age: {
      type: Number,
      required: [true, "Patient age is required"],
      min: [0, "Age cannot be negative"],
      max: [150, "Age cannot exceed 150"],
    },
    gender: {
      type: String,
      required: [true, "Patient gender is required"],
      enum: {
        values: ["male", "female", "other"],
        message: "{VALUE} is not a valid gender option",
      },
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Attending Doctor reference is required"],
      index: true,
    },
    condition: {
      type: String,
      required: [true, "Clinical condition status is required"],
      enum: {
        values: ["Critical", "Stable", "Under Observation", "Recovered"],
        message: "{VALUE} is not a recognized clinical condition",
      },
      default: "Stable",
      index: true,
    },
    contactNumber: {
      type: String,
      required: [true, "Patient emergency contact number is required"],
      trim: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 1. Foreign Key Compound Index: Rapid lookup of patients assigned to a specific physician
patientSchema.index({ doctorId: 1, createdAt: -1 });

// 2. Condition & Date Filtering Compound Index
patientSchema.index({ condition: 1, createdAt: -1 });
patientSchema.index({ condition: 1, admissionDate: -1 });

// 3. Chronological Index
patientSchema.index({ createdAt: -1 });

// 4. Compound Text Search Index for Name and Contact Number
patientSchema.index(
  {
    name: "text",
    contactNumber: "text",
  },
  {
    name: "PatientTextIndex",
    weights: {
      name: 10,
      contactNumber: 5,
    },
  }
);

export const Patient: Model<IPatient> = mongoose.model<IPatient>("Patient", patientSchema);
