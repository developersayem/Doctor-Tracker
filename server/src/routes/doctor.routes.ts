import { Router } from "express";
import * as doctorController from "../controllers/doctor.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorIdParamSchema,
  doctorQuerySchema,
} from "../schemas/doctor.schema.js";

const router = Router();

// Protect all doctor management endpoints with JWT authentication
router.use(requireAuth);

// Filter options lookup
router.get("/options/filters", doctorController.getDoctorFilterOptions);

// List and Create
router
  .route("/")
  .get(validate({ query: doctorQuerySchema }), doctorController.listDoctors)
  .post(validate({ body: createDoctorSchema }), doctorController.createDoctor);

// Single Doctor CRUD
router
  .route("/:id")
  .get(validate({ params: doctorIdParamSchema }), doctorController.getDoctor)
  .patch(
    validate({ params: doctorIdParamSchema, body: updateDoctorSchema }),
    doctorController.updateDoctor
  )
  .delete(validate({ params: doctorIdParamSchema }), doctorController.deleteDoctor);

export default router;
