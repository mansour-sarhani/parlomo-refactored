# Parlomo Admin Panel - Redux Toolkit Guide

## Overview

We're using **Redux Toolkit** for managing business data and UI state in our admin panel. This provides predictable state management, excellent debugging with Redux DevTools, and easy data sharing across components.

**Reference:** [Redux Toolkit Documentation](https://redux-toolkit.js.org/tutorials/quick-start)

---

## Architecture Decision

### Hybrid State Management Approach

We use **both Redux and React Context** for different purposes:

#### React Context (Simple, Global State):

- ✅ **AuthContext** - Authentication (user, token, login/logout)
- ✅ **ThemeContext** - Theme preference (light/dark mode)

#### Redux Toolkit (Complex, Shared Data):

- ✅ **Users** - User management data
- ✅ **Companies** - Company data
- ✅ **Transactions** - Transaction records
- ✅ **Packages** - Package management
- ✅ **Payments** - Payment records
- ✅ **Promotions** - Promotion codes
- ✅ **UI State** - Filters, pagination, search, sorting

**Why this split?**

- Context is simpler for auth/theme (set once, rarely change)
- Redux excels at complex data management with time-travel debugging
- Best tool for each job = cleaner, more maintainable code

---

## Redux Setup for Next.js 16

### Key Files Created

1. **`src/lib/store.js`** - Redux store configuration
2. **`src/lib/StoreProvider.js`** - Client-side Redux Provider
3. **`src/lib/hooks.js`** - Pre-typed hooks for selectors/dispatch
4. **`src/features/[feature]/[feature]Slice.js`** - Feature slices

### Next.js 16 App Router Considerations

**Important:** Redux runs on the **client side only** with Next.js App Router:

```javascript
"use client"; // Required for Redux components
```

**Data Flow:**

1. Server Components fetch initial data (SSR)
2. Pass data to Client Components
3. Client Components dispatch to Redux
4. Redux manages data + UI state from there

---

## File Structure

```
src/
├── lib/
│   ├── store.js             # Redux store config
│   ├── StoreProvider.js     # Provider wrapper (Client Component)
│   └── hooks.js             # useAppDispatch, useAppSelector
├── features/
│   ├── users/
│   │   └── usersSlice.js    # Users state slice
│   ├── companies/
│   │   └── companiesSlice.js
│   ├── transactions/
│   │   └── transactionsSlice.js
│   ├── packages/
│   │   └── packagesSlice.js
│   ├── payments/
│   │   └── paymentsSlice.js
│   └── promotions/
│       └── promotionsSlice.js
└── services/
    ├── user.service.js      # API calls (used by slices)
    ├── company.service.js
    └── ...
```

---

## How to Use Redux

### 1. Setup StoreProvider in Root Layout

In `src/app/layout.js`, wrap your app:

```javascript
import { StoreProvider } from "@/lib/StoreProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <ThemeProvider>
                    <AuthProvider>
                        <StoreProvider>{children}</StoreProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
```

**Order matters:**

1. ThemeProvider (outermost)
2. AuthProvider
3. StoreProvider
4. App content

### 2. Creating a Slice

Each feature gets its own slice (example: `src/features/users/usersSlice.js`):

```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "@/services/user.service";

// Async thunk for API calls
export const fetchUsers = createAsyncThunk(
    "users/fetchUsers",
    async (params, { rejectWithValue }) => {
        try {
            const response = await userService.getUsers(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice definition
const usersSlice = createSlice({
    name: "users",
    initialState: {
        list: [],
        loading: false,
        error: null,
        filters: { search: "", status: "all" },
    },
    reducers: {
        // Synchronous actions
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        // Handle async thunk states
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setFilters } = usersSlice.actions;
export default usersSlice.reducer;
```

### 3. Register Slice in Store

Add to `src/lib/store.js`:

```javascript
import usersReducer from "@/features/users/usersSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            users: usersReducer,
            // ... other slices
        },
    });
};
```

### 4. Using Redux in Components

```javascript
"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchUsers, setFilters } from "@/features/users/usersSlice";

export const UserList = () => {
    const dispatch = useAppDispatch();
    const { list, loading, error, filters } = useAppSelector((state) => state.users);

    useEffect(() => {
        dispatch(fetchUsers(filters));
    }, [dispatch, filters]);

    const handleSearch = (search) => {
        dispatch(setFilters({ search }));
    };

    if (loading) return <Loader />;
    if (error) return <Error message={error} />;

    return (
        <div>
            <SearchBar onSearch={handleSearch} />
            {list.map((user) => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    );
};
```

---

## Redux Toolkit Patterns

### Pattern 1: Async Thunks (API Calls)

```javascript
export const createUser = createAsyncThunk(
    "users/createUser",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await userService.createUser(userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
```

**Usage:**

```javascript
dispatch(createUser({ name: "John", email: "john@example.com" }))
    .unwrap()
    .then(() => toast.success("User created!"))
    .catch((error) => toast.error(error));
```

### Pattern 2: Synchronous Actions (UI State)

```javascript
reducers: {
  setFilters: (state, action) => {
    state.filters = { ...state.filters, ...action.payload };
  },
  setPage: (state, action) => {
    state.pagination.page = action.payload;
  },
}
```

**Usage:**

```javascript
dispatch(setFilters({ search: "john" }));
dispatch(setPage(2));
```

### Pattern 3: Optimistic Updates

```javascript
export const updateUser = createAsyncThunk(
    "users/updateUser",
    async ({ id, userData }, { dispatch, rejectWithValue }) => {
        // Optimistic update
        dispatch(userUpdatedOptimistically({ id, userData }));

        try {
            const response = await userService.updateUser(id, userData);
            return response.data;
        } catch (error) {
            // Rollback on error
            dispatch(revertOptimisticUpdate(id));
            return rejectWithValue(error.message);
        }
    }
);
```

### Pattern 4: Selectors (Computed Values)

```javascript
// In slice file
export const selectActiveUsers = (state) =>
    state.users.list.filter((user) => user.status === "active");

export const selectUserById = (id) => (state) => state.users.list.find((user) => user.id === id);
```

**Usage:**

```javascript
const activeUsers = useAppSelector(selectActiveUsers);
const user = useAppSelector(selectUserById(userId));
```

---

## Integration with Service Layer

Redux thunks call service functions:

```
Component → dispatch(fetchUsers()) → usersSlice thunk → userService.getUsers() → API
                                                                ↓
Component ← Redux state updated ← thunk fulfilled ← API response
```

**Service Layer (`src/services/user.service.js`):**

```javascript
import { api } from "@/lib/axios";

export const userService = {
    getUsers: async (params) => {
        return await api.get("/users", { params });
    },
    createUser: async (data) => {
        return await api.post("/users", data);
    },
    updateUser: async (id, data) => {
        return await api.put(`/users/${id}`, data);
    },
    deleteUser: async (id) => {
        return await api.delete(`/users/${id}`);
    },
};
```

---

## Redux DevTools

**Automatically enabled in development!**

Features:

- 🕰️ **Time-travel debugging** - Go back/forward through state changes
- 📊 **Action history** - See every action dispatched
- 🔍 **State inspection** - Examine state at any point
- 📈 **Performance monitoring** - Check render performance
- 🐛 **Error tracking** - See exactly what caused an error

**How to use:**

1. Install [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
2. Open browser DevTools
3. Click "Redux" tab
4. Explore state and actions!

---

## Best Practices

### 1. Keep Slices Focused

One slice per feature domain:

- ✅ `usersSlice` - User data + UI state
- ✅ `companiesSlice` - Company data + UI state
- ❌ Don't mix: `adminSlice` with everything

### 2. Use createAsyncThunk for API Calls

- ✅ Automatic pending/fulfilled/rejected states
- ✅ Built-in error handling
- ✅ Easy to test

### 3. Normalize Data When Needed

For relational data:

```javascript
{
  users: { byId: {}, allIds: [] },
  companies: { byId: {}, allIds: [] }
}
```

### 4. Keep Initial State Simple

```javascript
const initialState = {
    list: [],
    loading: false,
    error: null,
};
```

### 5. Use Immer's "Mutable" Updates

Redux Toolkit uses Immer, so you can write "mutating" code:

```javascript
state.list.push(newItem); // ✅ Works! (Immer makes it immutable)
state.loading = true; // ✅ Works!
```

### 6. Handle All Async States

```javascript
builder
    .addCase(fetchUsers.pending, (state) => {
        state.loading = true; // Show loader
        state.error = null; // Clear previous errors
    })
    .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false; // Hide loader
        state.list = action.payload;
    })
    .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false; // Hide loader
        state.error = action.payload; // Show error
    });
```

---

## Common Use Cases

### Fetching Data with Filters

```javascript
const dispatch = useAppDispatch();
const filters = useAppSelector((state) => state.users.filters);

useEffect(() => {
    dispatch(fetchUsers(filters));
}, [dispatch, filters]);
```

### Creating New Items

```javascript
const handleSubmit = async (formData) => {
    try {
        await dispatch(createUser(formData)).unwrap();
        toast.success("User created!");
        navigate("/users");
    } catch (error) {
        toast.error(error);
    }
};
```

### Pagination

```javascript
const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    dispatch(fetchUsers({ page: newPage }));
};
```

### Search/Filter

```javascript
const handleSearch = (search) => {
    dispatch(setFilters({ search }));
    dispatch(setPage(1)); // Reset to first page
};
```

---

## Testing Redux

### Testing Reducers

```javascript
import usersReducer, { setFilters } from "./usersSlice";

test("setFilters updates filters", () => {
    const state = usersReducer(undefined, setFilters({ search: "john" }));
    expect(state.filters.search).toBe("john");
});
```

### Testing Thunks

```javascript
import { fetchUsers } from "./usersSlice";
import { userService } from "@/services/user.service";

jest.mock("@/services/user.service");

test("fetchUsers success", async () => {
    userService.getUsers.mockResolvedValue({ data: [{ id: 1 }] });

    const dispatch = jest.fn();
    const thunk = fetchUsers();
    await thunk(dispatch, () => ({}), undefined);

    expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
            type: "users/fetchUsers/fulfilled",
        })
    );
});
```

---

## Summary

✅ **Redux Toolkit is production-ready for our admin panel!**

**We have:**

- Store configuration (`src/lib/store.js`)
- Client-side Provider (`src/lib/StoreProvider.js`)
- Pre-typed hooks (`src/lib/hooks.js`)
- Example slice structure (`src/features/users/usersSlice.js`)
- Complete documentation (this guide)

**Next steps:**

1. Add StoreProvider to root layout (Phase 2)
2. Create slices for each feature as needed
3. Use Redux for all business data
4. Keep auth/theme in React Context

**Resources:**

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Quick Start Guide](https://redux-toolkit.js.org/tutorials/quick-start)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)

Happy state managing! 🎯
