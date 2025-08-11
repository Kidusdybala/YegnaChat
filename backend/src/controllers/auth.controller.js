import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";

const router = express.Router();
export function Logout(req, res) {
  res.clearCookie("jwt"); // Clear JWT cookie
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
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password or email" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET, // Ensure this is in .env
      { expiresIn: "7d" }
    );

    // Set token in cookie (optional, or send in response)
    res.cookie("jwt", token, { httpOnly: true, sameSite:"strict", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days in ms
    res.status(201).json({ success:true, user:user});
  } catch (error) {
    console.log("error in signup", error);
    res.status(500).json({ message: "internal server", error: error.message });
  }
}
export async function Signup(req, res) {
  // Remove nativeLanguage and learningLanguage from destructuring
  const { email, password, fullName, bio } = req.body;

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
      return res.status(409).json({ message: "Email already in use" });
    }

    // Create new user with empty profile picture
    const user = new User({
      email,
      password,
      fullName,
      bio: bio || "",
      profilePic: "", // Empty profile picture by default
    });
    
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: "", // Empty image for Stream
      });
      console.log(`user created successfully ${user.fullName}`);
    }
    catch (error) {
      console.error(`Error upserting user ${user._id}:`, error);
    };
    
    await user.save();
    console.log("User saved to MongoDB");

    // Generate JWT with 7-day expiration
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET, // Ensure this is in .env
      { expiresIn: "7d" }
    );

    res.cookie("jwt", token, { httpOnly: true, sameSite: "strict", secure:process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 });
    // Update the response to not include these fields
    res.status(201).json({ 
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        profilePic: user.profilePic,
      } 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
export async function onboard(req, res) {
  try {
    const userId = req.user.id;
    const {
      fullName,
      bio,
    } = req.body;

    // Update validation to not require language fields
    if (!fullName || !bio) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
        ].filter(Boolean),
      });
    }
    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(` User ${updatedUser.fullName} updated successfully: `);

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("editprofile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
// Remove this line at the end of the file (around line 195)