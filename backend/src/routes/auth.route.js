import express from "express";
import { Logout, Login, Signup } from "../controllers/auth.controller.js"; // Adjust path

const router = express.Router();

router.post("/logout", Logout);
router.post("/login", Login);
router.post("/signup", Signup);

export default router;