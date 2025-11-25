# 🔧 Firebase Notification System - Troubleshooting Guide

## Common Issues & Solutions

---

## Issue 1: 404 Errors on Notification Endpoints ✅ FIXED

### Symptoms

- Console shows: `GET http://localhost:3000/notifications/count 404 (Not Found)`
- Console shows: `POST http://localhost:3000/notifications/fcm-token 404 (Not Found)`
- Errors repeat every 30 seconds
- Bell icon may not show or work correctly

### Root Cause

The notification service layer was calling endpoints without the `/api` prefix:

- Called: `/notifications/count` ❌
- Should call: `/api/notifications/count` ✅

### Solution

**FIXED:** All 10 API calls in `src/services/notification.service.js` now include `/api` prefix to match the Next.js API route structure.

### Verification

After fix, console should show:

```
🚀 [API Request] GET /api/notifications/count
✅ [API Response] GET /api/notifications/count { count: 3 }
```

---

## Issue 2: "Invalid token" Error When Registering FCM Token ✅ FIXED

### Symptoms

- Error: `"Failed to register FCM token", details: "Invalid token"`
- Terminal shows: `JsonWebTokenError: Invalid token at verifyToken`
- Happens even after logging in successfully

### Root Cause

The API routes were incorrectly reading the authentication cookie:

**❌ WRONG (Original Code):**

```javascript
const token = getCookie("token", request); // Looking for wrong cookie name
```

**✅ CORRECT (Fixed):**

```javascript
const token = await getAuthToken(); // Reads 'parlomo_auth_token' cookie
```

### Why This Happened

1. Cookie is named `parlomo_auth_token` (defined in `src/constants/config.js`)
2. API routes were looking for a cookie named `'token'` (wrong name)
3. The `getCookie` function signature was also incorrect (missing `await`, wrong params)

### Files Fixed

All notification API routes were updated:

- ✅ `src/app/api/notifications/fcm-token/route.js`
- ✅ `src/app/api/notifications/route.js`
- ✅ `src/app/api/notifications/count/route.js`
- ✅ `src/app/api/notifications/[id]/route.js`
- ✅ `src/app/api/notifications/mark-all-read/route.js`
- ✅ `src/app/api/notifications/delete-all-read/route.js`

### How to Verify It's Fixed

1. Login to the app
2. Check browser DevTools → Application → Cookies
3. Should see `parlomo_auth_token` cookie (httpOnly)
4. Go to `/backend-notification-test`
5. Register FCM token → Should work! ✅

---

## Issue 2: "Firebase Admin not initialized"

### Symptoms

- Error in terminal: `❌ Error initializing Firebase Admin SDK`
- Can't send push notifications from backend
- API returns 500 error

### Root Cause

Missing or incorrect Firebase Admin SDK credentials in `.env.local`

### Solution

1. Check `.env.local` has these three variables:

```env
FIREBASE_PROJECT_ID=parlomo-refactored
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@parlomo-refactored.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

2. **IMPORTANT:** Private key must be wrapped in quotes and use `\n` for line breaks

3. Restart dev server after changing `.env.local`:

```bash
npm run dev
```

### How to Get Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/project/parlomo-refactored/settings/serviceaccounts/adminsdk)
2. Click "Generate new private key"
3. Download JSON file
4. Extract values and add to `.env.local`

---

## Issue 3: httpOnly Cookie Not Visible in JavaScript

### Symptoms

- Debug tool shows `hasTokenCookie: false`
- But cookie exists in browser DevTools → Application → Cookies
- User is logged in but JavaScript can't see token

### Why This Happens

**This is CORRECT behavior!** ✅

httpOnly cookies are designed to be invisible to JavaScript (security feature to prevent XSS attacks).

```javascript
// JavaScript (document.cookie)
// ❌ Cannot see httpOnly cookies
console.log(document.cookie); // Won't show parlomo_auth_token

// Browser DevTools (Application → Cookies)
// ✅ CAN see httpOnly cookies (for debugging)

// Server-side (Next.js cookies() API)
// ✅ CAN read httpOnly cookies
await getAuthToken(); // Works on server!
```

### Not a Bug - It's a Feature!

The cookie being invisible to JavaScript is by design. What matters is whether the **server** can read it, which it can!

### How to Verify

Use the debug API: `/api/debug/check-cookie`

- Should return: `"success": true, "message": "✅ Server can read and verify auth cookie!"`

---

## Issue 4: Duplicate Notifications in Dev Mode

### Symptoms

- Push notification appears twice when tab is in background
- Only happens in development mode

### Root Cause

Next.js dev mode with Fast Refresh and Hot Module Replacement (HMR) can register service worker multiple times.

### Solution

**This is normal in dev mode - NOT a bug!** ✅

**In production (`npm run build` + `npm start`):**

- Service worker registers once
- No duplicate notifications
- Everything works correctly

**For development:**

- You can ignore the duplicates
- Or test in production build locally
- Or disable HMR (not recommended)

---

## Issue 5: No Push Notification Received

### Symptoms

- API says `pushDelivered: true`
- But no notification appeared in browser

### Checklist

**1. Browser Permissions:**

- Check browser settings → Site settings → Notifications
- Should be "Allow" for localhost:3000

**2. Windows Notifications:**

- Windows Settings → System → Notifications
- Ensure notifications are enabled
- Check Focus Assist is not blocking

**3. Browser Notification Settings:**

- Chrome: chrome://settings/content/notifications
- Firefox: about:preferences#privacy (Notifications section)
- Edge: edge://settings/content/notifications

**4. Service Worker Active:**

- DevTools → Application → Service Workers
- Should show "activated and running"
- If stuck, click "Unregister" and try again

**5. FCM Token Valid:**

- Go to `/backend-notification-test`
- Check if token exists in Step 1
- If expired, request permission again

**6. Check Notification Center:**

- Windows: Click bell icon in system tray (bottom-right)
- Notifications might be there even if you missed the popup

---

## Issue 6: "FCM API not enabled" (404 Error)

### Symptoms

- Terminal shows: `❌ Error sending push notification: 404 Not Found`
- Or: `Requested entity was not found`

### Solution

Enable FCM API in Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=parlomo-refactred
2. Click **"Enable"**
3. Wait 1-2 minutes for propagation
4. Try sending notification again

**Note:** New Firebase projects need this API enabled manually.

---

## Issue 7: "Token has expired" Error

### Symptoms

- Error: `"Token has expired"`
- Happens after being logged in for a while

### Solution

This is normal JWT behavior. The token expires after 7 days (configurable in `.env.local`).

**User should:**

1. Logout
2. Login again
3. Fresh token will be issued

**To change expiry time:**

```env
JWT_EXPIRES_IN=30d  # Change to 30 days (or any value)
```

---

## Issue 8: VAPID Key Invalid

### Symptoms

- Error: `"VAPID key is invalid"`
- Or: `"Failed to get token"`

### Solution

**1. Verify VAPID key in `.env.local`:**

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BKagOny0KF_2pCJQ3m....moL0ewzQ8rZu
```

**2. Key should:**

- Start with `B`
- Be 80+ characters long
- Have no line breaks or spaces
- Be from the same Firebase project

**3. How to get/regenerate:**

- Firebase Console → Project Settings → Cloud Messaging
- Web Push certificates tab
- Generate key pair (or use existing)

---

## Debugging Tools Available

### 1. Debug Auth Page

**URL:** `/debug-auth`

**Features:**

- Check browser cookies (client-side)
- Test server-side cookie reading
- Manual login
- Comprehensive diagnostics

### 2. Firebase Test Page

**URL:** `/firebase-test`

**Features:**

- Request notification permission
- Get FCM token
- Listen for foreground messages
- Test service worker

### 3. Backend Notification Test

**URL:** `/backend-notification-test`

**Features:**

- Complete end-to-end testing
- Register token in database
- Send notification from backend
- Verify delivery status

### 4. API Debug Endpoint

**URL:** `/api/debug/check-cookie`

**Returns:**

- Whether server can read auth cookie
- Decoded token contents
- Verification status

---

## Quick Diagnostic Commands

### Check Service Worker Status

```javascript
// In browser console:
navigator.serviceWorker.getRegistration().then((reg) => {
    console.log("Service Worker:", reg ? "Registered ✅" : "Not Registered ❌");
    if (reg) console.log("State:", reg.active?.state);
});
```

### Check Notification Permission

```javascript
// In browser console:
console.log("Notification permission:", Notification.permission);
// Should be: "granted"
```

### Check FCM Token

```javascript
// In browser console (on app page):
import { getCurrentToken } from "@/lib/firebase/client";
const token = await getCurrentToken();
console.log("FCM Token:", token ? "Exists ✅" : "Missing ❌");
```

### Check Auth Cookie (Server-Side)

```javascript
// Visit: http://localhost:3000/api/debug/check-cookie
// Should return: { "success": true, "message": "✅ Server can read..." }
```

---

## Getting Help

If you've tried everything above and still having issues:

1. **Check server logs** (terminal running `npm run dev`)
2. **Check browser console** (F12 → Console tab)
3. **Use debug tools** (listed above)
4. **Check MongoDB** (verify data is being saved)
5. **Try incognito mode** (rules out extension conflicts)
6. **Try different browser** (Chrome, Firefox, Edge)

---

## Known Limitations

**Development Mode:**

- Duplicate notifications due to HMR
- Service worker may need manual refresh
- Hot reload can disconnect WebSocket (future Socket.io feature)

**Browser Support:**

- Safari < 16.4: No push notification support
- Some older browsers: Limited support

**Windows:**

- Focus Assist may block notifications
- Some antivirus software blocks push notifications

---

**Last Updated:** November 5, 2025  
**Status:** All issues documented and resolved ✅
