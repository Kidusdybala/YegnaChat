# YegnaChat 💬

A modern, full-stack real-time chat application with video calling, friend management, and news integration. Built with React, Node.js, and Socket.io for seamless real-time communication.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://comfy-tiramisu-59c6aa.netlify.app)
[![Backend](https://img.shields.io/badge/API-Live-green?style=for-the-badge)](https://egnahat-buddykk7781-6o6zpy2c.leapcell.dev)

## ✨ Features

### 🔐 Authentication & Security
- **User Registration & Login** - Secure JWT-based authentication
- **Email Verification** - Email-based account verification system
- **Password Reset** - Forgot password functionality with secure reset codes
- **Profile Management** - Update profile information and change passwords
- **Rate Limiting** - Built-in protection against spam and abuse

### 💬 Real-time Communication
- **Instant Messaging** - Real-time chat with Socket.io
- **Video & Voice Calls** - WebRTC-based peer-to-peer calling
- **Online Status** - See when friends are online
- **Message Notifications** - Real-time notification system
- **Chat History** - Persistent message storage

### 👥 Social Features
- **Friend System** - Add, manage, and chat with friends
- **User Discovery** - Find and connect with other users
- **Profile Customization** - Personalized user profiles with avatar support

### 📰 Additional Features
- **News Integration** - Built-in news feed with API proxy
- **File Uploads** - Share images and files via Cloudinary integration
- **Dark/Light Theme** - Customizable UI themes
- **Responsive Design** - Mobile-friendly interface
- **Cross-platform** - Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **DaisyUI** - Beautiful component library for Tailwind
- **Socket.io Client** - Real-time bidirectional communication
- **React Query** - Powerful data fetching and caching
- **React Router** - Client-side routing
- **Simple Peer** - WebRTC library for video/voice calls
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **Socket.io** - Real-time engine for WebSocket communication
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token for secure authentication
- **Cloudinary** - Cloud-based image and file management
- **Nodemailer** - Email sending functionality
- **bcryptjs** - Password hashing and encryption

### DevOps & Deployment
- **netlify** - Frontend deployment platform
- **Leapcell** - Backend hosting and deployment
- **MongoDB Atlas** - Cloud database hosting
- **GitHub** - Version control and CI/CD integration

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** database (local or MongoDB Atlas)
- **Cloudinary** account for file uploads
- **Email service** for notifications (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/yegnachat.git
   cd yegnachat
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm run install-backend
   
   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. **Environment Setup**
   
   **Backend** - Create `backend/.env` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   NEWS_API_KEY=your_news_api_key
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

   **Frontend** - Create `frontend/.env.local` file:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

4. **Start the development servers**
   
   **Backend** (Terminal 1):
   ```bash
   npm run dev
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5001`

## 📁 Project Structure

```
yegnachat/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context providers
│   │   ├── utils/          # Utility functions
│   │   └── constants/      # App constants
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── lib/           # Utility libraries
│   │   └── server.js      # Main server file
│   └── package.json
├── DEPLOYMENT.md           # Deployment instructions
└── README.md              # Project documentation
```

## 🔧 Available Scripts

### Root Level
- `npm start` - Start the backend server
- `npm run dev` - Start backend in development mode
- `npm run install-backend` - Install backend dependencies

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm start` - Start production server
- `npm run dev` - Start with nodemon for development

## 🌐 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password
- `GET /api/users/search` - Search users

### Chat & Messaging
- `GET /api/chats` - Get user chats
- `GET /api/chats/:chatId/messages` - Get chat messages
- `POST /api/chats/:chatId/messages` - Send message
- `POST /api/chats` - Create new chat

### Real-time Events (Socket.io)
- `connection` - User connects
- `join_room` - Join chat room
- `send_message` - Send message
- `call_user` - Initiate video call
- `accept_call` - Accept incoming call
- `disconnect` - User disconnects

## 🚀 Deployment

### Quick Deployment

1. **Backend (Leapcell)**
   - Connect your GitHub repository to Leapcell
   - Set environment variables in the dashboard
   - Deploy automatically on push

2. **Frontend (netlify)**
   - Connect repository to netlify
   - Set `VITE_API_URL` environment variable
   - Deploy automatically on push

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features when applicable
- Update documentation for any API changes
- Ensure all tests pass before submitting PR

## 🐛 Known Issues & Troubleshooting

### Common Issues

**Socket.io Connection Problems**
- Ensure CORS is properly configured for your domain
- Check that WebSocket connections are allowed through firewalls
- Verify that both frontend and backend are using compatible Socket.io versions

**Video Call Issues**
- WebRTC requires HTTPS in production
- Check browser permissions for camera and microphone access
- Ensure proper STUN/TURN server configuration for peer-to-peer connections

**Authentication Problems**
- Verify JWT secret matches between development and production
- Check that cookies are being set with correct domain settings
- Ensure email service credentials are properly configured

For more troubleshooting help, see [SOCKET_TROUBLESHOOTING.md](SOCKET_TROUBLESHOOTING.md).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**YegnaChat Team**
- GitHub: [@kidusdybala](https://github.com/kidusdybala)
- Email: sam684751@gmail.com

## 🙏 Acknowledgments

- **Socket.io** - For real-time communication capabilities
- **React Team** - For the amazing frontend framework
- **MongoDB** - For the flexible NoSQL database
- **Cloudinary** - For image and file management services
- **All contributors** - For making this project better

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/your-username/yegnachat?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-username/yegnachat?style=social)
![GitHub issues](https://img.shields.io/github/issues/your-username/yegnachat)
![GitHub license](https://img.shields.io/github/license/your-username/yegnachat)

---

<div align="center">
  <p><strong>Built with effort for seamless communication</strong></p>
  <p>
    <a href="#yegnachat-">Back to Top</a> •
    <a href="https://comfy-tiramisu-59c6aa.netlify.app">Live Demo</a> •
    <a href="mailto:your-email@example.com">Contact</a>
  </p>
</div>
