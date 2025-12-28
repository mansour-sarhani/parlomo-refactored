# Organizer Seated Event Creation - Step by Step Guide

This guide walks through the complete flow for an organizer to create a public event with seat selection.

---

## Overview

Creating a seated event involves these steps:

1. **Create Event** - Basic event details
2. **Select or Create Chart** - Choose venue seating layout
3. **Assign Chart to Event** - Link the chart
4. **Create Ticket Types** - Define pricing tiers (VIP, Standard, etc.)
5. **Map Categories to Ticket Types** - Connect seats.io categories to your prices
6. **Publish Event** - Make it live

---

## Step 1: Create the Event

### Endpoint
```
POST /api/ticketing/public-events
Authorization: Bearer {token}
```

### Request Body
```json
{
  "title": "Summer Concert 2025",
  "description": "An amazing concert at the stadium",
  "event_type": "seated",
  "start_date": "2025-07-15T19:00:00Z",
  "end_date": "2025-07-15T23:00:00Z",
  "venue_name": "City Stadium",
  "venue_address": "123 Main Street",
  "city": "London",
  "country": "UK",
  "category_id": "uuid-of-event-category",
  "status": "draft"
}
```

**Important:** Set `event_type` to `"seated"` for events with seat selection.

### Response
```json
{
  "success": true,
  "data": {
    "id": "event-uuid-123",
    "title": "Summer Concert 2025",
    "event_type": "seated",
    "status": "draft",
    "seatsio_chart_key": null,
    "seatsio_event_key": null,
    ...
  }
}
```

---

## Step 2: Get Available Charts

Organizers can use admin-created charts or create their own.

### Endpoint
```
GET /api/ticketing/seatsio/charts
Authorization: Bearer {token}
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "chart-uuid-1",
      "name": "Stadium Layout A",
      "venue_name": "City Stadium",
      "is_admin_chart": true,
      "categories": [
        { "key": "vip", "label": "VIP Section", "color": "#FFD700" },
        { "key": "standard", "label": "Standard", "color": "#4CAF50" },
        { "key": "economy", "label": "Economy", "color": "#2196F3" }
      ],
      "thumbnail_url": "https://..."
    },
    {
      "id": "chart-uuid-2",
      "name": "My Custom Layout",
      "venue_name": "Private Venue",
      "is_admin_chart": false,
      "categories": []
    }
  ]
}
```

---

## Step 3: Choose a Path

### Option A: Use Existing Chart
If an admin chart fits your venue, skip to **Step 5** (Assign Chart).

### Option B: Create Custom Chart
If you need a custom layout, continue to **Step 4**.

---

## Step 4: Create Custom Chart (Optional)

### 4.1 Create Chart Record

```
POST /api/ticketing/seatsio/charts
Authorization: Bearer {token}
```

#### Request Body
```json
{
  "name": "My Custom Venue Layout",
  "venue_name": "The Grand Hall",
  "venue_address": "456 Oak Avenue",
  "city": "Manchester",
  "country": "UK",
  "description": "Custom seating for our private venue"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "new-chart-uuid",
    "name": "My Custom Venue Layout",
    "seatsio_chart_key": "abc123-seatsio-key",
    "categories": [],
    "is_admin_chart": false
  }
}
```

### 4.2 Open Chart Designer

Get the designer configuration to embed the seats.io designer.

```
GET /api/ticketing/seatsio/charts/{chartId}/designer
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "data": {
    "chart_key": "abc123-seatsio-key",
    "secret_key": "workspace-secret-key",
    "region": "eu",
    "mode": "safe"
  }
}
```

### 4.3 Embed Designer in Frontend

```javascript
// Load seats.io script based on region
const scriptUrl = data.region === 'na'
  ? 'https://cdn-na.seatsio.net/chart.js'
  : 'https://cdn-eu.seatsio.net/chart.js';

// After script loads, initialize designer
new seatsio.SeatingChartDesigner({
  divId: 'chart-designer-container',
  secretKey: data.secret_key,
  chartKey: data.chart_key,
  mode: data.mode,

  onChartPublished: (chartKey) => {
    // Chart saved - sync to backend
    syncChart(chartId);
  },

  onExitRequested: () => {
    // User wants to exit
    handleExit();
  }
}).render();
```

### 4.4 Sync Chart After Design

After the organizer finishes designing and publishes the chart:

```
POST /api/ticketing/seatsio/charts/{chartId}/sync
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "message": "Chart synced successfully",
  "data": {
    "id": "chart-uuid",
    "name": "My Custom Venue Layout",
    "categories": [
      { "key": "1", "label": "Front Row", "color": "#FF0000" },
      { "key": "2", "label": "Back Row", "color": "#00FF00" }
    ],
    "thumbnail_url": "https://..."
  }
}
```

---

## Step 5: Assign Chart to Event

Link the selected chart to your event.

### Endpoint
```
POST /api/ticketing/seatsio/events/{eventId}/assign-chart
Authorization: Bearer {token}
```

### Request Body
```json
{
  "venue_chart_id": "chart-uuid-to-use"
}
```

### Response
```json
{
  "success": true,
  "message": "Chart assigned to event successfully",
  "data": {
    "id": "event-uuid-123",
    "title": "Summer Concert 2025",
    "seatsio_chart_key": "abc123-seatsio-key",
    "venue_chart": {
      "id": "chart-uuid",
      "name": "Stadium Layout A",
      "categories": [...]
    }
  }
}
```

---

## Step 6: Create Ticket Types

Create pricing tiers for your event. Each ticket type will be mapped to a seating category.

### Endpoint
```
POST /api/ticketing/public-events/{eventId}/ticket-types
Authorization: Bearer {token}
```

### Create Multiple Ticket Types

**VIP Tickets:**
```json
{
  "name": "VIP",
  "description": "Front row seats with backstage access",
  "price": 150.00,
  "quantity": 100,
  "max_per_order": 4,
  "sale_start_date": "2025-01-01T00:00:00Z",
  "sale_end_date": "2025-07-15T18:00:00Z"
}
```

**Standard Tickets:**
```json
{
  "name": "Standard",
  "description": "Great view from the middle sections",
  "price": 75.00,
  "quantity": 500,
  "max_per_order": 6,
  "sale_start_date": "2025-01-01T00:00:00Z",
  "sale_end_date": "2025-07-15T18:00:00Z"
}
```

**Economy Tickets:**
```json
{
  "name": "Economy",
  "description": "Affordable seats in the back",
  "price": 35.00,
  "quantity": 1000,
  "max_per_order": 10,
  "sale_start_date": "2025-01-01T00:00:00Z",
  "sale_end_date": "2025-07-15T18:00:00Z"
}
```

---

## Step 7: Map Categories to Ticket Types

Connect seats.io categories to your ticket types for pricing.

### Endpoint
```
POST /api/ticketing/seatsio/events/{eventId}/map-categories
Authorization: Bearer {token}
```

### Request Body
```json
{
  "mappings": [
    {
      "seatsio_category_key": "vip",
      "ticket_type_id": "vip-ticket-type-uuid"
    },
    {
      "seatsio_category_key": "standard",
      "ticket_type_id": "standard-ticket-type-uuid"
    },
    {
      "seatsio_category_key": "economy",
      "ticket_type_id": "economy-ticket-type-uuid"
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "message": "Category mappings saved successfully",
  "data": [
    {
      "seatsio_category_key": "vip",
      "category_label": "VIP Section",
      "ticket_type": {
        "id": "vip-ticket-type-uuid",
        "name": "VIP",
        "price": 150.00
      }
    },
    ...
  ]
}
```

---

## Step 8: Publish Event

When everything is ready, publish the event to make it live.

### Endpoint
```
PATCH /api/ticketing/public-events/{eventId}
Authorization: Bearer {token}
```

### Request Body
```json
{
  "status": "published"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "event-uuid-123",
    "title": "Summer Concert 2025",
    "status": "published",
    "seatsio_chart_key": "abc123-seatsio-key",
    "seatsio_event_key": "event-key-xyz",
    ...
  }
}
```

**Note:** The `seatsio_event_key` is generated when the event is published. This is used for the seat selection widget.

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZER EVENT CREATION                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Create Event                                            │
│  POST /api/ticketing/public-events                               │
│  { "event_type": "seated", "status": "draft", ... }             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Get Available Charts                                    │
│  GET /api/ticketing/seatsio/charts                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│  Use Existing Chart     │     │  Create Custom Chart    │
│  (Admin or Own)         │     │                         │
└─────────────────────────┘     │  POST /charts           │
              │                 │  GET /charts/{id}/      │
              │                 │      designer           │
              │                 │  [Design in UI]         │
              │                 │  POST /charts/{id}/sync │
              │                 └─────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: Assign Chart to Event                                   │
│  POST /api/ticketing/seatsio/events/{eventId}/assign-chart       │
│  { "venue_chart_id": "..." }                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: Create Ticket Types                                     │
│  POST /api/ticketing/public-events/{eventId}/ticket-types        │
│  Create VIP, Standard, Economy, etc.                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: Map Categories to Ticket Types                          │
│  POST /api/ticketing/seatsio/events/{eventId}/map-categories     │
│  { "mappings": [{ "seatsio_category_key": "vip",                │
│                   "ticket_type_id": "..." }, ...] }             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 8: Publish Event                                           │
│  PATCH /api/ticketing/public-events/{eventId}                    │
│  { "status": "published" }                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  EVENT IS LIVE  │
                    │  Customers can  │
                    │  select seats   │
                    └─────────────────┘
```

---

## Frontend UI Recommendations

### Event Creation Form

```
┌─────────────────────────────────────────────────────────────┐
│  Create New Event                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Event Title: [________________________]                     │
│                                                              │
│  Event Type:  ○ General Admission                           │
│               ● Seated Event (with seat selection)          │
│                                                              │
│  Date & Time: [2025-07-15] [19:00]                          │
│                                                              │
│  Venue:       [________________________]                     │
│                                                              │
│                              [Next: Select Seating Layout]   │
└─────────────────────────────────────────────────────────────┘
```

### Chart Selection Screen

```
┌─────────────────────────────────────────────────────────────┐
│  Select Seating Layout                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Admin Charts (Pre-built):                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ [thumb]  │  │ [thumb]  │  │ [thumb]  │                   │
│  │ Stadium  │  │ Theater  │  │ Arena    │                   │
│  │ Layout A │  │ Classic  │  │ Bowl     │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                              │
│  My Charts:                                                  │
│  ┌──────────┐                                               │
│  │ [thumb]  │  [+ Create New Chart]                         │
│  │ Custom   │                                               │
│  │ Layout   │                                               │
│  └──────────┘                                               │
│                                                              │
│                              [Select]  [Design New Chart]    │
└─────────────────────────────────────────────────────────────┘
```

### Category Mapping Screen

```
┌─────────────────────────────────────────────────────────────┐
│  Map Seat Categories to Ticket Types                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Chart: Stadium Layout A                                     │
│                                                              │
│  ┌─────────────────┬─────────────────────────────────────┐  │
│  │ Seat Category   │ Ticket Type                         │  │
│  ├─────────────────┼─────────────────────────────────────┤  │
│  │ 🟡 VIP Section  │ [Dropdown: VIP - £150.00      ▼]   │  │
│  │ 🟢 Standard     │ [Dropdown: Standard - £75.00  ▼]   │  │
│  │ 🔵 Economy      │ [Dropdown: Economy - £35.00   ▼]   │  │
│  └─────────────────┴─────────────────────────────────────┘  │
│                                                              │
│  Note: Create ticket types first if they don't exist         │
│                                                              │
│                              [Save Mappings]                 │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoint Summary

| Step | Method | Endpoint | Purpose |
|------|--------|----------|---------|
| 1 | POST | `/api/ticketing/public-events` | Create event |
| 2 | GET | `/api/ticketing/seatsio/charts` | List available charts |
| 4a | POST | `/api/ticketing/seatsio/charts` | Create custom chart |
| 4b | GET | `/api/ticketing/seatsio/charts/{id}/designer` | Get designer config |
| 4c | POST | `/api/ticketing/seatsio/charts/{id}/sync` | Sync after design |
| 5 | POST | `/api/ticketing/seatsio/events/{id}/assign-chart` | Assign chart |
| 6 | POST | `/api/ticketing/public-events/{id}/ticket-types` | Create ticket types |
| 7 | POST | `/api/ticketing/seatsio/events/{id}/map-categories` | Map categories |
| 8 | PATCH | `/api/ticketing/public-events/{id}` | Publish event |

---

## Additional Features

### Block Seats (Mark as unavailable)

Organizers can block certain seats (broken, reserved for staff, etc.):

```
POST /api/ticketing/seatsio/events/{eventId}/block-seats
Authorization: Bearer {token}

{
  "seat_labels": ["A-1", "A-2", "B-5"],
  "reason": "technical",
  "notes": "Sound equipment placement"
}
```

### View Blocked Seats

```
GET /api/ticketing/seatsio/events/{eventId}/blocked-seats
Authorization: Bearer {token}
```

### Unblock Seats

```
POST /api/ticketing/seatsio/events/{eventId}/unblock-seats
Authorization: Bearer {token}

{
  "seat_labels": ["A-1", "A-2"]
}
```

### Check Seat Availability

```
POST /api/ticketing/seatsio/events/{eventId}/check-seat-availability
Authorization: Bearer {token}

{
  "seat_labels": ["C-10", "C-11", "C-12"]
}
```

### Get Event Seat Availability Summary

```
GET /api/ticketing/seatsio/events/{eventId}/availability
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "total_capacity": 1600,
    "available": 1450,
    "booked": 120,
    "held": 15,
    "blocked": 15,
    "by_category": [
      {
        "category_key": "vip",
        "label": "VIP Section",
        "available": 85,
        "booked": 10,
        "held": 5,
        "ticket_type": { "name": "VIP", "price": 150.00 }
      },
      ...
    ]
  }
}
```

---

## Error Handling

Common errors you may encounter:

| Error | Cause | Solution |
|-------|-------|----------|
| `Chart already assigned` | Trying to assign chart to event that has one | Reassign or create new event |
| `Chart not found` | Invalid chart ID | Check available charts |
| `Category not found in chart` | Invalid category key in mapping | Sync chart first |
| `Ticket type not found` | Invalid ticket type ID | Create ticket type first |
| `Event must be seated type` | Trying to assign chart to GA event | Set `event_type: "seated"` |
| `Maximum charts limit reached` | Organizer exceeded chart quota | Contact admin |

---

## Testing Checklist

Before going live, verify:

- [ ] Event created with `event_type: "seated"`
- [ ] Chart assigned successfully
- [ ] All ticket types created with correct prices
- [ ] All seat categories mapped to ticket types
- [ ] Blocked seats (if any) are properly marked
- [ ] Event published and `seatsio_event_key` generated
- [ ] Seat selection widget loads for customers
- [ ] Test purchase completes and assigns seats
