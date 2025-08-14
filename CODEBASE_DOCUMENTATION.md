# YegnaChat - Complete Codebase Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Authentication System](#authentication-system)
4. [User Management](#user-management)
5. [Friends System](#friends-system)
6. [Chat System](#chat-system)
7. [Video Calling](#video-calling)
8. [File Upload System](#file-upload-system)
9. [Database Schema](#database-schema)
10. [API Endpoints](#api-endpoints)
11. [Frontend Components](#frontend-components)
12. [State Management](#state-management)
13. [Real-time Features](#real-time-features)
14. [Security Implementation](#security-implementation)
15. [Development Workflow](#development-workflow)

---

## 🎯 Project Overview

**YegnaChat** is a full-stack real-time chat application with video calling capabilities, built with modern web technologies.

### Core Features:
- User authentication (signup, login, email verification)
- Real-time messaging with Socket.IO
- Friend system (add, accept, decline friends)
- Video calling with Stream.io
- File sharing (images, documents)
- Profile management
- Responsive design

---

## 🏗️ Architecture & Tech Stack

### Backend Stack:
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Nodemailer** - Email sending
- **bcryptjs** - Password hashing

### Frontend Stack:
- **React** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **DaisyUI** - UI components
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **Socket.IO Client** - Real-time client
- **Stream Video React SDK** - Video calling

### Project Structure:
```
YegnaChat/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── lib/           # Utilities
│   │   └── uploads/       # File storage
│   └── server.js          # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # API & utilities
│   │   └── utils/        # Helper functions
│   └── index.html        # Entry HTML
└── README.md
```

---

## 🔐 Authentication System

### How It Works:
1. **Registration**: User provides email, password, full name
2. **Email Verification**: System sends verification code
3. **Login**: JWT token generation
4. **Protected Routes**: Middleware validates tokens

### Key Files:
- `backend/src/controllers/auth.controller.js` - Auth logic
- `backend/src/models/User.js` - User schema
- `backend/src/middleware/auth.middleware.js` - Token validation
- `frontend/src/lib/api.js` - API calls
- `frontend/src/hooks/useAuth.js` - Auth state management

### Code Flow:

#### Registration Process:
```javascript
// 1. Frontend sends registration data
const register = async (userData) => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  return response.json();
};

// 2. Backend validates and creates user
const signup = async (req, res) => {
  const { email, password, fullName } = req.body;
  
  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Create user
  const user = new User({
    email,
    password: hashedPassword,
    fullName
  });
  
  await user.save();
  
  // Send verification email
  await sendVerificationEmail(user);
  
  res.status(201).json({ message: "User created successfully" });
};
```

#### JWT Token System:
```javascript
// Token generation
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Token validation middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### Why This Matters:
- **Security**: JWT tokens are stateless and secure
- **Scalability**: No server-side session storage needed
- **User Experience**: Persistent login across browser sessions
- **Email Verification**: Prevents fake accounts

---

## 👤 User Management

### Features:
- Profile editing (name, bio, profile picture)
- Password change
- Account settings

### Key Files:
- `backend/src/controllers/auth.controller.js` - Profile operations
- `frontend/src/pages/EditProfile.jsx` - Profile editing UI
- `frontend/src/utils/imageUtils.js` - Image handling

### Code Flow:

#### Profile Update:
```javascript
// Frontend profile update
const updateProfile = async (profileData) => {
  const formData = new FormData();
  Object.keys(profileData).forEach(key => {
    formData.append(key, profileData[key]);
  });
  
  const response = await fetch('/api/auth/editprofile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};

// Backend profile update
const editProfile = async (req, res) => {
  const userId = req.userId; // From auth middleware
  const { fullName, bio } = req.body;
  
  // Validation
  if (!fullName || !bio) {
    return res.status(400).json({ message: "All fields are required" });
  }
  
  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    req.body,
    { new: true }
  );
  
  res.status(200).json({
    message: "User updated successfully",
    user: updatedUser
  });
};
```

### Why This Matters:
- **User Control**: Users can customize their profiles
- **Data Integrity**: Server-side validation ensures clean data
- **File Handling**: Multer middleware handles image uploads safely

---

## 👥 Friends System

### Features:
- Send friend requests
- Accept/decline requests
- View friends list
- Friend suggestions
- Search users

### Key Files:
- `backend/src/controllers/user.controller.js` - Friend operations
- `backend/src/models/FriendRequest.js` - Friend request schema
- `frontend/src/pages/FriendsPage.jsx` - Friends UI
- `frontend/src/hooks/useFriends.js` - Friends state

### Database Schema:
```javascript
// FriendRequest Model
const friendRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

// User Model (friends field)
const userSchema = new mongoose.Schema({
  // ... other fields
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
```

### Code Flow:

#### Send Friend Request:
```javascript
// Frontend
const sendFriendRequest = async (userId) => {
  const response = await fetch('/api/users/send-friend-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ receiverId: userId })
  });
  return response.json();
};

// Backend
const sendFriendRequest = async (req, res) => {
  const senderId = req.userId;
  const { receiverId } = req.body;
  
  // Check if request already exists
  const existingRequest = await FriendRequest.findOne({
    sender: senderId,
    receiver: receiverId,
    status: 'pending'
  });
  
  if (existingRequest) {
    return res.status(400).json({ message: 'Friend request already sent' });
  }
  
  // Create new request
  const friendRequest = new FriendRequest({
    sender: senderId,
    receiver: receiverId
  });
  
  await friendRequest.save();
  
  res.status(201).json({ message: 'Friend request sent successfully' });
};
```

#### Accept Friend Request:
```javascript
const acceptFriendRequest = async (req, res) => {
  const { requestId } = req.params;
  const userId = req.userId;
  
  // Find and update request
  const request = await FriendRequest.findById(requestId);
  if (!request || request.receiver.toString() !== userId) {
    return res.status(404).json({ message: 'Request not found' });
  }
  
  // Update request status
  request.status = 'accepted';
  await request.save();
  
  // Add to friends lists
  await User.findByIdAndUpdate(request.sender, {
    $addToSet: { friends: request.receiver }
  });
  
  await User.findByIdAndUpdate(request.receiver, {
    $addToSet: { friends: request.sender }
  });
  
  res.json({ message: 'Friend request accepted' });
};
```

### Why This Matters:
- **Social Features**: Core functionality for social interaction
- **Data Relationships**: Proper MongoDB relationships with references
- **State Management**: Complex state updates handled efficiently
- **User Experience**: Real-time updates with optimistic UI updates

---

## 💬 Chat System (Socket.IO)

### Features:
- Real-time messaging
- Message history
- Online status
- Typing indicators
- Message timestamps

### Key Files:
- `backend/src/models/Message.js` - Message schema
- `backend/src/controllers/message.controller.js` - Message operations
- `backend/src/server.js` - Socket.IO setup
- `frontend/src/pages/ChatPage.jsx` - Chat UI
- `frontend/src/hooks/useSocket.js` - Socket management

### Technology Choice:
**Socket.IO** is used for real-time messaging because it provides:
- Simple real-time bidirectional communication
- Automatic fallback to polling if WebSocket fails
- Built-in room management for user presence
- Lightweight for text-based messaging

### Database Schema:
```javascript
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  fileUrl: { type: String },
  fileName: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
```

### Code Flow:

#### Real-time Messaging:
```javascript
// Backend Socket.IO setup
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their room
  socket.on('join', (userId) => {
    socket.join(userId);
    socket.userId = userId;
  });
  
  // Handle new message
  socket.on('sendMessage', async (messageData) => {
    try {
      // Save message to database
      const message = new Message({
        sender: messageData.senderId,
        receiver: messageData.receiverId,
        content: messageData.content,
        messageType: messageData.messageType || 'text'
      });
      
      await message.save();
      
      // Populate sender info
      await message.populate('sender', 'fullName profilePic');
      
      // Send to receiver
      socket.to(messageData.receiverId).emit('newMessage', message);
      
      // Confirm to sender
      socket.emit('messageConfirmed', message);
      
    } catch (error) {
      socket.emit('messageError', { error: error.message });
    }
  });
  
  // Handle typing
  socket.on('typing', (data) => {
    socket.to(data.receiverId).emit('userTyping', {
      userId: data.senderId,
      isTyping: data.isTyping
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

#### Frontend Socket Integration:
```javascript
// useSocket hook
const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SERVER_URL);
    setSocket(newSocket);
    
    // Join user room
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      newSocket.emit('join', user._id);
    }
    
    // Listen for online users
    newSocket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });
    
    return () => newSocket.close();
  }, []);
  
  return { socket, onlineUsers };
};

// Chat component usage
const ChatPage = () => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
    if (!socket) return;
    
    // Listen for new messages
    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    return () => {
      socket.off('newMessage');
    };
  }, [socket]);
  
  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;
    
    socket.emit('sendMessage', {
      senderId: user._id,
      receiverId: selectedUser._id,
      content: newMessage,
      messageType: 'text'
    });
    
    setNewMessage('');
  };
  
  return (
    // Chat UI components
  );
};
```

### Why This Matters:
- **Real-time Communication**: Socket.IO enables instant messaging
- **Data Persistence**: Messages stored in MongoDB for history
- **User Experience**: Typing indicators and online status
- **Scalability**: Room-based messaging for efficient broadcasting

---

## 📹 Video Calling (Stream.io)

### Features:
- One-on-one video calls
- Audio/video controls
- Screen sharing
- Professional call quality

### Key Files:
- `frontend/src/pages/CallPage.jsx` - Video call UI
- `frontend/src/hooks/useStreamCall.js` - Stream.io integration
- Backend: Stream.io API keys in `.env` file

### Technology Choice:
**Stream.io** is used for video calling because it provides:
- Enterprise-grade WebRTC infrastructure
- Built-in call controls and UI components
- Reliable video/audio quality
- Screen sharing capabilities

### Code Flow:

#### Stream.io Setup:
```javascript
// Stream client setup
import { StreamVideoClient, User } from '@stream-io/video-react-sdk';

const useStreamCall = () => {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  
  useEffect(() => {
    const initializeStream = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Create Stream user
      const streamUser = {
        id: user._id,
        name: user.fullName,
        image: user.profilePic
      };
      
      // Get token from backend
      const response = await fetch('/api/stream/token', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { token: streamToken } = await response.json();
      
      // Initialize client
      const streamClient = new StreamVideoClient({
        apiKey: import.meta.env.VITE_STREAM_API_KEY,
        user: streamUser,
        token: streamToken
      });
      
      setClient(streamClient);
    };
    
    initializeStream();
  }, []);
  
  const startCall = async (callId, members) => {
    if (!client) return;
    
    const newCall = client.call('default', callId);
    await newCall.getOrCreate({
      data: {
        members: members.map(id => ({ user_id: id }))
      }
    });
    
    setCall(newCall);
    return newCall;
  };
  
  return { client, call, startCall };
};
```

#### Call Page Implementation:
```javascript
const CallPage = () => {
  const { client, call, startCall } = useStreamCall();
  const [isCallActive, setIsCallActive] = useState(false);
  const { userId } = useParams();
  
  useEffect(() => {
    if (client && userId) {
      const callId = `call_${Math.min(user._id, userId)}_${Math.max(user._id, userId)}`;
      startCall(callId, [user._id, userId]);
    }
  }, [client, userId]);
  
  if (!client || !call) {
    return <div>Loading call...</div>;
  }
  
  return (
    <StreamCall call={call}>
      <StreamTheme>
        <SpeakerLayout />
        <CallControls />
      </StreamTheme>
    </StreamCall>
  );
};
```

### Why This Matters:
- **Professional Quality**: Stream.io provides enterprise-grade video calling
- **Easy Integration**: SDK handles complex WebRTC implementation
- **Scalability**: Cloud-based infrastructure
- **Features**: Built-in controls, screen sharing, recording

---

## 📁 File Upload System

### Features:
- Profile picture upload
- Message attachments
- File type validation
- Size limits

### Key Files:
- `backend/src/middleware/upload.middleware.js` - Multer configuration
- `backend/src/controllers/upload.controller.js` - Upload logic
- `frontend/src/utils/imageUtils.js` - Image utilities

### Code Flow:

#### Multer Configuration:
```javascript
// upload.middleware.js
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
```

#### Upload Controller:
```javascript
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};
```

### Why This Matters:
- **Security**: File type and size validation prevents malicious uploads
- **Performance**: Proper file handling prevents server overload
- **User Experience**: Progress indicators and error handling
- **Storage**: Organized file structure for easy management

---

## 🗄️ Database Schema

### User Model:
```javascript
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 4 },
  bio: { type: String, default: "" },
  profilePic: { type: String, default: null },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null },
  passwordResetToken: { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Message Model:
```javascript
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  fileUrl: { type: String },
  fileName: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
```

### FriendRequest Model:
```javascript
const friendRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
```

### Why This Matters:
- **Data Integrity**: Proper schemas ensure consistent data
- **Relationships**: References enable complex queries
- **Indexing**: Optimized for common query patterns
- **Validation**: Built-in validation prevents bad data

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`):
```javascript
POST /signup          // User registration
POST /login           // User login
POST /verify-email    // Email verification
POST /forgot-password // Password reset request
POST /reset-password  // Password reset
PUT  /editprofile     // Update profile
POST /change-password // Change password
GET  /me             // Get current user
```

### User Routes (`/api/users`):
```javascript
GET  /search                    // Search users
GET  /friends                   // Get friends list
GET  /friend-requests          // Get friend requests
GET  /outgoing-requests        // Get sent requests
POST /send-friend-request      // Send friend request
PUT  /accept-friend-request/:id // Accept request
PUT  /decline-friend-request/:id // Decline request
DELETE /cancel-friend-request/:id // Cancel request
GET  /recommended              // Get suggested friends
```

### Message Routes (`/api/messages`):
```javascript
GET  /:userId          // Get messages with user
POST /send             // Send message
PUT  /mark-read/:id    // Mark message as read
GET  /conversations    // Get all conversations
```

### Upload Routes (`/api/upload`):
```javascript
POST /profile-pic      // Upload profile picture
POST /message-file     // Upload message attachment
```

### Why This Matters:
- **RESTful Design**: Predictable and intuitive API structure
- **Proper HTTP Methods**: Semantic meaning for different operations
- **Error Handling**: Consistent error responses
- **Authentication**: Protected routes require valid tokens

---

## 🎨 Frontend Components

### Component Structure:
```
components/
├── ui/                 # Basic UI components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   └── Loading.jsx
├── chat/              # Chat-specific components
│   ├── MessageList.jsx
│   ├── MessageInput.jsx
│   ├── ChatHeader.jsx
│   └── TypingIndicator.jsx
├── friends/           # Friends-specific components
│   ├── FriendCard.jsx
│   ├── FriendRequest.jsx
│   └── UserSearch.jsx
└── layout/            # Layout components
    ├── Navbar.jsx
    ├── Sidebar.jsx
    └── Layout.jsx
```

### Key Component Patterns:

#### Custom Hooks:
```javascript
// useAuth.js
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user
      verifyToken(token).then(setUser);
    }
    setLoading(false);
  }, []);
  
  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  return { user, login, logout, loading };
};
```

#### React Query Integration:
```javascript
// useFriends.js
const useFriends = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: userAPI.getFriendUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

// Component usage
const FriendsPage = () => {
  const { data: friends, isLoading, error } = useFriends();
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return (
    <div>
      {friends.map(friend => (
        <FriendCard key={friend._id} friend={friend} />
      ))}
    </div>
  );
};
```

### Why This Matters:
- **Reusability**: Components can be used across different pages
- **Maintainability**: Separation of concerns makes code easier to update
- **Performance**: React Query handles caching and background updates
- **Type Safety**: PropTypes or TypeScript ensure correct prop usage

---

## 🔄 State Management

### State Management Strategy:
1. **Local State**: useState for component-specific state
2. **Server State**: React Query for API data
3. **Global State**: Context API for user authentication
4. **Real-time State**: Socket.IO for live updates

### Implementation:

#### Auth Context:
```javascript
// AuthContext.js
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);
  
  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### React Query Setup:
```javascript
// main.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
);
```

### Why This Matters:
- **Performance**: Efficient state updates and caching
- **Developer Experience**: Predictable state management
- **User Experience**: Optimistic updates and background sync
- **Scalability**: Easy to add new features without state conflicts

---

## ⚡ Real-time Features

### Socket.IO Implementation:

#### Server Setup:
```javascript
// server.js
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  // User joins
  socket.on('join', (userId) => {
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    
    // Broadcast online users
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });
  
  // Handle messages
  socket.on('sendMessage', async (messageData) => {
    // Save to database
    const message = await saveMessage(messageData);
    
    // Send to receiver if online
    const receiverSocketId = onlineUsers.get(messageData.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', message);
    }
    
    // Confirm to sender
    socket.emit('messageConfirmed', message);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    }
  });
});
```

#### Client Integration:
```javascript
// useSocket.js
const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const newSocket = io(import.meta.env.VITE_SERVER_URL);
    setSocket(newSocket);
    
    // Join user room
    newSocket.emit('join', user._id);
    
    // Listen for events
    newSocket.on('onlineUsers', setOnlineUsers);
    newSocket.on('newMessage', (message) => {
      // Update message list
      queryClient.setQueryData(['messages', message.sender], (old) => {
        return [...(old || []), message];
      });
    });
    
    return () => {
      newSocket.close();
    };
  }, [user]);
  
  return { socket, onlineUsers };
};
```

### Why This Matters:
- **Real-time Communication**: Instant message delivery
- **User Presence**: Online/offline status
- **Better UX**: Live updates without page refresh
- **Engagement**: Users stay connected longer

---

## 🔒 Security Implementation

### Security Measures:

#### Password Security:
```javascript
// Password hashing
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Password validation
const validatePassword = (password) => {
  const minLength = 4;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return {
    isValid: password.length >= minLength,
    errors: [
      password.length < minLength && `Password must be at least ${minLength} characters`,
      // Add more validation rules as needed
    ].filter(Boolean)
  };
};
```

#### JWT Security:
```javascript
// Token generation with expiration
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Token validation middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

#### Input Validation:
```javascript
// Validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
};

// Usage example
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
  fullName: Joi.string().min(2).max(50).required()
});

router.post('/signup', validateInput(signupSchema), signup);
```

### Why This Matters:
- **Data Protection**: Prevents unauthorized access
- **User Trust**: Secure handling of sensitive information
- **Compliance**: Meets security standards
- **Attack Prevention**: Guards against common vulnerabilities

---

## 🚀 Development Workflow

### Getting Started:

#### 1. Environment Setup:
```bash
# Clone repository
git clone <repository-url>
cd YegnaChat

# Backend setup
cd backend
npm install
cp .env.example .env
# Configure environment variables

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
# Configure environment variables
```

#### 2. Environment Variables:

**Backend (.env):**
```env
PORT=5001
MONGO_URL=mongodb://localhost:27017/yegnachat
JWT_SECRET=your-jwt-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-secret
CLIENT_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_SERVER_URL=http://localhost:5001
VITE_STREAM_API_KEY=your-stream-api-key
```

#### 3. Development Commands:
```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm run dev

# Build for production
npm run build
```

### Code Organization Best Practices:

#### 1. File Naming:
- Components: PascalCase (e.g., `UserProfile.jsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useAuth.js`)
- Utilities: camelCase (e.g., `imageUtils.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.js`)

#### 2. Component Structure:
```javascript
// Component template
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.required,
  prop2: PropTypes.number
};

export default ComponentName;
```

#### 3. API Organization:
```javascript
// api.js structure
const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};

export const authAPI = {
  login: (credentials) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  signup: (userData) => apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  // ... other auth methods
};

export const userAPI = {
  // User-related API calls
};

export const messageAPI = {
  // Message-related API calls
};
```

### Why This Matters:
- **Consistency**: Standardized code structure
- **Maintainability**: Easy to find and update code
- **Collaboration**: Team members can easily understand codebase
- **Scalability**: Structure supports growth

---

## 📝 Summary

This documentation provides a comprehensive overview of the YegnaChat codebase. Each section explains:

1. **What** the feature does
2. **How** it's implemented
3. **Why** it's important
4. **Where** to find the relevant code

### Key Takeaways:

1. **Modular Architecture**: Each feature is self-contained with clear boundaries
2. **Real-time Communication**: Socket.IO enables instant messaging and presence
3. **Secure Implementation**: JWT tokens, password hashing, input validation
4. **Modern Tech Stack**: React, Node.js, MongoDB, Socket.IO, Stream.io
5. **Scalable Design**: Component-based frontend, RESTful API, efficient database queries

### Next Steps for Development:

1. **Study Each Section**: Understand how each feature works
2. **Experiment**: Make small changes to see how they affect the application
3. **Add Features**: Use existing patterns to implement new functionality
4. **Optimize**: Improve performance and user experience
5. **Test**: Ensure changes don't break existing functionality

This documentation should serve as your reference guide for understanding and extending the YegnaChat application. Each time you work on a feature, refer back to the relevant section to understand the context and implementation details.