# Refund System - Frontend Developer Guide

## Overview

This guide covers everything frontend developers need to implement the refund system UI. It includes API endpoints, page requirements, component specifications, and user flows.

---

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Pages to Build](#pages-to-build)
4. [Component Specifications](#component-specifications)
5. [User Flows](#user-flows)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [UI/UX Guidelines](#uiux-guidelines)

---

## API Endpoints

### Base URL
```
Production: https://api.parlomo.co.uk
Staging: https://staging-api.parlomo.co.uk
```

### Authentication
All endpoints require Bearer token authentication except webhooks:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

### Organizer Endpoints

#### 1. Create Refund Request
```http
POST /api/v1/ticketing/refunds
```

**Request Body:**
```json
{
  "event_id": "uuid",
  "type": "EVENT_CANCELLATION",  // or "BULK_REFUND", "SINGLE_ORDER"
  "reason": "Event cancelled due to weather conditions",
  "description": "Optional additional details",
  "order_ids": ["uuid1", "uuid2"]  // Required for BULK_REFUND and SINGLE_ORDER
}
```

**Validation Rules:**
- `event_id`: Required, must be valid event UUID
- `type`: Required, one of: `EVENT_CANCELLATION`, `BULK_REFUND`, `SINGLE_ORDER`
- `reason`: Required, minimum 10 characters
- `description`: Optional, maximum 500 characters
- `order_ids`: Required for `BULK_REFUND` and `SINGLE_ORDER` types

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "event_id": "660e8400-e29b-41d4-a716-446655440000",
    "event_title": "Summer Music Festival 2025",
    "type": "EVENT_CANCELLATION",
    "affected_orders_count": 125,
    "total_refund_amount": 625000,
    "currency": "GBP",
    "status": "PENDING",
    "requested_at": "2025-12-17T18:30:00Z"
  },
  "message": "Refund request submitted"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Refund requests can only be made up to 1 day after the event ends. Deadline was: 2025-12-16 18:00:00"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Order IDs are required for bulk refund or single order refund"
}
```

#### 2. List Organizer's Refund Requests
```http
GET /api/v1/organizer/refunds?status=PENDING
```

**Query Parameters:**
- `status` (optional): Filter by status (`PENDING`, `APPROVED`, `REJECTED`, `PROCESSED`)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "event_title": "Summer Music Festival 2025",
      "type": "EVENT_CANCELLATION",
      "status": "PENDING",
      "affected_orders_count": 125,
      "total_refund_amount": 625000,
      "currency": "GBP",
      "reason": "Event cancelled due to weather",
      "description": "Severe weather warning issued",
      "requested_at": "2025-12-17T18:30:00Z",
      "created_at": "2025-12-17T18:30:00Z"
    }
  ]
}
```

#### 3. Get Event Orders (for selection)
```http
GET /api/v1/organizer/events/{eventId}/orders?status=paid
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "order_number": "ORD-2025-001234",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "total": 5000,
      "currency": "GBP",
      "status": "paid",
      "ticket_count": 2,
      "created_at": "2025-12-10T14:30:00Z"
    }
  ]
}
```

---

### Admin Endpoints

#### 4. List All Refund Requests (Admin)
```http
GET /api/v1/admin/refunds?status=PENDING&page=1
```

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional): Page number for pagination

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "organizer": {
        "id": "uuid",
        "name": "Event Organizer Ltd",
        "email": "organizer@example.com"
      },
      "event": {
        "id": "uuid",
        "title": "Summer Music Festival 2025",
        "start_date": "2025-07-15T18:00:00Z",
        "venue_name": "Central Park"
      },
      "type": "EVENT_CANCELLATION",
      "status": "PENDING",
      "affected_orders_count": 125,
      "total_refund_amount": 625000,
      "fine_amount": 0,
      "net_refund_amount": 0,
      "currency": "GBP",
      "reason": "Event cancelled due to weather",
      "description": "Severe weather warning issued",
      "requested_at": "2025-12-17T18:30:00Z",
      "fees_lost": {
        "total_refund_amount": 625000,
        "total_stripe_fees_lost": 15825,
        "total_application_fees_lost": 31250,
        "net_loss": 47075,
        "currency": "GBP"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 45
  }
}
```

#### 5. Approve Refund Request
```http
PUT /api/v1/admin/refunds/{refundId}
```

**Request Body:**
```json
{
  "status": "APPROVED",
  "admin_notes": "Valid cancellation reason. Approved for processing."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Refund request approved",
  "data": {
    "id": "uuid",
    "status": "APPROVED",
    "approved_by": "admin-uuid",
    "approved_at": "2025-12-17T19:00:00Z"
  }
}
```

#### 6. Reject Refund Request
```http
PUT /api/v1/admin/refunds/{refundId}
```

**Request Body:**
```json
{
  "status": "REJECTED",
  "rejection_reason": "Event already took place. Refund deadline passed.",
  "admin_notes": "Internal notes for review"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Refund request rejected",
  "data": {
    "id": "uuid",
    "status": "REJECTED",
    "rejection_reason": "Event already took place. Refund deadline passed.",
    "rejected_by": "admin-uuid",
    "rejected_at": "2025-12-17T19:00:00Z"
  }
}
```

#### 7. Process Refund (Full Refund)
```http
PUT /api/v1/admin/refunds/{refundId}
```

**Request Body:**
```json
{
  "status": "PROCESSED"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Refund processing initiated: 125 queued, 0 failed",
  "data": {
    "id": "uuid",
    "status": "PROCESSED",
    "refunds_processed": 125,
    "refunds_failed": 0,
    "processed_at": "2025-12-17T19:05:00Z"
  }
}
```

#### 8. Process Refund (Partial with Fine)
```http
PUT /api/v1/admin/refunds/{refundId}
```

**Request Body:**
```json
{
  "status": "PROCESSED",
  "fine_amount": 5000,
  "fine_reason": "Late cancellation fee (less than 48 hours notice)"
}
```

**Validation Rules:**
- `fine_amount`: Optional, integer in cents, minimum 0
- `fine_reason`: Required if `fine_amount` > 0

**Success Response (200):**
```json
{
  "success": true,
  "message": "Refund processing initiated: 125 queued, 0 failed (with 50.00 GBP fine deducted)",
  "data": {
    "id": "uuid",
    "status": "PROCESSED",
    "fine_amount": 5000,
    "net_refund_amount": 620000,
    "refunds_processed": 125,
    "refunds_failed": 0,
    "processed_at": "2025-12-17T19:05:00Z"
  }
}
```

#### 9. View Audit Logs
```http
GET /api/v1/admin/refunds/{refundId}/audit-logs
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "action": "created",
      "user": {
        "id": "uuid",
        "name": "Event Organizer Ltd",
        "email": "organizer@example.com"
      },
      "old_status": null,
      "new_status": "PENDING",
      "metadata": {
        "event_id": "uuid",
        "type": "EVENT_CANCELLATION",
        "affected_orders_count": 125
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-12-17T18:30:00Z"
    },
    {
      "id": "uuid",
      "action": "approved",
      "user": {
        "id": "uuid",
        "name": "Admin User",
        "email": "admin@parlomo.co.uk"
      },
      "old_status": "PENDING",
      "new_status": "APPROVED",
      "metadata": {
        "admin_notes": "Valid cancellation reason"
      },
      "ip_address": "10.0.0.5",
      "created_at": "2025-12-17T19:00:00Z"
    }
  ]
}
```

---

## User Roles & Permissions

### Organizer Role
**Can:**
- View their own refund requests
- Create refund requests for their events
- View event orders
- Cancel pending refund requests (not implemented yet)

**Cannot:**
- Approve/reject refund requests
- Process refunds
- View other organizers' refunds
- View audit logs

### Admin Role
**Can:**
- View all refund requests across all organizers
- Approve/reject refund requests
- Process approved refunds (full or partial)
- Set fine amounts and reasons
- View audit logs
- View fee loss calculations

**Cannot:**
- Create refund requests (only organizers can)

---

## Pages to Build

### 1. Organizer Dashboard - Refund Requests Page
**Route:** `/organizer/refunds`

**Purpose:** View and manage refund requests for organizer's events

**Components Needed:**
- Refund requests list/table
- Status filter (All, Pending, Approved, Rejected, Processed)
- "Create Refund Request" button
- Refund request details modal/page

**Table Columns:**
- Event Title
- Type (badge)
- Status (colored badge)
- Orders Count
- Total Amount
- Request Date
- Actions (View Details)

**Status Badge Colors:**
- `PENDING`: Yellow/Orange
- `APPROVED`: Blue
- `REJECTED`: Red
- `PROCESSED`: Green

---

### 2. Organizer - Create Refund Request Page
**Route:** `/organizer/refunds/create` or Modal

**Purpose:** Create new refund request

**Form Sections:**

#### Step 1: Select Event
- Dropdown/Search to select event
- Show event details (title, date, venue)
- Display deadline information (1 day after event ends)
- Show total paid orders count

#### Step 2: Select Refund Type
- Radio buttons:
  - **Event Cancellation**: Refund all tickets
  - **Bulk Refund**: Select multiple orders
  - **Single Order**: Refund one specific order

#### Step 3: Select Orders (if Bulk/Single)
- Searchable/filterable table of paid orders
- Checkboxes for selection
- Show: Order Number, Customer Name, Amount, Ticket Count
- Display selected count and total amount

#### Step 4: Provide Reason
- Text input for reason (required, min 10 chars)
- Textarea for description (optional)

#### Step 5: Review & Submit
- Summary of selection:
  - Event details
  - Refund type
  - Number of orders
  - Total refund amount
  - Reason
- "Submit Request" button
- Cancel button

**Validation Messages:**
- "Refund deadline has passed (deadline was: {date})"
- "You must select at least one order"
- "Reason must be at least 10 characters"

---

### 3. Organizer - Refund Request Details Page
**Route:** `/organizer/refunds/{refundId}`

**Purpose:** View detailed information about a specific refund request

**Sections:**

#### Request Information
- Request ID
- Status (large badge)
- Event title and details
- Refund type
- Request date

#### Financial Summary
- Total refund amount
- Number of orders affected
- Currency

#### Reason & Description
- Organizer's reason
- Additional description

#### Status History (if visible)
- Request submitted: {date}
- Approved by: {admin name} on {date} (if approved)
- Rejected by: {admin name} on {date} (if rejected)
  - Rejection reason shown
- Processed on: {date} (if processed)

#### Affected Orders List
- Table showing all orders in this refund
- Columns: Order Number, Customer Name, Amount, Status
- Export to CSV button

---

### 4. Admin Dashboard - Refund Management Page
**Route:** `/admin/refunds`

**Purpose:** Manage all refund requests across platform

**Components Needed:**
- Refund requests table (paginated)
- Status filter tabs (Pending, Approved, Rejected, Processed, All)
- Search by event name or organizer
- Sort by date, amount, status

**Table Columns:**
- Organizer Name
- Event Title
- Type
- Status
- Orders Count
- Total Amount
- Fee Loss (calculated)
- Request Date
- Actions (View, Approve/Reject/Process)

**Quick Actions:**
- "View Details" button
- "Approve" button (for PENDING)
- "Reject" button (for PENDING)
- "Process" button (for APPROVED)

---

### 5. Admin - Refund Request Review Page
**Route:** `/admin/refunds/{refundId}`

**Purpose:** Review and process refund request

**Layout:**

#### Left Column (60%)

**Request Information Card**
- Request ID and status
- Organizer details (name, email, profile link)
- Event details (title, date, venue, link to event)
- Refund type
- Request date and time

**Financial Summary Card**
- Total refund amount (large)
- Number of orders
- Estimated fee loss breakdown:
  - Stripe fees: £XXX.XX
  - Application fees: £XXX.XX
  - Total loss: £XXX.XX

**Reason & Description Card**
- Organizer's reason
- Additional description

**Affected Orders Table**
- Searchable, sortable table
- Columns: Order #, Customer, Email, Amount, Tickets
- Export to CSV
- Total shown at bottom

#### Right Column (40%)

**Actions Panel** (changes based on status)

**If PENDING:**
- **Approve Button** (primary, green)
  - Opens modal with admin notes textarea
- **Reject Button** (secondary, red)
  - Opens modal with rejection reason (required) and admin notes

**If APPROVED:**
- **Process Refund Button** (primary, blue)
  - Opens processing modal with options:
    - Radio: Full Refund / Partial Refund
    - If Partial:
      - Input: Fine Amount (in currency format)
      - Input: Fine Reason (required)
    - Preview shows:
      - Original total: £XXX.XX
      - Fine amount: -£XX.XX
      - Net refund: £XXX.XX
    - Confirm button

**If REJECTED:**
- Rejection reason displayed
- Admin who rejected
- Date rejected

**If PROCESSED:**
- Processing summary:
  - Refunds queued: XXX
  - Refunds failed: XXX
  - Fine amount (if partial): £XX.XX
  - Net refund amount: £XXX.XX
- Admin who processed
- Date processed

**Audit Log Panel**
- Timeline of all actions
- User, action, date/time
- Click to expand for full details
- Includes IP addresses and metadata

---

### 6. Admin - Process Refund Modal
**Component:** Modal Dialog

**Purpose:** Process approved refund with optional fine

**Form Fields:**

**Refund Type (Radio)**
- ○ Full Refund
- ○ Partial Refund (with deduction)

**If Partial Refund selected:**

**Fine Amount** (Required)
- Currency input field
- Placeholder: "0.00"
- Validation: Must be less than total refund amount

**Fine Reason** (Required if fine > 0)
- Text input
- Placeholder: "e.g., Late cancellation fee (48 hours notice)"
- Minimum 10 characters

**Preview Section:**
```
Original Amount:    £625.00
Fine/Deduction:     -£50.00
─────────────────────────────
Net Refund:         £575.00
Affected Orders:    125
Avg per Order:      £4.60
```

**Buttons:**
- "Process Refund" (primary)
- "Cancel" (secondary)

**Warning Message:**
"This will initiate refunds for 125 orders. Customers will receive email notifications. This action cannot be undone."

---

## Component Specifications

### 1. RefundStatusBadge Component

**Props:**
- `status`: string (PENDING, APPROVED, REJECTED, PROCESSED)

**Styling:**
```jsx
PENDING: {
  background: '#FEF3C7',
  color: '#92400E',
  text: 'Pending Review'
}
APPROVED: {
  background: '#DBEAFE',
  color: '#1E40AF',
  text: 'Approved'
}
REJECTED: {
  background: '#FEE2E2',
  color: '#991B1B',
  text: 'Rejected'
}
PROCESSED: {
  background: '#D1FAE5',
  color: '#065F46',
  text: 'Processed'
}
```

---

### 2. RefundTypeLabel Component

**Props:**
- `type`: string (EVENT_CANCELLATION, BULK_REFUND, SINGLE_ORDER)

**Display:**
- `EVENT_CANCELLATION` → "Event Cancellation"
- `BULK_REFUND` → "Bulk Refund"
- `SINGLE_ORDER` → "Single Order"

---

### 3. CurrencyDisplay Component

**Props:**
- `amount`: number (in cents)
- `currency`: string (GBP, USD, EUR)

**Output:**
- `625000` + `GBP` → "£6,250.00"
- `125000` + `USD` → "$1,250.00"
- `100000` + `EUR` → "€1,000.00"

**Format:**
- Divide amount by 100
- Add thousand separators
- Show 2 decimal places
- Prepend currency symbol

---

### 4. OrderSelectionTable Component

**Props:**
- `orders`: array of order objects
- `selectedOrders`: array of selected IDs
- `onSelectionChange`: callback function

**Features:**
- Checkbox in header for "Select All"
- Individual checkboxes per row
- Search/filter by order number or customer name
- Show selected count: "5 of 125 orders selected"
- Show selected total: "Total: £250.00"

---

### 5. FeeCalculationDisplay Component

**Props:**
- `feesLost`: object with breakdown

**Display:**
```
Fee Impact Analysis
─────────────────────────
Stripe Fees:        £158.25
Platform Fees:      £312.50
─────────────────────────
Total Loss:         £470.75
```

---

### 6. RefundTimeline Component

**Props:**
- `auditLogs`: array of log entries

**Display:**
Vertical timeline showing:
- Created by {user} on {date}
- Approved by {user} on {date}
- Processed by {user} on {date}
- Emails sent: {count}

Each entry shows:
- Icon (based on action)
- Action name
- User name and avatar
- Timestamp
- Additional details (expandable)

---

## User Flows

### Flow 1: Organizer Creates Event Cancellation Refund

1. Organizer goes to "My Events" page
2. Clicks on event with paid orders
3. Clicks "Request Refund" button
4. System checks deadline (must be within 1 day after event ends)
5. If deadline passed → Show error message
6. If within deadline → Open "Create Refund Request" form
7. System auto-selects "Event Cancellation" type
8. Shows summary: 125 paid orders, total £6,250.00
9. Organizer enters reason: "Event cancelled due to severe weather"
10. Organizer enters description (optional)
11. Clicks "Submit Request"
12. System validates and creates request with status PENDING
13. Show success message: "Refund request submitted successfully"
14. Redirect to refund requests list

**Success Message Example:**
"Your refund request has been submitted for review. You'll be notified when an admin reviews your request. Request ID: #REF-2025-001234"

---

### Flow 2: Organizer Creates Bulk Refund

1. Organizer goes to "Refunds" page
2. Clicks "Create Refund Request"
3. Selects event from dropdown
4. Selects "Bulk Refund" type
5. System loads all paid orders for the event
6. Organizer searches/filters orders
7. Selects 10 orders using checkboxes
8. System shows: "10 orders selected - Total: £500.00"
9. Enters reason and description
10. Reviews summary
11. Clicks "Submit Request"
12. System creates refund request
13. Show success confirmation

---

### Flow 3: Admin Approves and Processes Refund (Full)

1. Admin goes to "Refund Management" page
2. Sees "Pending" tab with notification badge (3 new)
3. Clicks on refund request to review
4. Views all details:
   - Organizer information
   - Event details
   - Reason provided
   - Affected orders
   - Fee loss calculation
5. Decides to approve
6. Clicks "Approve" button
7. Modal opens for admin notes
8. Enters notes: "Valid reason - weather cancellation confirmed"
9. Clicks "Approve Request"
10. Status changes to APPROVED
11. "Process Refund" button appears
12. Admin clicks "Process Refund"
13. Modal opens with full/partial options
14. Selects "Full Refund"
15. Reviews preview
16. Clicks "Process Refund"
17. System:
    - Marks orders as refunded
    - Queues Stripe refunds
    - Queues customer emails
    - Updates status to PROCESSED
18. Shows success message: "Refund processing initiated: 125 queued, 0 failed"

---

### Flow 4: Admin Processes Partial Refund with Fine

1. Admin reviews approved refund request
2. Decides to apply late cancellation fee
3. Clicks "Process Refund"
4. Modal opens
5. Selects "Partial Refund (with deduction)"
6. Enters fine amount: £50.00 (system converts to 5000 cents)
7. Enters fine reason: "Late cancellation fee (less than 48 hours notice)"
8. Preview shows:
   ```
   Original Amount:    £625.00
   Fine/Deduction:     -£50.00
   ─────────────────────────────
   Net Refund:         £575.00
   Affected Orders:    125
   ```
9. Confirms understanding of fine distribution
10. Clicks "Process Refund"
11. System:
    - Calculates proportional fine per order
    - Creates Stripe refunds with correct amounts
    - Queues customer emails showing deduction
    - Updates refund request with fine details
12. Shows success: "Refund processing initiated: 125 queued, 0 failed (with 50.00 GBP fine deducted)"

---

### Flow 5: Admin Rejects Refund

1. Admin reviews refund request
2. Notices event already took place 3 days ago
3. Deadline has passed (1 day after event)
4. Clicks "Reject" button
5. Modal opens requiring rejection reason
6. Enters reason: "Refund deadline has passed. Event took place 3 days ago."
7. Enters admin notes (optional): "Organizer contacted - explained policy"
8. Clicks "Reject Request"
9. Status changes to REJECTED
10. Organizer receives notification (if implemented)
11. Rejection reason visible to organizer

---

## Data Models

### RefundRequest Object

```typescript
interface RefundRequest {
  id: string;
  organizer_id: string;
  event_id: string;
  event_title: string;
  type: 'EVENT_CANCELLATION' | 'BULK_REFUND' | 'SINGLE_ORDER';
  order_ids: string[];
  affected_orders_count: number;
  total_refund_amount: number; // in cents
  fine_amount: number; // in cents
  net_refund_amount: number; // in cents
  currency: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  admin_notes?: string;
  rejection_reason?: string;
  fine_reason?: string;
  refunds_processed: number;
  refunds_failed: number;
  processing_errors?: Array<{
    order_id: string;
    order_number: string;
    error: string;
  }>;
  requested_at: string; // ISO 8601
  approved_at?: string;
  rejected_at?: string;
  processed_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;

  // Relationships (if included)
  organizer?: Organizer;
  event?: PublicEvent;
  approved_by_user?: User;
  rejected_by_user?: User;
}
```

### Order Object

```typescript
interface TicketingOrder {
  id: string;
  order_number: string;
  event_id: string;
  customer_name: string;
  customer_email: string;
  total: number; // in cents
  subtotal: number;
  fees: number;
  tax: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  payment_intent_id?: string;
  ticket_count: number;
  refunded_at?: string;
  created_at: string;
}
```

### AuditLog Object

```typescript
interface RefundAuditLog {
  id: string;
  refund_request_id: string;
  user_id: string;
  action: 'created' | 'approved' | 'rejected' | 'processed' |
          'stripe_initiated' | 'stripe_completed' | 'stripe_failed' | 'email_sent';
  old_status?: string;
  new_status?: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;

  // Relationship
  user?: User;
}
```

### FeeLoss Object

```typescript
interface FeeLoss {
  total_refund_amount: number; // in cents
  total_stripe_fees_lost: number; // in cents
  total_application_fees_lost: number; // in cents
  net_loss: number; // in cents
  currency: string;
}
```

---

## Error Handling

### Common HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Request successful |
| 201 | Created | Refund request created |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Token missing/invalid |
| 403 | Forbidden | Permission denied or deadline passed |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend error |

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>; // Validation errors
}
```

### Example Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "reason": ["The reason field is required."],
    "order_ids": ["You must select at least one order."]
  }
}
```

### UI Error Display

**Global Errors** (403, 500):
- Toast notification (red)
- Show error message
- Auto-dismiss after 5 seconds

**Validation Errors** (400):
- Show under form fields
- Red text with error icon
- Don't auto-dismiss

**Network Errors**:
- Show retry button
- "Unable to connect. Please check your connection."

---

## UI/UX Guidelines

### Loading States

**Creating Refund Request:**
- Disable submit button
- Show spinner: "Submitting request..."
- Prevent form changes

**Processing Refund:**
- Show modal with progress indicator
- "Processing 125 refunds... This may take a moment"
- Don't allow closing modal
- Auto-close on success/error

**Loading Tables:**
- Show skeleton loaders
- 5-10 skeleton rows
- Animated shimmer effect

### Success Messages

**After Creating Request:**
```
✓ Refund request submitted successfully!
  Request ID: #REF-2025-001234
  Status: Pending Review
```

**After Approval:**
```
✓ Refund request approved
  The organizer has been notified.
```

**After Processing:**
```
✓ Refund processing initiated!
  125 refunds queued successfully
  0 refunds failed
  Customers will receive email confirmations.
```

### Confirmation Dialogs

**Before Processing Refund:**
```
Process Refund Request?

This will initiate refunds for 125 orders totaling £625.00.
Customers will receive email notifications.

⚠️ This action cannot be undone.

[Cancel]  [Process Refund]
```

**Before Rejecting:**
```
Reject Refund Request?

Please provide a reason for rejection.
This will be visible to the organizer.

Reason: [_________________________]

[Cancel]  [Reject Request]
```

### Empty States

**No Refund Requests:**
```
📋 No Refund Requests

You haven't created any refund requests yet.
Create your first refund request to get started.

[Create Refund Request]
```

**No Orders Available:**
```
✓ All orders have been refunded

There are no paid orders available for refund.
```

### Responsive Design

**Desktop (1200px+):**
- Two-column layout for review pages
- Full tables with all columns
- Side-by-side forms

**Tablet (768px - 1199px):**
- Single column for review pages
- Hide less important table columns
- Stacked forms

**Mobile (< 768px):**
- Card-based layouts instead of tables
- Simplified navigation
- Bottom sheet modals
- Sticky action buttons at bottom

### Accessibility

**Requirements:**
- All buttons have `aria-label`
- Form fields have proper labels
- Error messages linked with `aria-describedby`
- Focus management in modals
- Keyboard navigation support
- Color contrast ratios meet WCAG AA
- Status badges have text, not just color

**Example:**
```jsx
<button
  aria-label="Approve refund request for Summer Music Festival"
  className="btn-approve"
>
  Approve
</button>

<div role="status" aria-live="polite">
  Refund request approved successfully
</div>
```

---

## Currency Formatting

### Helper Function

```javascript
function formatCurrency(amountInCents, currency) {
  const amount = amountInCents / 100;

  const currencySymbols = {
    'GBP': '£',
    'USD': '$',
    'EUR': '€'
  };

  const symbol = currencySymbols[currency] || currency;

  return `${symbol}${amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

// Usage:
formatCurrency(625000, 'GBP') // "£6,250.00"
formatCurrency(125050, 'USD') // "$1,250.50"
```

---

## Date/Time Formatting

### Helper Functions

```javascript
function formatDateTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
// "17 Dec 2025, 18:30"

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}
// "17 December 2025"

function timeAgo(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
// "2 hours ago"
```

---

## State Management Recommendations

### API State (using React Query / TanStack Query)

```javascript
// Fetch refund requests
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['refunds', { status: 'PENDING' }],
  queryFn: () => fetchRefunds({ status: 'PENDING' })
});

// Create refund request
const mutation = useMutation({
  mutationFn: createRefundRequest,
  onSuccess: () => {
    queryClient.invalidateQueries(['refunds']);
    toast.success('Refund request submitted');
    navigate('/organizer/refunds');
  }
});

// Process refund
const processMutation = useMutation({
  mutationFn: ({ refundId, data }) =>
    processRefund(refundId, data),
  onSuccess: () => {
    queryClient.invalidateQueries(['refunds']);
    queryClient.invalidateQueries(['refund', refundId]);
    toast.success('Refund processing initiated');
  }
});
```

### Form State (using React Hook Form)

```javascript
const {
  register,
  handleSubmit,
  watch,
  formState: { errors }
} = useForm({
  defaultValues: {
    event_id: '',
    type: 'EVENT_CANCELLATION',
    reason: '',
    description: '',
    order_ids: []
  }
});

const refundType = watch('type');
const selectedOrders = watch('order_ids');
```

---

## Testing Considerations

### Frontend Testing Checklist

**Unit Tests:**
- [ ] Currency formatting helper
- [ ] Date formatting helpers
- [ ] Form validation logic
- [ ] Fine calculation display
- [ ] Status badge rendering

**Component Tests:**
- [ ] RefundStatusBadge displays correct color/text
- [ ] OrderSelectionTable handles selection
- [ ] CurrencyDisplay formats correctly
- [ ] Form validation shows errors
- [ ] Modal opens/closes properly

**Integration Tests:**
- [ ] Create refund request flow
- [ ] Order selection and deselection
- [ ] Form submission with validation
- [ ] API error handling
- [ ] Success/error messages display

**E2E Tests (Cypress/Playwright):**
- [ ] Complete refund creation flow
- [ ] Admin approval flow
- [ ] Admin processing with fine
- [ ] Rejection flow
- [ ] Pagination and filtering
- [ ] Responsive behavior

---

## API Rate Limiting

The API implements rate limiting:
- **Authenticated requests**: 60 requests per minute
- **Webhook endpoint**: 100 requests per minute

**Handle 429 (Too Many Requests):**
```javascript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  toast.warning(`Too many requests. Please wait ${retryAfter} seconds.`);
}
```

---

## Environment Variables

Frontend needs these environment variables:

```bash
# API Configuration
REACT_APP_API_URL=https://api.parlomo.co.uk
REACT_APP_API_VERSION=v1

# Stripe (for display purposes only, not processing)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Feature Flags (optional)
REACT_APP_ENABLE_PARTIAL_REFUNDS=true
REACT_APP_ENABLE_REFUND_AUDIT_LOGS=true
```

---

## Quick Reference - API Endpoints Summary

| Method | Endpoint | Purpose | Role |
|--------|----------|---------|------|
| POST | `/api/v1/ticketing/refunds` | Create refund request | Organizer |
| GET | `/api/v1/organizer/refunds` | List organizer's refunds | Organizer |
| GET | `/api/v1/organizer/events/{id}/orders` | Get event orders | Organizer |
| GET | `/api/v1/admin/refunds` | List all refunds | Admin |
| PUT | `/api/v1/admin/refunds/{id}` | Update refund status | Admin |
| GET | `/api/v1/admin/refunds/{id}/audit-logs` | View audit logs | Admin |

---

## Support & Questions

For technical questions or API issues:
- Backend Developer: [Slack/Email]
- API Documentation: [Link to full docs]
- Postman Collection: [Link]

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-17
**For Frontend Developers**
