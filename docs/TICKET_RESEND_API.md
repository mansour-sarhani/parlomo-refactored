# Ticket Resend Email API Documentation

> API documentation for resending ticket emails to customers with optional different email address.

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

## Authorization

- **Order Owner** can resend tickets for their own orders
- **Event Organizer** can resend tickets for orders on their events
- **Super Admin** can resend tickets for any order

---

## Endpoint

**POST** `/ticketing/orders/{order}/resend-tickets`

Resend ticket email to customer with optional different email address.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `order` | UUID | Yes | Order ID |

### Request Body

All fields are optional:

```json
{
  "email": "newemail@example.com",
  "reason": "Customer didn't receive original email"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | No | Email address to send tickets to (defaults to order's customer_email) |
| `reason` | string | No | Reason for resending (max 500 chars, for audit log) |

### Success Response (200)

```json
{
  "success": true,
  "message": "Tickets have been sent to newemail@example.com",
  "data": {
    "order_number": "ORD-2026-000123",
    "sent_to": "newemail@example.com",
    "sent_at": "2026-01-03T11:15:00Z",
    "ticket_count": 2
  }
}
```

### Error Responses

**Unauthorized (403)**
```json
{
  "success": false,
  "message": "You do not have permission to resend tickets for this order"
}
```

**Invalid Order Status (400)**
```json
{
  "success": false,
  "message": "Tickets can only be resent for paid orders"
}
```

**Rate Limit Exceeded (429)**
```json
{
  "success": false,
  "message": "Too many resend attempts. Maximum 5 resends per day allowed for this order"
}
```

**Validation Error (422)**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email must be a valid email address."]
  }
}
```

**Server Error (500)**
```json
{
  "success": false,
  "message": "Failed to send tickets. Please try again later.",
  "error": "Error details"
}
```

---

## Usage Examples

### Example 1: Resend to Original Email

```bash
curl -X POST "https://api.parlomo.co.uk/api/ticketing/orders/{order_id}/resend-tickets" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Result**: Email sent to order's customer_email

---

### Example 2: Resend to Different Email

```bash
curl -X POST "https://api.parlomo.co.uk/api/ticketing/orders/{order_id}/resend-tickets" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "reason": "Customer requested different email"
  }'
```

**Result**: Email sent to new address, order's customer_email remains unchanged

---

### Example 3: With Reason Only

```bash
curl -X POST "https://api.parlomo.co.uk/api/ticketing/orders/{order_id}/resend-tickets" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Customer lost original email"
  }'
```

**Result**: Email sent to order's customer_email with reason logged

---

## Important Notes

1. **Rate Limiting**: Maximum 5 resends per order per day to prevent abuse

2. **Order Status**: Only paid orders can have tickets resent

3. **Email Unchanged**: When sending to a different email, the order's `customer_email` field is NOT updated

4. **Audit Trail**: All resend actions are logged in order metadata with:
   - Timestamp
   - Recipient email
   - Sender information
   - Reason (if provided)
   - Original email address

5. **Email Content**: 
   - Same email template as original purchase confirmation
   - Includes PDF attachment with all tickets
   - Subject: "Your Tickets for {Event} - Order #{OrderNumber}"

6. **Authorization**:
   - Order owner can resend their own tickets
   - Event organizer can resend tickets for orders on their events
   - Super-admin can resend any tickets

---

## Audit Log Structure

Resend history is stored in order metadata:

```json
{
  "metadata": {
    "resend_history": [
      {
        "sent_at": "2026-01-03T11:15:00Z",
        "sent_to": "newemail@example.com",
        "sent_by": "user-uuid",
        "sent_by_name": "Admin User",
        "reason": "Customer didn't receive original email",
        "original_email": "original@example.com"
      }
    ]
  }
}
```

---

## Testing Checklist

- [ ] Resend to original email works
- [ ] Resend to different email works
- [ ] Email validation catches invalid addresses
- [ ] Rate limiting blocks after 5 attempts
- [ ] Only paid orders can be resent
- [ ] Authorization prevents unauthorized access
- [ ] Audit log is created correctly
- [ ] Email is received with PDF attachment
- [ ] PDF contains correct tickets
- [ ] Order's customer_email remains unchanged when sending to different address

---

## Common Use Cases

1. **Customer Didn't Receive Email**: Resend to same email
2. **Wrong Email Address**: Resend to correct email
3. **Lost/Deleted Email**: Resend to same or different email
4. **Multiple Recipients**: Resend to different family member's email
5. **Email Provider Issues**: Resend to alternative email address
