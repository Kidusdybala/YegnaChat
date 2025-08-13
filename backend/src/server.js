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

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

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

// Socket.IO event handlers
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Add user to online users when they connect
  socket.on('addUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
    console.log('User added to online users:', userId);
  });
  
  // Handle sending messages
  socket.on('sendMessage', ({ senderId, receiverId, content }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getMessage', {
        senderId,
        content,
        timestamp: new Date().toISOString()
      });
      console.log(`Message sent to ${receiverId}`);
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
    console.log('A user disconnected');
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