# Firebase Backend Setup - Final Steps

## ✅ What's Complete So Far

### Phase 1-6 Complete! 🎉

**Database Models:**
- ✅ User model extended with `fcmTokens` field + helper methods
- ✅ Notification model created with full CRUD support
- ✅ Compound indexes for efficient queries

**Backend Infrastructure:**
- ✅ Firebase Admin SDK installed (`firebase-admin`)
- ✅ Firebase Admin configuration (`src/lib/firebase/admin.js`)
- ✅ Notification helper functions (`src/lib/notifications.js`)
- ✅ System notification templates (user created, status changed, etc.)

**API Routes:**
- ✅ `POST /api/notifications/fcm-token` - Register FCM token
- ✅ `DELETE /api/notifications/fcm-token` - Remove FCM token
- ✅ `GET /api/notifications` - List notifications (paginated)
- ✅ `GET /api/notifications/count` - Get unread count
- ✅ `POST /api/notifications` - Send notification (admin/manager)
- ✅ `PATCH /api/notifications/[id]` - Mark as read/unread
- ✅ `DELETE /api/notifications/[id]` - Delete notification
- ✅ `PATCH /api/notifications/mark-all-read` - Mark all as read
- ✅ `DELETE /api/notifications/delete-all-read` - Delete all read

**Frontend State Management:**
- ✅ Notification service layer (`src/services/notification.service.js`)
- ✅ Notifications Redux slice (`src/features/notifications/notificationsSlice.js`)
- ✅ Redux store updated with notifications reducer

---

## 🔑 Environment Setup Needed

Before the backend can send push notifications, add these to `.env.local`:

```env
# Firebase Admin SDK (Server-side - Get from Firebase Console)
FIREBASE_PROJECT_ID=befix-panel
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@befix-panel.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

### How to Get These Values:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **befix-panel**
3. Click **⚙️ Settings** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Extract values from JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

**⚠️ CRITICAL:**
- Keep the JSON file secure (don't commit to git)
- Add `.env.local` to `.gitignore` (already done)
- Never expose `FIREBASE_PRIVATE_KEY` to client code

---

## 🧪 Testing Backend Push Notifications

Once environment variables are set, test from the Firebase test page:

### 1. Register Token (Already Working)
```javascript
// Visit /firebase-test
// Click "Request Notification Permission"
// Click "Get Current FCM Token"
// Copy your token
```

### 2. Register Token in Database
```javascript
// In browser console on /firebase-test page:
const registerToken = async () => {
    const response = await fetch('/api/notifications/fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token: 'YOUR_FCM_TOKEN_HERE',
            device: 'web',
            browser: navigator.userAgent,
        }),
    });
    const data = await response.json();
    console.log(data);
};

await registerToken();
```

### 3. Send Test Notification from Backend
```javascript
// Create a test API route or use existing notification system
// Example: Trigger a user status change notification

// In your user update API:
import { notifyUserStatusChanged } from '@/lib/notifications';

await notifyUserStatusChanged(userId, 'inactive', 'active', adminId);
// Push notification will be sent automatically!
```

---

## 📱 How It Works

### Registration Flow:
1. User grants notification permission in browser
2. FCM generates unique token for this browser/device
3. Frontend calls `POST /api/notifications/fcm-token` with token
4. Backend saves token to User's `fcmTokens` array in MongoDB
5. Token is now ready to receive push notifications

### Sending Flow:
1. Event occurs (user created, status changed, etc.)
2. Call helper function (e.g., `notifyUserStatusChanged()`)
3. Helper:
   - Creates notification in MongoDB
   - Fetches user's FCM tokens from database
   - Sends push via Firebase Admin SDK to all tokens
   - Updates delivery status in notification document

### Receiving Flow:
1. **User online:** Foreground message listener shows toast
2. **User offline:** Service worker shows native browser notification
3. **User clicks:** Opens app and navigates to action URL

---

## 🎯 Next: Frontend UI (Phase 7)

Now we'll build:

1. **NotificationDropdown Component**
   - Bell icon in Header
   - Badge with unread count
   - Dropdown with recent notifications
   - Mark as read/delete actions
   - "View All" link

2. **Full Notifications Page**
   - List all notifications
   - Tabs: All / Unread / Read
   - Filters by type
   - Pagination
   - Bulk actions

3. **Admin Notification Sender Page**
   - Form to send custom notifications
   - Select recipients (all/role/specific users)
   - Pre-defined templates

4. **Auto Token Registration**
   - Automatically register token on login
   - Update token on page load if changed
   - Remove token on logout

---

## 🚀 System Integration Examples

### Example 1: Notify on User Creation
```javascript
// In src/app/api/users/route.js (POST handler)
import { notifyUserCreated } from '@/lib/notifications';

// After creating user...
await notifyUserCreated(newUser._id, decoded.userId);
```

### Example 2: Notify on Status Change
```javascript
// In src/app/api/users/[id]/route.js (PUT handler)
import { notifyUserStatusChanged } from '@/lib/notifications';

if (oldUser.status !== status) {
    await notifyUserStatusChanged(userId, oldUser.status, status, decoded.userId);
}
```

### Example 3: Broadcast Announcement
```javascript
// In admin announcement page
import { notifySystemAnnouncement } from '@/lib/notifications';

await notifySystemAnnouncement(
    'System Update',
    'New features have been released! Check them out in the dashboard.',
    adminUserId
);
```

---

## ✅ Testing Checklist

- [ ] Firebase Admin SDK credentials added to `.env.local`
- [ ] Server restarted after adding env variables
- [ ] Token registration API works (`POST /api/notifications/fcm-token`)
- [ ] Token saved in MongoDB (check user document)
- [ ] Test notification sent from backend
- [ ] Push notification received in browser
- [ ] Notification saved in MongoDB
- [ ] Delivery status updated correctly

---

## 🐛 Common Issues

**"Invalid token" when registering FCM token** ⚠️ MOST COMMON
→ This was a bug in initial implementation where API routes were reading wrong cookie name. **FIXED:** All routes now use `await getAuthToken()` instead of `getCookie('token')`. If you still see this, make sure you're using the latest code. See `TROUBLESHOOTING.md` for details.

**"Firebase Admin not initialized"**
→ Missing or invalid environment variables. Check `.env.local` has all three Firebase Admin variables.

**"Error sending push notification: 404"**
→ FCM API not enabled. Go to: https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=befix-panel

**"Token has expired"** (JWT, not FCM)
→ Login session expired. Logout and login again to get fresh JWT token.

**"Permission denied"**
→ Service account doesn't have proper permissions. Regenerate service account key.

**For complete troubleshooting guide, see:** `docs/TROUBLESHOOTING.md`

---

**Ready for Phase 7?** Once backend is tested and working, we'll build the beautiful notification UI! 🎨

