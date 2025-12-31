# Admin Venue Charts - Frontend Implementation Gap Analysis

> **Companion Document to:** [ADMIN_VENUE_CHARTS_API.md](./ADMIN_VENUE_CHARTS_API.md)
> **Last Updated:** 2025-12-29
> **Status:** Gap Analysis - Implementation Pending

---

## Executive Summary

This document analyzes the frontend implementation status for the **Admin Venue Charts** feature. The Laravel backend API is fully documented with 10 endpoints, but the Next.js frontend is **missing all admin-facing UI components**.

**Current State:**
- ✅ **Organizer Features:** Fully implemented (chart selection, creation, designer, category mapping)
- ❌ **Admin Features:** Not implemented (list, CRUD, sync, publish, activate/deactivate)

**Required Work:** Build complete admin interface (~22-32 hours estimated)

---

## Table of Contents

1. [API Endpoints Status](#api-endpoints-status)
2. [What's Already Implemented](#whats-already-implemented-organizer-facing)
3. [What's Missing](#whats-missing-admin-facing)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Technical Specifications](#technical-specifications)
6. [File Structure](#required-file-structure)
7. [Code Examples](#code-examples)
8. [Testing Checklist](#testing-checklist)

---

## API Endpoints Status

### ✅ Organizer Endpoints - Fully Implemented

| Endpoint | Method | Service Method | UI Component | Page |
|----------|--------|----------------|--------------|------|
| `/api/ticketing/seatsio/charts` | GET | `getCharts()` | ChartSelector | `/panel/my-events/[id]/seating` |
| `/api/ticketing/seatsio/charts` | POST | `createChart()` | CreateChartForm | `/panel/my-events/[id]/seating` |
| `/api/ticketing/seatsio/charts/{id}` | GET | `getChart()` | ChartSelector | `/panel/my-events/[id]/seating` |
| `/api/ticketing/seatsio/charts/{id}/designer` | GET | `getDesignerConfig()` | ChartDesigner | `/panel/my-events/[id]/seating` |
| `/api/ticketing/seatsio/charts/{id}/sync` | POST | `syncChart()` | ChartDesigner | `/panel/my-events/[id]/seating` |
| Event chart assignment | POST | `assignChartToEvent()` | Seating page | `/panel/my-events/[id]/seating` |
| Category mapping | POST | `mapCategoriesToTicketTypes()` | CategoryMapping | `/panel/my-events/[id]/seating` |

### ❌ Admin Endpoints - Not Implemented

| # | Endpoint | Method | Purpose | Missing Component |
|---|----------|--------|---------|-------------------|
| 1 | `/admin/seatsio/venue-charts` | GET | List all charts | List page + table + search + filters |
| 2 | `/admin/seatsio/venue-charts` | POST | Create chart | Create form page |
| 3 | `/admin/seatsio/venue-charts/{id}` | GET | Get details | Detail view page |
| 4 | `/admin/seatsio/venue-charts/{id}` | PATCH | Update chart | Edit form page |
| 5 | `/admin/seatsio/venue-charts/{id}` | DELETE | Delete chart | Delete modal + confirmation |
| 6 | `/admin/seatsio/venue-charts/{id}/designer` | GET | Designer config | Designer integration |
| 7 | `/admin/seatsio/venue-charts/{id}/sync` | POST | Sync from Seats.io | Sync button + handler |
| 8 | `/admin/seatsio/venue-charts/{id}/publish` | POST | Publish changes | Publish button + handler |
| 9 | `/admin/seatsio/venue-charts/{id}/activate` | POST | Activate chart | Activate toggle |
| 10 | `/admin/seatsio/venue-charts/{id}/deactivate` | POST | Deactivate chart | Deactivate toggle |

---

## What's Already Implemented (Organizer-Facing)

### Service Layer
**File:** `src/services/seating.service.js`

Complete API client for organizer endpoints with methods:
- Chart listing and retrieval
- Chart creation and syncing
- Designer configuration
- Event chart assignment
- Category mapping

### UI Components

| Component | File | Purpose |
|-----------|------|---------|
| **ChartSelector** | `src/components/ticketing/ChartSelector.js` | Browse and select venue charts |
| **CreateChartForm** | `src/components/ticketing/CreateChartForm.js` | Create custom venue charts |
| **ChartDesigner** | `src/components/ticketing/ChartDesigner.js` | Embed Seats.io designer |
| **CategoryMapping** | `src/components/ticketing/CategoryMapping.js` | Map categories to tickets |
| **SeatingChart** | `src/components/ticketing/SeatingChart.js` | Display chart for buyers |

### Pages
**File:** `src/app/panel/my-events/[id]/seating/page.js`

Multi-step workflow:
1. Select existing chart or create new
2. Design chart with Seats.io designer
3. Map categories to ticket types

### Type Definitions
**File:** `src/types/seating-types.js`

Comprehensive types supporting both workflows:
- `VenueChart`
- `ChartCategory`
- `DesignerConfig`
- `CreateChartRequest`
- `CategoryMapping`

---

## What's Missing (Admin-Facing)

### 1. Admin Service Layer ❌

**File:** `src/services/admin/adminVenueCharts.service.js` (doesn't exist)

**Required Methods:**

```javascript
// List & Retrieve
getVenueCharts({ search, active, limit, page })  // GET /admin/seatsio/venue-charts
getVenueChart(id)                                 // GET /admin/seatsio/venue-charts/{id}

// CRUD
createVenueChart(data)                            // POST /admin/seatsio/venue-charts
updateVenueChart(id, data)                        // PATCH /admin/seatsio/venue-charts/{id}
deleteVenueChart(id)                              // DELETE /admin/seatsio/venue-charts/{id}

// Designer
getDesignerConfig(id)                             // GET /admin/seatsio/venue-charts/{id}/designer

// Actions
syncChart(id)                                     // POST /admin/seatsio/venue-charts/{id}/sync
publishChart(id)                                  // POST /admin/seatsio/venue-charts/{id}/publish
activateChart(id)                                 // POST /admin/seatsio/venue-charts/{id}/activate
deactivateChart(id)                               // POST /admin/seatsio/venue-charts/{id}/deactivate
```

### 2. Admin Pages ❌

**Required Pages:**

| Page | Route | Purpose |
|------|-------|---------|
| **List Page** | `/panel/admin/seatsio/venue-charts` | Table of all charts with search/filters |
| **Create Page** | `/panel/admin/seatsio/venue-charts/new` | Form to create new chart |
| **Detail Page** | `/panel/admin/seatsio/venue-charts/[id]` | View chart details + actions |
| **Edit Page** | `/panel/admin/seatsio/venue-charts/[id]/edit` | Form to update chart |

### 3. Admin Components ❌

**Required Components:**

| Component | Purpose | Features |
|-----------|---------|----------|
| **VenueChartsTable** | Display charts in table | Sorting, search, filters, pagination |
| **VenueChartForm** | Create/edit form | Validation, category management |
| **VenueChartDetail** | Show chart info | All metadata, capacity breakdown |
| **ChartActions** | Action buttons | Sync, publish, activate/deactivate |
| **DeleteChartModal** | Delete confirmation | Warning, event count check |
| **ChartStatusBadge** | Status indicator | Active/inactive visual badge |
| **ChartFilters** | Filter controls | Search, active status, pagination |
| **CategoryList** | Display categories | Color swatches, capacity per category |

### 4. Navigation Integration ❌

**Need to Add:**
- "Venue Charts" link in admin sidebar
- Under "Seating Management" or similar section
- Icon + label + active state

### 5. Authorization Checks ❌

**Need to Implement:**
- Super-admin role check on all admin pages
- Redirect non-admin users
- Protect API calls with role verification

---

## Implementation Roadmap

### Phase 1: Foundation (4-6 hours)

**Goal:** Set up infrastructure

1. Create admin service layer
   - File: `src/services/admin/adminVenueCharts.service.js`
   - Implement all 10 API methods
   - Add error handling and auth headers

2. Set up routing structure
   - Create directory: `src/app/panel/admin/seatsio/venue-charts/`
   - Add layout file (optional)
   - Configure navigation

3. Add to admin sidebar
   - Insert "Venue Charts" link
   - Add appropriate icon
   - Set active state logic

**Deliverables:**
- ✅ Service layer ready
- ✅ Routes configured
- ✅ Navigation updated

---

### Phase 2: List & View (8-10 hours)

**Goal:** Browse and view existing charts

1. **List Page** (`page.js`)
   - Server component for initial data fetch
   - Client component for interactions
   - Implement:
     - Data table with sortable columns
     - Search input (debounced)
     - Active/inactive filter dropdown
     - Pagination controls
     - "Create New Chart" button
     - Loading skeletons
     - Empty state

2. **VenueChartsTable Component**
   - Responsive design (mobile: cards, desktop: table)
   - Columns: name, venue, city, capacity, status, created_by, actions
   - Row actions: View, Edit, Delete
   - Status badge integration

3. **Detail Page** (`[id]/page.js`)
   - Fetch and display full chart data
   - Metadata sections:
     - Chart info (name, description, chart_key)
     - Venue details (name, address, city, country)
     - Capacity info (total, by category)
     - Categories with colors
     - Creator and timestamps
   - Action buttons section
   - Back to list link

4. **ChartStatusBadge Component**
   - Green badge for active
   - Gray badge for inactive
   - Consistent styling

**Deliverables:**
- ✅ List page with search and filters
- ✅ Detail view page
- ✅ Table component
- ✅ Status badges

---

### Phase 3: Create & Edit (6-8 hours)

**Goal:** CRUD operations

1. **Create Page** (`new/page.js`)
   - Form component integration
   - Field validation
   - Category management (add/remove)
   - Submit handler
   - Success: redirect to detail page
   - Error: show inline validation

2. **Edit Page** (`[id]/edit/page.js`)
   - Fetch current data
   - Pre-populate form
   - Same form as create (pass initial data)
   - PATCH request on submit
   - Success: redirect to detail page

3. **VenueChartForm Component**
   - Controlled form with React Hook Form or Formik
   - Fields:
     - Name (required, max 200)
     - Description (optional, textarea)
     - Venue Name (required, max 200)
     - Venue Address (optional)
     - City (optional, max 100)
     - Country (optional, max 100)
     - Categories (dynamic list):
       - Key (required, max 50)
       - Label (required, max 100)
       - Color (optional, color picker)
   - Validation rules per API spec
   - "Add Category" / "Remove Category" buttons
   - Submit and Cancel buttons
   - Loading state during submission

4. **CategoryList Component**
   - Display categories with color swatches
   - Edit/remove functionality for form
   - Read-only view for detail page

**Deliverables:**
- ✅ Create page + form
- ✅ Edit page + form
- ✅ Form validation
- ✅ Category management

---

### Phase 4: Actions & Delete (4-6 hours)

**Goal:** Chart operations

1. **Delete Flow**
   - Delete button on detail page
   - Delete action in table
   - DeleteChartModal component:
     - Warning message
     - Chart name display
     - Confirmation input (type name to confirm)
     - Handle "chart in use" error
     - Show event count if deletion blocked
   - Success: redirect to list with toast
   - Error: show error message

2. **ChartActions Component**
   - Sync button:
     - Confirmation modal (optional)
     - Call `syncChart(id)`
     - Show updated capacity/categories
     - Success toast
   - Publish button:
     - Confirmation modal
     - Call `publishChart(id)`
     - Success toast
   - Activate/Deactivate toggle:
     - Switch or button
     - Call appropriate endpoint
     - Update UI immediately
     - Success toast

3. **Toast Notifications**
   - Set up toast library (if not already)
   - Success messages for all actions
   - Error messages with details

**Deliverables:**
- ✅ Delete modal + confirmation
- ✅ Sync functionality
- ✅ Publish functionality
- ✅ Activate/deactivate toggle
- ✅ Toast notifications

---

### Phase 5: Polish & Testing (4-6 hours)

**Goal:** Production-ready quality

1. **Loading States**
   - Skeleton loaders for list page
   - Spinner for actions
   - Disabled state for forms during submit
   - Loading overlay for modals

2. **Error Handling**
   - 401: Redirect to login
   - 403: Show "insufficient permissions"
   - 404: Show "chart not found" page
   - 422: Display validation errors inline
   - 500: Show error message with retry button

3. **Responsive Design**
   - Mobile-friendly table (convert to cards)
   - Touch-friendly buttons
   - Proper spacing and typography
   - Test on various screen sizes

4. **Accessibility**
   - ARIA labels for all interactive elements
   - Keyboard navigation support
   - Focus management in modals
   - Screen reader friendly

5. **Testing**
   - Manual testing of all flows
   - Edge case testing
   - Cross-browser testing
   - Performance testing (large datasets)

**Deliverables:**
- ✅ All loading states
- ✅ Complete error handling
- ✅ Responsive design
- ✅ Accessibility compliance
- ✅ Tested and bug-free

---

## Technical Specifications

### Authentication & Authorization

**Required Role:** `super-admin`

**Implementation Pattern:**

```javascript
// In page component
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VenueChartsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'super-admin') {
      router.push('/unauthorized');
    }
  }, [user, router]);

  if (!user || user.role !== 'super-admin') {
    return null; // or loading spinner
  }

  // ... rest of component
}
```

**Service Layer:**

```javascript
// In adminVenueCharts.service.js
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken'); // or from context
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const getVenueCharts = async (params) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/seatsio/venue-charts?${new URLSearchParams(params)}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw await handleApiError(response);
  }

  return response.json();
};
```

### State Management

**Recommended:** React Query / TanStack Query

**Why:**
- Automatic caching
- Background refetching
- Optimistic updates
- Easy pagination
- Error retry logic

**Example:**

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminVenueCharts } from '@/services/admin/adminVenueCharts.service';

// List query
const { data, isLoading, error } = useQuery({
  queryKey: ['venue-charts', { search, active, page }],
  queryFn: () => adminVenueCharts.getVenueCharts({ search, active, page }),
  keepPreviousData: true, // for smooth pagination
});

// Create mutation
const queryClient = useQueryClient();
const createMutation = useMutation({
  mutationFn: adminVenueCharts.createVenueChart,
  onSuccess: () => {
    queryClient.invalidateQueries(['venue-charts']);
    router.push('/panel/admin/seatsio/venue-charts');
  },
});

// Usage
const handleSubmit = (formData) => {
  createMutation.mutate(formData);
};
```

### Form Validation

**Recommended:** React Hook Form + Zod

**Schema Example:**

```javascript
import { z } from 'zod';

const venueChartSchema = z.object({
  name: z.string()
    .min(1, 'Chart name is required')
    .max(200, 'Chart name must be 200 characters or less'),
  description: z.string().optional(),
  venue_name: z.string()
    .min(1, 'Venue name is required')
    .max(200, 'Venue name must be 200 characters or less'),
  venue_address: z.string().optional(),
  city: z.string().max(100, 'City must be 100 characters or less').optional(),
  country: z.string().max(100, 'Country must be 100 characters or less').optional(),
  categories: z.array(
    z.object({
      key: z.string()
        .min(1, 'Category key is required')
        .max(50, 'Category key must be 50 characters or less'),
      label: z.string()
        .min(1, 'Category label is required')
        .max(100, 'Category label must be 100 characters or less'),
      color: z.string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code')
        .optional(),
    })
  ).optional(),
});
```

**Usage:**

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const VenueChartForm = ({ initialData, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(venueChartSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      {/* ... more fields */}
    </form>
  );
};
```

### Error Handling

**Centralized Error Handler:**

```javascript
const handleApiError = async (response) => {
  if (response.status === 422) {
    const data = await response.json();
    return {
      type: 'validation',
      errors: data.errors, // { name: ['error msg'], ... }
    };
  }

  if (response.status === 404) {
    return { type: 'not_found', message: 'Chart not found' };
  }

  if (response.status === 403) {
    return { type: 'forbidden', message: 'Insufficient permissions' };
  }

  const data = await response.json().catch(() => ({}));
  return {
    type: 'server_error',
    message: data.message || 'Something went wrong',
  };
};
```

### Performance Optimizations

1. **Pagination:** Default 20 items per page, configurable
2. **Search Debouncing:** 300ms delay after typing
3. **Memoization:** Use `useMemo` for expensive calculations
4. **Virtual Scrolling:** If table has 100+ rows
5. **Image Optimization:** Use Next.js `<Image>` for any chart thumbnails
6. **Code Splitting:** Dynamic imports for modals and designer

---

## Required File Structure

```
src/
├── services/
│   └── admin/
│       └── adminVenueCharts.service.js       ❌ NEW
│
├── components/
│   └── admin/
│       └── venue-charts/                      ❌ NEW DIRECTORY
│           ├── VenueChartsTable.js
│           ├── VenueChartForm.js
│           ├── VenueChartDetail.js
│           ├── ChartActions.js
│           ├── DeleteChartModal.js
│           ├── ChartStatusBadge.js
│           ├── ChartFilters.js
│           └── CategoryList.js
│
├── app/
│   └── panel/
│       └── admin/
│           └── seatsio/                       ❌ NEW DIRECTORY
│               └── venue-charts/
│                   ├── page.js                 (list)
│                   ├── layout.js               (optional)
│                   ├── loading.js              (optional)
│                   ├── new/
│                   │   └── page.js             (create)
│                   └── [id]/
│                       ├── page.js             (detail)
│                       ├── loading.js          (optional)
│                       ├── error.js            (optional)
│                       └── edit/
│                           └── page.js         (edit)
│
├── hooks/                                     ❌ OPTIONAL
│   └── admin/
│       ├── useVenueCharts.js
│       └── useVenueChartActions.js
│
├── utils/
│   └── venueChartValidation.js                ❌ NEW
│
└── types/
    └── seating-types.js                        ✅ EXISTS (reuse)
```

---

## Code Examples

### Service Layer Implementation

**File:** `src/services/admin/adminVenueCharts.service.js`

```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw error;
  }
  return response.json();
};

/**
 * Get list of venue charts with filters
 * @param {Object} params - Query parameters
 * @param {string} [params.search] - Search term
 * @param {boolean} [params.active] - Filter by active status
 * @param {number} [params.limit=20] - Items per page
 * @param {number} [params.page=1] - Page number
 */
export const getVenueCharts = async ({ search, active, limit = 20, page = 1 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (active !== undefined) params.append('active', active);
  params.append('limit', limit);
  params.append('page', page);

  const response = await fetch(
    `${API_BASE_URL}/admin/seatsio/venue-charts?${params}`,
    { headers: getAuthHeaders() }
  );

  return handleResponse(response);
};

/**
 * Get single venue chart by ID
 * @param {string} id - Chart ID
 */
export const getVenueChart = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/seatsio/venue-charts/${id}`,
    { headers: getAuthHeaders() }
  );

  return handleResponse(response);
};

/**
 * Create new venue chart
 * @param {Object} data - Chart data
 */
export const createVenueChart = async (data) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/seatsio/venue-charts`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
};

/**
 * Update existing venue chart
 * @param {string} id - Chart ID
 * @param {Object} data - Updated chart data
 */
export const updateVenueChart = async (id, data) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/seatsio/venue-charts/${id}`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
};

/**
 * Delete venue chart
 * @param {string} id - Chart ID
 */
export const deleteVenueChart = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/seatsio/venue-charts/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

/**
 * Get designer configuration for chart
 * @param {string} id - Chart ID
 */
export const getDesignerConfig = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/seatsio/venue-charts/${id}/designer`,
    { headers: getAuthHeaders() }
  );

  return handleResponse(response);
};

/**
 * Sync chart data from Seats.io
 * @param {string} id - Chart ID
 */
export const syncChart = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/seatsio/venue-charts/${id}/sync`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

/**
 * Publish chart changes
 * @param {string} id - Chart ID
 */
export const publishChart = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/seatsio/venue-charts/${id}/publish`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

/**
 * Activate chart
 * @param {string} id - Chart ID
 */
export const activateChart = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/seatsio/venue-charts/${id}/activate`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

/**
 * Deactivate chart
 * @param {string} id - Chart ID
 */
export const deactivateChart = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/seatsio/venue-charts/${id}/deactivate`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

export const adminVenueCharts = {
  getVenueCharts,
  getVenueChart,
  createVenueChart,
  updateVenueChart,
  deleteVenueChart,
  getDesignerConfig,
  syncChart,
  publishChart,
  activateChart,
  deactivateChart,
};
```

---

### List Page Implementation

**File:** `src/app/panel/admin/seatsio/venue-charts/page.js`

```javascript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { adminVenueCharts } from '@/services/admin/adminVenueCharts.service';
import VenueChartsTable from '@/components/admin/venue-charts/VenueChartsTable';
import ChartFilters from '@/components/admin/venue-charts/ChartFilters';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VenueChartsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'true' | 'false'
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Auth check
  if (!user || user.role !== 'super-admin') {
    router.push('/unauthorized');
    return null;
  }

  // Fetch charts
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['venue-charts', { search, active: activeFilter !== 'all' ? activeFilter : undefined, page, limit }],
    queryFn: () => adminVenueCharts.getVenueCharts({
      search,
      active: activeFilter !== 'all' ? activeFilter === 'true' : undefined,
      page,
      limit,
    }),
    keepPreviousData: true,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Venue Charts</h1>
        <Link href="/panel/admin/seatsio/venue-charts/new">
          <Button>Create New Chart</Button>
        </Link>
      </div>

      <ChartFilters
        search={search}
        onSearchChange={setSearch}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
      />

      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error.message}</div>}

      {data && (
        <>
          <VenueChartsTable
            charts={data.data}
            onRefresh={refetch}
          />

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-600">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.meta.total)} of {data.meta.total} charts
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.meta.last_page}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

---

### Table Component

**File:** `src/components/admin/venue-charts/VenueChartsTable.js`

```javascript
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ChartStatusBadge from './ChartStatusBadge';
import { Trash2, Edit, Eye } from 'lucide-react';
import { useState } from 'react';
import DeleteChartModal from './DeleteChartModal';

export default function VenueChartsTable({ charts, onRefresh }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chartToDelete, setChartToDelete] = useState(null);

  const handleDeleteClick = (chart) => {
    setChartToDelete(chart);
    setDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteModalOpen(false);
    setChartToDelete(null);
    onRefresh();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chart Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Venue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {charts.map((chart) => (
              <tr key={chart.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {chart.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{chart.venue_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {chart.city}{chart.city && chart.country && ', '}{chart.country}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {chart.total_capacity.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ChartStatusBadge isActive={chart.is_active} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{chart.createdBy?.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link href={`/panel/admin/seatsio/venue-charts/${chart.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/panel/admin/seatsio/venue-charts/${chart.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(chart)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {chartToDelete && (
        <DeleteChartModal
          isOpen={deleteModalOpen}
          chartId={chartToDelete.id}
          chartName={chartToDelete.name}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
```

---

## Testing Checklist

### Functional Testing

#### List Page
- [ ] Page loads and displays charts
- [ ] Search filters charts by name, venue, city
- [ ] Active filter shows only active charts
- [ ] Inactive filter shows only inactive charts
- [ ] Pagination works correctly
- [ ] "Create New Chart" button navigates to create page
- [ ] Empty state shown when no charts exist
- [ ] Loading state shown while fetching

#### Create Page
- [ ] Form displays all required fields
- [ ] Name field validation (required, max 200)
- [ ] Venue name field validation (required, max 200)
- [ ] Optional fields work correctly
- [ ] Category fields validation
- [ ] "Add Category" button adds new category row
- [ ] "Remove Category" button removes category
- [ ] Submit creates chart successfully
- [ ] Validation errors display inline
- [ ] Success redirects to detail page
- [ ] Cancel button returns to list

#### Detail Page
- [ ] All chart metadata displays correctly
- [ ] Categories show with correct colors
- [ ] Capacity breakdown is accurate
- [ ] Active status badge shows correct state
- [ ] Creator information displays
- [ ] Timestamps are formatted correctly
- [ ] Edit button navigates to edit page
- [ ] Back button returns to list

#### Edit Page
- [ ] Form pre-populates with current data
- [ ] Changes save successfully
- [ ] Validation works same as create
- [ ] Success redirects to detail page
- [ ] Cancel returns to detail page

#### Delete Flow
- [ ] Delete button opens confirmation modal
- [ ] Modal shows chart name
- [ ] Confirmation required to delete
- [ ] Success deletes chart and returns to list
- [ ] Error shown if chart is in use
- [ ] Event count displayed in error message

#### Chart Actions
- [ ] Sync button updates chart data
- [ ] Sync shows updated capacity
- [ ] Publish button publishes chart
- [ ] Activate changes status to active
- [ ] Deactivate changes status to inactive
- [ ] All actions show success toast
- [ ] Errors are handled gracefully

### Edge Cases
- [ ] Empty search results
- [ ] Very long chart names (200 chars)
- [ ] Very long venue names (200 chars)
- [ ] Chart with 50+ categories
- [ ] Chart with 0 capacity (not yet synced)
- [ ] Network error during fetch
- [ ] Network error during create/update/delete
- [ ] Concurrent edits (two users editing same chart)
- [ ] Special characters in names (unicode, emojis)
- [ ] SQL injection attempts in search
- [ ] XSS attempts in text fields

### Authorization
- [ ] Non-admin users redirected to unauthorized
- [ ] Unauthenticated users redirected to login
- [ ] API calls include auth token
- [ ] 403 errors handled correctly

### Performance
- [ ] List page loads in <2s with 100 charts
- [ ] Search is debounced (no request per keystroke)
- [ ] Table renders smoothly with 50+ rows
- [ ] Form submits in <1s
- [ ] No memory leaks on page navigation

### Cross-Browser
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

### Mobile Responsive
- [ ] Table converts to cards on mobile
- [ ] Forms are usable on mobile
- [ ] Buttons are touch-friendly
- [ ] Modals display correctly on small screens

---

## Summary

### Implementation Scope

**Total Estimated Time:** 22-32 hours

**Breakdown:**
- Service Layer: 3-4 hours
- List Page: 6-8 hours
- Create/Edit: 6-8 hours
- Delete + Actions: 4-6 hours
- Polish + Testing: 4-6 hours

### What Exists ✅
- Organizer seating workflow (complete)
- Type definitions (comprehensive)
- Existing components for chart display
- Service patterns to follow

### What's Missing ❌
- All admin pages (0/4 pages)
- All admin components (0/8 components)
- Admin service layer (0/10 methods)
- Navigation integration
- Authorization checks

### Next Steps

1. **Backend Verification**
   - Confirm all 10 Laravel endpoints are implemented
   - Verify authentication works with Sanctum
   - Test CORS configuration
   - Check rate limiting

2. **Frontend Development**
   - Follow roadmap phases 1-5
   - Use existing admin pages as reference
   - Reuse components where possible
   - Maintain UI consistency

3. **Testing**
   - Manual testing all flows
   - Edge case verification
   - Cross-browser testing
   - Mobile responsive testing

4. **Deployment**
   - Staging environment testing
   - UAT with super-admins
   - Production deployment
   - Monitor for errors

---

## Questions for Backend Team

Before starting implementation:

1. Are all 10 endpoints fully implemented in Laravel?
2. What's the actual API base URL? (doc says `https://api.parlomo.co.uk/api`)
3. Is Sanctum authentication configured and working?
4. Are CORS headers set for the frontend domain?
5. What's the rate limit on these endpoints?
6. Are there any additional endpoints needed (bulk operations)?
7. What Seats.io environment variables are required?
8. Is there a staging/development API available for testing?

---

**Document Maintained By:** Development Team
**For Questions:** Contact backend team lead or project manager
