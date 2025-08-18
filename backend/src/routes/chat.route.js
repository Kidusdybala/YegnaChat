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
  getMessagesBetweenUsers,
  getUnreadMessagesCount,
  markMessagesAsRead
} from "../controllers/chat.controller.js";
import multer from "multer";
import Chat from "../models/Chat.js";

// Configure multer for file uploads (memory storage for Cloudinary)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

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

// Test route to get all chats (for debugging)
router.get("/all-chats", protectRoute, async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('participants', 'fullName profilePic')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'fullName profilePic'
        }
      });
    
    res.status(200).json({ chats });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Add this new route for getting messages between users
router.get('/messages/user/:targetUserId', protectRoute, getMessagesBetweenUsers);

// Add route for getting unread messages count
router.get('/unread-count', protectRoute, getUnreadMessagesCount);

// Add route for marking messages as read
router.post('/mark-read/:chatId', protectRoute, markMessagesAsRead);

export default router;
