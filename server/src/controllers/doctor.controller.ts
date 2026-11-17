import { Request, Response, NextFunction } from "express";
import * as doctorService from "../services/doctor.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Controller: List all doctors with pagination, search, and filters.
 * GET /api/v1/doctors
 */
export const listDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { doctors, meta } = await doctorService.getDoctors(req.query);
    new ApiResponse(200, "Doctors retrieved successfully", doctors, meta).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get single doctor profile by ID with full patient list.
 * GET /api/v1/doctors/:id
 */
export const getDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    new ApiResponse(200, "Doctor details fetched successfully", doctor).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Create a new doctor profile.
 * POST /api/v1/doctors
 */
export const createDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    new ApiResponse(201, "Doctor created successfully", doctor).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update existing doctor profile.
 * PATCH /api/v1/doctors/:id
 */
export const updateDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    new ApiResponse(200, "Doctor updated successfully", doctor).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Delete doctor and clean up assigned patients.
 * DELETE /api/v1/doctors/:id
 */
export const deleteDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await doctorService.deleteDoctor(req.params.id);
    new ApiResponse(200, "Doctor deleted successfully", result).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Fetch distinct specializations and hospital options.
 * GET /api/v1/doctors/options/filters
 */
export const getDoctorFilterOptions = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const options = await doctorService.getDoctorFilterOptions();
    new ApiResponse(200, "Filter options retrieved successfully", options).send(res);
  } catch (error) {
    next(error);
  }
};
