import express from "express";
import { login } from "../controllers/authController.js";
const router = express.Router();

// TESTING => POST /auth/login
router.post("/login", login);

export default router;
