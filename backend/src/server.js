// First import your dependencies
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"; // Adjust path if needed
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
// Add this import at the top with your other imports
import rateLimit from 'express-rate-limit';
import compression from 'compression';

dotenv.config();
import cors from "cors";
// Add this after your other imports
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize app FIRST
const app = express();
const PORT = process.env.PORT || 5001;

// THEN add middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: "10mb" })); // allow up to 10 MB
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Add static file middleware AFTER app is initialized
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rate limiting middleware
// Add this before your routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all API routes
app.use('/api', apiLimiter);

// Compression middleware
// Add this middleware after your other middleware (before routes)
app.use(compression());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });