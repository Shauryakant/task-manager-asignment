import { Router } from "express";
import {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { loginValidator, registerValidator } from "../utils/validators.js";

const router = Router();

router.post("/register", registerValidator(), validate, register);
router.post("/login", loginValidator(), validate, login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getCurrentUser);

export default router;
