# Ticketing API Routes - Documentation

## Base URL
`/api/ticketing`

---

## Endpoints

### 1. Get Event Ticketing Information
**GET** `/api/ticketing/events/[eventId]`

Returns event details with available ticket types, pricing, and availability.

**Response:**
```json
{
  "success": true,
  "eventId": 1,
  "ticketTypes": [...],
  "stats": {
    "totalCapacity": 650,
    "totalSold": 0,
    "totalAvailable": 650,
    "soldOut": false
  }
}
```

---

### 2. Create Ticket Type
**POST** `/api/ticketing/events/[eventId]/ticket-types`

Create a new ticket type for an event (organizer only).

**Request Body:**
```json
{
  "name": "VIP Pass",
  "description": "Premium access",
  "price": 29900,
  "capacity": 50,
  "minPerOrder": 1,
  "maxPerOrder": 3,
  "refundable": false,
  "transferAllowed": true
}
```

---

### 3. Update Ticket Type
**PATCH** `/api/ticketing/events/[eventId]/ticket-types`

Update existing ticket type.

**Request Body:**
```json
{
  "ticketTypeId": 3,
  "price": 24900,
  "capacity": 60
}
```

---

### 4. Start Checkout
**POST** `/api/ticketing/checkout/start`

Validates cart, reserves inventory, applies promo codes, calculates totals.

**Request Body:**
```json
{
  "eventId": 1,
  "cartItems": [
    {
      "ticketTypeId": 2,
      "quantity": 2
    }
  ],
  "promoCode": "EARLY2024"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "sessionId": "uuid",
    "cartItems": [...],
    "subtotal": 29800,
    "discount": 5960,
    "fees": 1392,
    "total": 25232,
    "expiresAt": "2024-..."
  }
}
```

---

### 5. Complete Checkout
**POST** `/api/ticketing/checkout/complete`

Finalizes order after payment, generates tickets.

**Request Body:**
```json
{
  "sessionId": "uuid",
  "eventId": 1,
  "userId": 1,
  "cartItems": [...],
  "buyerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "subtotal": 29800,
  "discount": 5960,
  "fees": 1392,
  "total": 25232,
  "paymentIntentId": "pi_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": 3,
    "orderNumber": "ORD-2024-000003",
    "status": "paid",
    "total": 25232
  },
  "ticketCount": 2
}
```

---

### 6. Get Order Details
**GET** `/api/ticketing/orders/[orderId]`

Returns complete order information.

**Response:**
```json
{
  "success": true,
  "order": {
    "id": 1,
    "orderNumber": "ORD-2024-000001",
    "status": "paid",
    "total": 31490,
    "items": [...],
    "totalItems": 2
  }
}
```

---

### 7. Get Order Tickets
**GET** `/api/ticketing/orders/[orderId]/tickets`

Returns all tickets for an order with QR codes.

**Response:**
```json
{
  "success": true,
  "orderId": 1,
  "orderNumber": "ORD-2024-000001",
  "tickets": [
    {
      "id": 1,
      "code": "TKT-ABC123XYZ",
      "qrPayload": "{...}",
      "status": "valid",
      "attendeeName": "John Doe",
      "ticketType": {
        "name": "General Admission"
      }
    }
  ],
  "count": 2
}
```

---

### 8. Validate Promo Code
**POST** `/api/ticketing/promo/validate`

Validates a promo code and returns discount information.

**Request Body:**
```json
{
  "code": "EARLY2024",
  "cartTotal": 10000,
  "ticketTypeIds": [1, 2]
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "promo": {
    "id": 1,
    "code": "EARLY2024",
    "type": "percent",
    "amount": 20,
    "discount": 2000
  },
  "message": "Promo code applied successfully"
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "error": "This promo code has expired"
}
```

---

### 9. Scan Ticket
**POST** `/api/ticketing/scanner/scan`

Validates ticket QR code and marks as used.

**Request Body:**
```json
{
  "ticketCode": "TKT-ABC123XYZ",
  "scannedBy": 5
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "message": "Ticket validated successfully",
  "ticket": {
    "code": "TKT-ABC123XYZ",
    "status": "used",
    "attendeeName": "John Doe",
    "usedAt": "2024-...",
    "ticketType": {
      "name": "General Admission"
    }
  }
}
```

**Response (Already Used):**
```json
{
  "valid": false,
  "error": "Ticket already used",
  "ticket": {
    "code": "TKT-ABC123XYZ",
    "status": "used",
    "usedAt": "2024-..."
  }
}
```

---

### 10. Check Ticket Status
**GET** `/api/ticketing/scanner/scan?code=TKT-ABC123XYZ`

Check ticket status without marking as used.

**Response:**
```json
{
  "found": true,
  "ticket": {
    "code": "TKT-ABC123XYZ",
    "status": "valid",
    "attendeeName": "John Doe",
    "ticketType": "General Admission"
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Additional details (in dev mode)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing

### Using PowerShell (Windows):

```powershell
# Get event ticketing
Invoke-WebRequest -Uri "http://localhost:3000/api/ticketing/events/1" -Method GET

# Validate promo code
Invoke-WebRequest -Uri "http://localhost:3000/api/ticketing/promo/validate" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"code":"SAVE10","cartTotal":5000,"ticketTypeIds":[1,2]}'

# Check ticket status
Invoke-WebRequest -Uri "http://localhost:3000/api/ticketing/scanner/scan?code=TKT-ABC123XYZ" -Method GET
```

### Using curl (Linux/Mac):

```bash
# Get event ticketing
curl http://localhost:3000/api/ticketing/events/1

# Validate promo code
curl -X POST http://localhost:3000/api/ticketing/promo/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"SAVE10","cartTotal":5000,"ticketTypeIds":[1,2]}'
```

---

**Created:** 2025-11-25  
**Version:** 1.0  
**Status:** Complete - Phase 1 MVP
