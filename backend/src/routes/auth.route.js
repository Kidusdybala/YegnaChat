import express from "express";
import { 
  Logout, 
  Login, 
  Signup, 
  changePassword, 
  verifyEmail, 
  resendVerificationCode, 
  forgotPassword, 
  resetPassword,
  editProfile 
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/logout", Logout);
router.post("/login", Login);
router.post("/signup", Signup);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationCode);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/editprofile", protectRoute, editProfile);
router.post("/change-password", protectRoute, changePassword);
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user:req.user});
});

// Debug endpoint to check cookies without auth
router.get("/debug-cookies", (req, res) => {
  res.status(200).json({ 
    success: true,
    cookies: req.cookies,
    headers: {
      'user-agent': req.headers['user-agent'],
      'cookie': req.headers.cookie
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for Render
router.get("/check", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "YegnaChat Backend is running!",
    timestamp: new Date().toISOString()
  });
});

export default router;