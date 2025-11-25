# 🧪 Backend Notification Testing Guide

## ✅ Pre-Test Checklist

Before testing, ensure:
- [x] Firebase Admin SDK JSON downloaded
- [x] JSON file added to `.gitignore` ✅ (Done!)
- [x] `.env.local` updated with Firebase Admin credentials ✅ (Done!)
- [x] Dev server restarted (`npm run dev`) ✅ (Running!)

---

## 🎯 Testing Steps (Browser-Based - No Postman!)

### Step 1: Access the Test Page

1. Open your browser: **http://localhost:3000/backend-notification-test**
2. Make sure you're logged in as admin (admin@befix.com / Admin@123)
3. You'll see a step-by-step guided interface

---

### Step 2: Request Permission & Get Token

1. Click **"Request Notification Permission"**
2. Browser will show permission popup → Click **"Allow"**
3. You'll see: ✅ FCM Token Generated
4. Your token will be displayed on the page

**Expected Result:**
- Status shows: FCM Token: ✅ Generated
- Token appears in a gray box

---

### Step 3: Register Token in Database

1. Click **"Register Token in MongoDB"**
2. This saves your FCM token to your user document

**What Happens Behind the Scenes:**
```javascript
POST /api/notifications/fcm-token
{
  "token": "your-fcm-token...",
  "device": "web",
  "browser": "Chrome"
}
```

**Expected Result:**
- Test result shows: ✅ Token Registered
- Status shows: Token Registered in DB: ✅ Yes
- Toast: "Token registered in database!"

**Verify in MongoDB:**
```javascript
// Open MongoDB Compass or shell
db.users.findOne({ email: "admin@befix.com" }, { fcmTokens: 1 })

// Should show:
{
  fcmTokens: [
    {
      token: "your-long-fcm-token",
      device: "web",
      browser: "Chrome",
      createdAt: ISODate(...),
      lastUsed: ISODate(...)
    }
  ]
}
```

---

### Step 4: Send Notification from Backend

1. Fill in the form:
   - **Title:** "Backend Test Notification"
   - **Message:** "This was sent from the server!"
   - **Type:** Success
   - **Action URL:** /notifications (optional)
   - **Action Label:** View All (optional)

2. Click **"🚀 Send Notification from Backend"**

**What Happens Behind the Scenes:**
```javascript
POST /api/notifications
{
  "recipientType": "single",
  "recipients": "your-user-id",
  "title": "Backend Test Notification",
  "message": "This was sent from the server!",
  "type": "success",
  "actionUrl": "/notifications",
  "actionLabel": "View All"
}

// Backend will:
// 1. Create notification in MongoDB (notifications collection)
// 2. Fetch your FCM tokens from user.fcmTokens
// 3. Send push notification via Firebase Admin SDK
// 4. Update notification.deliveryStatus.pushDelivered
```

**Expected Result:**
- Test result shows: ✅ Notification Sent!
- **Browser shows push notification** (even if page is in background!)
- Click notification → Opens /notifications page

---

### Step 5: Verify Database

1. Click **"Fetch My Notifications"**
   - Shows total notification count
   - Console logs recent 5 notifications

2. Click **"Get Unread Count"**
   - Shows how many unread notifications you have

**Verify in MongoDB:**
```javascript
// Check notifications collection
db.notifications.find({ recipient: ObjectId("your-user-id") }).pretty()

// Should show:
{
  _id: ObjectId(...),
  recipient: ObjectId(...),
  sender: ObjectId(...), // or null for system
  type: "success",
  title: "Backend Test Notification",
  message: "This was sent from the server!",
  actionUrl: "/notifications",
  actionLabel: "View All",
  read: false,
  readAt: null,
  deliveryStatus: {
    socketDelivered: false,
    pushDelivered: true,  // ← Should be true!
    pushDeliveredAt: ISODate(...),
    pushError: null
  },
  createdAt: ISODate(...),
  updatedAt: ISODate(...)
}
```

---

## 🎉 Success Criteria

You've successfully set up the backend if:

✅ **Step 1:** Permission granted, token generated  
✅ **Step 2:** Token saved in MongoDB user.fcmTokens  
✅ **Step 3:** Notification created in MongoDB notifications collection  
✅ **Step 4:** deliveryStatus.pushDelivered = true  
✅ **Step 5:** **Push notification appeared in browser!**  

---

## 🐛 Troubleshooting

### "Firebase Admin not initialized"

**Check Server Logs** (terminal running `npm run dev`):
```
❌ Error initializing Firebase Admin SDK: ...
```

**Solution:**
1. Verify `.env.local` has all three variables:
   - `FIREBASE_PROJECT_ID=befix-panel`
   - `FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@befix-panel.iam.gserviceaccount.com`
   - `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."`

2. Make sure private key is wrapped in quotes and has `\n` for line breaks
3. Restart dev server: `npm run dev`

### "Failed to send push notification"

**Check Server Logs:**
```
❌ Error sending push notification: 404 Not Found
```

**Solution: Enable FCM API**
1. Go to: https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=befix-panel
2. Click **"Enable"**
3. Wait 1-2 minutes
4. Try sending notification again

### "Invalid FCM token"

**Solution:**
- Token may have expired
- Request permission again (Step 1)
- Register new token (Step 2)

### "No push notification received"

**Check:**
1. Browser notification settings (allow notifications for localhost)
2. Try different browser (Chrome, Firefox, Edge)
3. Check browser console for errors
4. Make sure tab is not muted
5. Try closing the tab completely (service worker should still deliver)

### "403 Forbidden"

**Solution:**
- Make sure you're logged in as **admin** or **manager**
- Regular users can't send notifications (only receive)

---

## 📊 Server Logs to Watch

When you send a notification, watch your terminal for these logs:

**Success:**
```
✅ Notification sent to user 673c123...: 1/1 push delivered
✅ Push notification sent successfully: projects/befix-panel/messages/...
```

**Failure:**
```
❌ Error initializing Firebase Admin SDK: Missing credentials
❌ Failed to send push to token: abc123... Error: Invalid registration token
```

---

## 🎨 Next: Build the UI

Once backend testing passes, we can build:

1. **NotificationDropdown** - Bell icon in Header with badge
2. **Full Notifications Page** - List all notifications
3. **Admin Sender Page** - Send custom notifications
4. **Auto Token Registration** - Register on login automatically

---

## 📝 Quick Test Script

If you prefer testing via browser console:

```javascript
// 1. Request permission and get token
const token = await requestNotificationPermission();
console.log('Token:', token);

// 2. Register token
await fetch('/api/notifications/fcm-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token, device: 'web', browser: 'Chrome' }),
});

// 3. Send notification
await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
        recipientType: 'single',
        recipients: 'YOUR_USER_ID_HERE',
        title: 'Test!',
        message: 'It works!',
        type: 'success',
    }),
});

// 4. Fetch notifications
const res = await fetch('/api/notifications', { credentials: 'include' });
const data = await res.json();
console.log('Notifications:', data);
```

---

**Ready to Test?** Open: **http://localhost:3000/backend-notification-test** 🚀

Any issues? Check the terminal logs and this troubleshooting guide!

