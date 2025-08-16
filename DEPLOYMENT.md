# YegnaChat Deployment Guide

## Backend Deployment (Leapcell)

1. **Prepare your backend:**
   - Install missing dependencies: `npm install compression express-rate-limit`
   - Make sure all environment variables are set

2. **Deploy to Leapcell:**
   - Create account on Leapcell
   - Connect your GitHub repository
   - Set environment variables in Leapcell dashboard:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `EMAIL_USER`
     - `EMAIL_PASS`
     - `STREAM_API_KEY` (optional)
     - `STREAM_API_SECRET` (optional)
     - `NODE_ENV=production`
     - `FRONTEND_URL` (will be your Vercel URL)

3. **Get your backend URL** (something like `https://your-app.leapcell.dev`)

## Frontend Deployment (Vercel)

1. **Update frontend environment:**
   - Create `.env.local` file in frontend directory
   - Set `VITE_API_URL=https://your-backend.leapcell.dev/api`

2. **Deploy to Vercel:**
   - Install Vercel CLI: `npm i -g vercel`
   - Run `vercel` in frontend directory
   - Follow the prompts
   - Set environment variables in Vercel dashboard

3. **Update backend with frontend URL:**
   - Go back to Leapcell dashboard
   - Update `FRONTEND_URL` environment variable with your Vercel URL

## Important Notes

- Make sure both deployments are using HTTPS
- The cookie settings are configured for cross-origin requests
- CORS is set up to allow your frontend domain

## Testing

After deployment:
1. Try logging in from your deployed frontend
2. Check browser network tab for any CORS errors
3. Verify cookies are being set and sent properly