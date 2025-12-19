# Refund System - API Reference

## Base URL

```
Production: https://api.parlomo.co.uk
Staging:    https://staging-api.parlomo.co.uk
```

## Authentication

All endpoints require Bearer token authentication:

```http
Authorization: Bearer {your_access_token}
```

---

## Table of Contents

1. [Organizer Endpoints](#organizer-endpoints)
   - [Create Refund Request](#1-create-refund-request)
   - [List Organizer's Refunds](#2-list-organizers-refunds)
   - [Get Event Orders](#3-get-event-orders)
2. [Admin Endpoints](#admin-endpoints)
   - [List All Refunds](#4-list-all-refunds-admin)
   - [Get Refund Details](#5-get-refund-details)
   - [Approve Refund](#6-approve-refund)
   - [Reject Refund](#7-reject-refund)
   - [Process Full Refund](#8-process-full-refund)
   - [Process Partial Refund](#9-process-partial-refund-with-fine)
   - [Get Audit Logs](#10-get-audit-logs)
3. [Response Codes](#response-codes)
4. [Error Handling](#error-handling)

---

## Organizer Endpoints

### 1. Create Refund Request

Create a new refund request for an event.

**Endpoint:** `POST /api/financials/refunds`

**Authentication:** Required (Organizer)

**Request Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "EVENT_CANCELLATION",
  "reason": "Event cancelled due to severe weather conditions",
  "description": "Weather warning issued by authorities. Unsafe to proceed.",
  "order_ids": ["order-uuid-1", "order-uuid-2"]
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event_id` | UUID | Yes | The event ID to refund |
| `type` | String | Yes | One of: `EVENT_CANCELLATION`, `BULK_REFUND`, `SINGLE_ORDER` |
| `reason` | String | Yes | Reason for refund (min 10 characters) |
| `description` | String | No | Additional details (max 500 characters) |
| `order_ids` | Array | Conditional | Required for `BULK_REFUND` and `SINGLE_ORDER` types |

**Refund Types:**

- **`EVENT_CANCELLATION`**: Refund all paid orders for the event. `order_ids` is ignored.
- **`BULK_REFUND`**: Refund specific multiple orders. `order_ids` required.
- **`SINGLE_ORDER`**: Refund a single order. `order_ids` required (array with 1 UUID).

**Validation Rules:**

- Event must belong to authenticated organizer
- Refund must be requested within 1 day after event ends
- Orders must be in `paid` status
- Orders must belong to the specified event

**Success Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "650e8400-e29b-41d4-a716-446655440000",
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "event_title": "Summer Music Festival 2025",
    "type": "EVENT_CANCELLATION",
    "affected_orders_count": 125,
    "total_refund_amount": 625000,
    "currency": "GBP",
    "status": "PENDING",
    "requested_at": "2025-12-17T18:30:00.000000Z"
  },
  "message": "Refund request submitted"
}
```

**Error Responses:**

**403 Forbidden - Deadline Passed:**
```json
{
  "success": false,
  "message": "Refund requests can only be made up to 1 day after the event ends. Deadline was: 2025-12-16 18:00:00"
}
```

**403 Forbidden - Not Event Owner:**
```json
{
  "success": false,
  "message": "You do not have permission to request refunds for this event"
}
```

**400 Bad Request - Missing Order IDs:**
```json
{
  "success": false,
  "message": "Order IDs are required for bulk refund or single order refund"
}
```

**400 Bad Request - No Eligible Orders:**
```json
{
  "success": false,
  "message": "No eligible orders found for refund"
}
```

**400 Bad Request - Invalid Orders:**
```json
{
  "success": false,
  "message": "Some orders were not found or are not eligible for refund"
}
```

**Example cURL:**

```bash
curl -X POST https://api.parlomo.co.uk/api/financials/refunds \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "EVENT_CANCELLATION",
    "reason": "Event cancelled due to severe weather conditions",
    "description": "Weather warning issued by authorities"
  }'
```

---

### 2. List Organizer's Refunds

Get all refund requests created by the authenticated organizer.

**Endpoint:** `GET /api/financials/refunds/organizer`

**Authentication:** Required (Organizer)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | String | No | Filter by status: `PENDING`, `APPROVED`, `REJECTED`, `PROCESSED` |

**Example Requests:**

```http
GET /api/financials/refunds/organizer
GET /api/financials/refunds/organizer?status=PENDING
GET /api/financials/refunds/organizer?status=PROCESSED
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440000",
      "event_id": "550e8400-e29b-41d4-a716-446655440000",
      "event_title": "Summer Music Festival 2025",
      "type": "EVENT_CANCELLATION",
      "status": "PENDING",
      "affected_orders_count": 125,
      "total_refund_amount": 625000,
      "fine_amount": 0,
      "net_refund_amount": 0,
      "currency": "GBP",
      "reason": "Event cancelled due to weather",
      "description": "Severe weather warning issued",
      "requested_at": "2025-12-17T18:30:00.000000Z",
      "processed_at": null,
      "completed_at": null,
      "created_at": "2025-12-17T18:30:00.000000Z",
      "updated_at": "2025-12-17T18:30:00.000000Z"
    },
    {
      "id": "750e8400-e29b-41d4-a716-446655440000",
      "event_id": "560e8400-e29b-41d4-a716-446655440000",
      "event_title": "Jazz Night at the Park",
      "type": "SINGLE_ORDER",
      "status": "APPROVED",
      "affected_orders_count": 1,
      "total_refund_amount": 5000,
      "fine_amount": 0,
      "net_refund_amount": 0,
      "currency": "GBP",
      "reason": "Customer unable to attend",
      "description": "Medical emergency",
      "requested_at": "2025-12-16T14:20:00.000000Z",
      "processed_at": null,
      "completed_at": null,
      "created_at": "2025-12-16T14:20:00.000000Z",
      "updated_at": "2025-12-16T15:00:00.000000Z"
    }
  ]
}
```

**Example cURL:**

```bash
curl -X GET "https://api.parlomo.co.uk/api/financials/refunds/organizer?status=PENDING" \
  -H "Authorization: Bearer your_token_here"
```

---

### 3. Get Event Orders

Get all paid orders for a specific event (used for order selection when creating bulk/single refunds).

**Endpoint:** `GET /api/ticketing/events/{eventId}/orders`

**Authentication:** Required (Organizer)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `eventId` | UUID | The event ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | String | No | Filter by order status (default: `paid`) |

**Example Requests:**

```http
GET /api/ticketing/events/550e8400-e29b-41d4-a716-446655440000/orders
GET /api/ticketing/events/550e8400-e29b-41d4-a716-446655440000/orders?status=paid
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "850e8400-e29b-41d4-a716-446655440000",
      "order_number": "ORD-2025-001234",
      "event_id": "550e8400-e29b-41d4-a716-446655440000",
      "customer_name": "John Doe",
      "customer_email": "john.doe@example.com",
      "total": 5000,
      "subtotal": 4500,
      "fees": 300,
      "tax": 200,
      "currency": "GBP",
      "status": "paid",
      "ticket_count": 2,
      "payment_intent_id": "pi_xxxxxxxxxxxxxxxxxxxxx",
      "created_at": "2025-12-10T14:30:00.000000Z"
    },
    {
      "id": "950e8400-e29b-41d4-a716-446655440000",
      "order_number": "ORD-2025-001235",
      "event_id": "550e8400-e29b-41d4-a716-446655440000",
      "customer_name": "Jane Smith",
      "customer_email": "jane.smith@example.com",
      "total": 7500,
      "subtotal": 6800,
      "fees": 450,
      "tax": 250,
      "currency": "GBP",
      "status": "paid",
      "ticket_count": 3,
      "payment_intent_id": "pi_yyyyyyyyyyyyyyyyyyyyyyy",
      "created_at": "2025-12-11T09:15:00.000000Z"
    }
  ]
}
```

**Example cURL:**

```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/events/550e8400-e29b-41d4-a716-446655440000/orders?status=paid" \
  -H "Authorization: Bearer your_token_here"
```

---

## Admin Endpoints

### 4. List All Refunds (Admin)

Get all refund requests across all organizers with pagination.

**Endpoint:** `GET /api/financials/refunds/admin`

**Authentication:** Required (Admin)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | String | No | Filter by status: `PENDING`, `APPROVED`, `REJECTED`, `PROCESSED` |
| `page` | Integer | No | Page number for pagination (default: 1) |

**Example Requests:**

```http
GET /api/financials/refunds/admin
GET /api/financials/refunds/admin?status=PENDING
GET /api/financials/refunds/admin?status=APPROVED&page=2
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440000",
      "organizer": {
        "id": "450e8400-e29b-41d4-a716-446655440000",
        "name": "Event Organizer Ltd",
        "email": "organizer@example.com"
      },
      "event": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Summer Music Festival 2025",
        "start_date": "2025-07-15T18:00:00.000000Z",
        "end_date": "2025-07-15T23:00:00.000000Z",
        "venue_name": "Central Park",
        "city": "London"
      },
      "type": "EVENT_CANCELLATION",
      "status": "PENDING",
      "affected_orders_count": 125,
      "total_refund_amount": 625000,
      "fine_amount": 0,
      "net_refund_amount": 0,
      "currency": "GBP",
      "reason": "Event cancelled due to severe weather",
      "description": "Weather warning issued by authorities",
      "admin_notes": null,
      "rejection_reason": null,
      "fine_reason": null,
      "refunds_processed": 0,
      "refunds_failed": 0,
      "processing_errors": null,
      "requested_at": "2025-12-17T18:30:00.000000Z",
      "approved_at": null,
      "rejected_at": null,
      "processed_at": null,
      "completed_at": null,
      "created_at": "2025-12-17T18:30:00.000000Z",
      "updated_at": "2025-12-17T18:30:00.000000Z",
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

**Example cURL:**

```bash
curl -X GET "https://api.parlomo.co.uk/api/financials/refunds/admin?status=PENDING&page=1" \
  -H "Authorization: Bearer admin_token_here"
```

---

### 5. Get Refund Details

Get detailed information about a specific refund request (not explicitly implemented, but can be added if needed).

**Note:** Currently, detailed information is retrieved via the list endpoints with filtering.

---

### 6. Approve Refund

Approve a pending refund request.

**Endpoint:** `PATCH /api/financials/refunds/{refund}`

**Authentication:** Required (Admin)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `refund` | UUID | The refund request ID |

**Request Body:**

```json
{
  "status": "APPROVED",
  "admin_notes": "Valid cancellation reason. Severe weather confirmed by authorities."
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | String | Yes | Must be `APPROVED` |
| `admin_notes` | String | No | Internal admin notes (max 1000 characters) |

**Validation:**
- Refund must be in `PENDING` status
- Cannot approve already finalized refunds

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Refund request approved",
  "data": {
    "id": "650e8400-e29b-41d4-a716-446655440000",
    "status": "APPROVED",
    "admin_notes": "Valid cancellation reason. Severe weather confirmed by authorities.",
    "approved_by": "350e8400-e29b-41d4-a716-446655440000",
    "approved_at": "2025-12-17T19:00:00.000000Z",
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "event_title": "Summer Music Festival 2025",
    "type": "EVENT_CANCELLATION",
    "affected_orders_count": 125,
    "total_refund_amount": 625000,
    "currency": "GBP"
  }
}
```

**Error Response:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Refund request has already been finalized"
}
```

**Example cURL:**

```bash
curl -X PATCH "https://api.parlomo.co.uk/api/financials/refunds/650e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer admin_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "admin_notes": "Valid cancellation reason. Severe weather confirmed by authorities."
  }'
```

---

### 7. Reject Refund

Reject a pending refund request.

**Endpoint:** `PATCH /api/financials/refunds/{refund}`

**Authentication:** Required (Admin)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `refund` | UUID | The refund request ID |

**Request Body:**

```json
{
  "status": "REJECTED",
  "rejection_reason": "Refund deadline has passed. Event took place 3 days ago.",
  "admin_notes": "Organizer contacted via email. Policy explained."
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | String | Yes | Must be `REJECTED` |
| `rejection_reason` | String | Yes | Reason for rejection (visible to organizer) |
| `admin_notes` | String | No | Internal admin notes (not visible to organizer) |

**Validation:**
- Refund must be in `PENDING` status
- `rejection_reason` is required when status is `REJECTED`

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Refund request rejected",
  "data": {
    "id": "650e8400-e29b-41d4-a716-446655440000",
    "status": "REJECTED",
    "rejection_reason": "Refund deadline has passed. Event took place 3 days ago.",
    "admin_notes": "Organizer contacted via email. Policy explained.",
    "rejected_by": "350e8400-e29b-41d4-a716-446655440000",
    "rejected_at": "2025-12-17T19:00:00.000000Z"
  }
}
```

**Error Response:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Refund request has already been finalized"
}
```

**Example cURL:**

```bash
curl -X PATCH "https://api.parlomo.co.uk/api/financials/refunds/650e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer admin_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REJECTED",
    "rejection_reason": "Refund deadline has passed. Event took place 3 days ago.",
    "admin_notes": "Organizer contacted via email. Policy explained."
  }'
```

---

### 8. Process Full Refund

Process an approved refund request with full refund (no deductions).

**Endpoint:** `PATCH /api/financials/refunds/{refund}`

**Authentication:** Required (Admin)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `refund` | UUID | The refund request ID |

**Request Body:**

```json
{
  "status": "PROCESSED"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | String | Yes | Must be `PROCESSED` |

**Validation:**
- Refund must be in `APPROVED` status
- Cannot process without approval

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Refund processing initiated: 125 queued, 0 failed",
  "data": {
    "id": "650e8400-e29b-41d4-a716-446655440000",
    "status": "PROCESSED",
    "affected_orders_count": 125,
    "total_refund_amount": 625000,
    "fine_amount": 0,
    "net_refund_amount": 625000,
    "refunds_processed": 125,
    "refunds_failed": 0,
    "processing_errors": [],
    "processed_at": "2025-12-17T19:05:00.000000Z"
  }
}
```

**What Happens:**
1. All affected orders are marked as `refunded`
2. Stripe refund records are created for each order
3. Refund processing jobs are queued
4. Customer email notifications are queued
5. Audit logs are created

**Error Response:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Refund must be approved before marking as processed"
}
```

**Example cURL:**

```bash
curl -X PATCH "https://api.parlomo.co.uk/api/financials/refunds/650e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer admin_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PROCESSED"
  }'
```

---

### 9. Process Partial Refund (with Fine)

Process an approved refund request with a fine/deduction (partial refund).

**Endpoint:** `PATCH /api/financials/refunds/{refund}`

**Authentication:** Required (Admin)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `refund` | UUID | The refund request ID |

**Request Body:**

```json
{
  "status": "PROCESSED",
  "fine_amount": 5000,
  "fine_reason": "Late cancellation fee (less than 48 hours notice)"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | String | Yes | Must be `PROCESSED` |
| `fine_amount` | Integer | Yes | Total fine amount in cents (e.g., 5000 = £50.00) |
| `fine_reason` | String | Yes | Reason for fine (visible to customers in email) |

**Validation:**
- Refund must be in `APPROVED` status
- `fine_amount` must be >= 0
- `fine_amount` must not exceed `total_refund_amount`
- `fine_reason` is required if `fine_amount` > 0

**How Fine Distribution Works:**

The total fine is distributed **proportionally** across all orders based on their amounts.

**Example:**
- Order A: £100 (50% of total £200) → Gets 50% of £50 fine = £25 fine → £75 refund
- Order B: £60 (30% of total £200) → Gets 30% of £50 fine = £15 fine → £45 refund
- Order C: £40 (20% of total £200) → Gets 20% of £50 fine = £10 fine → £30 refund

**Formula:**
```
order_fine = (order_amount / total_orders_amount) × total_fine_amount
refund_amount = order_amount - order_fine
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Refund processing initiated: 125 queued, 0 failed (with 50.00 GBP fine deducted)",
  "data": {
    "id": "650e8400-e29b-41d4-a716-446655440000",
    "status": "PROCESSED",
    "affected_orders_count": 125,
    "total_refund_amount": 625000,
    "fine_amount": 5000,
    "net_refund_amount": 620000,
    "fine_reason": "Late cancellation fee (less than 48 hours notice)",
    "refunds_processed": 125,
    "refunds_failed": 0,
    "processing_errors": [],
    "processed_at": "2025-12-17T19:05:00.000000Z"
  }
}
```

**What Happens:**
1. Fine is distributed proportionally across all orders
2. Each order is marked as `refunded`
3. Stripe refund records are created with partial amounts
4. Refund processing jobs are queued
5. Customer emails are queued showing:
   - Original amount
   - Deduction/fine
   - Net refund amount
   - Deduction reason
6. Audit logs are created

**Example cURL:**

```bash
curl -X PATCH "https://api.parlomo.co.uk/api/financials/refunds/650e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer admin_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PROCESSED",
    "fine_amount": 5000,
    "fine_reason": "Late cancellation fee (less than 48 hours notice)"
  }'
```

---

### 10. Get Audit Logs

Get complete audit trail for a specific refund request.

**Endpoint:** `GET /api/financials/refunds/{refund}/audit-logs`

**Authentication:** Required (Admin)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `refund` | UUID | The refund request ID |

**Example Request:**

```http
GET /api/financials/refunds/650e8400-e29b-41d4-a716-446655440000/audit-logs
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "150e8400-e29b-41d4-a716-446655440000",
      "refund_request_id": "650e8400-e29b-41d4-a716-446655440000",
      "action": "created",
      "user": {
        "id": "450e8400-e29b-41d4-a716-446655440000",
        "name": "Event Organizer Ltd",
        "email": "organizer@example.com"
      },
      "old_status": null,
      "new_status": "PENDING",
      "metadata": {
        "event_id": "550e8400-e29b-41d4-a716-446655440000",
        "type": "EVENT_CANCELLATION",
        "affected_orders_count": 125,
        "total_refund_amount": 625000
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
      "created_at": "2025-12-17T18:30:00.000000Z"
    },
    {
      "id": "250e8400-e29b-41d4-a716-446655440000",
      "refund_request_id": "650e8400-e29b-41d4-a716-446655440000",
      "action": "approved",
      "user": {
        "id": "350e8400-e29b-41d4-a716-446655440000",
        "name": "Admin User",
        "email": "admin@parlomo.co.uk"
      },
      "old_status": "PENDING",
      "new_status": "APPROVED",
      "metadata": {
        "admin_notes": "Valid cancellation reason. Severe weather confirmed."
      },
      "ip_address": "10.0.0.5",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "created_at": "2025-12-17T19:00:00.000000Z"
    },
    {
      "id": "260e8400-e29b-41d4-a716-446655440000",
      "refund_request_id": "650e8400-e29b-41d4-a716-446655440000",
      "action": "processed",
      "user": {
        "id": "350e8400-e29b-41d4-a716-446655440000",
        "name": "Admin User",
        "email": "admin@parlomo.co.uk"
      },
      "old_status": "APPROVED",
      "new_status": "PROCESSED",
      "metadata": {
        "refunds_processed": 125,
        "refunds_failed": 0,
        "fine_amount": 5000,
        "net_refund_amount": 620000
      },
      "ip_address": "10.0.0.5",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "created_at": "2025-12-17T19:05:00.000000Z"
    },
    {
      "id": "270e8400-e29b-41d4-a716-446655440000",
      "refund_request_id": "650e8400-e29b-41d4-a716-446655440000",
      "action": "stripe_initiated",
      "user": null,
      "old_status": null,
      "new_status": null,
      "metadata": {
        "order_id": "850e8400-e29b-41d4-a716-446655440000",
        "order_number": "ORD-2025-001234",
        "stripe_refund_id": "050e8400-e29b-41d4-a716-446655440000",
        "original_amount": 5000,
        "fine_amount": 200,
        "refund_amount": 4800,
        "refund_type": "partial"
      },
      "ip_address": null,
      "user_agent": null,
      "created_at": "2025-12-17T19:05:01.000000Z"
    },
    {
      "id": "280e8400-e29b-41d4-a716-446655440000",
      "refund_request_id": "650e8400-e29b-41d4-a716-446655440000",
      "action": "email_sent",
      "user": null,
      "old_status": null,
      "new_status": null,
      "metadata": {
        "order_id": "850e8400-e29b-41d4-a716-446655440000",
        "customer_email": "john.doe@example.com"
      },
      "ip_address": null,
      "user_agent": null,
      "created_at": "2025-12-17T19:05:05.000000Z"
    }
  ]
}
```

**Audit Log Actions:**

| Action | Description |
|--------|-------------|
| `created` | Organizer created refund request |
| `approved` | Admin approved refund request |
| `rejected` | Admin rejected refund request |
| `processed` | Admin processed refunds |
| `stripe_initiated` | Stripe refund job queued for an order |
| `stripe_completed` | Stripe confirmed refund succeeded |
| `stripe_failed` | Stripe refund failed |
| `email_sent` | Customer email notification sent |

**Example cURL:**

```bash
curl -X GET "https://api.parlomo.co.uk/api/financials/refunds/650e8400-e29b-41d4-a716-446655440000/audit-logs" \
  -H "Authorization: Bearer admin_token_here"
```

---

## Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation failed or invalid request |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Authenticated but not authorized (wrong role, deadline passed, etc.) |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server error |

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical error description (optional)",
  "errors": {
    "field_name": ["Error message for this field"]
  }
}
```

### Validation Errors (400/422)

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "event_id": ["The event id field is required."],
    "reason": ["The reason must be at least 10 characters."],
    "order_ids": ["You must select at least one order."]
  }
}
```

### Authentication Error (401)

```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

### Authorization Error (403)

```json
{
  "success": false,
  "message": "You do not have permission to perform this action."
}
```

### Not Found Error (404)

```json
{
  "success": false,
  "message": "Resource not found."
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "An error occurred while processing your request.",
  "error": "Technical details (only in development mode)"
}
```

---

## Common Use Cases

### Use Case 1: Organizer Cancels Entire Event

```bash
# Step 1: Create refund request
curl -X POST https://api.parlomo.co.uk/api/financials/refunds \
  -H "Authorization: Bearer organizer_token" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "EVENT_CANCELLATION",
    "reason": "Event cancelled due to severe weather"
  }'

# Response: Refund request created with status PENDING
```

### Use Case 2: Admin Approves and Processes Full Refund

```bash
# Step 1: Approve
curl -X PATCH https://api.parlomo.co.uk/api/financials/refunds/650e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "admin_notes": "Valid reason"
  }'

# Step 2: Process (full refund)
curl -X PATCH https://api.parlomo.co.uk/api/financials/refunds/650e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PROCESSED"
  }'
```

### Use Case 3: Admin Processes Partial Refund with Late Fee

```bash
# After approval, process with fine
curl -X PATCH https://api.parlomo.co.uk/api/financials/refunds/650e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PROCESSED",
    "fine_amount": 5000,
    "fine_reason": "Late cancellation fee (less than 48 hours notice)"
  }'
```

### Use Case 4: Organizer Refunds Selected Orders

```bash
# Step 1: Get event orders
curl -X GET https://api.parlomo.co.uk/api/ticketing/events/550e8400-e29b-41d4-a716-446655440000/orders \
  -H "Authorization: Bearer organizer_token"

# Step 2: Create bulk refund with selected order IDs
curl -X POST https://api.parlomo.co.uk/api/financials/refunds \
  -H "Authorization: Bearer organizer_token" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "BULK_REFUND",
    "reason": "Customer complaints about venue quality",
    "order_ids": [
      "850e8400-e29b-41d4-a716-446655440000",
      "950e8400-e29b-41d4-a716-446655440000"
    ]
  }'
```

### Use Case 5: Admin Rejects Refund Request

```bash
curl -X PATCH https://api.parlomo.co.uk/api/financials/refunds/650e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REJECTED",
    "rejection_reason": "Event already took place. Refund deadline has passed.",
    "admin_notes": "Contacted organizer - explained policy"
  }'
```

---

## Rate Limiting

All API endpoints are rate-limited:

- **Authenticated requests**: 60 requests per minute per user
- **Webhook endpoint**: 100 requests per minute

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1639494000
```

**Rate Limit Exceeded (429):**

```json
{
  "success": false,
  "message": "Too Many Requests. Please wait 30 seconds."
}
```

---

## Postman Collection

Import this base collection and add your token:

```json
{
  "info": {
    "name": "Parlomo Refund API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{access_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://api.parlomo.co.uk"
    },
    {
      "key": "access_token",
      "value": "your_token_here"
    }
  ]
}
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-17 | Initial API documentation |
| 1.1.0 | 2025-12-17 | Added partial refund support with fine distribution |

---

**Document Version**: 1.1.0
**Last Updated**: 2025-12-17
**Base URL**: https://api.parlomo.co.uk
**For Frontend & Backend Developers**
