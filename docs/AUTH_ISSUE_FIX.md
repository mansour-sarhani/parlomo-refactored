# 🔧 Authentication Issue - Quick Fix

## Problem

Getting "Invalid token" error when trying to register FCM token, even after logging in.

**Error in terminal:**

```
JsonWebTokenError: Invalid token
at verifyToken (src\lib\jwt.js:57:19)
```

## Root Cause

This happens when the `JWT_SECRET` in `.env.local` is missing or different from the one used to sign the JWT token during login.

When you added Firebase Admin credentials to `.env.local`, the `JWT_SECRET` might have been accidentally removed or changed.

---

## ✅ Solution (2 minutes)

### Step 1: Check Your .env.local

Your `.env.local` file should have **ALL** of these variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/parlomo-refactored

# JWT Secret (CRITICAL - Don't change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_USE_MOCK_API=false

# Storage
NEXT_PUBLIC_STORAGE_STRATEGY=local

# Firebase Client SDK (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCgDYqtcxl6XM5dd1B54BOc45tASXb-pc8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=parlomo-refactored.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=parlomo-refactored
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=parlomo-refactored.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=110844709095
NEXT_PUBLIC_FIREBASE_APP_ID=1:110844709095:web:26c3b39903bca7212afa42
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-MRBYVTENF9
NEXT_PUBLIC_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY_HERE

# Firebase Admin SDK (Server-side - Keep secret!)
FIREBASE_PROJECT_ID=parlomo-refactored
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@parlomo-refactored.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCu1WlMP9KtPwm2\nt7i1+c+0yq+G9dBuG2cmdW320L8/x2RnCp2mPrE9lmh+1NzK7rRdephMMx+7H45i\nbS4hJ0r/0ryegSfmGgNjBzMlrBQzjmvVWVEOtCL3C1+OIUPenlERr79ig23Wkh+e\n9m/4I22YILJ+uLi+xTFgp455QcQLijxP/Ohwn4NOvaeUwhYNikOmoGfLRDdVH2ul\nEP/XshHBlRrlMF8vbWQJQbElMbkBpnhbkJkv0MU3LnMunGpjqTL5O/aREvji/rmq\nZjjNrfuYlpAKEOprSAOWQTerznj4NmM9ZjVgNW0ooGyvKImNWVo4cYV0zyDavJV7\nDmqMPMPVAgMBAAECggEAPa94hnmiSJQMRlaOKk6otT4qLjD+yEqM22nlUYcXY1Zj\nm2OIegZ2nKc72TwbZtJP+wdtQr1q/afFof6pnvLxKE/fUwF45VvaRA9fQXR0cDhY\n3Z601b5C8+0kWs5r1tj++4GJwiVjFKjb1UdX/DHr0hf/QmzEajLDGDomL6w/kl4u\n3B+JovCR4pthb4dZJFtgQBjQJ75uZGTL/D2SCh9xBBPCbsM6IpF4CU0hkvmevJZM\nzp7S3Fw6SrIAkCy+bdUbCzi9q8as9F9Xx9IG5UVNzbI8Jjwtk8aXpQsKkavrBxDc\n6gLbhXtsUv6rSnsyG5TXBclbkqJ4GfIfN9mQ+9UWpQKBgQDltKdX23Q26At2XnmJ\nstO1sbsT6udvLqHd4dy0Rp9hS6SPWSyBV0Il1Kty7ZSDyWcbgnUiSyRGEWZA+Xf1\njXObs1ItXFNe9wc3PxmmUl8SCS0c3zaBk2hmA77CEx2d7dcMlb4cFVAmWoelhaCj\nvjfEp/uUNyZcS6ThyffNZp/PdwKBgQDC2MZwSFrLwzn4JBAC2lvO2dZHb/BN79+9\ngyasqi1eknkA38AlH4yslo3oZFQhQYkuZ7hIdV+wN1Of0mUM4fMyuHg370t3kTOd\nCyt2F3zj7MlF5yvOqnUbC+uQFP5CBncp++DEOoLEVkuMJqLIfrXawKZJUtlfmIir\nwQWwEwYSEwKBgFoTDCf8i0bYmV4ST/B6KmCuUCDQVW6Yx6p9XhFnPCpoAiCgJD6X\n2/1/trd7iGhhOshj0NDgzFmZixJhgPPOQw5ENC5LbPnpPnAgk0tQM62b4Y/Xy8Tl\n6+NNBqmN22hJkrGBqqnShbp0d4qlqsdq2O2JvbJyKd25X++WRlDKNFKjAoGBAK+Q\nOYU0fLM6zkHa5J5dd/my6FNn9kOTTqtov/E2STj8i5ERCwWoHs3nvifWNsPcVCn/\nBNotADI8N9o67hgkg0iBVLk5oWsz5yiqxtdaJIsOcPDOcfd+OZRMMk2ZzNtbDgZD\nUOweuHMGOn4m1egH2/4mNe69euWbABKaEnDrQz4HAoGBANocLIa8YNS9n22mN1Jo\n+LVAt4ei9hTUoEUb7ZP5ypy5EDxQ4s4nv9WOUal9Gjlj+w3EugiDFClSQ9o2n1dZ\nsr+y91oMgHKPlhyWEuSKJiv5dwG3I6wDcOGdG2UFuRZhkF9t0aRuYhki3FbudPix\nd7BZx6lU0CGg0UzHPX7TPMiu\n-----END PRIVATE KEY-----\n"
```

**⚠️ MOST IMPORTANT:** Make sure this line is present:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

---

### Step 2: Restart Dev Server

After verifying/fixing `.env.local`:

**Stop the server:**

- Press `Ctrl + C` in the terminal running `npm run dev`

**Start it again:**

```bash
npm run dev
```

**⚠️ CRITICAL:** Server MUST be restarted after any `.env.local` changes!

---

### Step 3: Clear Browser Data & Login Again

1. Open browser DevTools (F12)
2. Go to **Application** tab → **Cookies**
3. Delete all cookies for `localhost:3000`
4. Go to `/login`
5. Login: `admin@parlomo.com` / `Admin@123`

---

### Step 4: Use Debug Tool

Open: **http://localhost:3000/debug-auth**

1. Click **"Check Browser Cookies"**
    - Should show: `hasTokenCookie: true`
2. Click **"Test Auth API"**
    - Should show: `apiWorked: true`

If both are true, you're good to go!

---

## 🧪 Test Backend Notifications Again

Once debug tool shows everything working:

1. Go to: **http://localhost:3000/backend-notification-test**
2. Follow the 4 steps
3. Should work now! ✅

---

## 🐛 Still Not Working?

If you've done all the above and still getting errors, run this in terminal:

```bash
# Check if JWT_SECRET is being loaded
node -e "require('dotenv').config({ path: '.env.local' }); console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found ✅' : 'MISSING ❌')"
```

Should output: `JWT_SECRET: Found ✅`

If it says `MISSING ❌`, then `.env.local` is not in the right location or the variable name is wrong.

---

## 📋 Quick Checklist

- [ ] `.env.local` has `JWT_SECRET=...` line
- [ ] Dev server restarted after editing `.env.local`
- [ ] Browser cookies cleared
- [ ] Logged in fresh (admin@parlomo.com / Admin@123)
- [ ] Debug tool shows `hasTokenCookie: true`
- [ ] Debug tool shows `apiWorked: true`
- [ ] Backend notification test now works

---

**After fixing, let me know and we'll send that first backend push notification!** 🚀
