# 🧪 Quick Local Test

## Run Backend Locally (2 minutes):

1. **Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```

2. **Terminal 2 - Check:**
```bash
# Should show fixes working
curl http://localhost:5001/health
curl http://localhost:5001/socket.io/health
```

3. **Test with mobile:**
- Update `.env` temporarily: `VITE_API_URL=http://[YOUR-IP]:5001/api`
- Test on mobile using your computer's IP
- Should connect successfully with fixes

## Expected Results:
- ✅ No rate limiting errors in console
- ✅ Socket.io connects and stays connected  
- ✅ Online users > 0