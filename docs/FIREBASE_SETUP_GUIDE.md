# Firebase Cloud Messaging Setup Guide

## 📋 Overview

This guide will walk you through setting up Firebase Cloud Messaging (FCM) for the BeFix Admin Panel. Follow these steps carefully.

---

## ✅ Phase 1 Complete: Files Created

The following files have been created:

1. ✅ `src/lib/firebase/client.js` - Firebase client SDK initialization
2. ✅ `public/firebase-messaging-sw.js` - Service worker for background push notifications

---

## 🔑 Step 1: Generate VAPID Key (Web Push Certificate)

You need a VAPID key to send push notifications to web browsers. Follow these steps:

### Option A: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **befix-panel**
3. Click the **⚙️ Settings** icon → **Project Settings**
4. Go to the **Cloud Messaging** tab
5. Scroll down to **Web configuration** section
6. Under **Web Push certificates**, click **Generate key pair**
7. Copy the generated key (starts with `B...`)

### Option B: Using Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase projects:list
firebase apps:sdkconfig web YOUR_APP_ID
```

---

## 🔧 Step 2: Update Environment Variables

Add these variables to your `.env.local` file:

```env
# Firebase Client SDK (Public - Safe to expose in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCgDYqtcxl6XM5dd1B54BOc45tASXb-pc8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=befix-panel.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=befix-panel
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=befix-panel.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=110844709095
NEXT_PUBLIC_FIREBASE_APP_ID=1:110844709095:web:26c3b39903bca7212afa42
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-MRBYVTENF9

# VAPID Key - Replace with your generated key from Step 1
NEXT_PUBLIC_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY_HERE
```

**⚠️ IMPORTANT:** Replace `YOUR_VAPID_KEY_HERE` with the actual VAPID key you generated in Step 1.

---

## 🔒 Step 3: Setup Firebase Admin SDK (Backend)

For sending push notifications from the server, you need the Firebase Admin SDK credentials.

### Generate Service Account Key:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **befix-panel**
3. Click **⚙️ Settings** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate new private key**
6. Download the JSON file (keep it secure!)

### Add to Environment Variables:

Open the downloaded JSON file and extract these values:

```env
# Firebase Admin SDK (Server-side only - NEVER commit to git!)
FIREBASE_PROJECT_ID=befix-panel
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@befix-panel.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour actual private key here\n-----END PRIVATE KEY-----\n"
```

**⚠️ CRITICAL SECURITY:**
- NEVER commit the service account JSON file to git
- NEVER expose `FIREBASE_PRIVATE_KEY` to the client
- Keep these credentials secure

---

## 🌐 Step 4: Enable Firebase Cloud Messaging API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **befix-panel**
3. Go to **APIs & Services** → **Library**
4. Search for "Firebase Cloud Messaging API"
5. Click **Enable**

Alternatively, use this direct link (replace PROJECT_ID):
```
https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=befix-panel
```

---

## 🧪 Step 5: Test Firebase Configuration

After setting up environment variables, restart your dev server:

```bash
npm run dev
```

Open browser console and run this test:

```javascript
// Test Firebase initialization
import { requestNotificationPermission } from '@/lib/firebase/client';

const token = await requestNotificationPermission();
console.log('FCM Token:', token);
```

**Expected Result:**
- Browser shows notification permission popup
- If granted, you should see an FCM token in console
- Token looks like: `eXaMpLe_ToKeN_1234567890...` (very long string)

---

## 📝 Step 6: Update Service Worker (If Needed)

The service worker (`public/firebase-messaging-sw.js`) currently has hardcoded Firebase config values. This is fine for development, but for production, you may want to:

**Option A: Keep Hardcoded (Simple - Recommended for now)**
- Current approach works fine
- Firebase client config is public anyway (safe to expose)

**Option B: Dynamic Generation (Advanced - For later)**
- Generate the service worker file dynamically with env values
- Requires build-time script
- More complex but cleaner

For now, **Option A is recommended**. The hardcoded values in the service worker are already correct for your project.

---

## 🎯 What You Can Do Now

After completing these steps, you'll have:

✅ Firebase SDK initialized in your app  
✅ Service worker ready for background push  
✅ Ability to request notification permission  
✅ Ability to generate FCM tokens  
✅ Backend credentials ready for sending push notifications

---

## 🚀 Next Steps

Once environment variables are configured:

1. **Test notification permission request** (we'll create a test page)
2. **Implement token storage** (save FCM tokens to database)
3. **Build Notification UI** (dropdown in header)
4. **Create notification sender** (admin feature)
5. **Add Socket.io** (real-time updates for online users)

---

## 🐛 Troubleshooting

### "Messaging is not supported in this browser"
- Make sure you're using HTTPS (or localhost for dev)
- Check browser compatibility (Chrome, Firefox, Edge, Safari 16.4+)

### "VAPID key is invalid"
- Double-check the key was copied completely
- Make sure no extra spaces or line breaks
- Key should start with `B` and be ~80+ characters

### "Failed to get token"
- Check browser console for detailed error
- Ensure service worker is registered successfully
- Try clearing site data and retrying

### "Permission denied"
- User must manually grant permission again
- Clear site data to reset permission
- Or use browser settings to allow notifications

### Service worker not updating
```bash
# Clear service worker cache
# In browser DevTools:
# Application → Service Workers → Unregister
# Then hard refresh (Ctrl+Shift+R)
```

---

## 📚 Useful Resources

- [FCM Web Setup](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Service Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [Firebase Console](https://console.firebase.google.com)

---

**Status:** Phase 1 complete - Waiting for VAPID key configuration ⏳

Once you've added the VAPID key to `.env.local`, we can proceed to Phase 2!

