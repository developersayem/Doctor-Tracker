import { Router } from "express";
import * as patientController from "../controllers/patient.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createPatientSchema,
  updatePatientSchema,
  patientIdParamSchema,
  patientQuerySchema,
} from "../schemas/patient.schema.js";

const router = Router();

// Protect all patient management endpoints with JWT authentication
router.use(requireAuth);

// Filter choices
router.get("/options/filters", patientController.getPatientFilterOptions);

// List and Create
router
  .route("/")
  .get(validate({ query: patientQuerySchema }), patientController.listPatients)
  .post(validate({ body: createPatientSchema }), patientController.createPatient);

// Single Patient CRUD
router
  .route("/:id")
  .get(validate({ params: patientIdParamSchema }), patientController.getPatient)
  .patch(
    validate({ params: patientIdParamSchema, body: updatePatientSchema }),
    patientController.updatePatient
  )
  .delete(validate({ params: patientIdParamSchema }), patientController.deletePatient);

export default router;
