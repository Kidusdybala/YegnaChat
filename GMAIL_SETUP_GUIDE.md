# Gmail Setup Guide for YegnaChat Email Service

## 🚨 Current Issue
**Error:** `Invalid login: Username and Password not accepted`

This means Gmail is rejecting the credentials because you need to use an **App Password** instead of your regular Gmail password.

## ✅ Step-by-Step Gmail Setup

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the setup process to enable 2FA (you'll need your phone)

### Step 2: Generate App Password
1. After 2FA is enabled, go back to **Security** settings
2. Under "Signing in to Google", click **App passwords**
3. Select **Mail** from the dropdown
4. Click **Generate**
5. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Replace the current password in your `.env` file:

```env
EMAIL_USER=sam684751@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # Use the App Password here (remove spaces)
```

**Important:** Remove the spaces from the App Password when copying to .env

### Step 4: Test the Configuration
After updating the .env file, restart your server and test:

```bash
# Restart the backend server
npm run dev
```

Then test the email:
```bash
curl -X POST http://localhost:5001/api/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'
```

## 🔧 Alternative: Use a Different Email Service

If you don't want to use Gmail, you can modify the email service to use other providers:

### Option 1: Outlook/Hotmail
```javascript
// In emailService.js
return nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### Option 2: Yahoo Mail
```javascript
// In emailService.js
return nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### Option 3: Custom SMTP
```javascript
// In emailService.js
return nodemailer.createTransport({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## 🧪 Testing Checklist

After setting up Gmail properly:

- [ ] 2FA enabled on Gmail account
- [ ] App Password generated
- [ ] .env file updated with App Password
- [ ] Backend server restarted
- [ ] Test email endpoint works
- [ ] Signup flow sends verification email
- [ ] Email verification works
- [ ] Forgot password sends email
- [ ] Password reset works

## 🚨 Security Notes

1. **Never commit** your App Password to version control
2. **Keep your .env file** in .gitignore
3. **Use different credentials** for production
4. **Monitor email usage** to prevent abuse
5. **Consider rate limiting** for production

## 📧 Expected Email Flow

Once working properly:

1. **Signup** → User receives beautiful verification email with 6-digit code
2. **Verification** → User enters code, account activated
3. **Forgot Password** → User receives reset link email
4. **Password Reset** → User clicks link, sets new password

## 🎯 Next Steps

1. **Set up Gmail App Password** following steps above
2. **Update .env file** with the App Password
3. **Restart backend server**
4. **Test signup flow** end-to-end
5. **Test forgot password flow**

The email system is fully implemented and ready - it just needs proper Gmail credentials!