import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getStreamToken,
  createOrGetStreamChat,
  uploadMedia,
  createOrGetChat,
  getChatMessages,
  sendMessage,
  getUserChats,
  getMessagesBetweenUsers
} from "../controllers/chat.controller.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Stream token route
router.get("/token", protectRoute, getStreamToken);

// Stream chat routes
router.post("/stream-chat", protectRoute, createOrGetStreamChat);
router.post("/upload", protectRoute, upload.single('file'), uploadMedia);

// Simple chat routes (fallback)
router.post("/simple-chat", protectRoute, createOrGetChat);
router.get("/chats", protectRoute, getUserChats);
router.get("/messages/:chatId", protectRoute, getChatMessages);
router.post("/messages/:chatId", protectRoute, sendMessage);

// Add this new route for getting messages between users
router.get('/messages/user/:targetUserId', protectRoute, getMessagesBetweenUsers);

export default router;
