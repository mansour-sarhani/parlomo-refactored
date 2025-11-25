# httpOnly Cookie Authentication Guide 🍪

## Overview

This guide explains our **cookie-based authentication system** using **httpOnly cookies** for storing JWT tokens. This approach provides **better security** than localStorage and is the **recommended best practice** for modern web applications.

---

## Table of Contents

1. [Why httpOnly Cookies?](#why-httponly-cookies)
2. [Architecture](#architecture)
3. [Implementation](#implementation)
4. [API Routes](#api-routes)
5. [Cookie Utilities](#cookie-utilities)
6. [Frontend Usage](#frontend-usage)
7. [Security Features](#security-features)
8. [Testing](#testing)
9. [Migration from localStorage](#migration-from-localstorage)

---

## Why httpOnly Cookies?

### Security Comparison

| Feature                    | localStorage      | httpOnly Cookies |
| -------------------------- | ----------------- | ---------------- |
| **XSS Protection**         | ❌ Vulnerable     | ✅ Protected     |
| **JavaScript Access**      | ✅ Yes            | ❌ No (secure)   |
| **Automatic Transmission** | ❌ Manual         | ✅ Automatic     |
| **CSRF Protection**        | ✅ Not vulnerable | ✅ SameSite flag |
| **SSR Compatible**         | ❌ Client-only    | ✅ Yes           |
| **Server Components**      | ❌ No             | ✅ Yes           |

### Key Benefits

1. **🔒 XSS Protection**: JavaScript cannot access httpOnly cookies, preventing token theft through XSS attacks
2. **🚀 Automatic**: Cookies sent automatically with every request - no manual work
3. **🛡️ CSRF Protection**: `SameSite` attribute prevents cross-site attacks
4. **⚡ Simpler Code**: No token management in frontend
5. **✅ Next.js Native**: Works seamlessly with App Router and Server Components

---

## Architecture

### Flow Diagram

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser   │         │  Next.js API  │         │   MongoDB    │
│  (Client)   │         │    Routes     │         │  (Database)  │
└──────┬──────┘         └───────┬──────┘         └──────┬───────┘
       │                        │                        │
       │  POST /api/auth/login  │                        │
       │ ─────────────────────> │   Verify credentials   │
       │                        │ ─────────────────────> │
       │                        │ <───────────────────── │
       │  Set httpOnly cookie   │                        │
       │ <───────────────────── │                        │
       │                        │                        │
       │  GET /api/users        │                        │
       │  (Cookie sent auto)    │   Read cookie token    │
       │ ─────────────────────> │   Verify JWT           │
       │                        │   Fetch data           │
       │                        │ ─────────────────────> │
       │  Response with data    │ <───────────────────── │
       │ <───────────────────── │                        │
```

### Cookie Configuration

```javascript
{
    httpOnly: true,      // Cannot be accessed by JavaScript
    secure: true,        // HTTPS only (production)
    sameSite: 'lax',     // CSRF protection
    maxAge: 604800,      // 7 days in seconds
    path: '/',           // Available across entire site
}
```

---

## Implementation

### 1. Cookie Utilities (`src/lib/cookies.js`)

Server-side utilities for cookie management:

```javascript
import { setAuthToken, getAuthToken, clearAuthToken } from "@/lib/cookies";

// Set token (on login)
await setAuthToken(jwtToken);

// Get token (in API routes)
const token = await getAuthToken();

// Clear token (on logout)
await clearAuthToken();
```

**Key Functions:**

- `setAuthToken(token, options)` - Set JWT in httpOnly cookie
- `getAuthToken()` - Retrieve JWT from cookie
- `clearAuthToken()` - Delete cookie (logout)
- `isAuthenticated()` - Check if cookie exists

### 2. Axios Configuration (`src/lib/axios.js`)

Updated to work with cookies:

```javascript
// Before (localStorage)
config.headers.Authorization = `Bearer ${token}`; // ❌ Manual

// After (httpOnly Cookies)
config.withCredentials = true; // ✅ Automatic
```

**Changes:**

- ✅ Removed token injection from request interceptor
- ✅ Added `withCredentials: true` to send cookies automatically
- ✅ Response interceptor still handles 401 errors
- ✅ No localStorage token management needed

### 3. Configuration (`src/constants/config.js`)

```javascript
// Storage Keys (for localStorage - NOT for tokens!)
export const STORAGE_KEYS = {
    USER: "parlomo_user", // Optional: non-sensitive user data
    THEME: "parlomo_theme", // Theme preference
};

// Cookie Names (server-side only)
export const COOKIE_NAMES = {
    TOKEN: "parlomo_auth_token", // JWT token in httpOnly cookie
};
```

---

## API Routes

### Login Route (`/api/auth/login`)

```javascript
import { setAuthToken } from "@/lib/cookies";

export async function POST(request) {
    const { email, password } = await request.json();

    // 1. Verify credentials against database
    const user = await verifyCredentials(email, password);

    // 2. Generate JWT token
    const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    // 3. Set token in httpOnly cookie
    await setAuthToken(token);

    // 4. Return user data (NOT the token!)
    return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
    });
}
```

**Important:** Never send the JWT token in the response body!

### Logout Route (`/api/auth/logout`)

```javascript
import { clearAuthToken } from "@/lib/cookies";

export async function POST() {
    await clearAuthToken();

    return NextResponse.json({
        success: true,
        message: "Logged out successfully",
    });
}
```

### Protected Route Example (`/api/users`)

```javascript
import { getAuthToken } from "@/lib/cookies";
import jwt from "jsonwebtoken";

export async function GET() {
    // 1. Get token from cookie
    const token = await getAuthToken();

    if (!token) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Fetch data
        const users = await User.find();

        return NextResponse.json({ success: true, users });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }
}
```

### Auth Check Route (`/api/auth/check`)

```javascript
import { getAuthToken } from "@/lib/cookies";

export async function GET() {
    const token = await getAuthToken();

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify token and return user data
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return NextResponse.json({
        authenticated: true,
        user: { id: decoded.userId, email: decoded.email },
    });
}
```

---

## Cookie Utilities

### Complete API

#### `setAuthToken(token, options)`

Set JWT token in httpOnly cookie.

```javascript
await setAuthToken(jwtToken, {
    maxAge: 7 * 24 * 60 * 60, // 7 days
});
```

#### `getAuthToken()`

Retrieve JWT token from cookie.

```javascript
const token = await getAuthToken();
if (!token) {
    // User not authenticated
}
```

#### `clearAuthToken()`

Delete auth cookie (logout).

```javascript
await clearAuthToken();
```

#### `isAuthenticated()`

Check if user has auth cookie.

```javascript
const isLoggedIn = await isAuthenticated();
```

---

## Frontend Usage

### Login Component

```javascript
import { api } from "@/lib/axios";

async function handleLogin(email, password) {
    try {
        // POST to login endpoint
        const response = await api.post("/api/auth/login", { email, password });

        // Cookie is set automatically by server!
        // No need to store anything in localStorage

        // Redirect to dashboard
        router.push("/dashboard");
    } catch (error) {
        console.error("Login failed:", error.message);
    }
}
```

### Logout Component

```javascript
async function handleLogout() {
    try {
        // POST to logout endpoint
        await api.post("/api/auth/logout");

        // Cookie is cleared by server!

        // Redirect to login
        router.push("/login");
    } catch (error) {
        console.error("Logout failed:", error.message);
    }
}
```

### Making Authenticated Requests

```javascript
// No token management needed!
// Cookie is sent automatically with every request

async function fetchUsers() {
    const response = await api.get("/api/users");
    return response.data.users;
}

async function createUser(userData) {
    const response = await api.post("/api/users", userData);
    return response.data.user;
}
```

### Auth Context (Optional)

```javascript
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const response = await api.get("/api/auth/check");
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        const response = await api.post("/api/auth/login", { email, password });
        setUser(response.data.user);
    }

    async function logout() {
        await api.post("/api/auth/logout");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
```

---

## Security Features

### 1. XSS Protection

```javascript
httpOnly: true; // JavaScript cannot access the cookie
```

**Benefit:** Even if attacker injects malicious script, they cannot steal the token.

### 2. CSRF Protection

```javascript
sameSite: "lax"; // Cookie not sent on cross-site POST requests
```

**Benefit:** Prevents cross-site request forgery attacks.

### 3. HTTPS Only (Production)

```javascript
secure: process.env.NODE_ENV === "production";
```

**Benefit:** Cookie only transmitted over HTTPS in production.

### 4. Limited Scope

```javascript
path: "/"; // Cookie available across entire site
```

**Benefit:** Cookie sent to all routes under your domain.

### 5. Expiration

```javascript
maxAge: 7 * 24 * 60 * 60; // 7 days
```

**Benefit:** Automatic cleanup of expired sessions.

---

## Testing

### Test Page (`/test-axios`)

Visual interface to test cookie-based authentication:

1. **Login Test**: Sets httpOnly cookie
2. **Status Check**: Verifies cookie exists
3. **API Calls**: Tests authenticated requests
4. **Logout Test**: Clears cookie

### Testing Workflow

```bash
# 1. Navigate to test page
http://localhost:3000/test-axios

# 2. Check initial status (should be "Not authenticated")

# 3. Login with mock credentials
Email: admin@parlomo.com
Password: Admin@123

# 4. Verify cookie is set (status shows "Authenticated")

# 5. Test API calls (cookie sent automatically)

# 6. Logout (cookie is cleared)

# 7. Test API calls again (should show no cookie)
```

### Browser DevTools

**Check cookies:**

1. Open DevTools (F12)
2. Go to Application tab
3. Cookies → http://localhost:3000
4. Look for `parlomo_auth_token`
5. Verify `HttpOnly` and `Secure` flags

**Important:** You won't be able to access the cookie via `document.cookie` (that's the point!).

---

## Migration from localStorage

### What Changed

| Aspect           | Before (localStorage)             | After (httpOnly Cookies)         |
| ---------------- | --------------------------------- | -------------------------------- |
| **Login**        | Store token in localStorage       | Server sets cookie automatically |
| **Requests**     | Manually add Authorization header | Cookie sent automatically        |
| **Logout**       | Clear localStorage                | Call logout API to clear cookie  |
| **Token Access** | `localStorage.getItem('token')`   | Cannot access (server-side only) |
| **Auth Check**   | Check localStorage                | Call `/api/auth/check`           |

### Code Migration

**Before (localStorage):**

```javascript
// Login
const response = await api.post("/api/auth/login", credentials);
localStorage.setItem("parlomo_token", response.data.token);

// Request
const token = localStorage.getItem("parlomo_token");
config.headers.Authorization = `Bearer ${token}`;

// Logout
localStorage.removeItem("parlomo_token");
```

**After (httpOnly Cookies):**

```javascript
// Login
await api.post("/api/auth/login", credentials);
// Cookie set automatically by server!

// Request
await api.get("/api/users");
// Cookie sent automatically!

// Logout
await api.post("/api/auth/logout");
// Cookie cleared by server!
```

### Benefits of Migration

1. **✅ Better Security**: XSS protection
2. **✅ Simpler Code**: No token management
3. **✅ Fewer Bugs**: No manual token handling
4. **✅ SSR Ready**: Works with Server Components
5. **✅ Industry Standard**: Best practice approach

---

## Environment Variables

```env
# .env.local
JWT_SECRET=your-secret-key-here
DEV_BASE_URL=http://localhost:3000/
```

**Security Note:** Never expose `JWT_SECRET` to the client (no `NEXT_PUBLIC_` prefix).

---

## Best Practices

### DO ✅

- ✅ Use httpOnly cookies for JWT tokens
- ✅ Set `secure: true` in production
- ✅ Use `sameSite: 'lax'` for CSRF protection
- ✅ Verify JWT on every protected route
- ✅ Set reasonable expiration times
- ✅ Clear cookies on logout

### DON'T ❌

- ❌ Don't return JWT token in API response body
- ❌ Don't store sensitive data in localStorage
- ❌ Don't set cookies from client-side JavaScript
- ❌ Don't use `httpOnly: false`
- ❌ Don't skip token verification
- ❌ Don't use very long expiration times

---

## Troubleshooting

### Cookie Not Being Set

**Problem:** Login succeeds but cookie not set.

**Solution:**

- Check if `setAuthToken()` is being called in API route
- Verify cookie name in DevTools
- Ensure response is not blocked by CORS

### Cookie Not Being Sent

**Problem:** Authenticated requests fail.

**Solution:**

- Ensure `withCredentials: true` in Axios config
- Check if cookie has expired
- Verify cookie `path` matches request URL

### 401 Errors After Login

**Problem:** Getting unauthorized errors.

**Solution:**

- Check JWT_SECRET matches between sign and verify
- Verify token hasn't expired
- Ensure cookie domain matches

---

## Summary

### Key Takeaways

1. **🔒 More Secure**: httpOnly cookies protect against XSS
2. **🚀 Simpler**: No manual token management
3. **✅ Automatic**: Cookies sent with every request
4. **🛡️ CSRF Protected**: SameSite flag prevents attacks
5. **⚡ SSR Ready**: Works with Server Components

### Files Created/Modified

#### New Files:

- ✅ `src/lib/cookies.js` - Cookie utility functions
- ✅ `src/app/api/auth/login/route.js` - Login endpoint
- ✅ `src/app/api/auth/logout/route.js` - Logout endpoint
- ✅ `src/app/api/auth/check/route.js` - Auth check endpoint

#### Modified Files:

- ✅ `src/lib/axios.js` - Removed token injection, added withCredentials
- ✅ `src/constants/config.js` - Updated storage keys, added cookie names
- ✅ `src/app/api/test-axios/route.js` - Updated to check cookies
- ✅ `src/app/(dashboard)/test-axios/page.js` - Added login/logout testing

---

**Status:** ✅ COMPLETED
**Security:** ✅ PRODUCTION READY
**Recommended:** ✅ YES (Best Practice)

For questions or issues, refer to Next.js documentation on cookies and authentication.
