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

// Trust proxy for Leapcell deployment
app.set('trust proxy', true);

// Create HTTP server
const server = createServer(app);

// Socket.IO event handlers
const onlineUsers = new Map();

// CORS configuration with debug logging - MUST MATCH Socket.io CORS
const allowedOrigins = [
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
].filter(Boolean);

// Socket.io CORS function - same as Express CORS
const socketCorsFunction = (origin, callback) => {
  console.log("🔌 Socket.io CORS check for origin:", origin);
  
  // Allow requests with no origin (mobile apps, etc.)
  if (!origin) {
    console.log("🔌 No origin, allowing connection");
    return callback(null, true);
  }
  
  // Check against string origins
  const stringOrigins = allowedOrigins.filter(o => typeof o === 'string');
  if (stringOrigins.includes(origin)) {
    console.log("✅ Socket.io origin allowed (string match):", origin);
    return callback(null, true);
  }
  
  // Check against regex patterns
  const regexOrigins = allowedOrigins.filter(o => o instanceof RegExp);
  const regexMatch = regexOrigins.some(regex => regex.test(origin));
  if (regexMatch) {
    console.log("✅ Socket.io origin allowed (regex match):", origin);
    return callback(null, true);
  }
  
  console.log("❌ Socket.io origin rejected:", origin);
  callback(null, false);
};

// Global variable to hold Socket.IO instance
let io = null;

// Function to initialize Socket.IO after server starts
function initializeSocketIO(httpServer) {
  console.log("🔌 Initializing Socket.IO server...");
  console.log("🔌 HTTP Server instance:", !!httpServer);
  console.log("🔌 HTTP Server listening:", httpServer.listening);
  console.log("🔌 Socket CORS function:", !!socketCorsFunction);

  try {
    // Create Socket.IO server with the listening HTTP server
    io = new Server(httpServer, {
      cors: {
        origin: socketCorsFunction,
        credentials: true,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "User-Agent", "Origin", "Accept"]
      },
      // Hybrid transport with optimized settings for Leapcell proxy
      transports: ['polling', 'websocket'],
      // Allow upgrades but with better session handling
      allowUpgrades: true,
      upgradeTimeout: 30000, // Longer timeout for proxy environments
      // Session and connection persistence
      cookie: false, // Disable cookies that might cause session issues
      // Longer timeouts for proxy environments - prevent premature disconnections
      pingTimeout: 60000,
      pingInterval: 25000,
      // Additional settings for proxy compatibility
      maxHttpBufferSize: 1e6, // 1MB buffer
      httpCompression: false, // Disable compression that might confuse proxies
      // Simplified settings for deployment
      serveClient: false,
      // Enable all Engine.IO protocols
      allowEIO3: true,
      // Connection settings optimized for proxy environments
      connectTimeout: 60000,
      // Add path explicitly to avoid conflicts
      path: '/socket.io/',
      // Additional proxy-friendly settings
      destroyUpgrade: false, // Don't destroy connection on upgrade failure
      destroyUpgradeTimeout: 1000,
      // Force Engine.IO v4 for better compatibility
      allowEIO3: false
    });

    console.log("✅ Socket.IO server created successfully:", !!io);
    
    // Test Socket.IO initialization and engine setup
    setTimeout(() => {
      console.log("🔍 Socket.IO engine status:");
      console.log("🔌 Socket.IO engine available:", !!io.engine);
      console.log("🔌 Socket.IO sockets namespace:", !!io.sockets);
      console.log("🔌 Socket.IO engine listening:", io.engine?.listening);
      console.log("🔌 Socket.IO httpServer bound:", io.httpServer === httpServer);
      
      // Check if Socket.IO engine is properly handling routes
      if (io.engine) {
        console.log("🔍 Socket.IO engine details:");
        console.log("🔌 Engine transport:", io.engine.transport?.name);
        console.log("🔌 Engine readyState:", io.engine.readyState);
        console.log("🔌 Engine server attached:", !!io.engine.httpServer);
      }
      
      // Test if Socket.IO path is working
      console.log("🔍 Testing Socket.IO internal paths...");
      
    }, 500);

    return io;
    
  } catch (error) {
    console.error("❌ Socket.IO initialization error:", error);
    throw error;
  }
}

// io and onlineUsers will be set after Socket.IO initialization

console.log("🔧 CORS allowed origins:", allowedOrigins);
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL);

// Enhanced CORS configuration for both regular HTTP and Socket.io
app.use(cors({
  origin: function (origin, callback) {
    console.log("🌐 CORS check for origin:", origin);
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Check against string origins
    const stringOrigins = allowedOrigins.filter(o => typeof o === 'string');
    if (stringOrigins.includes(origin)) {
      console.log("✅ Origin allowed (string match):", origin);
      return callback(null, true);
    }
    
    // Check against regex patterns
    const regexOrigins = allowedOrigins.filter(o => o instanceof RegExp);
    const regexMatch = regexOrigins.some(regex => regex.test(origin));
    if (regexMatch) {
      console.log("✅ Origin allowed (regex match):", origin);
      return callback(null, true);
    }
    
    console.log("❌ Origin rejected:", origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "User-Agent", "Origin", "Accept"]
}));

app.use(express.json({ limit: "10mb" })); // allow up to 10 MB
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Add static file middleware AFTER app is initialized
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rate limiting middleware with proxy support
// Add this before your routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased limit
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for Socket.io requests
  skip: (req) => {
    return req.path.startsWith('/socket.io/');
  },
  // Use proper key generator for proxy environments
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Handle proxy headers properly
  validate: {
    xForwardedForHeader: false, // Disable validation that was causing errors
  }
});

// Apply to all API routes
app.use('/api', apiLimiter);

// Compression middleware
// Add this middleware after your other middleware (before routes)
app.use(compression());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    socketio: "enabled",
    cors: allowedOrigins.length + " origins configured"
  });
});

// Socket.IO health check endpoint - moved to avoid conflict with Socket.IO paths
app.get("/api/socket-health", (req, res) => {
  try {
    const socketStatus = {
      status: "ok",
      transports: ['polling', 'websocket'],
      cors: "configured",
      timestamp: new Date().toISOString(),
      onlineUsers: Array.from(onlineUsers.keys()).length,
      socketServer: io ? "initialized" : "not initialized",
      port: PORT,
      environment: process.env.NODE_ENV,
      frontendUrl: process.env.FRONTEND_URL
    };
    
    // Additional Socket.IO specific checks
    if (io) {
      socketStatus.socketEngine = io.engine ? "available" : "not available";
      socketStatus.socketListeners = Object.keys(io._events || {});
      socketStatus.engineListening = io.engine ? io.engine.listening : "no engine";
      socketStatus.serverAttached = !!io.httpServer;
    }
    
    console.log("🔍 Socket health check requested:", socketStatus);
    res.json(socketStatus);
  } catch (error) {
    console.error("❌ Socket health check error:", error);
    res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Alternative debug endpoint that bypasses Socket.IO completely
app.get("/api/debug-socket", (req, res) => {
  res.json({
    status: "debug-ok",
    message: "Direct endpoint working",
    timestamp: new Date().toISOString(),
    socketInitialized: !!io,
    onlineUsersCount: onlineUsers.size,
    port: PORT,
    env: process.env.NODE_ENV,
    socketEngineReady: !!io?.engine,
    socketEngineListening: io?.engine?.listening
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

// Remove static file serving since frontend is on Vercel
// Backend only serves API routes

// Socket.IO event handlers will be set up after initialization

connectDB()
  .then(() => {
    // Start the HTTP server first
    const httpServer = server.listen(PORT, () => {
      console.log(`✅ HTTP Server is running on port ${PORT}`);
      
      try {
        // Initialize Socket.IO AFTER server is listening
        io = initializeSocketIO(httpServer);
        
        // Make io instance available to the controllers after initialization
        app.set('io', io);
        app.set('onlineUsers', onlineUsers);
        
        // Set up Socket.IO event handlers after initialization
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
        
        console.log(`✅ Socket.IO is ready for connections`);
        
        // Verification after everything is set up
        setTimeout(() => {
          console.log("🔍 Final verification:");
          console.log("🔌 HTTP Server listening:", httpServer.listening);
          console.log("🔌 Socket.IO instance ready:", !!io);
          console.log("🔌 Socket.IO engine ready:", !!io?.engine);
          console.log("🔌 Socket.IO engine listening:", io?.engine?.listening);
          console.log("🔌 Socket.IO bound to server:", io?.httpServer === httpServer);
          console.log("🔌 Online users map initialized:", !!onlineUsers);
        }, 1000);
        
      } catch (socketError) {
        console.error("❌ Socket.IO setup error:", socketError);
        // Server will still work for HTTP requests
      }
    });
    
    // Store server reference for debugging
    global.httpServer = httpServer;
  })
  .catch((error) => {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  });