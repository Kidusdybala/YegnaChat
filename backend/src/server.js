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

// Initialize Socket.IO with enhanced mobile support
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173", 
      "http://localhost:5174", 
      "http://localhost:3000",
      "http://yegnachat.local:5173",
      "https://yegna-chat.vercel.app",
      "https://yegna-chat-kzsckozdx-kidus-projects-41c41b33.vercel.app",
      "https://comfy-tiramisu-59c6aa.netlify.app",
      // Allow any Netlify subdomain for your deployments
      /^https:\/\/.*\.netlify\.app$/,
      // Allow any Vercel subdomain for your deployments
      /^https:\/\/.*\.vercel\.app$/
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "User-Agent"]
  },
  // Enable all transport methods for better compatibility
  transports: ['polling', 'websocket'],
  // Increase timeout for mobile networks
  pingTimeout: 60000,
  pingInterval: 25000,
  // Allow connections from mobile browsers
  allowEIO3: true,
  // Enable compression for better mobile performance
  compression: true
});

// Make io instance available to the controllers
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// CORS configuration with debug logging
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173", 
  "http://localhost:5174", 
  "http://localhost:3000",
  "http://yegnachat.local:5173",
  "https://yegna-chat.vercel.app",
  "https://yegna-chat-kzsckozdx-kidus-projects-41c41b33.vercel.app",
  "https://comfy-tiramisu-59c6aa.netlify.app"
].filter(Boolean);

console.log("🔧 CORS allowed origins:", allowedOrigins);
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL);

// THEN add middleware
app.use(cors({
  origin: allowedOrigins,
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

// Remove static file serving since frontend is on Vercel
// Backend only serves API routes

io.on('connection', (socket) => {
  console.log('🔌 New socket connection:', socket.id);
  console.log('🔌 Transport method:', socket.conn.transport.name);
  console.log('🔌 User agent:', socket.handshake.headers['user-agent']);
  console.log('🔌 Origin:', socket.handshake.headers.origin);
  console.log('🔌 Referer:', socket.handshake.headers.referer);
  
  // Detect if it's an iOS device
  const userAgent = socket.handshake.headers['user-agent'] || '';
  const isIOS = /iPhone|iPad|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  
  console.log(`🔌 Device detected: ${isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'}`);
  
  // Test handler to verify connection
  socket.on('test', (data) => {
    console.log('🧪 Test event received:', data, 'from socket:', socket.id);
    console.log('🧪 Current transport:', socket.conn.transport.name);
    console.log('🧪 Socket connected:', socket.connected);
  });

  // Add user to online users when they connect
  socket.on('addUser', (userId) => {
    console.log('👤 Adding user to online list:', userId, 'Socket ID:', socket.id);
    onlineUsers.set(userId, socket.id);
    console.log('👥 Current online users:', Array.from(onlineUsers.keys()));
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
    console.log('🔌 Socket disconnected:', socket.id);
    // Remove user from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        console.log('👤 Removing user from online list:', userId);
        onlineUsers.delete(userId);
        console.log('👥 Remaining online users:', Array.from(onlineUsers.keys()));
        io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
        break;
      }
    }
  });
  
  // Handle video call signaling
  socket.on('callUser', ({ userToCall, signalData, from, name }) => {
    console.log(`📞 Call request: ${name} (${from}) calling ${userToCall}`);
    const receiverSocketId = onlineUsers.get(userToCall);
    console.log(`📞 Receiver socket ID: ${receiverSocketId}`);
    console.log(`📞 Online users:`, Array.from(onlineUsers.keys()));
    
    if (receiverSocketId) {
      console.log(`📞 Forwarding call to ${userToCall}`);
      io.to(receiverSocketId).emit('callUser', {
        signal: signalData,
        from,
        name
      });
    } else {
      console.log(`📞 User ${userToCall} is not online`);
    }
  });

  socket.on('answerCall', (data) => {
    console.log(`📞 Call answered by user, sending to: ${data.to}`);
    const callerSocketId = onlineUsers.get(data.to);
    if (callerSocketId) {
      console.log(`📞 Forwarding answer to caller`);
      io.to(callerSocketId).emit('callAccepted', data.signal);
    } else {
      console.log(`📞 Caller ${data.to} is no longer online`);
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