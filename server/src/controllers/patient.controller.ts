import { Request, Response, NextFunction } from "express";
import * as patientService from "../services/patient.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Controller: List all patients with pagination, search, and condition/doctor filters.
 * GET /api/v1/patients
 */
export const listPatients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { patients, meta } = await patientService.getPatients(req.query);
    new ApiResponse(200, "Patients retrieved successfully", patients, meta).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Retrieve single patient record by ID.
 * GET /api/v1/patients/:id
 */
export const getPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patient = await patientService.getPatientById(req.params.id);
    new ApiResponse(200, "Patient record retrieved successfully", patient).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Register a new patient.
 * POST /api/v1/patients
 */
export const createPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patient = await patientService.createPatient(req.body);
    new ApiResponse(201, "Patient registered successfully", patient).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update existing patient record.
 * PATCH /api/v1/patients/:id
 */
export const updatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patient = await patientService.updatePatient(req.params.id, req.body);
    new ApiResponse(200, "Patient record updated successfully", patient).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Delete patient record.
 * DELETE /api/v1/patients/:id
 */
export const deletePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await patientService.deletePatient(req.params.id);
    new ApiResponse(200, "Patient record deleted successfully", result).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Retrieve available condition and gender filter choices.
 * GET /api/v1/patients/options/filters
 */
export const getPatientFilterOptions = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const options = patientService.getPatientFilterOptions();
    new ApiResponse(200, "Patient filter options retrieved successfully", options).send(res);
  } catch (error) {
    next(error);
  }
};
