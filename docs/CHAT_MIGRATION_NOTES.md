# Parlomo Chat Migration Notes

## Overview

- Rebuilt the legacy admin chat experience in the refactored Next.js panel.
- Reused the original Laravel endpoints to preserve backend contracts:
  - `GET /api/conversations`
  - `POST /api/conversations/loadMessage`
  - `POST /api/conversations/sendMessageToUserByUserId`
  - `POST /api/conversations/deleteByConversationsById`
  - `GET /api/user/userHasPublicId`
  - `POST /api/user/publicIdAutocomplete`
  - `POST /api/user/get-user-public`
- Local polling is still available (30 s interval) but the UI now listens for Firebase Cloud Messaging events when available.

## Frontend Architecture

- Service layer: `src/services/chat/chat.service.js`.
- Redux slice: `src/features/chat/chatSlice.js`.
  - Holds conversations, active conversation, messages, contact info, search state, and auth guard metadata.
  - Async thunks wrap every API call and handle optimistic refresh of the conversation list.
- UI entry point: `src/app/panel/chat/page.js` → `ChatPage`.
  - Desktop layout mirrors legacy (sidebar + thread); mobile view provides a dropdown selector.
  - New chat modal lets admins search by public ID and open conversation threads.
  - Delete conversation, unread indicators, auto-scrolling, and send composer handled in one place.
- Real-time glue: `src/features/chat/hooks/useChatRealtime.js`.
  - Subscribes to foreground FCM messages (`eventType = "chat:new-message"`).
  - Falls back to 30 s polling when FCM isn’t available.
- Firebase bootstrap:
  - Client helpers in `src/lib/firebase/client.js`.
  - Service worker registered via `FirebaseMessagingProvider` (wired in `app/layout.js`).
  - `/public/firebase-config.js` posts env config to the worker at runtime.

## FCM Contract for Chat

When the backend sends a push for chat, use a payload like:

```json
{
  "notification": {
    "title": "New message",
    "body": "Customer replied to your conversation"
  },
  "data": {
    "eventType": "chat:new-message",
    "conversationId": "abc123",
    "message": "{\"id\":\"...\",\"message\":\"...\",\"owner\":false}"
  }
}
```

- `conversationId` should match the legacy `thread.conversation_id`.
- `message` (optional) can include a serialized copy of the new message. If omitted, the client will automatically refetch the thread.
- Backend can reuse the notification admin SDK helpers once chat push wiring exists.

## Environment Requirements

Set the Firebase env vars before running the chat page in real-time mode:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

`NEXT_PUBLIC_ASSET_BASE_URL` (optional) is used to display user avatars when provided by the legacy API.

## Known Follow-ups

- Wire backend events to the `chat:new-message` FCM flow.
- Add socket bridging if/when Laravel exposes a websocket channel.
- Extend UI with typing indicators or read receipts once backend contracts exist.
- Backfill unit tests (slice + components) after backend real-time integration stabilises.


