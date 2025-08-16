import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendPasswordResetCodeEmail,
  generateVerificationCode, 
  generateResetToken 
} from "../services/emailService.js";

const router = express.Router();
export function Logout(req, res) {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production"
  }); 
  res.status(200).json({ message: "Logged out successfully" });
}

// Login Handler with JWT
export async function Login(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "invalid email or password" });
    }
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        message: "Please verify your email before logging in",
        emailNotVerified: true 
      });
    }
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password or email" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Set token in cookie 
    res.cookie("jwt", token, { 
      httpOnly: true, 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000 
    }); // 7 days in ms
    res.status(201).json({ success:true, user:user});
  } catch (error) {
    res.status(500).json({ message: "internal server", error: error.message });
  }
}
export async function Signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    // Validate required fields
    if (!password||!fullName) {
      return res.status(400).json({ message: "Password and fullname is required" });
    }
    if (!password||!email) {
      return res.status(400).json({ message: "Password and email is required" });
    }
    if (!fullName||!email) {
      return res.status(400).json({ message: "fullName and email is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (!fullName) {
      return res.status(400).json({ message: "Full name is required" });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password length validation
    if (password.length < 4 || password.length > 15) {
      return res.status(400).json({ message: "Password must be between 4 and 15 characters" });
    }

    // Check for existing user (unique email)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(409).json({ message: "Email already in use" });
      } else {
        // User exists but email not verified, update verification code
        const verificationCode = generateVerificationCode();
        existingUser.emailVerificationCode = verificationCode;
        existingUser.emailVerificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await existingUser.save();
        
        // Send verification email
        try {
          await sendVerificationEmail(email, verificationCode, existingUser.fullName);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          return res.status(500).json({ 
            message: "Account created but failed to send verification email. Please try resending the code.",
            emailError: true 
          });
        }
        
        return res.status(200).json({ 
          message: "Verification email sent. Please check your inbox.",
          emailSent: true 
        });
      }
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Create new user (not verified yet)
    const user = new User({
      email,
      password,
      fullName,
      profilePic: "", // Empty profile picture by default
      emailVerificationCode: verificationCode,
      emailVerificationExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      isEmailVerified: false,
    });
    
    await user.save();
    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode, fullName);
      res.status(201).json({ 
        message: "Account created! Please check your email for verification code.",
        emailSent: true 
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({ 
        message: "Account created but failed to send verification email. Please try resending the code.",
        emailError: true 
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
export async function editProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      fullName,
    } = req.body;
   
    if (!fullName) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
        ].filter(Boolean),
      });
    }
    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      req.body,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("edit profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Change Password Handler
export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }
    // Validate new password length
    if (newPassword.length < 4 || newPassword.length > 15) {
      return res.status(400).json({
        message: "New password must be between 4 and 15 characters long"
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Check if new password is different from current password
    const isSamePassword = await user.matchPassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from current password"
      });
    }
    // Update password (the pre-save middleware will hash it)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
// Email Verification Handler
export async function verifyEmail(req, res) {
  try {
    const { email, code } = req.body;
    // Validate required fields
    if (!email || !code) {
      return res.status(400).json({
        message: "Email and verification code are required"
      });
    }
    // Find user with matching email and verification code
    const user = await User.findOne({ 
      email,
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification code"
      });
    }

    // Verify the user
    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    
    // Try to upsert user to Stream now that they're verified
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePic || "",
      });
    } catch (error) {
      console.error(`Error upserting user ${user._id}:`, error);
    }

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully! You can now log in."
    });

  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Resend Verification Code Handler
export async function resendVerificationCode(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode, user.fullName);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ 
        message: "Failed to send verification email. Please try again.",
        emailError: true 
      });
    }

    return res.status(200).json({
      message: "Verification code sent successfully"
    });

  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Forgot Password Handler
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        message: "If an account with that email exists, a password reset link has been sent."
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        message: "Please verify your email first before resetting password"
      });
    }

    // Generate reset code
    const resetCode = generateVerificationCode();
    user.passwordResetCode = resetCode;
    user.passwordResetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Send password reset code email
    try {
      await sendPasswordResetCodeEmail(email, resetCode, user.fullName);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ 
        message: "Failed to send password reset email. Please try again.",
        emailError: true 
      });
    }

    return res.status(200).json({
      message: "If an account with that email exists, a password reset code has been sent."
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Reset Password Handler
export async function resetPassword(req, res) {
  try {
    const { email, code, password } = req.body;

    // Validate required fields
    if (!email || !code || !password) {
      return res.status(400).json({
        message: "Email, verification code, and new password are required"
      });
    }

    // Validate password length
    if (password.length < 4 || password.length > 15) {
      return res.status(400).json({
        message: "Password must be between 4 and 15 characters long"
      });
    }

    // Find user with valid reset code
    const user = await User.findOne({
      email,
      passwordResetCode: code,
      passwordResetCodeExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset code"
      });
    }

    // Update password
    user.password = password;
    user.passwordResetCode = null;
    user.passwordResetCodeExpires = null;

    await user.save();



    return res.status(200).json({
      message: "Password reset successfully! You can now log in with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

