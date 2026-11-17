import { Router } from "express";
import { getDashboardMetrics } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all analytics endpoints
router.use(requireAuth);

router.get("/dashboard", getDashboardMetrics);

export default router;
