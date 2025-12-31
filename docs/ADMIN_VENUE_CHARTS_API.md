# Seats.io Admin Venue Charts API Documentation

**Base URL:** `https://api.parlomo.co.uk/api`  
**Authentication:** Bearer Token (Sanctum)  
**Authorization:** `super-admin` role required

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/seatsio/venue-charts` | List all venue charts |
| POST | `/admin/seatsio/venue-charts` | Create new venue chart |
| GET | `/admin/seatsio/venue-charts/{id}` | Get chart details |
| PATCH | `/admin/seatsio/venue-charts/{id}` | Update chart |
| DELETE | `/admin/seatsio/venue-charts/{id}` | Delete chart |
| GET | `/admin/seatsio/venue-charts/{id}/designer` | Get designer configuration |
| POST | `/admin/seatsio/venue-charts/{id}/sync` | Sync from Seats.io |
| POST | `/admin/seatsio/venue-charts/{id}/publish` | Publish chart changes |
| POST | `/admin/seatsio/venue-charts/{id}/activate` | Activate chart |
| POST | `/admin/seatsio/venue-charts/{id}/deactivate` | Deactivate chart |

---

## 1. List Venue Charts

**GET** `/admin/seatsio/venue-charts`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search by name, venue_name, or city |
| `active` | boolean | No | Filter by active status (`true` or `false`) |
| `limit` | integer | No | Items per page (default: 20) |
| `page` | integer | No | Page number |

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Main Arena Layout",
      "description": "Standard arena seating",
      "venue_name": "The O2 Arena",
      "venue_address": "Peninsula Square, London",
      "city": "London",
      "country": "UK",
      "chart_key": "seats-io-chart-key",
      "total_capacity": 20000,
      "categories": [
        {"key": "vip", "label": "VIP", "color": "#FFD700"},
        {"key": "standard", "label": "Standard", "color": "#4CAF50"}
      ],
      "category_capacities": {"vip": 500, "standard": 19500},
      "is_admin_chart": true,
      "is_active": true,
      "created_by": "user-uuid",
      "created_at": "2025-12-29T10:00:00Z",
      "updated_at": "2025-12-29T10:00:00Z",
      "createdBy": {
        "id": "user-uuid",
        "name": "Admin User"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 50,
    "last_page": 3
  }
}
```

---

## 2. Create Venue Chart

**POST** `/admin/seatsio/venue-charts`

### Request Body

```json
{
  "name": "Main Arena Layout",
  "description": "Standard arena seating configuration",
  "venue_name": "The O2 Arena",
  "venue_address": "Peninsula Square, London SE10 0DX",
  "city": "London",
  "country": "UK",
  "categories": [
    {
      "key": "vip",
      "label": "VIP Section",
      "color": "#FFD700"
    },
    {
      "key": "standard",
      "label": "Standard Seating",
      "color": "#4CAF50"
    }
  ]
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `name` | Required, string, max 200 chars |
| `description` | Optional, string |
| `venue_name` | Required, string, max 200 chars |
| `venue_address` | Optional, string |
| `city` | Optional, string, max 100 chars |
| `country` | Optional, string, max 100 chars |
| `categories` | Optional, array |
| `categories.*.key` | Required with categories, string, max 50 chars |
| `categories.*.label` | Required with categories, string, max 100 chars |
| `categories.*.color` | Optional, string, max 10 chars (hex color) |

### Response (201 Created)

```json
{
  "success": true,
  "message": "Venue chart created successfully",
  "data": {
    "id": "uuid",
    "name": "Main Arena Layout",
    "chart_key": "seats-io-chart-key",
    "venue_name": "The O2 Arena",
    "is_active": true,
    "total_capacity": 0,
    "categories": [...]
  }
}
```

---

## 3. Get Chart Details

**GET** `/admin/seatsio/venue-charts/{id}`

### Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Main Arena Layout",
    "description": "Standard arena seating",
    "venue_name": "The O2 Arena",
    "venue_address": "Peninsula Square, London",
    "city": "London",
    "country": "UK",
    "chart_key": "seats-io-chart-key",
    "total_capacity": 20000,
    "categories": [
      {"key": "vip", "label": "VIP", "color": "#FFD700"},
      {"key": "standard", "label": "Standard", "color": "#4CAF50"}
    ],
    "category_capacities": {"vip": 500, "standard": 19500},
    "is_admin_chart": true,
    "is_active": true,
    "created_by": "user-uuid",
    "created_at": "2025-12-29T10:00:00Z",
    "updated_at": "2025-12-29T10:00:00Z",
    "createdBy": {
      "id": "user-uuid",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

---

## 4. Update Chart

**PATCH** `/admin/seatsio/venue-charts/{id}`

### Request Body

```json
{
  "name": "Updated Arena Layout",
  "description": "Updated description",
  "venue_name": "The O2 Arena",
  "venue_address": "New Address",
  "city": "London",
  "country": "United Kingdom"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `name` | Optional, string, max 200 chars |
| `description` | Optional, string |
| `venue_name` | Optional, string, max 200 chars |
| `venue_address` | Optional, string |
| `city` | Optional, string, max 100 chars |
| `country` | Optional, string, max 100 chars |

### Response

```json
{
  "success": true,
  "message": "Venue chart updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Arena Layout",
    ...
  }
}
```

---

## 5. Delete Chart

**DELETE** `/admin/seatsio/venue-charts/{id}`

> **Note:** Chart cannot be deleted if it's being used by any public events.

### Response

```json
{
  "success": true,
  "message": "Chart deleted successfully"
}
```

### Error Response (Chart in use)

```json
{
  "success": false,
  "message": "Cannot delete chart: it is being used by 3 events"
}
```

---

## 6. Get Designer Configuration

**GET** `/admin/seatsio/venue-charts/{id}/designer`

Returns the configuration needed to embed the Seats.io Chart Designer.

### Response

```json
{
  "success": true,
  "data": {
    "chartKey": "seats-io-chart-key",
    "designerKey": "your-designer-key",
    "secretKey": "optional-secret-key",
    "mode": "safe",
    "features": {
      "enabled": ["backgroundImage", "generalAdmission"],
      "disabled": []
    }
  }
}
```

### Frontend Usage

```javascript
new seatsio.SeatingChartDesigner({
  divId: "chart-designer",
  ...designerConfig  // spread the response data
}).render();
```

---

## 7. Sync Chart from Seats.io

**POST** `/admin/seatsio/venue-charts/{id}/sync`

Synchronizes the chart data from Seats.io to update categories and capacity.

### Response

```json
{
  "success": true,
  "message": "Chart synced successfully",
  "data": {
    "id": "uuid",
    "name": "Main Arena Layout",
    "total_capacity": 20500,
    "categories": [...],
    "category_capacities": {...},
    "synced_at": "2025-12-29T10:30:00Z"
  }
}
```

---

## 8. Publish Chart

**POST** `/admin/seatsio/venue-charts/{id}/publish`

Publishes draft changes in the Seats.io chart.

### Response

```json
{
  "success": true,
  "message": "Chart published successfully",
  "data": {
    "id": "uuid",
    "name": "Main Arena Layout",
    "published_at": "2025-12-29T10:30:00Z"
  }
}
```

---

## 9. Activate Chart

**POST** `/admin/seatsio/venue-charts/{id}/activate`

Makes the chart available for organizers to use when creating events.

### Response

```json
{
  "success": true,
  "message": "Chart activated successfully",
  "data": {
    "id": "uuid",
    "is_active": true
  }
}
```

---

## 10. Deactivate Chart

**POST** `/admin/seatsio/venue-charts/{id}/deactivate`

Hides the chart from organizers (existing events keep using it).

### Response

```json
{
  "success": true,
  "message": "Chart deactivated successfully",
  "data": {
    "id": "uuid",
    "is_active": false
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

### Validation Error (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."],
    "venue_name": ["The venue name field is required."]
  }
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "Venue chart not found"
}
```

### Unauthorized (401)

```json
{
  "message": "Unauthenticated."
}
```

### Forbidden (403)

```json
{
  "success": false,
  "message": "User does not have the right roles."
}
```

### Server Error (400/500)

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

---

## Data Model: Venue Chart

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | string | Chart name |
| `description` | string | Description |
| `venue_name` | string | Venue name |
| `venue_address` | string | Full address |
| `city` | string | City |
| `country` | string | Country |
| `chart_key` | string | Seats.io chart key |
| `total_capacity` | integer | Total seats |
| `categories` | array | Category definitions |
| `category_capacities` | object | Capacity per category |
| `is_admin_chart` | boolean | Created by admin |
| `is_active` | boolean | Available for use |
| `created_by` | UUID | Creator user ID |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |

---

## Category Object

```json
{
  "key": "vip",
  "label": "VIP Section",
  "color": "#FFD700"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | Unique identifier for the category |
| `label` | string | Display name |
| `color` | string | Hex color code for the chart |
