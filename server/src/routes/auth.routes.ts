import { Router } from "express";
import { login, getMe, logout } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { loginSchema } from "../schemas/auth.schema.js";

const router = Router();

// Public route: Administrator login
router.post("/login", validate({ body: loginSchema }), login);

// Protected routes: Current user info & logout
router.get("/me", requireAuth, getMe);
router.post("/logout", requireAuth, logout);

export default router;
