import mongoose from "mongoose";
import { Patient, IPatient } from "../models/Patient.model.js";
import { Doctor } from "../models/Doctor.model.js";
import { buildMongooseQuery, calculatePaginationMeta } from "../utils/queryBuilder.js";
import { ApiError } from "../utils/ApiError.js";
import {
  CreatePatientInput,
  UpdatePatientInput,
  PatientQueryParams,
  patientConditions,
  patientGenders,
} from "../schemas/patient.schema.js";

/**
 * Service: Retrieves a paginated list of patients with search, multi-field filters,
 * date ranges, and populated doctor metadata.
 */
export const getPatients = async (queryParams: PatientQueryParams) => {
  const { filter, sort, skip, limit, page } = buildMongooseQuery<IPatient>(queryParams, {
    searchFields: ["name", "contactNumber"],
    allowedFilters: ["doctorId", "condition", "gender"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  // Parallel execution of total count and paginated query
  const [totalDocsResult, patients] = await Promise.all([
    Patient.countDocuments(filter),
    Patient.find(filter)
      .populate("doctorId", "name specialization hospital phone email status")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const meta = calculatePaginationMeta(totalDocsResult, page, limit);

  return {
    patients: patients.map((p) => ({
      ...p,
      id: p._id,
      doctor: p.doctorId,
    })),
    meta,
  };
};

/**
 * Service: Retrieves a single patient by ID with populated doctor details.
 */
export const getPatientById = async (patientId: string) => {
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw ApiError.badRequest("Invalid Patient ID format");
  }

  const patient = await Patient.findById(patientId)
    .populate("doctorId", "name specialization hospital phone email status")
    .lean();

  if (!patient) {
    throw ApiError.notFound("Patient record not found");
  }

  return {
    ...patient,
    id: patient._id,
    doctor: patient.doctorId,
  };
};

/**
 * Service: Registers a new patient after validating the attending physician's existence.
 */
export const createPatient = async (data: CreatePatientInput) => {
  // Verify attending physician exists
  const doctor = await Doctor.findById(data.doctorId);
  if (!doctor) {
    throw ApiError.notFound(`Attending doctor with ID '${data.doctorId}' does not exist.`);
  }

  const patient = await Patient.create({
    ...data,
    admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
  });

  const populated = await patient.populate("doctorId", "name specialization hospital phone email status");
  return populated;
};

/**
 * Service: Updates an existing patient record.
 */
export const updatePatient = async (patientId: string, data: UpdatePatientInput) => {
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw ApiError.badRequest("Invalid Patient ID format");
  }

  // If reassigning to a different physician, verify the new physician exists
  if (data.doctorId) {
    const doctor = await Doctor.findById(data.doctorId);
    if (!doctor) {
      throw ApiError.notFound(`New attending doctor with ID '${data.doctorId}' does not exist.`);
    }
  }

  const updatePayload: Record<string, unknown> = { ...data };
  if (data.admissionDate) {
    updatePayload.admissionDate = new Date(data.admissionDate);
  }

  const updatedPatient = await Patient.findByIdAndUpdate(patientId, updatePayload, {
    new: true,
    runValidators: true,
  }).populate("doctorId", "name specialization hospital phone email status");

  if (!updatedPatient) {
    throw ApiError.notFound("Patient record not found");
  }

  return updatedPatient;
};

/**
 * Service: Deletes a patient record.
 */
export const deletePatient = async (patientId: string) => {
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw ApiError.badRequest("Invalid Patient ID format");
  }

  const patient = await Patient.findByIdAndDelete(patientId);
  if (!patient) {
    throw ApiError.notFound("Patient record not found");
  }

  return { deletedPatientId: patientId, name: patient.name };
};

/**
 * Service: Returns allowed clinical conditions and gender choices.
 */
export const getPatientFilterOptions = () => {
  return {
    conditions: [...patientConditions],
    genders: [...patientGenders],
  };
};
