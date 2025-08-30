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
import { createServer } from 'http';
import { Server } from 'socket.io';

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

// Create HTTP server
const server = createServer(app);

// Socket.IO event handlers
const onlineUsers = new Map();

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL, "https://yegnachat.vercel.app", "https://yegnachat-frontend.vercel.app"]
      : ["http://localhost:5173", "http://yegnachat.local:5173"],
    credentials: true
  }
});

// Make io instance available to the controllers
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// THEN add middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, "https://yegnachat.vercel.app", "https://yegnachat-frontend.vercel.app"]
    : ["http://localhost:5173", "http://yegnachat.local:5173"],
  credentials: true
}));

app.use(express.json({ limit: "10mb" })); // allow up to 10 MB
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Static file serving removed - using Cloudinary for media storage

// Rate limiting middleware
// Add this before your routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased limit
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

// Remove static file serving since frontend is on Vercel
// Backend only serves API routes

io.on('connection', (socket) => {
  
  // Add user to online users when they connect
  socket.on('addUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));

  });
  
  // Handle sending messages
  socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    
    try {
      // Get sender info for better notifications
      const User = (await import('./models/User.js')).default;
      const sender = await User.findById(senderId).select('fullName');
      const senderName = sender ? sender.fullName : 'Someone';
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('getMessage', {
          senderId,
          senderName,
          content,
          timestamp: new Date().toISOString()
        });

      }
    } catch (error) {
      console.error('Error in sendMessage socket handler:', error);
    }
  });
  
  // Handle typing indicators
  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing', { senderId });
    }
  });
  
  socket.on('stopTyping', ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('stopTyping');
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove user from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
        break;
      }
    }
  });
  
  // Handle video call signaling
  socket.on('callUser', ({ userToCall, signalData, from, name }) => {
    const receiverSocketId = onlineUsers.get(userToCall);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('callUser', {
        signal: signalData,
        from,
        name
      });
    }
  });

  socket.on('answerCall', (data) => {
    const callerSocketId = onlineUsers.get(data.to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('callAccepted', data.signal);
    }
  });

  socket.on('endCall', ({ userId }) => {
    const receiverSocketId = onlineUsers.get(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('callEnded');
    }
  });
});

connectDB()
  .then(() => {
    // Use 'server' instead of 'app' to listen
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Socket.IO is ready for connections`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });