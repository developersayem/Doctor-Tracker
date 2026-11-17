import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  status: "active" | "on-leave";
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [120, "Name cannot exceed 120 characters"],
      index: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
      index: true,
    },
    hospital: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Contact phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    status: {
      type: String,
      enum: ["active", "on-leave"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to link assigned patients without duplicating data
doctorSchema.virtual("patients", {
  ref: "Patient",
  localField: "_id",
  foreignField: "doctorId",
});

// 1. Compound Text Index for rapid multi-field fuzzy search
doctorSchema.index(
  {
    name: "text",
    specialization: "text",
    hospital: "text",
  },
  {
    weights: {
      name: 10,
      specialization: 5,
      hospital: 3,
    },
    name: "DoctorTextIndex",
  }
);

// 2. Compound Index for filtered and sorted directory queries
doctorSchema.index({ specialization: 1, status: 1, createdAt: -1 });

// 3. Single-field index for chronology
doctorSchema.index({ createdAt: -1 });

export const Doctor: Model<IDoctor> = mongoose.model<IDoctor>("Doctor", doctorSchema);
