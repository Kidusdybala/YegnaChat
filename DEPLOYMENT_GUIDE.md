# YegnaChat Deployment Guide - Render (Free)

This guide will help you deploy your MERN chat application on Render for free, making it accessible from any device including phones.

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

First, make sure your code is in a Git repository:

```bash
# If not already initialized
git init
git add .
git commit -m "Initial commit for deployment"

# Push to GitHub (create a new repository on GitHub first)
git remote add origin https://github.com/YOUR_USERNAME/YegnaChat.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Render

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Connect your GitHub account**
3. **Create a new Web Service** and select your YegnaChat repository
4. **Render will automatically detect the `render.yaml` file** and create both services:
   - `yegnachat-backend` (Node.js API)
   - `yegnachat-frontend` (Static Site)

### 3. Configure Environment Variables

For the **backend service**, add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
MONGO_URL=mongodb+srv://Kidus:sy75bg03zmgoHh7P@cluster0.cwkhv7q.mongodb.net/YegnaChat?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=9199324f923f69461fc2871459565c0f21fffb279a1afb96792f2db391e0b9ec
STREAM_API_KEY=ecvfjq3tumma
STREAM_API_SECRET=wffh274pqkajzvj8ukxzwxha9tjjwxdug42vgknmr6jjgjfttq8ywarmmkux3qua
EMAIL_USER=sam684751@gmail.com
EMAIL_PASS=frvujmuwzorwlvwi
FRONTEND_URL=https://yegnachat-frontend.onrender.com
```

For the **frontend service**, add these environment variables:

```
VITE_STREAM_API_KEY=ecvfjq3tumma
VITE_NEWS_API_KEY=7241009d45be436d93973a917d5abc8f
VITE_API_URL=https://yegnachat-backend.onrender.com/api
```

### 4. Access Your Deployed App

After deployment (takes 5-10 minutes):

- **Frontend URL**: `https://yegnachat-frontend.onrender.com`
- **Backend API**: `https://yegnachat-backend.onrender.com`

## 📱 Mobile Access

Your app will be fully accessible on mobile devices:

1. **Share the frontend URL** with users
2. **Mobile browsers** will work perfectly
3. **PWA features** (if implemented) will allow "Add to Home Screen"

## 🔧 Important Notes

### Free Tier Limitations:
- **Sleep after 15 minutes** of inactivity
- **750 hours/month** of runtime (enough for most use cases)
- **Cold starts** may take 30-60 seconds when waking up

### Performance Tips:
- **Keep the app active** by setting up a simple ping service
- **Optimize images** and assets for faster loading
- **Use compression** (already configured in your backend)

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **CORS Errors**:
   - Verify frontend URL in backend CORS configuration
   - Check environment variables are set correctly

3. **Database Connection**:
   - Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
   - Verify MONGO_URL is correct

4. **Socket.IO Issues**:
   - Check that both frontend and backend URLs are correctly configured
   - Verify CORS settings for Socket.IO

## 🔄 Updates and Redeployment

To update your app:

1. **Make changes** to your code
2. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push
   ```
3. **Render will automatically redeploy** both services

## 📊 Monitoring

- **Render Dashboard**: Monitor logs, metrics, and deployment status
- **Health Check**: Backend has a health endpoint at `/api/auth/check`
- **Uptime Monitoring**: Consider using UptimeRobot for free monitoring

## 🎉 Success!

Once deployed, your YegnaChat application will be:
- ✅ Accessible worldwide
- ✅ Mobile-friendly
- ✅ Free to host
- ✅ Automatically updated on code changes
- ✅ Secure with HTTPS

Share your frontend URL with friends and family to test your chat application!

---

**Frontend URL**: https://yegnachat-frontend.onrender.com
**Backend API**: https://yegnachat-backend.onrender.com/api