# Parlomo Ticketing Platform - Implementation Plan

Transform Parlomo from event listings into a full-featured ticketing platform supporting GA and seated events, with payments, QR tickets, scanning, and organizer dashboards.

## 📋 Table of Contents

- [Time Estimation](#time-estimation)
- [Current State Analysis](#current-state-analysis)
- [Architecture Strategy](#architecture-strategy)
- [Proposed Changes](#proposed-changes)
- [Verification Plan](#verification-plan)
- [User Review Required](#user-review-required)
- [Next Steps](#next-steps)
- [Migration to Laravel](#migration-to-laravel-backend)

---

## ⏱️ Time Estimation

### **Phase 0 - Infrastructure & Setup**
**2-3 hours**
- Data models & TypeScript types: 30 min
- Mock database system: 1 hour
- Seed data & utilities: 1-1.5 hours

### **Phase 1 - GA Ticketing MVP** ⭐
**12-16 hours**
- API routes (7 endpoints): 3-4 hours
- Redux slices (ticketing + orders): 2 hours
- Public ticketing page + components: 3-4 hours
- Checkout flow + Stripe integration: 3-4 hours
- Confirmation page + ticket display: 1.5 hours
- Organizer dashboard: 3-4 hours
- Testing & debugging: 2-3 hours

### **Phase 2 - Public Events & Promo Codes** ⭐
**13-19 hours**
- Public events data model & types: 2-3 hours
- API routes (7 endpoints): 2-3 hours
- Services & Redux: 1-2 hours
- Event management UI: 4-5 hours
- Promo code manager UI: 2-3 hours
- Integration & testing: 2-3 hours

### **Phase 2.6 - Public Event Categories** ✅
**6-7 hours**
- MongoDB model & database layer: 1 hour
- API routes with image upload: 1 hour
- Service layer & Redux slice: 1 hour
- Admin UI components: 2 hours
- Admin page & navigation: 1 hour
- Testing: 30 min

### **Phase 3 - Seated Events**
**8-10 hours**
- Seat data models & hold mechanism: 2-3 hours
- Interactive seat selection UI: 3-4 hours
- API extensions: 1.5 hours
- Integration & testing: 2-3 hours

### **Phase 4 - Advanced Features**
**10-15 hours** (varies by scope)

### **Timeline Summary:**

| Scope | Estimated Time | Calendar Days | Status |
|-------|----------------|---------------|--------|
| **Phase 0 + Phase 1 MVP** | **15-20 hours** | **2-3 days** | ✅ Complete |
| **Up to Phase 2 (Public Events)** | **28-39 hours** | **3-5 days** | ✅ Complete |
| **Up to Phase 2.5 (Financials)** | **39-54 hours** | **5-8 days** | ✅ Complete |
| **Up to Phase 2.6 (Categories)** | **45-61 hours** | **6-8 days** | ✅ Complete |
| **Up to Phase 3 (Seated Events)** | **53-71 hours** | **7-10 days** | Pending |
| **All Phases Complete** | **56-76 hours** | **7-10 days** | Pending |

---

## Current State Analysis

### Existing Infrastructure ✅
- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4 + CSS Custom Properties
- **State**: Redux Toolkit + React Context
- **Auth**: JWT-based with httpOnly cookies
- **Storage**: Abstracted layer (local/cloud ready)
- **Icons**: Lucide React
- **Forms**: Formik + Yup
- **Payments**: Stripe already integrated (`@stripe/react-stripe-js`, `@stripe/stripe-js`)

### Current Event System
The app already has a basic event management system:
- **Service**: `src/services/events.service.js` - CRUD operations for events
- **State**: `src/features/events/eventsSlice.js` - Redux slice for events
- **Panel Pages**: `src/app/panel/admin/events/` - Admin event management
- **Components**: Event creation/editing modals, tables, detail views

### Current Architecture
```
src/
├── app/
│   ├── (auth)/              # Login/register
│   ├── panel/               # Admin dashboard
│   │   ├── admin/          # Admin features
│   │   ├── businesses/     # Business listings
│   │   ├── marketplace/    # Marketplace ads
│   │   └── bookmarks/      # Saved items
│   ├── directory-search/   # Public directory search
│   └── api/                # API routes (currently none)
├── components/
│   ├── common/             # Buttons, modals, cards
│   ├── forms/              # Form fields
│   ├── layout/             # Layouts (FrontLayout, MainLayout)
│   │   └── front/         # Public-facing header
│   └── front/              # Public directory search components
├── features/               # Redux slices
├── services/              # API services
├── lib/                   # Utilities (axios, store, storage)
├── contexts/              # Auth, Theme contexts
└── types/                 # Type definitions
```

## Architecture Strategy

### Backend Approach (Next.js API Routes)
Since we're starting without the Laravel backend, we'll:
1. **Create Next.js API routes** in `src/app/api/ticketing/`
2. **Use mock data initially** with JSON files or in-memory storage
3. **Design data models** that mirror what Laravel will implement
4. **Build service layer** that can swap backends later

### Data Storage Strategy
For Phase 1 (MVP), we'll use:
- **Mock JSON files** in `/public/mock-data/` or
- **Server-side in-memory storage** (Map/Object)
- **localStorage** for client-side cart state

Migration path:
```
Phase 1: Next.js API → Mock Data
Phase 2: Next.js API → Laravel API (swap axios endpoints)
```

### State Management
- **Redux Toolkit** for ticketing business logic (cart, checkout, orders)
- **React Context** for checkout flow state
- **URL params** for event/ticket selection state

---

## Proposed Changes

### Component 1: Data Models & Types

#### `src/types/ticketing-types.js` [NEW]

Define TypeScript-style JSDoc types for the entire ticketing domain:
- `TicketType` - ticket tier/category configuration
- `Order` - purchase order with status and totals
- `OrderItem` - individual ticket purchase line
- `Ticket` - issued ticket instance with QR
- `PromoCode` - discount codes
- `Fee` - platform/service fees
- `SeatChart`, `Seat` - seating data (Phase 2)
- `Payout` - organizer payment records

---

### Component 2: Mock Data Layer

#### `src/lib/mock-ticketing-db.js` [NEW]

Server-side in-memory mock database with:
- In-memory Maps for `ticketTypes`, `orders`, `tickets`, `promoCodes`
- CRUD helper functions
- Auto-increment ID generation
- Mock Stripe payment simulation
- Seat hold/lock simulation (Phase 2)

#### `src/lib/seed-ticketing-data.js` [NEW]

Seed script to populate mock events with sample ticket types, promo codes, and initial orders for testing.

---

### Component 3: API Routes (Next.js)

All routes under `src/app/api/ticketing/`:

#### `events/[eventId]/route.js` [NEW]
- `GET` - Fetch event with ticket types, availability, pricing

#### `events/[eventId]/ticket-types/route.js` [NEW]
- `POST` - Create new ticket type (organizer)
- `PATCH` - Update ticket type

#### `checkout/start/route.js` [NEW]
- `POST` - Validate cart, reserve inventory, apply promos, calculate totals
- Returns checkout session ID and totals

#### `checkout/complete/route.js` [NEW]
- `POST` - Finalize order after payment
- Generate ticket instances with QR codes
- Mark order as paid

#### `orders/[orderId]/route.js` [NEW]
- `GET` - Fetch order details

#### `orders/[orderId]/tickets/route.js` [NEW]
- `GET` - Fetch tickets for order (with QR payload)

#### `promo/validate/route.js` [NEW]
- `POST` - Validate promo code and return discount

#### `scanner/scan/route.js` [NEW]
- `POST` - Verify ticket QR code, mark as used

---

### Component 4: Redux Slices

#### `src/features/ticketing/ticketingSlice.js` [NEW]

Manages:
- Current event ticketing details
- Available ticket types
- Shopping cart state (ticket selections)
- Applied promo codes
- Fee calculations
- Checkout status

Actions:
- `fetchEventTicketing(eventId)`
- `addToCart(ticketTypeId, quantity)`
- `removeFromCart(ticketTypeId)`
- `applyPromoCode(code)`
- `calculateTotals()`

#### `src/features/ticketing/ordersSlice.js` [NEW]

Manages:
- User's order history
- Current order details
- Tickets for orders

Actions:
- `fetchUserOrders()`
- `fetchOrderDetails(orderId)`
- `fetchOrderTickets(orderId)`

---

### Component 5: Frontend - Public Ticketing Flow

#### `src/app/event-ticketing/[eventId]/page.js` [NEW]

Public-facing event ticketing page with:
- Event hero section
- Ticket type cards with pricing
- Quantity selectors
- Add to cart buttons
- Sticky cart summary
- "Proceed to Checkout" CTA

Uses `FrontLayout` for consistent header/footer.

#### `src/components/ticketing/TicketTypeCard.js` [NEW]

Display ticket tier with:
- Name, description
- Price
- Availability count
- Quantity selector
- Max per order indicator

#### `src/components/ticketing/CartSummary.js` [NEW]

Sticky/modal cart showing:
- Selected tickets
- Subtotal
- Promo code input/application
- Fees breakdown
- Total
- "Checkout" button

#### `src/app/checkout/page.js` [NEW]

Checkout page with:
- Cart review
- Attendee information form
- Stripe payment form (Elements)
- Terms & conditions
- "Complete Purchase" button

#### `src/app/order-confirmation/[orderId]/page.js` [NEW]

Confirmation page showing:
- Order success message
- Order details
- Download tickets button
- Add to calendar option
- Email confirmation notice

#### `src/components/ticketing/TicketDisplay.js` [NEW]

Digital ticket component:
- Event info
- Ticket type, seat (if applicable)
- QR code display
- Ticket number
- Valid/used indicator

---

### Component 6: Frontend - Organizer Dashboard

#### `src/app/panel/events/[eventId]/ticketing/page.js` [NEW]

Event ticketing management dashboard:
- Ticket types list (create/edit/disable)
- Sales summary cards
- Revenue chart
- Attendee count
- Check-in status

#### `src/components/ticketing/organizer/TicketTypeManager.js` [NEW]

Component to:
- List existing ticket types
- Create new ticket type (name, price, capacity, min/max per order)
- Edit capacity/pricing
- Enable/disable ticket types

#### `src/components/ticketing/organizer/SalesDashboard.js` [NEW]

Dashboard showing:
- Total revenue
- Tickets sold by type
- Sales over time chart
- Average order value
- Promo code usage

#### `src/components/ticketing/organizer/AttendeeList.js` [NEW]

Table displaying:
- Attendee name/email
- Ticket type
- Order ID
- Check-in status
- Export to CSV button

---

### Component 7: Utilities & Helpers

#### `src/lib/ticketing/qr-generator.js` [NEW]

Generate secure QR codes for tickets:
- Create signed JWT payload
- Encode ticket data
- Return QR code data URL

#### `src/lib/ticketing/fee-calculator.js` [NEW]

Calculate fees and totals:
- Apply platform fees (% or fixed)
- Apply taxes/VAT
- Calculate promo discount
- Return breakdown object

#### `src/lib/ticketing/promo-validator.js` [NEW]

Validate promo codes:
- Check validity period
- Check max uses
- Check applicable ticket types
- Return discount amount

#### `src/lib/ticketing/ticket-generator.js` [NEW]

Generate ticket instances:
- Create unique ticket codes
- Generate QR payloads
- Assign sequential numbers

---

### Component 8: Services Layer

#### `src/services/ticketing.service.js` [NEW]

Client-side service to call ticketing APIs:
- `getEventTicketing(eventId)`
- `createTicketType(eventId, payload)`
- `startCheckout(cartData)`
- `completeOrder(orderId, paymentData)`
- `validatePromo(code, cartData)`
- `getOrderTickets(orderId)`

---

## Phase 2: Public Events & Promo Code Management

### Overview

Phase 2 introduces a separate `publicEvents` system for organizer-created ticketed events, distinct from the existing `adminEvents` (platform management). This allows any organizer to create and manage their own events with full ticketing integration.

### Strategic Rationale

**Why separate `publicEvents` from `adminEvents`?**

1. **Different Purposes**
   - `adminEvents`: Platform-managed events for directory/community features
   - `publicEvents`: Organizer-created ticketed events for commerce

2. **Different Permissions**
   - `adminEvents`: Only admins can create/manage
   - `publicEvents`: Any organizer can create/manage their events

3. **Different Data Requirements**
   - `adminEvents`: Directory-focused (postcode, showOnMap, validDate)
   - `publicEvents`: Commerce-focused (currency, tax, capacity, venue details)

4. **Cleaner Architecture**
   - Each system evolves independently
   - No coupling between ticketing and directory features

### Component 9: PublicEvent Data Model

#### `src/types/public-events-types.js` [NEW]

Complete type definition for public events:
- Core event info (title, description, category, slug)
- Date & time with timezone support
- Venue & location (address, city, coordinates)
- Ticketing configuration (eventType, globalCapacity, currency)
- Organizer information (name, email, phone, website)
- Media (coverImage, galleryImages, videoUrl)
- Status management (draft, published, cancelled, completed)
- Additional features (tags, ageRestriction, refundPolicy)
- Tax & fees configuration

### Component 10: Public Events Mock Database

#### `src/lib/mock-public-events-db.js` [NEW]

Server-side JSON database similar to ticketing:
- Storage in `public/mock-data/public-events/events.json`
- CRUD operations: `createPublicEvent`, `updatePublicEvent`, `getPublicEvent`, etc.
- Auto-incrementing IDs
- Slug generation from titles
- Organizer ownership filtering

#### `src/lib/seed-public-events-data.js` [NEW]

Seed 5-10 sample public events:
- Various categories (concert, conference, workshop, festival)
- Different dates (past, ongoing, future)
- Multiple venues and locations
- Linked to existing ticket types

### Component 11: Public Events API Routes

**Location:** `src/app/api/public-events/`

#### Endpoints:

- `POST /api/public-events` - Create event
- `GET /api/public-events` - List events (with filters: status, category, organizerId)
- `GET /api/public-events/[id]` - Get single event
- `PATCH /api/public-events/[id]` - Update event
- `DELETE /api/public-events/[id]` - Soft delete event
- `GET /api/public-events/[id]/stats` - Event statistics (tickets sold, revenue)
- `GET /api/public-events/categories` - Get event categories

All using `ticketingAxios` (localhost:3000) for consistency.

### Component 12: Public Events Service Layer

#### `src/services/public-events.service.js` [NEW]

Client-side service methods:
- `createEvent(payload)` - Create new public event
- `updateEvent(id, payload)` - Update event
- `getEvent(id)` - Fetch single event
- `getMyEvents(params)` - List organizer's events
- `deleteEvent(id)` - Delete event
- `getCategories()` - Fetch categories
- `getEventStats(id)` - Get analytics

### Component 13: Public Events Redux Slice

#### `src/features/public-events/publicEventsSlice.js` [NEW]

State management:

```javascript
// State
{
    myEvents: [],
    currentEvent: null,
    categories: [],
    loading: false,
    error: null,
}

// Async Thunks
- fetchMyEvents()
- fetchEventById()
- createEvent()
- updateEvent()
- deleteEvent()
- fetchCategories()
```

### Component 14: Organizer Event Management UI

#### `src/app/panel/my-events/page.js` [NEW]

Main event management page:
- Grid/list view of organizer's events
- Create new event button
- Status filters (all, draft, published, cancelled)
- Search and category filters
- Event cards showing stats (tickets sold, revenue)
- Quick actions (edit, ticketing, analytics, delete)

#### `src/app/panel/my-events/create/page.js` [NEW]

Event creation page with multi-step form.

#### `src/app/panel/my-events/[id]/edit/page.js` [NEW]

Event editing page reusing the same form.

### Component 15: Event Form Components

#### `src/components/public-events/EventForm.js` [NEW]

Multi-step event creation form:

**Step 1: Event Details**
- Title, description
- Category selection
- Tags

**Step 2: Date & Time**
- Start date/time
- End date/time (optional)
- Timezone selector
- Doors open time

**Step 3: Location**
- Venue name
- Full address entry
- City, state, country, postcode
- Map integration (optional)

**Step 4: Organizer Info**
- Contact name
- Email, phone
- Website URL

**Step 5: Ticketing Settings**
- Event type (general admission/seated)
- Global capacity
- Currency
- Waitlist enabled

**Step 6: Media**
- Cover image upload
- Gallery images
- Video URL

**Step 7: Policies & Settings**
- Age restrictions
- Refund policy
- Terms and conditions
- Tax settings

#### Supporting Components:

- `src/components/public-events/EventCard.js` - Event display card
- `src/components/public-events/EventsList.js` - Event list with filters
- `src/components/public-events/DateTimePicker.js` - Date/time selection
- `src/components/public-events/VenueSelector.js` - Venue/location form
- `src/components/public-events/MediaUploader.js` - Image upload

### Component 16: Promo Code Management UI

#### `src/components/ticketing/organizer/PromoCodeManager.js` [NEW]

Promo code management interface:
- List existing promo codes
- Create new promo code with:
  - Code generation or custom code
  - Discount type (percentage/fixed amount)
  - Discount value
  - Valid from/until dates
  - Max uses total
  - Max uses per user
  - Applicable ticket types
- Edit/disable existing codes
- Usage analytics (times used, revenue impact)

#### API Extensions:

- `GET /api/ticketing/events/[eventId]/promo-codes` - List event promo codes
- `POST /api/ticketing/events/[eventId]/promo-codes` - Create promo code
- `PATCH /api/ticketing/promo-codes/[id]` - Update promo code
- `DELETE /api/ticketing/promo-codes/[id]` - Delete promo code

Add as 4th tab in `/panel/events/[eventId]/ticketing/page.js`.

### Integration Workflow

1. **Create Public Event**
   - Organizer navigates to `/panel/my-events`
   - Clicks "Create Event"
   - Fills multi-step form
   - Saves as draft or publish

2. **Setup Ticketing**
   - After event creation, redirect to `/panel/events/[id]/ticketing`
   - Create ticket types using existing `TicketTypeManager`
   - Create promo codes using new `PromoCodeManager`
   - Configure sales dashboard

3. **Publish Event**
   - Change status to "published"
   - Event becomes visible (future: public event listing page)

### Data Relationships

```
PublicEvent (1) ─┬─→ (many) TicketTypes
                 ├─→ (many) PromoCodes
                 ├─→ (many) Orders
                 └─→ (many) Tickets
```

### Navigation Updates

Add to sidebar:

```
Panel
├── Dashboard
├── My Events                    # NEW
│   ├── All Events
│   ├── Create Event
│   └── Drafts
├── My Businesses (existing)
├── My Ads (existing)
└── Bookmarks (existing)
```

### File Structure

```
src/
├── app/
│   ├── api/public-events/          # NEW - 7 routes
│   └── panel/my-events/            # NEW - 3 pages
├── components/
│   ├── public-events/              # NEW - 6 components
│   └── ticketing/organizer/
│       └── PromoCodeManager.js     # NEW
├── features/
│   └── public-events/              # NEW - Redux slice
├── lib/
│   ├── mock-public-events-db.js   # NEW
│   └── seed-public-events-data.js  # NEW
├── services/
│   └── public-events.service.js    # NEW
└── types/
    └── public-events-types.js      # NEW
```

### Time Estimation

- **Data Layer & Types**: 2-3 hours
- **API Routes**: 2-3 hours
- **Services & Redux**: 1-2 hours
- **Event Management UI**: 4-5 hours
- **Promo Code Manager**: 2-3 hours
- **Integration & Testing**: 2-3 hours

**Total Phase 2: 13-19 hours** (~2-3 days)

### Success Criteria

After Phase 2 completion, organizers can:
1. ✅ Create and manage their public ticketed events
2. ✅ Set up complete ticketing configuration
3. ✅ Create and manage ticket types
4. ✅ Create and manage promo codes with analytics
5. ✅ View event and sales statistics
6. ✅ Publish events to make them live

---

## Phase 2.5: Financials & Administration (Settlements & Refunds)

### Overview
Implement financial workflows for organizers to request settlements (payouts) and refunds, with an admin interface to review and process these requests manually.

### Component 17: Financial Data Models

#### `src/types/financial-types.js` [NEW]
- `SettlementRequest`: Request for payout of event ticket sales.
  - `id`, `organizerId`, `eventId`, `amount`, `status` (PENDING, APPROVED, REJECTED, PAID), `requestedAt`, `processedAt`, `adminNotes`
- `RefundRequest`: Request for refunding orders (e.g., event cancellation).
  - `id`, `organizerId`, `eventId`, `reason`, `status` (PENDING, APPROVED, REJECTED, PROCESSED), `type` (EVENT_CANCELLATION, BULK_REFUND), `requestedAt`, `processedAt`, `adminNotes`

### Component 18: Financial API Routes

**Location:** `src/app/api/financials/`

#### Endpoints:
- `POST /api/financials/settlements` - Create settlement request (Organizer)
- `GET /api/financials/settlements/organizer` - List own settlement requests (Organizer)
- `GET /api/financials/settlements/admin` - List all settlement requests (Admin)
- `PATCH /api/financials/settlements/[id]` - Approve/Reject/Mark Paid (Admin)
- `POST /api/financials/refunds` - Create refund request (Organizer)
- `GET /api/financials/refunds/organizer` - List own refund requests (Organizer)
- `GET /api/financials/refunds/admin` - List all refund requests (Admin)
- `PATCH /api/financials/refunds/[id]` - Approve/Reject/Process (Admin)

### Component 19: Organizer Financial UI

#### `src/app/panel/my-events/[id]/financials/page.js` [NEW]
- Tab in Event Dashboard.
- **Settlement Section**:
  - Show total sales, platform fees, net revenue.
  - "Request Settlement" button (if eligible).
  - Status of previous requests.
- **Refund Section**:
  - "Request Refund/Cancellation" button.
  - Form to provide reason.
  - Status of refund requests.

### Component 20: Admin Financial UI

#### `src/app/panel/admin/financials/settlements/page.js` [NEW]
- Table of all settlement requests.
- Columns: Organizer, Event, Amount, Status, Date.
- Actions: View details, Approve (Manual Transfer), Reject.

#### `src/app/panel/admin/financials/refunds/page.js` [NEW]
- Table of all refund requests.
- Columns: Organizer, Event, Reason, Status, Date.
- Actions: View details, Approve (Manual Refund), Reject.

### Time Estimation
- **Data Models & API**: 3-4 hours
- **Organizer UI**: 3-4 hours
- **Admin UI**: 3-4 hours
- **Integration & Testing**: 2-3 hours
**Total Phase 2.5: 11-15 hours**

---

## Phase 2.6: Public Event Categories Management ✅ **Complete**

### Overview
Implement a dedicated category management system for public events, separate from the legacy admin event categories. Categories are stored in MongoDB and can be managed at runtime through an admin interface.

### Rationale

**Why separate from admin event categories?**
1. **Different storage**: Admin categories use legacy Laravel backend; public categories use local MongoDB
2. **Different features**: Public categories support Lucide icons, images, and custom sorting
3. **Independent evolution**: Each system can evolve without affecting the other
4. **Decoupled from legacy**: Public ticketing doesn't depend on legacy backend for categories

### Component 21: Public Event Category Data Model ✅

#### `src/models/ticketing/PublicEventCategory.js` [NEW]
```javascript
{
  _id: ObjectId,
  name: String,           // Display name (e.g., "Concert")
  slug: String,           // URL-friendly identifier (auto-generated)
  icon: String,           // Lucide React icon name (e.g., "Music")
  image: String,          // Category image URL (uploaded file path)
  description: String,    // Category description
  status: String,         // "active" | "inactive"
  sortOrder: Number,      // Display order
  createdAt: Date,
  updatedAt: Date
}
```

Features:
- Auto-generated slug from name (with uniqueness check)
- Static methods: `findActive()`, `findBySlug()`, `getNextSortOrder()`
- Indexes on: slug (unique), status, sortOrder

### Component 22: Category Database Layer ✅

#### `src/lib/public-event-categories-db.js` [NEW]

CRUD operations:
- `getAllCategories(options)` - With pagination, status filter, search
- `getActiveCategories()` - For public-facing use
- `getCategory(id)` - Get single category
- `getCategoryBySlug(slug)` - Get by slug
- `createCategory(data)` - Create new category
- `updateCategory(id, updates)` - Update category
- `deleteCategory(id)` - Delete category
- `toggleCategoryStatus(id)` - Toggle active/inactive
- `seedDefaultCategories()` - Seed from hardcoded defaults
- `reorderCategories(orderedIds)` - Bulk reorder

### Component 23: Image Upload Utility ✅

#### `src/lib/upload-handler.js` [NEW]

File upload handling:
- `saveUploadedFile(file, options)` - Save uploaded file with validation
- `deleteUploadedFile(url)` - Delete file by URL
- `parseFormData(request)` - Parse multipart/form-data
- `handleCategoryImageUpload(file, existingUrl)` - Handle category image with cleanup

Features:
- Stores images in `public/uploads/categories/`
- Generates unique filenames (timestamp + random)
- Validates file type and size
- Cleans up old images on update

### Component 24: Category API Routes ✅

**Location:** `src/app/api/public-events/categories/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/public-events/categories` | GET | List categories (pagination, filters) |
| `/api/public-events/categories` | POST | Create category (multipart/form-data) |
| `/api/public-events/categories/[id]` | GET | Get single category |
| `/api/public-events/categories/[id]` | PATCH | Update category (multipart/form-data) |
| `/api/public-events/categories/[id]` | DELETE | Delete category |
| `/api/public-events/categories/seed` | GET | Check seed status |
| `/api/public-events/categories/seed` | POST | Seed default categories |

### Component 25: Category Service Layer ✅

#### `src/services/public-event-categories.service.js` [NEW]

Client-side service:
- `getCategories(params)` - Fetch with pagination
- `getActiveCategories()` - Get active only
- `getCategory(id)` - Fetch single
- `createCategory(formData)` - Create with image
- `updateCategory(id, formData)` - Update with image
- `deleteCategory(id)` - Delete
- `seedCategories(reset)` - Seed defaults

Uses `ticketingAxios` with FormData for image uploads.

### Component 26: Category Redux Slice ✅

#### `src/features/public-events/publicEventCategoriesSlice.js` [NEW]

State:
```javascript
{
  list: [],
  currentCategory: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  seeding: false,
  error: null,
  pagination: { page, pages, total, limit },
  filters: { search, status }
}
```

Async Thunks:
- `fetchPublicEventCategories()`
- `fetchActiveCategories()`
- `fetchPublicEventCategoryById()`
- `createPublicEventCategory()`
- `updatePublicEventCategory()`
- `deletePublicEventCategory()`
- `seedPublicEventCategories()`

### Component 27: Category Admin UI ✅

#### `src/components/public-events/categories/` [NEW]

| Component | Description |
|-----------|-------------|
| `PublicEventCategoryTable.js` | Table with icon preview, image, status, actions |
| `PublicEventCategoryCreateModal.js` | Create form with icon selector, image upload |
| `PublicEventCategoryEditModal.js` | Edit form with image management |
| `index.js` | Barrel export |

#### `src/app/panel/admin/public-events/categories/page.js` [NEW]

Admin management page with:
- Category table with search and status filter
- "Add Category" modal
- "Seed Defaults" button (populates 10 default categories)
- Edit and delete actions
- Pagination

### Component 28: Navigation Update ✅

#### `src/constants/navigation.js` [MODIFIED]

Added to `adminNavigation`:
```javascript
{
    name: "Public Events",
    icon: Ticket,
    permission: { groupName: "Admin" },
    children: [
        {
            name: "Categories",
            href: "/panel/admin/public-events/categories",
            icon: FolderKanban,
            permission: { groupName: "Admin" },
        },
    ],
}
```

### Default Categories (Seeded)

The following categories are seeded by default:
1. Concert (Music icon)
2. Conference (Users icon)
3. Workshop (Wrench icon)
4. Festival (PartyPopper icon)
5. Sports (Trophy icon)
6. Theater (Theater icon)
7. Comedy (Laugh icon)
8. Networking (Network icon)
9. Charity (Heart icon)
10. Other (MoreHorizontal icon)

### File Structure

```
src/
├── app/
│   ├── api/public-events/categories/     # API routes
│   │   ├── route.js                      # GET (list), POST (create)
│   │   ├── [id]/route.js                 # GET, PATCH, DELETE
│   │   └── seed/route.js                 # GET (stats), POST (seed)
│   └── panel/admin/public-events/
│       └── categories/page.js            # Admin page
├── components/public-events/categories/   # UI components
│   ├── PublicEventCategoryTable.js
│   ├── PublicEventCategoryCreateModal.js
│   ├── PublicEventCategoryEditModal.js
│   └── index.js
├── features/public-events/
│   └── publicEventCategoriesSlice.js     # Redux slice
├── lib/
│   ├── public-event-categories-db.js     # Database layer
│   └── upload-handler.js                 # File uploads
├── models/ticketing/
│   └── PublicEventCategory.js            # Mongoose model
└── services/
    └── public-event-categories.service.js # Client service
```

### Integration Notes

- Categories are fetched from MongoDB, not from the hardcoded `EVENT_CATEGORIES` array
- The hardcoded array in `src/types/public-events-types.js` serves as seed data only
- Event creation form (`EventDetailsStep.js`) already uses Redux to fetch categories
- Images are stored locally in `public/uploads/categories/`

### Time Estimation

- **Model & Database Layer**: 1 hour ✅
- **API Routes**: 1 hour ✅
- **Service & Redux**: 1 hour ✅
- **Admin UI Components**: 2 hours ✅
- **Admin Page & Navigation**: 1 hour ✅
- **Testing**: 30 min ✅

**Total Phase 2.6: ~6.5 hours** ✅ **Complete**

---

## Phase 3: Seated Events

After Phase 2 is complete, Phase 3 adds seated event functionality:
- Seat chart integration (seats.io embed or custom canvas)
- Seat hold/lock mechanism with Redis-like TTL (mock with setTimeout)
- Interactive seat selection UI
- Seat-specific ticket assignment
- Price levels by section/zone

---

## Verification Plan

### Automated Tests

#### Unit Tests
- Fee calculation logic (various scenarios)
- Promo code validation (expiry, max uses, applicable types)
- Ticket number generation (uniqueness)
- QR payload signing/verification

#### Integration Tests
- Checkout flow: cart → payment → ticket generation
- Inventory depletion (concurrent purchases)
- Promo code redemption limits

#### E2E Tests (Manual for MVP)
- GA flow: browse event → add tickets → apply promo → checkout → receive tickets
- Organizer flow: create event → add ticket types → view sales → export attendees
- Scanner flow: scan valid ticket → scan used ticket → scan invalid ticket

### Manual Verification

**User Flow:**
1. Navigate to event ticketing page
2. Select multiple ticket types
3. Apply promo code (valid and invalid)
4. Complete checkout with test Stripe card
5. View order confirmation
6. Download/view tickets with QR codes
7. Simulate scanning tickets

**Organizer Flow:**
1. Create event with ticket types
2. Monitor sales dashboard
3. Export attendee list
4. Adjust pricing/capacity

---

## User Review Required

### Critical Decisions Needed:

1. **Mock Data Storage**: In-memory (resets on restart) or JSON file-based (persists during dev)?

2. **Stripe Integration**: Do you have Stripe test keys ready? Or should we fully mock payments initially?

3. **Email Delivery for Tickets**:
   - Option A: Integrate SendGrid/Mailgun (needs API keys)
   - Option B: On-screen download only (no emails for MVP)
   - Option C: Mock/console.log for now

4. **QR Code Library**: Add `qrcode` or `react-qr-code` to generate QR codes?

5. **PDF Generation**: Add `jspdf` or `react-to-pdf` for downloadable tickets?

---

## Next Steps (Recommended Order)

1. ~~**Confirm approach** for mock data persistence, Stripe, and email~~ ✅ **Phase 0 & 1 Complete**
2. ~~**Phase 0**: Create data models, types, and mock database~~ ✅ **Complete**
3. ~~**Phase 1a**: Build API routes for events and checkout~~ ✅ **Complete**
4. ~~**Phase 1b**: Build public ticketing page + cart~~ ✅ **Complete**
5. ~~**Phase 1c**: Integrate Stripe checkout flow~~ ✅ **Complete**
6. ~~**Phase 1d**: Build ticket display + QR generation~~ ✅ **Complete**
7. ~~**Phase 1e**: Build organizer dashboard~~ ✅ **Complete**
8. ~~**Phase 1f**: Add scanner validation endpoint~~ ✅ **Complete**
9. ~~**Testing**: E2E test full GA flow~~ ✅ **Complete**
10. ~~**Phase 2**: Implement Public Events & Promo Code Management~~ ✅ **Complete**
    - ~~Create public events data model and API~~ ✅
    - ~~Build event creation/management UI~~ ✅
    - ~~Implement promo code manager UI~~ ✅
11. ~~**Phase 2.5**: Financials & Administration (Settlements & Refunds)~~ ✅ **Complete**
    - ~~Implement settlement request workflow~~ ✅
    - ~~Implement refund request workflow~~ ✅
    - ~~Build admin financial dashboard~~ ✅
12. ~~**Phase 2.6**: Public Event Categories Management~~ ✅ **Complete**
    - ~~Create category MongoDB model and database layer~~ ✅
    - ~~Build category API routes with image upload~~ ✅
    - ~~Create admin UI for category management~~ ✅
    - ~~Add navigation menu item~~ ✅
13. **Phase 3**: Add Seated Events functionality
14. **Phase 4**: Advanced features (transfers, waitlists, etc.)

---

## Migration to Laravel Backend

When ready to migrate from Next.js mock APIs to Laravel:

1. **Keep the same API contract** (request/response structure)
2. **Update base URLs** in `src/lib/axios.js` to point to Laravel
3. **Replicate data models** in Laravel migrations (already designed here)
4. **Copy validation logic** from Next.js to Laravel controllers
5. **Test with same frontend** - should work seamlessly

The frontend and service layer won't need changes, only the API endpoint URLs.

---

## Database Schema Reference

### Core Tables (for future Laravel implementation)

#### `events` (existing, to be extended)
```sql
id, organiser_id, title, description, venue_id, start_at, end_at, 
status, global_capacity, currency
```

#### `ticket_types`
```sql
id, event_id, name, sku, price_cents, currency, capacity, visible, 
vat_class_id, min_per_order, max_per_order, refundable, 
transfer_allowed, settings_json
```

#### `orders`
```sql
id, user_id, event_id, status, total_cents, currency, fees_cents, 
promo_code_id, created_at
```

#### `order_items`
```sql
id, order_id, ticket_type_id, seat_id (nullable), quantity, 
unit_price_cents, discount_cents, ticket_instance_id (nullable)
```

#### `tickets` (instances)
```sql
id, order_item_id, code (unique), qr_payload, status, 
transfer_history_json, metadata, used_at
```

#### `promo_codes`
```sql
id, code, type (percent/fixed), amount_cents_or_pct, valid_from, 
valid_until, max_uses, max_per_user, applies_to_ticket_type_ids_json
```

#### `fees`
```sql
id, name, fee_type (fixed/per-ticket/per-order), amount_cents_or_pct, 
payer (buyer/organiser), cap_cents, applies_to
```

---

**Created**: 2025-11-25
**Last Updated**: 2025-11-30
**Status**: Phase 2.6 Complete - Ready for Phase 3 (Seated Events)
