# Checkout API for Seated Events

This document explains how to use the checkout API when purchasing tickets for seated events with seat selection.

---

## Overview

For seated events, customers must select specific seats before checkout. The selected seats are held temporarily during the checkout process and booked permanently after successful payment.

---

## Start Checkout Endpoint

### Endpoint
```
POST /api/ticketing/checkout/start
Authorization: Bearer {token} (optional - supports guest checkout)
```

### Request Body

#### For General Admission Events (no seat selection)
```json
{
  "event_id": "85bb8f5b-7f52-4faf-b57e-e8855acedbbd",
  "cart_items": [
    {
      "ticket_type_id": "8233181d-4b93-4fc0-848b-32d8b3f327be",
      "quantity": 2
    }
  ],
  "promo_code": "SUMMER20"
}
```

#### For Seated Events (with seat selection)
```json
{
  "event_id": "85bb8f5b-7f52-4faf-b57e-e8855acedbbd",
  "cart_items": [
    {
      "ticket_type_id": "8233181d-4b93-4fc0-848b-32d8b3f327be",
      "quantity": 2
    }
  ],
  "promo_code": "SUMMER20",
  "selected_seats": ["row 1-1", "row 1-2"]
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_id` | uuid | Yes | The public event ID |
| `cart_items` | array | Yes | Array of ticket types and quantities |
| `cart_items.*.ticket_type_id` | uuid | Yes | Ticket type ID |
| `cart_items.*.quantity` | integer | Yes | Number of tickets (min: 1) |
| `promo_code` | string | No | Promotional code for discount |
| `selected_seats` | array | **Yes for seated events** | Array of seat labels |

### Important Rules for `selected_seats`

1. **Required for seated events**: If the event has `event_type: "seated"` and a seats.io event is configured, `selected_seats` is required.

2. **Count must match quantity**: The number of seats in `selected_seats` must equal the total quantity of tickets in `cart_items`.
   ```
   Total tickets = sum of all cart_items.quantity
   selected_seats.length must equal Total tickets
   ```

3. **Seat labels format**: Use the exact seat labels from seats.io. The format depends on how the chart was designed:
   - Simple: `"1"`, `"2"`, `"3"`
   - With row: `"row 1-1"`, `"row 1-2"`, `"A-5"`
   - With section: `"Section A-Row 1-Seat 5"`

---

## Response

### Success Response
```json
{
  "success": true,
  "data": {
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "event_id": "85bb8f5b-7f52-4faf-b57e-e8855acedbbd",
    "cart_items": [
      {
        "ticket_type_id": "8233181d-4b93-4fc0-848b-32d8b3f327be",
        "ticket_type_name": "VIP",
        "quantity": 2,
        "unit_price": 15000,
        "subtotal": 30000
      }
    ],
    "subtotal": 30000,
    "discount": 0,
    "tax": 0,
    "fees": 1500,
    "total": 31500,
    "currency": "GBP",
    "status": "active",
    "expires_at": "2025-12-28T19:15:00.000000Z",
    "time_remaining_seconds": 900,
    "is_active": true,
    "selected_seats": ["row 1-1", "row 1-2"],
    "is_seated": true,
    "seat_hold": {
      "id": "hold-uuid-123",
      "status": "active",
      "expires_at": "2025-12-28T19:15:00.000000Z"
    }
  },
  "message": "Checkout session created"
}
```

### Response Fields for Seated Events

| Field | Type | Description |
|-------|------|-------------|
| `selected_seats` | array | The seats that were held |
| `is_seated` | boolean | `true` for seated events |
| `seat_hold.id` | uuid | The seat hold record ID |
| `seat_hold.status` | string | Hold status: `active`, `booked`, `released`, `expired` |
| `seat_hold.expires_at` | datetime | When the hold expires |

---

## Error Responses

### Seat Selection Required
```json
{
  "success": false,
  "error": "Checkout failed",
  "message": "Seat selection is required for this event"
}
```

### Seat Count Mismatch
```json
{
  "success": false,
  "error": "Checkout failed",
  "message": "Number of selected seats (3) must match ticket quantity (2)"
}
```

### Seats Not Available
```json
{
  "success": false,
  "error": "Checkout failed",
  "message": "One or more selected seats are no longer available"
}
```

### Failed to Hold Seats
```json
{
  "success": false,
  "error": "Checkout failed",
  "message": "Failed to hold selected seats: [error details]"
}
```

---

## Complete Checkout Flow for Seated Events

### Step 1: Get Seating Configuration
```
GET /api/ticketing/events/{eventId}/seating-config
```

Response:
```json
{
  "success": true,
  "data": {
    "workspace_key": "your-workspace-key",
    "event_key": "seatsio-event-key",
    "region": "eu",
    "pricing": [
      {
        "category": "1",
        "price": 15000,
        "ticket_type_id": "8233181d-4b93-4fc0-848b-32d8b3f327be",
        "ticket_type_name": "VIP"
      }
    ],
    "max_selected_objects": 20,
    "currency": "GBP"
  }
}
```

### Step 2: Display Seat Selection (Frontend)
Use seats.io SeatingChart component:

```javascript
new seatsio.SeatingChart({
  divId: 'chart',
  workspaceKey: data.workspace_key,
  event: data.event_key,
  region: data.region,
  pricing: data.pricing.map(p => ({
    category: p.category,
    ticketTypes: [{ ticketType: p.ticket_type_name, price: p.price / 100 }]
  })),
  maxSelectedObjects: data.max_selected_objects,

  onObjectSelected: (object) => {
    // Add to cart
    selectedSeats.push(object.label);
  },

  onObjectDeselected: (object) => {
    // Remove from cart
    selectedSeats = selectedSeats.filter(s => s !== object.label);
  }
}).render();
```

### Step 3: Start Checkout with Selected Seats
```
POST /api/ticketing/checkout/start
```

```json
{
  "event_id": "85bb8f5b-7f52-4faf-b57e-e8855acedbbd",
  "cart_items": [
    {
      "ticket_type_id": "8233181d-4b93-4fc0-848b-32d8b3f327be",
      "quantity": 2
    }
  ],
  "selected_seats": ["row 1-1", "row 1-2"]
}
```

**At this point:**
- Seats are held in seats.io (status: `reservedByToken`)
- Other customers cannot select these seats
- Hold expires in 15 minutes (configurable)

### Step 4: Create Payment Intent
```
POST /api/ticketing/checkout/create-payment-intent
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Step 5: Complete Payment
```
POST /api/ticketing/checkout/verify-payment
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "payment_intent_id": "pi_xxx",
  "buyer_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+44123456789"
  }
}
```

**After successful payment:**
- Seats are permanently booked in seats.io (status: `booked`)
- Seat info (section, row, seat number) is stored on each ticket
- Confirmation email is sent

---

## Session Expiration

- Checkout sessions expire after **15 minutes** (default)
- When a session expires:
  - Seat holds are automatically released in seats.io
  - Inventory reservations are released
  - Seats become available for other customers

---

## Cancelling a Session

If a customer abandons checkout:

```
POST /api/ticketing/checkout/cancel
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

This immediately releases:
- Held seats in seats.io
- Inventory reservations

---

## Frontend Integration Example (React)

```tsx
import { useState } from 'react';

interface CartItem {
  ticket_type_id: string;
  quantity: number;
}

async function startCheckout(
  eventId: string,
  cartItems: CartItem[],
  selectedSeats: string[],
  promoCode?: string
) {
  const response = await fetch('/api/ticketing/checkout/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      event_id: eventId,
      cart_items: cartItems,
      selected_seats: selectedSeats,
      promo_code: promoCode
    })
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data;
}

// Usage
const session = await startCheckout(
  'event-uuid',
  [{ ticket_type_id: 'ticket-type-uuid', quantity: 2 }],
  ['row 1-1', 'row 1-2']
);

console.log('Session ID:', session.session_id);
console.log('Seats held:', session.selected_seats);
console.log('Expires at:', session.expires_at);
```

---

## Summary

| Event Type | `selected_seats` Required | Seat Hold |
|------------|---------------------------|-----------|
| General Admission | No | No |
| Seated | Yes | Yes |

For seated events:
1. Seats must be selected before checkout
2. Number of seats must match ticket quantity
3. Seats are held during checkout
4. Seats are permanently booked after payment
5. Seats are released if session expires or is cancelled
