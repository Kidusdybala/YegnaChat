# Deployment Steps

## Backend Deployment (Leap Cell)

1. Go to https://dashboard.leapcell.io/
2. Find your "yegnachat-backend" project
3. Go to Settings > Environment Variables
4. Add/Update these variables:
   ```
   FRONTEND_URL=https://comfy-tiramisu-59c6aa.netlify.app
   NODE_ENV=production
   PORT=5001
   MONGO_URL=mongodb+srv://Kidus:sy75bg03zmgoHh7P@cluster0.cwkhv7q.mongodb.net/YegnaChat?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=9199324f923f69461fc2871459565c0f21fffb279a1afb96792f2db391e0b9ec
   STREAM_API_KEY=ecvfjq3tumma
   STREAM_API_SECRET=wffh274pqkajzvj8ukxzwxha9tjjwxdug42vgknmr6jjgjfttq8ywarmmkux3qua
   EMAIL_USER=sam684751@gmail.com
   EMAIL_PASS=frvujmuwzorwlvwi
   ```
5. Save the environment variables
6. Trigger a new deployment (either through Git push or manual deployment)

## Frontend Deployment (Netlify)

1. Go to https://app.netlify.com/
2. Find your site "comfy-tiramisu-59c6aa"
3. Go to the "Deploys" tab
4. Drag and drop the entire `frontend/dist` folder to deploy
   - The dist folder is located at: `c:\Users\user\Downloads\YegnaChat\frontend\dist`

## Verification Steps

After both deployments:

1. **Check Backend**: Visit https://egnahat-kidusrash6706-0lwwbd1y.leapcell.dev/api/auth/me
   - Should return a 401 error (not 404) - this means the API is working

2. **Check Frontend**: Visit https://comfy-tiramisu-59c6aa.netlify.app/login
   - Try to login - CORS errors should be gone

3. **Check Browser Console**: 
   - Should see requests going to the correct Leap Cell URL
   - No more CORS errors

## Files Updated

- ✅ `frontend/.env.production` - Updated API URL to Leap Cell
- ✅ `backend/.env` - Added FRONTEND_URL and NODE_ENV
- ✅ `backend/src/server.js` - Added Netlify URL to CORS
- ✅ `backend/leapcell.json` - Added all environment variables