import express from "express";
import { Logout, Login, Signup } from "../controllers/auth.controller.js";
import { onboard } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/logout", Logout);
router.post("/login", Login);
router.post("/signup", Signup);
router.post("/onboarding", protectRoute ,onboard);
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user:req.user});
});
export default router;