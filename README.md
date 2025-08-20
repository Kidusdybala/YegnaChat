# YegnaChat 🚀

YegnaChat is a **real-time Ethiopian messaging app** built with modern web technologies.  
It supports **chatting, video calling, media sharing**, and is optimized for speed and reliability.  

🌍 **Live Demo:** [yegna-chat.netlify.app](https://comfy-tiramisu-59c6aa.netlify.app/login)

---

## ✨ Features

- 🔥 Real-time messaging (Socket.IO)
- 🎥 Video calling support (WebRTC + Socket signaling)
- 📷 Media upload (Cloudinary integration)
- 📰 News API integration (with backend proxy)
- 🔒 Secure authentication & sessions
- 🚀 Deployed on **leapcell** & **Netlify**

---

## 🛠️ Tech Stack

**Frontend:** React, TailwindCSS, WebRTC  
**Backend:** Node.js, Express, Socket.IO  
**Database:** MongoDB (Mongoose)  
**Media Storage:** Cloudinary  
**Deployment:** Vercel + Netlify  

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/Kidusdybala/YegnaChat.git
cd YegnaChat
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Backend:

```bash
cd backend
npm install
npm start
```

---

## ⚙️ Environment Variables

Create a `.env` file in the **backend** folder and add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=your_cloudinary_api_url
NEWS_API_KEY=your_news_api_key
```

---

## 🚀 Deployment

- Frontend: Deployed on **Vercel**
- Backend: Can be deployed on **Heroku, Render, or Railway**
- Configured for **Netlify + Vercel**

---

## 👨‍💻 Author

**Kidus Adugna (Kidusdybala)**  
💡 Passionate about building real-time applications and Ethiopian tech solutions.

GitHub: [Kidusdybala](https://github.com/Kidusdybala)

---

## 📜 License

This project is licensed under the **MIT License**.
