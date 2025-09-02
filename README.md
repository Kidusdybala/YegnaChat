# YegnaChat 

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.9.3-green.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-black.svg)](https://socket.io/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)](https://vercel.com)
[![Render](https://img.shields.io/badge/Render-Deployed-blue.svg)](https://render.com)

🇪🇹 **A modern, real-time Ethiopian messaging application** built with the MERN stack. "YegnaChat" means "Our Chat" in Amharic, bringing Ethiopian communities together through seamless communication. Experience instant messaging, video calls, and file sharing with friends and family across Ethiopia and beyond.

##  About YegnaChat

YegnaChat was created with the Ethiopian diaspora and local communities in mind. Whether you're connecting with family in Addis Ababa, studying abroad, or building business relationships, YegnaChat provides a culturally-aware platform that respects Ethiopian values while delivering modern communication features.

###  Our Mission
- **Bridge Communities**: Connect Ethiopians worldwide
- **Preserve Culture**: Maintain Ethiopian identity in digital spaces
- **Empower Communication**: Provide accessible, reliable messaging
- **Support Local Businesses**: Help Ethiopian entrepreneurs connect with customers

##  Features

###  Core Features
- **Real-time Messaging**: Instant message delivery with Socket.IO
- **Video Calling**: High-quality video calls with WebRTC
- **File Sharing**: Share images and media files
- **User Authentication**: Secure login/signup with JWT
- **Friend System**: Add friends and manage connections
- **Online Status**: See when friends are online
- **Mobile Responsive**: Optimized for all devices

###  Screenshots

#### Chat Interface
![Chat Interface](frontend/public/Screenshot%202025-09-01%20225416.png)

![User Dashboard](frontend/public/Screenshot%202025-09-01%20232658.png)

#### chat page
![Mobile Experience](frontend/public/Screenshot%202025-09-03%20013817.png)

###  UI/UX Features
- **Modern Design**: Beautiful interface with DaisyUI and Tailwind CSS
- **Dark/Light Themes**: Theme switching capability
- **Mobile-First**: Responsive design for phones and tablets
- **Smooth Animations**: Fluid transitions and interactions
- **Touch-Friendly**: Optimized touch targets for mobile

###  Technical Features
- **Rate Limiting**: API protection with express-rate-limit
- **Compression**: Optimized response times
- **Cloud Storage**: Media files stored on Cloudinary
- **Email Notifications**: User verification and notifications
- **Real-time Updates**: Live chat and presence indicators

##  Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Media storage and optimization

### DevOps & Deployment
- **Render** - Backend deployment
- **Vercel** - Frontend deployment
- **MongoDB Atlas** - Cloud database
- **GitHub Actions** - CI/CD (optional)

##  Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kidusdybala/YegnaChat.git
   cd YegnaChat
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**

   **Backend (.env)**
   ```env
   NODE_ENV=development
   PORT=5001
   MONGO_URL=mongodb://localhost:27017/yegnachat
   JWT_SECRET=your_jwt_secret_here
   STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   FRONTEND_URL=http://localhost:5173
   ```

   **Frontend (.env)**
   ```env
   VITE_STREAM_API_KEY=your_stream_api_key
   VITE_NEWS_API_KEY=your_news_api_key
   VITE_API_URL=http://localhost:5001/api
   ```

4. **Start the application**
   ```bash
   # Start backend (from backend directory)
   npm run dev

   # Start frontend (from frontend directory)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

##  Mobile Development

### iOS Safari Support
- Optimized viewport handling for iOS devices
- Dynamic viewport height (`100dvh`) support
- Safe area insets for notched devices
- Touch-friendly interface elements

### Android Support
- Responsive design for all screen sizes
- Optimized touch targets (minimum 44px)
- Material Design inspired components

##  Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on git push

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment Variables

**Backend (Render)**
```env
NODE_ENV=production
PORT=10000
MONGO_URL=your_mongodb_atlas_url
JWT_SECRET=your_jwt_secret
STREAM_API_KEY=your_stream_key
STREAM_API_SECRET=your_stream_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Frontend (Vercel)**
```env
VITE_STREAM_API_KEY=your_stream_key
VITE_NEWS_API_KEY=your_news_key
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## 📁 Project Structure

```
YegnaChat/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── lib/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── Pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── lib/
│   ├── public/
│   ├── package.json
│   └── .env
├── .gitignore
├── package.json
├── README.md
└── DEPLOYMENT_GUIDE.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### Users
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/friends` - Get user friends
- `POST /api/user/friend-request` - Send friend request

### Chat
- `GET /api/chat` - Get user chats
- `POST /api/chat` - Create new chat
- `GET /api/chat/:chatId/messages` - Get chat messages
- `POST /api/chat/:chatId/messages` - Send message

##  Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check MongoDB is running (if local)
mongod

# Or update your MONGO_URL in .env
```

**Port Already in Use**
```bash
# Kill process using port 5001
lsof -ti:5001 | xargs kill -9

# Or change PORT in .env
```

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Deployment Issues

**Render Deployment Fails**
- Check build logs in Render dashboard
- Ensure all environment variables are set
- Verify Node.js version compatibility

**Vercel Deployment Fails**
- Check build logs in Vercel dashboard
- Ensure VITE_ prefixed environment variables
- Verify build commands in vercel.json

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- [DaisyUI](https://daisyui.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Socket.IO](https://socket.io/) for real-time communication
- [Cloudinary](https://cloudinary.com/) for media storage

## Support

For support, email sam684751@gmail.com or create an issue in this repository.
