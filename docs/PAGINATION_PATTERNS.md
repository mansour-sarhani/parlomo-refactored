# Server-Side Pagination Patterns - Parlomo Admin Panel

## Overview

This document outlines the standardized server-side pagination patterns implemented in the Parlomo Admin Panel. These patterns should be followed for all new features to ensure consistency and optimal performance.

## ⚠️ CRITICAL: Avoid Circular Dependencies!

**URL must be the SINGLE source of truth!**

**Common Mistake:** Having both URL and Redux as sources of truth causes infinite loops:

- ❌ URL changes → Update Redux → Redux changes → Update URL → infinite loop
- ❌ Handlers read from Redux → Redux out of sync with URL → page mismatches

**Correct Approach:**

- ✅ URL is the single source of truth
- ✅ Redux state is synced FROM URL (for UI display only)
- ✅ Data is fetched directly from URL parameters
- ✅ Handlers read current state FROM URL, not Redux
- ✅ Only `searchParams` dependency in main useEffect

See **User Management** (`src/app/(dashboard)/users/page.js`) for the correct working implementation.

## Backend API Response Structure

### Standardized Response Format

All paginated API endpoints MUST return this exact structure:

```javascript
{
  data: [...],                    // Array of actual items
  links: {
    next: "url?page=2&limit=10",  // Next page URL (null if last page)
    prev: "url?page=1&limit=10"   // Previous page URL (null if first page)
  },
  meta: {
    current_page: 1,              // Current page number
    last_page: 10,                // Total pages available
    total: 100                    // Total items count
  }
}
```

### API Route Implementation Template

```javascript
// src/app/api/[feature]/route.js
export async function GET(request) {
    // Extract pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // Build query with filters
    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        Model.find(query).skip(skip).limit(limit),
        Model.countDocuments(query),
    ]);

    // Calculate metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    const baseUrl = request.url.split("?")[0];

    return NextResponse.json({
        data: items,
        links: {
            next: hasNext ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
            prev: hasPrev ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
        },
        meta: {
            current_page: page,
            last_page: totalPages,
            total: total,
        },
    });
}
```

## Frontend Redux Patterns

### Redux Slice Structure

```javascript
// src/features/[feature]/[feature]Slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { featureService } from "@/services/feature.service";

export const fetchItems = createAsyncThunk(
    "feature/fetchItems",
    async (params, { rejectWithValue }) => {
        try {
            const response = await featureService.getItems(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    list: [],
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    },
    links: {
        next: null,
        prev: null,
    },
    filters: {
        search: "",
        status: "all",
        // Add feature-specific filters here
    },
};

const featureSlice = createSlice({
    name: "feature",
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPage: (state, action) => {
            state.pagination.page = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchItems.fulfilled, (state, action) => {
                state.loading = false;
                // Handle backend response structure: { data, links, meta }
                state.list = action.payload.data;
                state.pagination.page = action.payload.meta.current_page;
                state.pagination.pages = action.payload.meta.last_page;
                state.pagination.total = action.payload.meta.total;
                state.links.next = action.payload.links?.next || null;
                state.links.prev = action.payload.links?.prev || null;
            })
            .addCase(fetchItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setFilters, setPage, clearError } = featureSlice.actions;
export default featureSlice.reducer;
```

### Service Layer Pattern

```javascript
// src/services/feature.service.js
import { api } from "@/lib/axios";

export const featureService = {
    /**
     * Get list of items with pagination, search, and filters
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.limit - Items per page
     * @param {string} params.search - Search term
     * @param {string} params.status - Filter by status
     * @returns {Promise<Object>} Response with { data: [...], links: {next, prev}, meta: {current_page, last_page, total} }
     */
    getItems: async (params = {}) => {
        return await api.get("/api/feature", { params });
    },

    // Other CRUD methods...
};
```

## Frontend Component Patterns

### URL State Management

**⚠️ CRITICAL: URL must be the SINGLE source of truth to avoid infinite loops!**

```javascript
// src/app/(dashboard)/feature/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchItems, setFilters, setPage } from "@/features/feature/featureSlice";

export default function FeaturePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    const { list, loading, error, pagination, filters } = useAppSelector((state) => state.feature);

    // Update URL with current state
    const updateUrl = useCallback(
        (params) => {
            const url = new URL(window.location);

            Object.entries(params).forEach(([key, value]) => {
                if (value && value !== "all" && value !== "") {
                    url.searchParams.set(key, value);
                } else {
                    url.searchParams.delete(key);
                }
            });

            // Remove page=1 to keep URLs clean
            if (url.searchParams.get("page") === "1") {
                url.searchParams.delete("page");
            }

            router.push(url.pathname + url.search, { scroll: false });
        },
        [router]
    );

    // Sync URL parameters with Redux state
    useEffect(() => {
        const urlParams = getUrlParams();

        // Validate page against total pages (if available)
        let validatedPage = urlParams.page;
        if (pagination.pages > 0 && urlParams.page > pagination.pages) {
            validatedPage = pagination.pages;
            updateUrl({
                page: validatedPage,
                search: urlParams.search,
                status: urlParams.status,
            });
            return;
        }

        // Update Redux state to match URL
        if (validatedPage !== pagination.page) {
            dispatch(setPage(validatedPage));
        }

        if (urlParams.search !== filters.search || urlParams.status !== filters.status) {
            dispatch(
                setFilters({
                    search: urlParams.search,
                    status: urlParams.status,
                })
            );
        }
    }, [
        searchParams,
        pagination.pages,
        getUrlParams,
        updateUrl,
        dispatch,
        pagination.page,
        filters.search,
        filters.status,
    ]);

    // Fetch items when Redux state changes
    useEffect(() => {
        dispatch(
            fetchItems({
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search,
                status: filters.status,
            })
        );
    }, [dispatch, pagination.page, pagination.limit, filters.search, filters.status]);

    // Handle page change - update URL which will trigger Redux state update
    const handlePageChange = (newPage) => {
        updateUrl({
            page: newPage,
            search: filters.search,
            status: filters.status,
        });

        // Smooth scroll to top after page change
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Handle filter changes - update URL which will trigger Redux state update
    const handleFilterChange = (filterName, value) => {
        const newFilters = { ...filters, [filterName]: value };
        updateUrl({
            page: 1, // Reset to first page when filters change
            search: newFilters.search,
            status: newFilters.status,
        });
    };

    // Rest of component...
}
```

### Pagination Component Usage

```javascript
// In your list component
<Pagination
    currentPage={pagination.page}
    totalPages={pagination.pages}
    onPageChange={handlePageChange}
    totalItems={pagination.total}
    itemsPerPage={pagination.limit}
/>
```

## Implementation Checklist

When implementing pagination for a new feature:

### Backend Checklist:

- [ ] API route accepts `page`, `limit`, `search` parameters
- [ ] Returns standardized `{ data, links, meta }` response structure
- [ ] Calculates pagination metadata correctly
- [ ] Generates proper `next`/`prev` URLs
- [ ] Includes JSDoc documentation

### Frontend Checklist:

- [ ] Redux slice includes `pagination`, `links`, `filters` state
- [ ] Handles `{ data, links, meta }` response structure
- [ ] Implements URL parameter validation
- [ ] URL changes trigger Redux updates
- [ ] Page/filter changes update URL
- [ ] Smooth scroll on page changes
- [ ] Loading states during API calls
- [ ] Error handling with retry options

### Testing Checklist:

- [ ] Direct URL access works (`/feature?page=2`)
- [ ] Browser back/forward buttons work
- [ ] Filter changes reset to page 1
- [ ] Invalid page numbers redirect correctly
- [ ] Search is debounced (500ms)
- [ ] Mobile responsive tables

## URL Structure Examples

```
/users                                    # Page 1, no filters
/users?page=2                            # Page 2, no filters
/users?search=john                       # Page 1, search "john"
/users?page=2&search=john                # Page 2, search "john"
/users?page=1&status=active&role=admin   # Page 1, filtered
/users?page=3&search=john&status=active  # Page 3, search + filter
```

## Performance Considerations

### Implemented Optimizations:

- URL state prevents unnecessary re-renders
- Debounced search (500ms delay)
- Loading states during API calls
- Smooth scrolling behavior
- Error boundaries with retry options

### Future Enhancements:

- Infinite scroll for mobile
- Virtual scrolling for very large lists
- Prefetch next page data
- Cache previous pages in Redux

## Migration Guide

To convert existing client-side pagination to server-side:

1. **Update API Route:** Return `{ data, links, meta }` structure
2. **Update Redux Slice:** Handle new response format
3. **Add URL Management:** Implement `getUrlParams()` and `updateUrl()`
4. **Update Handlers:** Make changes update URL instead of local state
5. **Test Thoroughly:** Verify all URL scenarios work

## Common Patterns

### Server-Side Pagination (Recommended)

- **Use for:** Large datasets (users, transactions, orders)
- **Benefits:** Performance, real-time data, memory efficient
- **Implementation:** Follow patterns above

### Client-Side Pagination (Simple cases)

- **Use for:** Small datasets (settings, categories, < 100 items)
- **Benefits:** Instant navigation, simpler implementation
- **Implementation:** Load all data once, use local state for pagination

Choose the appropriate pattern based on your data size and performance requirements.
