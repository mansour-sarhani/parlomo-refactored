# Public Event Features - Complete API Documentation

## Overview

This document provides comprehensive API documentation for 15 new public event features. All endpoints require authentication via Bearer token unless specified otherwise.

**Base URL**: `https://api.parlomo.co.uk/api`

**Authentication**: 
```
Authorization: Bearer {access_token}
```

---

## Table of Contents

1. [Enhanced Event Dashboard](#1-enhanced-event-dashboard)
2. [Event Duplication](#2-event-duplication)
3. [Attendee Export](#3-attendee-export)
4. [Email Notifications](#4-email-notifications)
5. [Event Analytics](#5-event-analytics)
6. [Bulk Event Operations](#6-bulk-event-operations)
7. [Advanced Event Filtering](#7-advanced-event-filtering)
8. [Bulk Attendee Email](#8-bulk-attendee-email)
9. [Check-in Dashboard](#9-check-in-dashboard)
10. [Event Templates](#10-event-templates)
11. [Customer Communication](#11-customer-communication)
12. [Global Capacity Management](#12-global-capacity-management)
13. [Waitlist Management](#13-waitlist-management)
14. [Event Visibility Controls](#14-event-visibility-controls)
15. [Ticket Transfer Management](#15-ticket-transfer-management)

---

## 1. Enhanced Event Dashboard

Get comprehensive event overview with all key metrics in a single API call.

### Endpoint
```
GET /public-events/{eventId}/dashboard
```

### Authorization
- Event organizer
- Super-admin

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_capacity": 500,
      "total_sold": 350,
      "total_available": 150,
      "total_orders": 120,
      "total_revenue": 17500,
      "gross_ticket_sales": 16000,
      "total_fees": 1500,
      "total_discounts": 2000,
      "total_tax": 1500,
      "complimentary_tickets": 25,
      "checked_in_count": 0,
      "refunded_orders": 5,
      "refunded_amount": 1250
    },
    "recent_orders": [
      {
        "id": "uuid",
        "order_number": "ORD-2026-000123",
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "total": 150,
        "ticket_count": 2,
        "is_complimentary": false,
        "created_at": "2026-01-03T10:00:00Z"
      }
    ],
    "sales_by_day": [
      {
        "date": "2026-01-03",
        "orders": 15,
        "tickets_sold": 35,
        "revenue": 1750
      }
    ],
    "ticket_types": [
      {
        "id": "uuid",
        "name": "VIP",
        "capacity": 100,
        "sold": 75,
        "available": 25,
        "revenue": 7500,
        "percentage_sold": 75
      }
    ],
    "promo_codes": [
      {
        "code": "EARLYBIRD",
        "usage_count": 25,
        "total_discount": 1250,
        "max_uses": 50,
        "remaining_uses": 25
      }
    ],
    "complimentary_summary": {
      "total_orders": 5,
      "total_tickets": 25,
      "reasons": [
        {
          "reason": "Sponsor",
          "count": 15
        }
      ]
    },
    "refund_summary": {
      "total_refunds": 5,
      "total_amount": 1250,
      "pending_refunds": 2,
      "pending_amount": 500
    }
  }
}
```

### Example Request
```bash
curl -X GET "https://api.parlomo.co.uk/api/public-events/{eventId}/dashboard" \
  -H "Authorization: Bearer {token}"
```

---

## 2. Event Duplication

Clone an event with all settings including ticket types, promo codes, and seating configuration.

### Endpoint
```
POST /public-events/{eventId}/duplicate
```

### Authorization
- Event organizer
- Super-admin

### Request Body
```json
{
  "title": "New Event Title",
  "slug": "new-event-slug",
  "start_date": "2026-06-15T18:00:00Z",
  "end_date": "2026-06-15T22:00:00Z",
  "copy_ticket_types": true,
  "copy_promo_codes": false,
  "copy_seating": true,
  "status": "draft"
}
```

### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | New event title |
| slug | string | Yes | Unique URL slug |
| start_date | datetime | Yes | Event start date (must be future) |
| end_date | datetime | No | Event end date |
| copy_ticket_types | boolean | No | Copy ticket types (default: true) |
| copy_promo_codes | boolean | No | Copy promo codes (default: false) |
| copy_seating | boolean | No | Copy seating config (default: true) |
| status | string | No | Event status: draft/published (default: draft) |

### Response (200 OK)
```json
{
  "success": true,
  "message": "Event duplicated successfully",
  "data": {
    "id": "new-event-uuid",
    "title": "New Event Title",
    "slug": "new-event-slug",
    "original_event_id": "original-uuid"
  }
}
```

### Example Request
```bash
curl -X POST "https://api.parlomo.co.uk/api/public-events/{eventId}/duplicate" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Concert 2026",
    "slug": "summer-concert-2026",
    "start_date": "2026-07-15T19:00:00Z",
    "copy_ticket_types": true,
    "copy_promo_codes": false
  }'
```

---

## 3. Attendee Export

Export attendee list to CSV file with filtering options.

### Endpoint
```
GET /ticketing/events/{eventId}/attendees/export
```

### Authorization
- Event organizer
- Super-admin

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| ticket_type | UUID | Filter by ticket type |
| checked_in | boolean | Filter by check-in status |
| search | string | Search by name or email |

### Response
CSV file download with headers:
```
Order Number, Customer Name, Customer Email, Customer Phone, Ticket Type, 
Ticket Code, Attendee Name, Attendee Email, Checked In, Checked In At, Purchase Date
```

### Example Request
```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/events/{eventId}/attendees/export?checked_in=true" \
  -H "Authorization: Bearer {token}" \
  -o attendees.csv
```

---

## 4. Email Notifications

Automatic email notifications for important event activities (email only, no push notifications).

### Notification Types

#### 4.1 Low Ticket Alert
**Trigger**: When 80% of tickets are sold  
**Recipient**: Event organizer  
**Subject**: "Low Ticket Alert: {Event Title}"

#### 4.2 Sold Out Notification
**Trigger**: When all tickets are sold  
**Recipient**: Event organizer  
**Subject**: "Event Sold Out: {Event Title}"

#### 4.3 Refund Request Notification
**Trigger**: When refund request is created  
**Recipient**: Event organizer  
**Subject**: "Refund Request: {Event Title}"

#### 4.4 Large Order Notification
**Trigger**: When order exceeds $500 or 10 tickets  
**Recipient**: Event organizer  
**Subject**: "Large Order Received: {Event Title}"

### Configuration
Notifications are sent automatically. No API calls required.

---

## 5. Event Analytics

Get detailed analytics and insights for an event.

### Endpoint
```
GET /public-events/{eventId}/analytics
```

### Authorization
- Event organizer
- Super-admin

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "sales_velocity": [
      {
        "date": "2026-01-03",
        "orders": 15,
        "revenue": 1750,
        "unique_orders": 15
      }
    ],
    "revenue_trends": {
      "daily_average": 583.33,
      "peak_day": {
        "date": "2026-01-02",
        "orders": 20,
        "revenue": 2000
      },
      "total_days_with_sales": 30
    },
    "conversion_metrics": {
      "total_orders": 150,
      "paid_orders": 140,
      "cancelled_orders": 10,
      "conversion_rate": 93.33
    },
    "refund_metrics": {
      "total_refunds": 5,
      "refund_rate": 3.57,
      "refunded_amount": 1250
    },
    "average_order_value": 125.00,
    "peak_sales_times": [
      {
        "hour": 14,
        "orders": 25
      },
      {
        "hour": 19,
        "orders": 20
      }
    ]
  }
}
```

### Example Request
```bash
curl -X GET "https://api.parlomo.co.uk/api/public-events/{eventId}/analytics" \
  -H "Authorization: Bearer {token}"
```

---

## 6. Bulk Event Operations

Perform bulk actions on multiple events (admin only).

### Endpoint
```
POST /public-events/admin/bulk-action
```

### Authorization
- Super-admin
- System-admin

### Request Body
```json
{
  "event_ids": ["uuid1", "uuid2", "uuid3"],
  "action": "publish",
  "category_id": "uuid",
  "organizer_id": "uuid"
}
```

### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| event_ids | array | Yes | Array of event UUIDs |
| action | string | Yes | Action: publish, unpublish, cancel, delete, change_category, change_organizer |
| category_id | UUID | Conditional | Required if action is change_category |
| organizer_id | UUID | Conditional | Required if action is change_organizer |

### Response (200 OK)
```json
{
  "success": true,
  "message": "Bulk action completed. 3 events updated.",
  "data": {
    "success_count": 3,
    "total_count": 3,
    "errors": []
  }
}
```

### Example Request
```bash
curl -X POST "https://api.parlomo.co.uk/api/public-events/admin/bulk-action" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "event_ids": ["uuid1", "uuid2"],
    "action": "publish"
  }'
```

---

## 7. Advanced Event Filtering

Enhanced filtering options for event listings.

### Endpoint
```
GET /public-events
```

### New Query Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| statuses | string | Comma-separated statuses | published,draft |
| sold_percentage_min | integer | Minimum sold percentage | 50 |
| date_preset | string | Date range preset | this_week, this_month, next_month |

### Example Request
```bash
# Get events that are 50%+ sold
curl -X GET "https://api.parlomo.co.uk/api/public-events?sold_percentage_min=50" \
  -H "Authorization: Bearer {token}"

# Get events this month
curl -X GET "https://api.parlomo.co.uk/api/public-events?date_preset=this_month" \
  -H "Authorization: Bearer {token}"

# Get published or featured events
curl -X GET "https://api.parlomo.co.uk/api/public-events?statuses=published,featured" \
  -H "Authorization: Bearer {token}"
```

---

## 8. Bulk Attendee Email

Send bulk emails to event attendees with filtering options.

### Endpoint
```
POST /ticketing/events/{eventId}/attendees/bulk-email
```

### Authorization
- Event organizer
- Super-admin

### Request Body
```json
{
  "subject": "Important Event Update",
  "message": "Dear attendees, we have an important update...",
  "ticket_type_id": "uuid",
  "checked_in_only": false
}
```

### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subject | string | Yes | Email subject (max 255 chars) |
| message | string | Yes | Email message body |
| ticket_type_id | UUID | No | Send only to specific ticket type |
| checked_in_only | boolean | No | Send only to checked-in attendees |

### Response (200 OK)
```json
{
  "success": true,
  "message": "Email queued for 150 attendees",
  "data": {
    "recipient_count": 150
  }
}
```

### Example Request
```bash
curl -X POST "https://api.parlomo.co.uk/api/ticketing/events/{eventId}/attendees/bulk-email" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Event Reminder",
    "message": "Don't forget about the event tomorrow!",
    "checked_in_only": false
  }'
```

---

## 9. Check-in Dashboard

Get comprehensive check-in statistics and real-time data.

### Endpoint
```
GET /ticketing/events/{eventId}/check-in-dashboard
```

### Authorization
- Event organizer
- Super-admin

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_tickets": 500,
      "checked_in": 350,
      "pending": 150,
      "check_in_rate": 70.00
    },
    "check_ins_by_hour": [
      {
        "hour": 18,
        "count": 50
      },
      {
        "hour": 19,
        "count": 100
      }
    ],
    "recent_check_ins": [
      {
        "ticket_code": "TKT-ABC123",
        "attendee_name": "John Doe",
        "ticket_type": "VIP",
        "checked_in_at": "2026-01-03T18:30:00Z"
      }
    ],
    "check_ins_by_type": [
      {
        "ticket_type": "VIP",
        "checked_in": 75
      },
      {
        "ticket_type": "General Admission",
        "checked_in": 275
      }
    ]
  }
}
```

### Example Request
```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/events/{eventId}/check-in-dashboard" \
  -H "Authorization: Bearer {token}"
```

---

## 10. Event Templates

Save events as templates and create new events from templates.

### Database Schema
```sql
CREATE TABLE event_templates (
    id UUID PRIMARY KEY,
    name VARCHAR,
    description TEXT,
    created_by UUID,
    template_data JSON,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Future Endpoints (To be implemented)
```
POST /public-events/{eventId}/save-as-template
GET /public-events/templates
POST /public-events/templates/{templateId}/create-event
```

---

## 11. Customer Communication

Send updates and reminders to ticket holders.

### Future Endpoints (To be implemented)
```
POST /public-events/{eventId}/send-update
POST /public-events/{eventId}/send-reminder
```

### Planned Features
- Event update emails to all ticket holders
- Automated reminder emails (X days before event)
- Custom email templates
- Event cancellation notifications

---

## 12. Global Capacity Management

Enforce overall event capacity across all ticket types.

### Database Schema
```sql
ALTER TABLE public_events ADD COLUMN global_capacity INTEGER;
ALTER TABLE public_events ADD COLUMN enforce_global_capacity BOOLEAN DEFAULT false;
```

### Usage
When creating/updating events:
```json
{
  "global_capacity": 500,
  "enforce_global_capacity": true
}
```

### Behavior
- If `enforce_global_capacity` is true, total tickets sold across all ticket types cannot exceed `global_capacity`
- Useful for venue capacity limits
- Overrides individual ticket type capacities

---

## 13. Waitlist Management

Manage waitlist when events are sold out. **Supports both guest and authenticated users**.

### Database Schema
```sql
CREATE TABLE event_waitlist (
    id UUID PRIMARY KEY,
    event_id UUID,
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    requested_tickets INTEGER DEFAULT 1,
    ticket_type_id UUID,
    status ENUM('waiting', 'notified', 'converted', 'expired'),
    notified_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

### 13.1 Join Waitlist (PUBLIC - No Auth Required)

**Endpoint**: `POST /public-events/{eventId}/waitlist`

**Authorization**: None required (public endpoint for guests)

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "requested_tickets": 2,
  "ticket_type_id": "uuid"
}
```

**Request Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Customer name (max 255 chars) |
| email | string | Yes | Customer email |
| phone | string | No | Customer phone number |
| requested_tickets | integer | Yes | Number of tickets needed (1-10) |
| ticket_type_id | UUID | No | Specific ticket type requested |

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Successfully added to waitlist. We will notify you when tickets become available.",
  "data": {
    "position": 15,
    "requested_tickets": 2
  }
}
```

**Error Responses**

**Event Not Sold Out (400)**
```json
{
  "success": false,
  "message": "Event is not sold out. Tickets are still available for purchase.",
  "available_tickets": 50
}
```

**Already on Waitlist (400)**
```json
{
  "success": false,
  "message": "You are already on the waitlist for this event"
}
```

**Example Request**
```bash
# Guest customer joins waitlist (no auth token needed)
curl -X POST "https://api.parlomo.co.uk/api/public-events/{eventId}/waitlist" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "requested_tickets": 2
  }'
```

---

### 13.2 Get Waitlist (Organizer/Admin Only)

**Endpoint**: `GET /public-events/{eventId}/waitlist`

**Authorization**: 
- Event organizer
- Super-admin

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "position": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "requested_tickets": 2,
      "ticket_type_id": "uuid",
      "status": "waiting",
      "notified_at": null,
      "created_at": "2026-01-03T10:00:00Z"
    }
  ],
  "summary": {
    "total_waiting": 15,
    "total_notified": 5,
    "total_converted": 3
  }
}
```

**Example Request**
```bash
curl -X GET "https://api.parlomo.co.uk/api/public-events/{eventId}/waitlist" \
  -H "Authorization: Bearer {token}"
```

---

### 13.3 Notify Waitlist (Organizer/Admin Only)

**Endpoint**: `POST /public-events/{eventId}/waitlist/notify`

**Authorization**: 
- Event organizer
- Super-admin

**Request Body**
```json
{
  "count": 5,
  "message": "Good news! Tickets are now available for the event."
}
```

**Request Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| count | integer | Yes | Number of people to notify (from top of waitlist) |
| message | string | No | Custom message to include in email |

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Notified 5 people on the waitlist",
  "data": {
    "notified_count": 5
  }
}
```

**Example Request**
```bash
curl -X POST "https://api.parlomo.co.uk/api/public-events/{eventId}/waitlist/notify" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 10,
    "message": "Tickets are now available! Book now before they sell out again."
  }'
```

---

### 13.4 Remove from Waitlist (Organizer/Admin Only)

**Endpoint**: `DELETE /public-events/{eventId}/waitlist/{entryId}`

**Authorization**: 
- Event organizer
- Super-admin

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Removed from waitlist successfully"
}
```

**Example Request**
```bash
curl -X DELETE "https://api.parlomo.co.uk/api/public-events/{eventId}/waitlist/{entryId}" \
  -H "Authorization: Bearer {token}"
```

---

### Waitlist Features

✅ **Guest Support**: No login required to join waitlist  
✅ **Automatic Validation**: Checks if event is actually sold out  
✅ **Duplicate Prevention**: One email per event  
✅ **Position Tracking**: Shows waitlist position  
✅ **Email Notifications**: Automatic emails when tickets available  
✅ **Status Tracking**: waiting → notified → converted → expired  
✅ **FIFO Order**: First-come, first-served notification  

### Waitlist Workflow

1. **Customer joins waitlist** (no auth required)
   - System checks if event is sold out
   - Prevents duplicate emails
   - Returns position in queue

2. **Organizer monitors waitlist**
   - View all waiting customers
   - See summary statistics
   - Track notification status

3. **Tickets become available**
   - Organizer notifies X people from top of list
   - Automated emails sent
   - Status updated to "notified"

4. **Customer purchases ticket**
   - Organizer manually updates status to "converted"
   - Or removes from waitlist

---

## 14. Event Visibility Controls

Advanced visibility and access controls for events.

### Future Features
- **Scheduled Publishing**: Set `publish_at` timestamp
- **Password Protection**: Require password to view/purchase
- **Invite-Only**: Restrict to invited users only
- **Early Access**: Special access codes for early bird sales

### Planned Fields
```json
{
  "visibility": "public|password|invite_only",
  "password": "secret123",
  "publish_at": "2026-06-01T00:00:00Z",
  "early_access_codes": ["EARLY2026"]
}
```

---

## 15. Ticket Transfer Management

Enhanced ticket transfer controls and tracking. **Works for both seated and general admission events**.

### Overview

Ticket transfer allows ticket holders to:
- **Transfer ownership** to another person (all events)
- **Change seats** (seated events only)
- View transfer history
- Check if ticket can be transferred

---

### 15.1 Transfer Ticket Ownership

Transfer a ticket to a new owner (changes attendee name and email).

**Endpoint**: `POST /ticketing/tickets/{ticketId}/transfer`

**Authorization**:
- Ticket owner (order customer)
- Event organizer
- Super-admin

**Request Body**
```json
{
  "new_email": "newowner@example.com",
  "new_name": "Jane Smith",
  "notes": "Transferring to my friend"
}
```

**Request Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| new_email | string | Yes | New owner's email |
| new_name | string | Yes | New owner's name |
| notes | string | No | Transfer reason/notes (max 500 chars) |

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Ticket transferred successfully",
  "data": {
    "transfer_id": "uuid",
    "ticket_id": "uuid",
    "from_email": "oldowner@example.com",
    "to_email": "newowner@example.com",
    "transferred_at": "2026-01-03T12:00:00Z"
  }
}
```

**Error Responses**

**Cannot Transfer (400)**
```json
{
  "success": false,
  "message": "This ticket cannot be transferred. It may be used, cancelled, or the event has ended."
}
```

**Example Request**
```bash
curl -X POST "https://api.parlomo.co.uk/api/ticketing/tickets/{ticketId}/transfer" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "new_email": "jane@example.com",
    "new_name": "Jane Smith",
    "notes": "Transferring to my friend who will attend"
  }'
```

---

### 15.2 Get Transfer History

View all transfers for a specific ticket.

**Endpoint**: `GET /ticketing/tickets/{ticketId}/transfer-history`

**Authorization**:
- Ticket owner
- Event organizer
- Super-admin

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "from_email": "original@example.com",
      "from_name": "John Doe",
      "to_email": "second@example.com",
      "to_name": "Jane Smith",
      "transfer_type": "manual",
      "status": "completed",
      "transferred_at": "2026-01-03T12:00:00Z",
      "notes": "Transferring to friend"
    }
  ]
}
```

**Example Request**
```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/tickets/{ticketId}/transfer-history" \
  -H "Authorization: Bearer {token}"
```

---

### 15.3 Change Seat (Seated Events Only)

Move a ticket to a different seat.

**Endpoint**: `POST /ticketing/tickets/{ticketId}/change-seat`

**Authorization**:
- Ticket owner
- Event organizer
- Super-admin

**Request Body**
```json
{
  "new_seat_id": "A-15",
  "reason": "Better view requested"
}
```

**Request Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| new_seat_id | string | Yes | New seat identifier from Seats.io |
| reason | string | No | Reason for seat change (max 500 chars) |

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Seat changed successfully",
  "data": {
    "ticket_id": "uuid",
    "old_seat": "A-10",
    "new_seat": "A-15"
  }
}
```

**Error Responses**

**Not Seated Event (400)**
```json
{
  "success": false,
  "message": "This event does not have assigned seating"
}
```

**Example Request**
```bash
curl -X POST "https://api.parlomo.co.uk/api/ticketing/tickets/{ticketId}/change-seat" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "new_seat_id": "B-20",
    "reason": "Prefer aisle seat"
  }'
```

---

### 15.4 Check if Ticket Can Be Transferred

Validate if a ticket is eligible for transfer.

**Endpoint**: `GET /ticketing/tickets/{ticketId}/can-transfer`

**Authorization**: None required (public)

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "can_transfer": false,
    "reasons": [
      "Ticket status is 'used'",
      "Event has ended"
    ],
    "ticket_status": "used",
    "transfer_allowed": true,
    "event_ended": true
  }
}
```

**Example Request**
```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/tickets/{ticketId}/can-transfer" \
  -H "Authorization: Bearer {token}"
```

---

### 15.5 Get Transferable Tickets for Order

Get list of all tickets in an order that can be transferred.

**Endpoint**: `GET /ticketing/orders/{orderId}/transferable-tickets`

**Authorization**:
- Order owner
- Event organizer
- Super-admin

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ticket_code": "TKT-ABC123",
      "ticket_type": "VIP",
      "attendee_name": "John Doe",
      "attendee_email": "john@example.com",
      "seat_label": "A-10",
      "status": "valid"
    }
  ]
}
```

**Example Request**
```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/orders/{orderId}/transferable-tickets" \
  -H "Authorization: Bearer {token}"
```

---

### Transfer Rules

**A ticket CAN be transferred if**:
✅ Ticket status is 'valid' (not used, cancelled, or refunded)  
✅ Ticket type allows transfers (`transfer_allowed = true`)  
✅ Event has not ended  

**A ticket CANNOT be transferred if**:
❌ Ticket has been used (checked in)  
❌ Ticket has been cancelled or refunded  
❌ Ticket type does not allow transfers  
❌ Event has ended  

---

### Transfer Types

| Type | Description | Use Case |
|------|-------------|----------|
| **manual** | User-initiated transfer | Customer transfers to friend |
| **organizer** | Organizer-initiated | Event organizer reassigns ticket |
| **system** | System-initiated | Automated transfers |

---

### Seat Transfer vs Ownership Transfer

| Feature | Ownership Transfer | Seat Transfer |
|---------|-------------------|---------------|
| **Changes** | Attendee name & email | Seat location only |
| **Event Types** | All events | Seated events only |
| **Seats.io** | No integration | Full integration |
| **Use Case** | Give ticket to someone else | Move to better seat |

---

### Integration Notes

**For Seated Events**:
- Ownership transfer updates attendee info but keeps same seat
- Seat transfer changes seat but keeps same attendee
- Both can be done independently
- Seats.io automatically updated for seat transfers

**For General Admission**:
- Only ownership transfer available
- No seat assignment to change
- Simple attendee info update

---

## Error Responses

All endpoints follow consistent error response format:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

---

## Implementation Status

| # | Feature | Status | Endpoints |
|---|---------|--------|-----------|
| 1 | Enhanced Event Dashboard | ✅ Complete | 1 |
| 2 | Event Duplication | ✅ Complete | 1 |
| 3 | Attendee Export | ✅ Complete | 1 |
| 4 | Email Notifications | ✅ Complete | Automatic |
| 5 | Event Analytics | ✅ Complete | 1 |
| 6 | Bulk Event Operations | ✅ Complete | 1 |
| 7 | Advanced Filtering | ✅ Complete | Enhanced existing |
| 8 | Bulk Attendee Email | ✅ Complete | 1 |
| 9 | Check-in Dashboard | ✅ Complete | 1 |
| 10 | Event Templates | 🔄 Database Ready | Pending |
| 11 | Customer Communication | 🔄 Mailables Ready | Pending |
| 12 | Global Capacity | 🔄 Database Ready | Integrated |
| 13 | Waitlist Management | ✅ Complete | 4 |
| 14 | Visibility Controls | 📋 Planned | Pending |
| 15 | Transfer Management | ✅ Complete | 5 |

---

## Testing Checklist

### Dashboard
- [ ] Fetch dashboard for owned event
- [ ] Verify all metrics are accurate
- [ ] Test with event with no orders
- [ ] Test authorization (non-owner)

### Duplication
- [ ] Duplicate event with ticket types
- [ ] Duplicate with promo codes
- [ ] Duplicate seated event
- [ ] Verify slug uniqueness validation

### Export
- [ ] Export all attendees
- [ ] Export with ticket type filter
- [ ] Export checked-in only
- [ ] Verify CSV format

### Analytics
- [ ] Fetch analytics data
- [ ] Verify calculations
- [ ] Test with various date ranges

### Bulk Operations
- [ ] Publish multiple events
- [ ] Change category for multiple events
- [ ] Verify authorization (admin only)

### Bulk Email
- [ ] Send to all attendees
- [ ] Send to specific ticket type
- [ ] Send to checked-in only

### Check-in Dashboard
- [ ] View check-in statistics
- [ ] Verify real-time data
- [ ] Test during active check-in

---

## Migration Commands

Run these migrations to enable all features:

```bash
# Run all migrations
php artisan migrate

# Rollback if needed
php artisan migrate:rollback

# Check migration status
php artisan migrate:status
```

---

## Support

For questions or issues, contact the backend development team.

**Last Updated**: January 3, 2026  
**API Version**: 1.0  
**Documentation Version**: 1.0
