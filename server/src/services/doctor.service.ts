import mongoose from "mongoose";
import { Doctor, IDoctor } from "../models/Doctor.model.js";
import { buildMongooseQuery, calculatePaginationMeta } from "../utils/queryBuilder.js";
import { ApiError } from "../utils/ApiError.js";
import { CreateDoctorInput, UpdateDoctorInput, DoctorQueryParams } from "../schemas/doctor.schema.js";

/**
 * Service: Retrieves a paginated list of doctors with search, filters,
 * and dynamically computed patient counts via aggregation.
 */
export const getDoctors = async (queryParams: DoctorQueryParams) => {
  const { filter, sort, skip, limit, page } = buildMongooseQuery<IDoctor>(queryParams, {
    searchFields: ["name", "specialization", "hospital"],
    allowedFilters: ["specialization", "hospital", "status"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  // Parallel execution of total count and paginated aggregation
  const [totalDocsResult, doctors] = await Promise.all([
    Doctor.countDocuments(filter),
    Doctor.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "patients",
          localField: "_id",
          foreignField: "doctorId",
          as: "patientList",
        },
      },
      {
        $addFields: {
          id: "$_id",
          patientCount: { $size: "$patientList" },
        },
      },
      {
        $project: {
          patientList: 0,
          __v: 0,
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ]),
  ]);

  const meta = calculatePaginationMeta(totalDocsResult, page, limit);

  return { doctors, meta };
};

/**
 * Service: Retrieves a single doctor by ID and populates all their assigned patients.
 */
export const getDoctorById = async (doctorId: string) => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw ApiError.badRequest("Invalid Doctor ID format");
  }

  const doctor = await Doctor.findById(doctorId).lean();

  if (!doctor) {
    throw ApiError.notFound("Doctor profile not found");
  }

  // Fetch associated patients directly using indexed query
  const patients = await mongoose.model("Patient").find({ doctorId }).sort({ createdAt: -1 }).lean();

  return {
    ...doctor,
    id: doctor._id,
    patients,
    patientCount: patients.length,
  };
};

/**
 * Service: Creates a new doctor profile.
 */
export const createDoctor = async (data: CreateDoctorInput) => {
  const existingDoctor = await Doctor.findOne({ email: data.email });
  if (existingDoctor) {
    throw ApiError.conflict(`A doctor with email '${data.email}' already exists.`);
  }

  const doctor = await Doctor.create(data);
  return doctor;
};

/**
 * Service: Updates an existing doctor profile.
 */
export const updateDoctor = async (doctorId: string, data: UpdateDoctorInput) => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw ApiError.badRequest("Invalid Doctor ID format");
  }

  if (data.email) {
    const existingDoctor = await Doctor.findOne({
      email: data.email,
      _id: { $ne: doctorId },
    });
    if (existingDoctor) {
      throw ApiError.conflict(`Email '${data.email}' is already in use by another physician.`);
    }
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, data, {
    new: true,
    runValidators: true,
  });

  if (!updatedDoctor) {
    throw ApiError.notFound("Doctor profile not found");
  }

  return updatedDoctor;
};

/**
 * Service: Deletes a doctor and safely cleans up or checks associated patient records.
 */
export const deleteDoctor = async (doctorId: string) => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw ApiError.badRequest("Invalid Doctor ID format");
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw ApiError.notFound("Doctor profile not found");
  }

  // Cascade delete associated patients or unassign them
  const patientModel = mongoose.model("Patient");
  const associatedPatientCount = await patientModel.countDocuments({ doctorId });

  if (associatedPatientCount > 0) {
    // Clean up dependent patient records to avoid orphaned documents
    await patientModel.deleteMany({ doctorId });
  }

  await doctor.deleteOne();

  return {
    deletedDoctorId: doctorId,
    removedPatientsCount: associatedPatientCount,
  };
};

/**
 * Service: Retrieves distinct specializations and hospital names for filter dropdowns.
 */
export const getDoctorFilterOptions = async () => {
  const [specializations, hospitals] = await Promise.all([
    Doctor.distinct("specialization"),
    Doctor.distinct("hospital"),
  ]);

  return {
    specializations: specializations.sort(),
    hospitals: hospitals.sort(),
  };
};
