# Frontend API Changes - December 2025

This document outlines the API changes that frontend developers need to implement.

---

## Table of Contents

1. [Parlomo Fee System](#1-parlomo-fee-system)
2. [Organizer Info Visibility](#2-organizer-info-visibility)

---

## 1. Parlomo Fee System

### Overview

A platform fee system where admins set a percentage fee, and organizers choose who pays it (buyer or organizer).

---

### New Fields in Event Response

| Field | Type | Description |
|-------|------|-------------|
| `parlomo_fee_percentage` | number | Platform fee percentage (e.g., 10 = 10%) |
| `fee_paid_by` | string | `"buyer"` or `"organizer"` |

**Example Event Response:**
```json
{
  "id": "uuid",
  "title": "My Event",
  "parlomo_fee_percentage": 10,
  "fee_paid_by": "buyer",
  ...
}
```

---

### Event Creation Form

When creating an event, add a field for organizers to choose who pays the fee:

| Field | Type | Required | Default | Options |
|-------|------|----------|---------|---------|
| `fee_paid_by` | select | No | `"buyer"` | `"buyer"`, `"organizer"` |

**UI Suggestion:**
```
Who pays the platform fee?
( ) Buyer pays (fee added to ticket price)
( ) I pay (fee deducted from my earnings)
```

**Note:** The `parlomo_fee_percentage` is automatically set from admin settings - organizers cannot change it.

---

### Event Update Form

**For Organizers:**
- Can only change `fee_paid_by` when event is in **draft** status
- Once published, this field should be read-only

**For Admins:**
- Can update both `parlomo_fee_percentage` and `fee_paid_by` at any time

---

### Checkout Session Response

New fields in checkout session:

```json
{
  "session_id": "uuid",
  "event_id": "uuid",
  "cart_items": [
    {
      "ticket_type_id": "uuid",
      "ticket_type_name": "General Admission",
      "quantity": 2,
      "unit_price": 1000,
      "subtotal": 2000
    }
  ],
  "subtotal": 2000,
  "discount": 0,
  "promo_code": null,
  "promo_code_id": null,
  "tax": 0,
  "fees": 200,
  "fee_breakdown": [
    {
      "name": "Service Fee",
      "amount": 200,
      "type": "parlomo_fee"
    }
  ],
  "parlomo_fee": 200,
  "parlomo_fee_percentage": 10,
  "fee_paid_by": "buyer",
  "total": 2200,
  "currency": "GBP",
  "status": "active",
  "expires_at": "2025-12-26T12:15:00.000000Z",
  "time_remaining_seconds": 900,
  "is_active": true
}
```

**Key Fields for Checkout UI:**

| Field | Type | Description |
|-------|------|-------------|
| `fees` | integer | Total fees in cents (includes parlomo_fee if buyer pays) |
| `fee_breakdown` | array | List of fee items to display |
| `parlomo_fee` | integer | Parlomo platform fee amount in cents |
| `parlomo_fee_percentage` | number | Fee percentage |
| `fee_paid_by` | string | Who pays: `"buyer"` or `"organizer"` |

---

### Checkout UI Display Logic

**When `fee_paid_by = "buyer"`:**
- Show the service fee in the order summary
- Fee is included in `total`

```
Subtotal:     £20.00
Service Fee:   £2.00
-----------------
Total:        £22.00
```

**When `fee_paid_by = "organizer"`:**
- No service fee shown to buyer
- `fees` will be 0 (unless there are other service charges)

```
Subtotal:     £20.00
-----------------
Total:        £20.00
```

---

### Settlement Response (Organizer Dashboard)

New fields in settlement response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "event_id": "uuid",
    "event_title": "My Event",
    "amount": 1800,
    "total_sales": 2000,
    "processing_fees": 0,
    "parlomo_fee": 200,
    "parlomo_fee_percentage": 10,
    "fee_paid_by": "organizer",
    "total_refunds": 0,
    "platform_fees": 0,
    "status": "PENDING",
    "payment_method": "stripe",
    "requested_at": "2025-12-26T12:00:00.000000Z"
  }
}
```

**Settlement Breakdown UI:**

| Field | Display Label |
|-------|---------------|
| `total_sales` | Total Sales |
| `parlomo_fee` | Platform Fee |
| `processing_fees` | Processing Fees |
| `total_refunds` | Total Refunds |
| `amount` | Net Payout |

**Show platform fee deduction only when `fee_paid_by = "organizer"`**

---

### Admin Settings

**Endpoint:** `GET /api/setting?key=PublicEventFees`

**Response:**
```json
{
  "key": "PublicEventFees",
  "value": {
    "percentage": 10
  }
}
```

**To Update (Admin only):**

`POST /api/setting`
```json
{
  "key": "PublicEventFees",
  "value": {
    "percentage": 10
  }
}
```

---

## 2. Organizer Info Visibility

### Overview

Admins can control whether organizer contact information is visible to the public for each event.

---

### New Field in Event Response

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `show_organizer_info` | boolean | `false` | Controls organizer info visibility |

---

### Conditional Fields

These fields will be `null` when `show_organizer_info = false`:

| Field | When `true` | When `false` |
|-------|-------------|--------------|
| `organizer_name` | "John Doe" | `null` |
| `organizer_email` | "john@example.com" | `null` |
| `organizer_phone` | "+44 123 456" | `null` |
| `organizer_website` | "https://..." | `null` |
| `organizer_facebook` | "johndoe" | `null` |
| `organizer_instagram` | "@johndoe" | `null` |
| `organizer_whatsapp` | "+44 123 456" | `null` |
| `organizer` | `{id, name, email}` | `null` |

---

### Event Detail Page UI

**When `show_organizer_info = true`:**
- Display organizer contact section with all available info

**When `show_organizer_info = false`:**
- Hide the entire organizer contact section
- OR show "Contact information not available"

**Example Check:**
```javascript
if (event.show_organizer_info && event.organizer_name) {
  // Show organizer contact section
}
```

---

### Admin Event Edit Form

Add toggle for admins only:

| Field | Type | Default | Admin Only |
|-------|------|---------|------------|
| `show_organizer_info` | boolean/toggle | `false` | Yes |

**UI Suggestion:**
```
[ ] Show organizer contact information publicly
```

**Note:** Non-admin users should NOT see this toggle - it's admin-only.

---

## TypeScript Interfaces

```typescript
// Event Response
interface PublicEvent {
  id: string;
  title: string;
  // ... existing fields ...

  // Fee fields
  parlomo_fee_percentage: number;
  fee_paid_by: 'buyer' | 'organizer';

  // Organizer visibility
  show_organizer_info: boolean;
  organizer_name: string | null;
  organizer_email: string | null;
  organizer_phone: string | null;
  organizer_website: string | null;
  organizer_facebook: string | null;
  organizer_instagram: string | null;
  organizer_whatsapp: string | null;
  organizer: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// Checkout Session
interface CheckoutSession {
  session_id: string;
  event_id: string;
  cart_items: CartItem[];
  subtotal: number;
  discount: number;
  promo_code: string | null;
  promo_code_id: string | null;
  tax: number;
  fees: number;
  fee_breakdown: FeeBreakdownItem[];
  parlomo_fee: number;
  parlomo_fee_percentage: number;
  fee_paid_by: 'buyer' | 'organizer';
  total: number;
  currency: string;
  status: string;
  expires_at: string;
  time_remaining_seconds: number;
  is_active: boolean;
}

interface FeeBreakdownItem {
  name: string;
  amount: number;
  type: string; // 'parlomo_fee' | 'per_ticket' | 'per_cart'
}

// Settlement
interface Settlement {
  id: string;
  event_id: string;
  event_title: string;
  amount: number;
  total_sales: number;
  processing_fees: number;
  parlomo_fee: number;
  parlomo_fee_percentage: number;
  fee_paid_by: 'buyer' | 'organizer';
  total_refunds: number;
  platform_fees: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  payment_method: string;
  requested_at: string;
}

// Event Create/Update Request
interface EventCreateRequest {
  // ... existing fields ...
  fee_paid_by?: 'buyer' | 'organizer';
}

interface EventUpdateRequest {
  // ... existing fields ...
  fee_paid_by?: 'buyer' | 'organizer';
  parlomo_fee_percentage?: number; // Admin only
  show_organizer_info?: boolean;   // Admin only
}
```

---

## Summary of UI Changes Needed

### Public Event Page
- [ ] Hide organizer contact section when `show_organizer_info = false`
- [ ] Handle null values for organizer fields

### Event Creation Form (Organizer)
- [ ] Add "Who pays the platform fee?" selector (`fee_paid_by`)

### Event Edit Form (Organizer)
- [ ] Show `fee_paid_by` as read-only when event is not draft
- [ ] Display current `parlomo_fee_percentage` (read-only)

### Event Edit Form (Admin)
- [ ] Add `show_organizer_info` toggle
- [ ] Add editable `parlomo_fee_percentage` field
- [ ] Add editable `fee_paid_by` selector

### Checkout Page
- [ ] Display service fee from `fee_breakdown` when `fee_paid_by = "buyer"`
- [ ] Hide service fee when `fee_paid_by = "organizer"`

### Settlement/Payout Page (Organizer)
- [ ] Show `parlomo_fee` in breakdown when `fee_paid_by = "organizer"`
- [ ] Display `parlomo_fee_percentage` for clarity

### Admin Settings
- [ ] Add PublicEventFees settings page to set platform fee percentage
