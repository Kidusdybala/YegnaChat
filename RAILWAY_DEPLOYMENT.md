# 🚂 Deploy YegnaChat on Railway (100% Free)

Railway is completely free and doesn't require a credit card!

## 🚀 Quick Deployment Steps

### 1. Push Your Code to GitHub

```bash
# In your project directory
git add .
git commit -m "Ready for Railway deployment"
git push
```

### 2. Deploy on Railway

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub** (no card required!)
3. **Click "Deploy from GitHub repo"**
4. **Select your YegnaChat repository**
5. **Railway will automatically deploy!**

### 3. Add Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```
NODE_ENV=production
MONGO_URL=mongodb+srv://Kidus:sy75bg03zmgoHh7P@cluster0.cwkhv7q.mongodb.net/YegnaChat?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=9199324f923f69461fc2871459565c0f21fffb279a1afb96792f2db391e0b9ec
STREAM_API_KEY=ecvfjq3tumma
STREAM_API_SECRET=wffh274pqkajzvj8ukxzwxha9tjjwxdug42vgknmr6jjgjfttq8ywarmmkux3qua
EMAIL_USER=sam684751@gmail.com
EMAIL_PASS=frvujmuwzorwlvwi
PORT=3000
```

### 4. Your App is Live! 🎉

- **Your URL**: `https://your-app-name.up.railway.app`
- **Mobile accessible**: Share this URL with anyone
- **Auto-updates**: Pushes to GitHub auto-deploy

## 📱 Railway Benefits:

- ✅ **Completely FREE** - No card required
- ✅ **500 hours/month** free (plenty for testing)
- ✅ **Auto-deployment** from GitHub
- ✅ **Custom domains** available
- ✅ **Mobile-friendly** by default
- ✅ **HTTPS** included

## 🔄 Alternative: Cyclic (Also Free)

If Railway doesn't work, try **Cyclic**:

1. Go to [cyclic.sh](https://cyclic.sh)
2. Connect GitHub
3. Deploy your repo
4. Add same environment variables

## 🎯 Success!

Your chat app will be accessible worldwide on mobile and desktop!

---

**No credit cards, no hidden fees, just free hosting! 🚀**