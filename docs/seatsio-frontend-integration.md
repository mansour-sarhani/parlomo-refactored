# Seats.io Frontend Integration Guide (Next.js)

This document provides all the information needed to integrate seats.io seat selection into the Next.js frontend for Parlomo public events.

---

## Table of Contents

1. [Overview](#overview)
2. [Seats.io JavaScript SDK](#seatsio-javascript-sdk)
3. [API Endpoints](#api-endpoints)
4. [Integration Flows](#integration-flows)
5. [Component Examples](#component-examples)
6. [Error Handling](#error-handling)
7. [TypeScript Interfaces](#typescript-interfaces)

---

## Overview

### Event Types
- **General Admission (`general_admission`)**: No seat selection required - existing flow unchanged
- **Seated (`seated`)**: Requires seat selection via seats.io chart before checkout

### How It Works
1. User views event page
2. If event is seated, display seats.io seating chart
3. User selects seats from the chart
4. Selected seats are passed to checkout API
5. Backend holds seats during checkout (15 min expiry)
6. After payment, seats are permanently booked

---

## Seats.io JavaScript SDK

### Installation

```bash
npm install @seatsio/seatsio-react
# or
yarn add @seatsio/seatsio-react
```

### CDN Alternative

```html
<script src="https://cdn-eu.seatsio.net/chart.js"></script>
```

> **Note**: Use `cdn-eu.seatsio.net` for EU region or `cdn-na.seatsio.net` for NA region (check with backend team which region is configured).

---

## API Endpoints

### 1. Get Seating Configuration (Public - No Auth)

Get the seats.io renderer configuration for an event.

```
GET /api/ticketing/events/{eventId}/seating-config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workspace_key": "your-workspace-public-key",
    "event_key": "parlomo-event-uuid",
    "region": "eu",
    "pricing": [
      {
        "category": "vip",
        "price": 150.00,
        "ticketTypeId": "uuid-of-ticket-type",
        "ticketTypeName": "VIP Ticket"
      },
      {
        "category": "standard",
        "price": 75.00,
        "ticketTypeId": "uuid-of-ticket-type",
        "ticketTypeName": "Standard Ticket"
      }
    ],
    "max_selected_objects": 20,
    "currency": "GBP"
  }
}
```

**Error Response (Event not seated or not configured):**
```json
{
  "success": false,
  "message": "Seating configuration not available for this event"
}
```

---

### 2. Get Seat Availability (Authenticated)

Get detailed availability by category for organizers.

```
GET /api/ticketing/seatsio/events/{eventId}/availability
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vip": {
      "category_key": "vip",
      "category_label": "VIP Section",
      "total": 100,
      "available": 85,
      "booked": 10,
      "held": 5,
      "blocked": 0,
      "ticket_type": {
        "id": "uuid",
        "name": "VIP Ticket",
        "price": 15000,
        "price_formatted": "150.00",
        "currency": "GBP"
      }
    },
    "standard": {
      "category_key": "standard",
      "category_label": "Standard",
      "total": 500,
      "available": 423,
      "booked": 67,
      "held": 10,
      "blocked": 0,
      "ticket_type": {
        "id": "uuid",
        "name": "Standard Ticket",
        "price": 7500,
        "price_formatted": "75.00",
        "currency": "GBP"
      }
    }
  }
}
```

---

### 3. Start Checkout with Seats

Modified checkout endpoint - now accepts `selected_seats` for seated events.

```
POST /api/ticketing/checkout/start
Content-Type: application/json
```

**Request Body:**
```json
{
  "event_id": "event-uuid",
  "cart_items": [
    {
      "ticket_type_id": "vip-ticket-uuid",
      "quantity": 2
    },
    {
      "ticket_type_id": "standard-ticket-uuid",
      "quantity": 1
    }
  ],
  "promo_code": "DISCOUNT10",
  "selected_seats": ["A-1", "A-2", "B-15"]
}
```

**Important Notes:**
- `selected_seats` is **required** for seated events
- Number of seats must match total quantity in `cart_items`
- Seat labels come from seats.io (e.g., "A-1", "Section A-Row 1-Seat 5")

**Success Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "checkout-session-uuid",
    "event_id": "event-uuid",
    "cart_items": [
      {
        "ticket_type_id": "vip-ticket-uuid",
        "ticket_type_name": "VIP Ticket",
        "quantity": 2,
        "unit_price": 15000,
        "subtotal": 30000
      }
    ],
    "subtotal": 37500,
    "discount": 3750,
    "promo_code": "DISCOUNT10",
    "fees": 500,
    "fee_breakdown": [...],
    "total": 34250,
    "currency": "GBP",
    "expires_at": "2025-12-28T15:30:00+00:00",
    "is_seated": true,
    "selected_seats": ["A-1", "A-2", "B-15"],
    "seat_hold_id": "hold-uuid"
  }
}
```

**Error Responses:**

Seat selection required:
```json
{
  "success": false,
  "message": "Seat selection is required for seated events"
}
```

Seat count mismatch:
```json
{
  "success": false,
  "message": "Number of selected seats must match ticket quantity"
}
```

Seats unavailable:
```json
{
  "success": false,
  "message": "Failed to hold selected seats: One or more seats are no longer available"
}
```

---

### 4. Check Single Seat Availability (Authenticated)

Check if a specific seat is available (for seat transfer).

```
POST /api/ticketing/seatsio/events/{eventId}/check-seat-availability
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "seat_label": "A-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "seat_label": "A-15",
    "is_available": true
  }
}
```

---

### 5. Get Blocked Seats (Authenticated - Organizer)

```
GET /api/ticketing/seatsio/events/{eventId}/blocked-seats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "seat_labels": ["A-1", "A-2", "A-3"],
      "reason": "VIP",
      "notes": "Reserved for sponsor",
      "blocked_at": "2025-12-28T10:00:00Z",
      "blocked_by": {
        "id": "user-uuid",
        "name": "John Organizer"
      }
    }
  ]
}
```

---

## Integration Flows

### Flow 1: Customer Buying Tickets (Seated Event)

```
┌─────────────────────────────────────────────────────────────────┐
│                        EVENT PAGE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Fetch event details                                         │
│     GET /api/public-events/{id}                                 │
│     └─> Check if event_type === 'seated'                        │
│                                                                  │
│  2. If seated, fetch seating config                             │
│     GET /api/ticketing/events/{id}/seating-config               │
│     └─> Get workspace_key, event_key, pricing                   │
│                                                                  │
│  3. Render seats.io SeatingChart component                      │
│     └─> User selects seats                                      │
│     └─> onObjectSelected callback fires                         │
│     └─> Track selected seats in state                           │
│                                                                  │
│  4. User clicks "Proceed to Checkout"                           │
│     └─> Build cart_items from selected seats                    │
│     └─> POST /api/ticketing/checkout/start                      │
│         with selected_seats array                               │
│                                                                  │
│  5. Proceed to payment (existing flow)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 2: Determining Cart Items from Seat Selection

When user selects seats, you need to map them to ticket types:

```javascript
// seats.io provides category info with each selected seat
const onObjectSelected = (selectedObject) => {
  // selectedObject contains:
  // - label: "A-15"
  // - category: { key: "vip", label: "VIP Section" }
  // - pricing: { price: 150.00 }

  // Find matching ticket type from seating config
  const ticketType = seatingConfig.pricing.find(
    p => p.category === selectedObject.category.key
  );

  // Add to cart grouped by ticket type
  updateCart(ticketType.ticketTypeId, selectedObject.label);
};
```

---

## Component Examples

### Basic Seating Chart Component

```tsx
// components/SeatingChart.tsx
'use client';

import { useEffect, useState } from 'react';
import { SeatsioSeatingChart } from '@seatsio/seatsio-react';

interface SeatingConfig {
  workspace_key: string;
  event_key: string;
  region: string;
  pricing: Array<{
    category: string;
    price: number;
    ticketTypeId: string;
    ticketTypeName: string;
  }>;
  max_selected_objects: number;
  currency: string;
}

interface SelectedSeat {
  label: string;
  category: string;
  ticketTypeId: string;
  price: number;
}

interface SeatingChartProps {
  eventId: string;
  onSelectionChange: (seats: SelectedSeat[]) => void;
  maxSeats?: number;
}

export default function SeatingChart({
  eventId,
  onSelectionChange,
  maxSeats
}: SeatingChartProps) {
  const [config, setConfig] = useState<SeatingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  useEffect(() => {
    fetchSeatingConfig();
  }, [eventId]);

  const fetchSeatingConfig = async () => {
    try {
      const response = await fetch(
        `/api/ticketing/events/${eventId}/seating-config`
      );
      const data = await response.json();

      if (data.success) {
        setConfig(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load seating chart');
    } finally {
      setLoading(false);
    }
  };

  const handleObjectSelected = (selectedObject: any) => {
    const ticketType = config?.pricing.find(
      p => p.category === selectedObject.category.key
    );

    if (!ticketType) return;

    const newSeat: SelectedSeat = {
      label: selectedObject.label,
      category: selectedObject.category.key,
      ticketTypeId: ticketType.ticketTypeId,
      price: ticketType.price,
    };

    const updatedSeats = [...selectedSeats, newSeat];
    setSelectedSeats(updatedSeats);
    onSelectionChange(updatedSeats);
  };

  const handleObjectDeselected = (deselectedObject: any) => {
    const updatedSeats = selectedSeats.filter(
      seat => seat.label !== deselectedObject.label
    );
    setSelectedSeats(updatedSeats);
    onSelectionChange(updatedSeats);
  };

  if (loading) {
    return <div className="seating-chart-loading">Loading seating chart...</div>;
  }

  if (error || !config) {
    return <div className="seating-chart-error">{error || 'Configuration not available'}</div>;
  }

  return (
    <div className="seating-chart-container" style={{ height: '500px' }}>
      <SeatsioSeatingChart
        workspaceKey={config.workspace_key}
        event={config.event_key}
        region={config.region}
        pricing={config.pricing.map(p => ({
          category: p.category,
          price: p.price,
        }))}
        priceFormatter={(price) => `£${price.toFixed(2)}`}
        maxSelectedObjects={maxSeats || config.max_selected_objects}
        onObjectSelected={handleObjectSelected}
        onObjectDeselected={handleObjectDeselected}
        showLegend
        showMinimap
        // Optional: customize colors
        colorScheme="light"
        // Optional: show/hide certain elements
        showSectionContents="auto"
      />
    </div>
  );
}
```

### Event Page with Conditional Seating

```tsx
// app/events/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import SeatingChart from '@/components/SeatingChart';
import GeneralAdmissionSelector from '@/components/GeneralAdmissionSelector';

interface Event {
  id: string;
  title: string;
  event_type: 'general_admission' | 'seated';
  // ... other fields
}

interface SelectedSeat {
  label: string;
  category: string;
  ticketTypeId: string;
  price: number;
}

export default function EventPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSelectionChange = (seats: SelectedSeat[]) => {
    setSelectedSeats(seats);
  };

  const handleCheckout = async () => {
    if (!event) return;

    setLoading(true);

    // Build cart items grouped by ticket type
    const cartItemsMap = new Map<string, number>();
    selectedSeats.forEach(seat => {
      const current = cartItemsMap.get(seat.ticketTypeId) || 0;
      cartItemsMap.set(seat.ticketTypeId, current + 1);
    });

    const cartItems = Array.from(cartItemsMap.entries()).map(
      ([ticketTypeId, quantity]) => ({
        ticket_type_id: ticketTypeId,
        quantity,
      })
    );

    try {
      const response = await fetch('/api/ticketing/checkout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          cart_items: cartItems,
          // Only include for seated events
          selected_seats: event.event_type === 'seated'
            ? selectedSeats.map(s => s.label)
            : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to checkout page with session
        window.location.href = `/checkout/${data.data.session_id}`;
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total from selected seats
  const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="event-page">
      {/* Event details */}
      <h1>{event?.title}</h1>

      {/* Ticket selection based on event type */}
      {event?.event_type === 'seated' ? (
        <div className="seated-event">
          <h2>Select Your Seats</h2>
          <SeatingChart
            eventId={event.id}
            onSelectionChange={handleSelectionChange}
          />

          {/* Selected seats summary */}
          {selectedSeats.length > 0 && (
            <div className="selection-summary">
              <h3>Selected Seats ({selectedSeats.length})</h3>
              <ul>
                {selectedSeats.map(seat => (
                  <li key={seat.label}>
                    {seat.label} - £{seat.price.toFixed(2)}
                  </li>
                ))}
              </ul>
              <p className="total">Total: £{total.toFixed(2)}</p>
              <button
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <GeneralAdmissionSelector
          eventId={event?.id || ''}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}
```

### Selected Seats Summary Component

```tsx
// components/SelectedSeatsSummary.tsx
'use client';

interface SelectedSeat {
  label: string;
  category: string;
  ticketTypeId: string;
  price: number;
}

interface Props {
  seats: SelectedSeat[];
  currency?: string;
  onRemoveSeat?: (label: string) => void;
}

export default function SelectedSeatsSummary({
  seats,
  currency = 'GBP',
  onRemoveSeat
}: Props) {
  // Group seats by category
  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.category]) {
      acc[seat.category] = [];
    }
    acc[seat.category].push(seat);
    return acc;
  }, {} as Record<string, SelectedSeat[]>);

  const total = seats.reduce((sum, seat) => sum + seat.price, 0);
  const currencySymbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';

  if (seats.length === 0) {
    return (
      <div className="seats-summary empty">
        <p>No seats selected. Click on seats in the chart to select them.</p>
      </div>
    );
  }

  return (
    <div className="seats-summary">
      <h3>Your Selection</h3>

      {Object.entries(groupedSeats).map(([category, categorySeats]) => (
        <div key={category} className="category-group">
          <h4>{category} ({categorySeats.length})</h4>
          <ul>
            {categorySeats.map(seat => (
              <li key={seat.label}>
                <span className="seat-label">{seat.label}</span>
                <span className="seat-price">
                  {currencySymbol}{seat.price.toFixed(2)}
                </span>
                {onRemoveSeat && (
                  <button
                    onClick={() => onRemoveSeat(seat.label)}
                    className="remove-btn"
                    aria-label={`Remove seat ${seat.label}`}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="summary-total">
        <span>Total ({seats.length} seats)</span>
        <span className="total-price">
          {currencySymbol}{total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
```

---

## Error Handling

### Common Error Scenarios

| Scenario | Error Message | User Action |
|----------|---------------|-------------|
| Seats no longer available | "Failed to hold selected seats: One or more seats are no longer available" | Refresh chart, select different seats |
| Seat count mismatch | "Number of selected seats must match ticket quantity" | Ensure all seats are selected |
| Session expired | "Checkout session has expired" | Start checkout again |
| Event not seated | "Seating configuration not available for this event" | Use general admission flow |

### Handling Seat Conflicts

```tsx
const handleCheckout = async () => {
  try {
    const response = await fetch('/api/ticketing/checkout/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: eventId,
        cart_items: cartItems,
        selected_seats: selectedSeats.map(s => s.label),
      }),
    });

    const data = await response.json();

    if (!data.success) {
      if (data.message.includes('no longer available')) {
        // Seats were taken - refresh the chart
        setError('Some seats are no longer available. Please select different seats.');
        refreshSeatingChart(); // Re-fetch chart to show updated availability
        setSelectedSeats([]);
      } else {
        setError(data.message);
      }
      return;
    }

    // Success - proceed to payment
    router.push(`/checkout/${data.data.session_id}`);

  } catch (error) {
    setError('Network error. Please try again.');
  }
};
```

---

## TypeScript Interfaces

```typescript
// types/seatsio.ts

export interface SeatingConfig {
  workspace_key: string;
  event_key: string;
  region: 'eu' | 'na';
  pricing: CategoryPricing[];
  max_selected_objects: number;
  currency: string;
}

export interface CategoryPricing {
  category: string;
  price: number;
  ticketTypeId: string;
  ticketTypeName: string;
}

export interface SelectedSeat {
  label: string;
  category: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
}

export interface SeatAvailability {
  category_key: string;
  category_label: string;
  total: number;
  available: number;
  booked: number;
  held: number;
  blocked: number;
  ticket_type: {
    id: string;
    name: string;
    price: number;
    price_formatted: string;
    currency: string;
  } | null;
}

export interface CheckoutStartRequest {
  event_id: string;
  cart_items: Array<{
    ticket_type_id: string;
    quantity: number;
  }>;
  promo_code?: string;
  selected_seats?: string[]; // Required for seated events
}

export interface CheckoutSession {
  session_id: string;
  event_id: string;
  cart_items: Array<{
    ticket_type_id: string;
    ticket_type_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  promo_code: string | null;
  fees: number;
  fee_breakdown: any[];
  total: number;
  currency: string;
  expires_at: string;
  is_seated: boolean;
  selected_seats: string[] | null;
  seat_hold_id: string | null;
}

// Seats.io SDK types (from @seatsio/seatsio-react)
export interface SeatsioObject {
  label: string;
  category: {
    key: string;
    label: string;
    color: string;
  };
  pricing: {
    price: number;
  };
  status: 'free' | 'booked' | 'reservedByToken' | 'blocked';
  // ... more properties
}
```

---

## Styling Tips

### Seats.io Chart Customization

The seats.io chart can be styled via props:

```tsx
<SeatsioSeatingChart
  // Color scheme
  colorScheme="light" // or "dark"

  // Custom colors
  colors={{
    colorSelected: '#1a73e8',
    cursorTooltipBackgroundColor: '#333',
  }}

  // Legend position
  legend={{
    visible: true,
    position: 'bottom' // 'top' | 'bottom' | 'left' | 'right'
  }}

  // Minimap
  showMinimap={true}
  minimapPosition="top-left" // or other corners

  // Loading placeholder
  loading="<div>Loading...</div>"
/>
```

### Responsive Container

```css
.seating-chart-container {
  width: 100%;
  height: 500px;
  min-height: 400px;
  max-height: 80vh;
}

@media (max-width: 768px) {
  .seating-chart-container {
    height: 400px;
  }
}
```

---

## Testing

### Test Scenarios

1. **Select seats and checkout**
   - Select multiple seats from different categories
   - Verify cart totals are correct
   - Complete checkout successfully

2. **Seat conflicts**
   - Open event in two browsers
   - Select same seat in both
   - First checkout should succeed
   - Second should show "seats unavailable" error

3. **Session expiry**
   - Start checkout, wait 15+ minutes
   - Try to complete payment
   - Should show session expired error

4. **Mixed categories**
   - Select VIP and Standard seats
   - Verify cart_items groups correctly by ticket_type_id

---

## Quick Reference

| Task | Endpoint | Auth |
|------|----------|------|
| Get seating config | `GET /ticketing/events/{id}/seating-config` | No |
| Start checkout | `POST /ticketing/checkout/start` | Optional |
| Get session status | `GET /ticketing/checkout/session/{sessionId}` | No |
| Cancel session | `POST /ticketing/checkout/cancel` | No |
| Get availability | `GET /ticketing/seatsio/events/{id}/availability` | Yes |

---

## Support

For backend issues or questions about the API, contact the backend team.

For seats.io specific questions:
- [Seats.io Documentation](https://docs.seats.io/)
- [React SDK Docs](https://docs.seats.io/docs/renderer/react)
- [Seats.io Support](https://support.seats.io/)
