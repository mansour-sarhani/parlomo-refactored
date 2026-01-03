# Admin Bookings and Organizer Sales API Documentation

> API documentation for viewing all bookings (admin) and sales reports (organizer) including complimentary tickets.

---

## Base URL

```
https://api.parlomo.co.uk/api
```

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer {access_token}
```

---

## Endpoints Overview

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| GET | `/ticketing/admin/bookings` | List all bookings across all events | Super-admin only |
| GET | `/ticketing/organizer/sales` | List organizer's sales including complimentary | Organizer or super-admin |

---

## 1. Admin Bookings

**GET** `/ticketing/admin/bookings`

Get all bookings/orders across all events in the system with comprehensive filtering.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | UUID | No | Filter by specific event |
| `status` | string | No | Filter by order status (`paid`, `pending`, `cancelled`, `refunded`) |
| `complimentary` | boolean | No | Filter complimentary orders (true/false) |
| `organizerId` | UUID | No | Filter by organizer ID |
| `search` | string | No | Search by order number, customer name, or email |
| `dateFrom` | date | No | Filter orders created from this date (YYYY-MM-DD) |
| `dateTo` | date | No | Filter orders created to this date (YYYY-MM-DD) |
| `sortBy` | string | No | Sort field (`created_at`, `paid_at`, `total`, `order_number`) - default: `created_at` |
| `sortOrder` | string | No | Sort order (`asc`, `desc`) - default: `desc` |
| `limit` | integer | No | Results per page (default: 15) |
| `page` | integer | No | Page number (default: 1) |

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "order_number": "ORD-2026-000123",
      "status": "paid",
      "subtotal": 5000,
      "discount": 500,
      "fees": 300,
      "tax": 400,
      "total": 5200,
      "currency": "GBP",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "+1234567890",
      "is_complimentary": false,
      "complimentary_reason": null,
      "paid_at": "2026-01-03T10:00:00Z",
      "created_at": "2026-01-03T09:00:00Z",
      "event": {
        "id": "event-uuid",
        "title": "Summer Music Festival",
        "start_date": "2026-06-15T18:00:00Z",
        "organizer": {
          "id": "user-uuid",
          "name": "Event Organizer",
          "email": "organizer@example.com"
        }
      },
      "ticket_count": 2,
      "items": [
        {
          "ticket_type_name": "VIP",
          "quantity": 2,
          "unit_price": 2500,
          "total": 5000
        }
      ]
    },
    {
      "id": "uuid-2",
      "order_number": "ORD-2026-000124",
      "status": "paid",
      "subtotal": 0,
      "discount": 0,
      "fees": 0,
      "tax": 0,
      "total": 0,
      "currency": "GBP",
      "customer_name": "VIP Guest",
      "customer_email": "vip@example.com",
      "customer_phone": null,
      "is_complimentary": true,
      "complimentary_reason": "Sponsor",
      "paid_at": "2026-01-03T11:00:00Z",
      "created_at": "2026-01-03T11:00:00Z",
      "event": {
        "id": "event-uuid",
        "title": "Summer Music Festival",
        "start_date": "2026-06-15T18:00:00Z",
        "organizer": {
          "id": "user-uuid",
          "name": "Event Organizer",
          "email": "organizer@example.com"
        }
      },
      "ticket_count": 3,
      "items": [
        {
          "ticket_type_name": "VIP",
          "quantity": 3,
          "unit_price": 0,
          "total": 0
        }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 150,
    "last_page": 10
  }
}
```

### Error Responses

**Unauthorized (403)**
```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

---

## 2. Organizer Sales

**GET** `/ticketing/organizer/sales`

Get all sales for the authenticated organizer's events, including both paid and complimentary tickets.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | UUID | No | Filter by specific event (must be owned by organizer) |
| `status` | string | No | Filter by order status (`paid`, `refunded`) - default: `paid` |
| `includeComplimentary` | boolean | No | Include complimentary tickets (default: `true`) |
| `search` | string | No | Search by order number or customer name |
| `dateFrom` | date | No | Filter orders created from this date (YYYY-MM-DD) |
| `dateTo` | date | No | Filter orders created to this date (YYYY-MM-DD) |
| `sortBy` | string | No | Sort field (`created_at`, `paid_at`, `total`, `order_number`) - default: `created_at` |
| `sortOrder` | string | No | Sort order (`asc`, `desc`) - default: `desc` |
| `limit` | integer | No | Results per page (default: 15) |
| `page` | integer | No | Page number (default: 1) |

### Success Response (200)

```json
{
  "success": true,
  "summary": {
    "total_orders": 45,
    "total_revenue": 125000,
    "total_tickets_sold": 150,
    "paid_orders": 40,
    "complimentary_orders": 5,
    "complimentary_tickets": 15
  },
  "data": [
    {
      "id": "uuid",
      "order_number": "ORD-2026-000123",
      "status": "paid",
      "total": 5200,
      "currency": "GBP",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "is_complimentary": false,
      "complimentary_reason": null,
      "ticket_count": 2,
      "paid_at": "2026-01-03T10:00:00Z",
      "created_at": "2026-01-03T09:00:00Z",
      "event": {
        "id": "event-uuid",
        "title": "Summer Music Festival",
        "start_date": "2026-06-15T18:00:00Z"
      }
    },
    {
      "id": "uuid-2",
      "order_number": "ORD-2026-000124",
      "status": "paid",
      "total": 0,
      "currency": "GBP",
      "customer_name": "VIP Guest",
      "customer_email": "vip@example.com",
      "is_complimentary": true,
      "complimentary_reason": "Sponsor",
      "ticket_count": 3,
      "paid_at": "2026-01-03T11:00:00Z",
      "created_at": "2026-01-03T11:00:00Z",
      "event": {
        "id": "event-uuid",
        "title": "Summer Music Festival",
        "start_date": "2026-06-15T18:00:00Z"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 45,
    "last_page": 3
  }
}
```

### Error Responses

**Forbidden (403)**
```json
{
  "success": false,
  "message": "You do not have permission to view sales for this event"
}
```

---

## Usage Examples

### Example 1: Admin - View All Bookings

```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/admin/bookings" \
  -H "Authorization: Bearer {super_admin_token}" \
  -H "Accept: application/json"
```

### Example 2: Admin - Filter by Event and Status

```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/admin/bookings?eventId={event_id}&status=paid" \
  -H "Authorization: Bearer {super_admin_token}" \
  -H "Accept: application/json"
```

### Example 3: Admin - View Only Complimentary Tickets

```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/admin/bookings?complimentary=true" \
  -H "Authorization: Bearer {super_admin_token}" \
  -H "Accept: application/json"
```

### Example 4: Admin - Search and Date Range

```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/admin/bookings?search=john&dateFrom=2026-01-01&dateTo=2026-01-31" \
  -H "Authorization: Bearer {super_admin_token}" \
  -H "Accept: application/json"
```

### Example 5: Organizer - View All Sales

```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/organizer/sales" \
  -H "Authorization: Bearer {organizer_token}" \
  -H "Accept: application/json"
```

### Example 6: Organizer - Sales for Specific Event

```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/organizer/sales?eventId={event_id}" \
  -H "Authorization: Bearer {organizer_token}" \
  -H "Accept: application/json"
```

### Example 7: Organizer - Exclude Complimentary Tickets

```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/organizer/sales?includeComplimentary=false" \
  -H "Authorization: Bearer {organizer_token}" \
  -H "Accept: application/json"
```

### Example 8: Organizer - Sort by Revenue

```bash
curl -X GET "https://api.parlomo.co.uk/api/ticketing/organizer/sales?sortBy=total&sortOrder=desc" \
  -H "Authorization: Bearer {organizer_token}" \
  -H "Accept: application/json"
```

---

## Important Notes

1. **Authorization**:
   - Admin bookings endpoint: Super-admin role required
   - Organizer sales endpoint: Organizer can only view their own events, super-admin can view any event

2. **Complimentary Tickets**:
   - Identified by `is_complimentary: true` and `total: 0`
   - Include `complimentary_reason` field explaining why tickets were issued
   - Count against ticket inventory but not revenue

3. **Summary Statistics** (Organizer Sales):
   - `total_revenue`: Sum of all paid orders (excludes complimentary)
   - `total_tickets_sold`: Includes both paid and complimentary tickets
   - Useful for dashboard displays and reporting

4. **Pagination**:
   - Default: 15 results per page
   - Use `page` parameter to navigate through results
   - `meta` object contains pagination information

5. **Performance**:
   - Both endpoints use eager loading to minimize database queries
   - Large datasets are paginated for optimal performance

---

## Testing

### Prerequisites
- Super-admin account for admin bookings endpoint
- Organizer account with events for organizer sales endpoint
- Events with various order types (paid, complimentary, refunded)

### Test Scenarios

**Admin Bookings**:
1. List all bookings without filters
2. Filter by event, status, organizer
3. Search by order number, customer name, email
4. Filter complimentary vs paid orders
5. Date range filtering
6. Verify authorization (non-admin should get 403)

**Organizer Sales**:
1. View all sales across organizer's events
2. Filter by specific event
3. Include/exclude complimentary tickets
4. Verify summary statistics accuracy
5. Test sorting and pagination
6. Verify authorization (can't view other organizer's events)
