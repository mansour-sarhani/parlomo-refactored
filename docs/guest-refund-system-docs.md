# Guest Refund System - Documentation

## Overview

Allows customers (guests) who purchased tickets to request refunds **without needing an account**. They only need their order number and email address.

---

## New Endpoints

### 1. **POST /api/guest/refunds/request** - Submit Refund Request

**Authentication:** None required (public endpoint)

**Validation:** Order number + email must match

#### Request Body
```json
{
  "order_number": "ORD-2025-123456",
  "email": "customer@example.com",
  "reason": "cannot_attend",
  "description": "I can no longer attend due to scheduling conflict"
}
```

#### Request Fields

| Field | Type | Required | Options | Description |
|-------|------|----------|---------|-------------|
| `order_number` | string | Yes | - | Order number from purchase email |
| `email` | email | Yes | - | Email used during purchase |
| `reason` | string | Yes | event_cancelled, cannot_attend, duplicate_purchase, other | Refund reason |
| `description` | string | No | Max 1000 chars | Additional details |

#### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Refund request submitted successfully. The event organizer will review your request.",
  "data": {
    "refund_id": "uuid",
    "order_number": "ORD-2025-123456",
    "amount": 5000,
    "amount_formatted": "50.00",
    "currency": "GBP",
    "status": "PENDING",
    "requested_at": "2025-12-18T10:30:00.000000Z"
  }
}
```

#### Error Responses

**404 Not Found** - Order doesn't exist or email doesn't match
```json
{
  "success": false,
  "message": "Order not found. Please check your order number and email address."
}
```

**409 Conflict** - Refund already requested
```json
{
  "success": false,
  "message": "A refund request already exists for this order.",
  "refund_status": "PENDING",
  "refund_id": "uuid"
}
```

**400 Bad Request** - Order already refunded
```json
{
  "success": false,
  "message": "This order has already been refunded."
}
```

**403 Forbidden** - Deadline passed
```json
{
  "success": false,
  "message": "Refund requests can only be made up to 1 day after the event ends. Deadline was: 2025-12-17 20:00:00"
}
```

---

### 2. **POST /api/guest/refunds/status** - Check Refund Status

**Authentication:** None required (public endpoint)

**Validation:** Order number + email must match

#### Request Body
```json
{
  "order_number": "ORD-2025-123456",
  "email": "customer@example.com"
}
```

#### Success Response - Has Refund Request
```json
{
  "success": true,
  "data": {
    "has_refund_request": true,
    "refund_id": "uuid",
    "status": "PENDING",
    "reason": "Cannot Attend",
    "total_refund_amount": 5000,
    "amount_formatted": "50.00",
    "currency": "GBP",
    "requested_at": "2025-12-18T10:30:00.000000Z",
    "processed_at": null,
    "rejection_reason": null,
    "admin_notes": null
  }
}
```

#### Success Response - No Refund Request
```json
{
  "success": true,
  "data": {
    "has_refund_request": false,
    "order_number": "ORD-2025-123456",
    "order_status": "paid"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Order not found. Please check your order number and email address."
}
```

---

## Database Changes

### Migration File
`database/migrations/2025_12_18_100000_add_guest_refund_fields_to_refund_requests_table.php`

### New Fields in `refund_requests` Table

| Field | Type | Description |
|-------|------|-------------|
| `is_guest_request` | boolean | TRUE if guest initiated, FALSE if organizer |
| `customer_email` | string | Email of customer who requested refund |
| `customer_name` | string | Name of customer |

---

## How It Works

### Step 1: Customer Finds Order Details
- Customer receives order confirmation email after purchase
- Email contains: Order Number (ORD-2025-123456) and their email address

### Step 2: Customer Submits Refund Request
```bash
POST /api/guest/refunds/request
{
  "order_number": "ORD-2025-123456",
  "email": "customer@example.com",
  "reason": "cannot_attend",
  "description": "Got sick and cannot travel"
}
```

### Step 3: System Validates Request
1. ✅ Find order by order_number + email
2. ✅ Check order status is "paid" (not already refunded)
3. ✅ Check no existing refund request
4. ✅ Check event refund deadline (1 day after event ends)
5. ✅ Calculate refund amount

### Step 4: Create Refund Request
- Status: PENDING
- Type: SINGLE_ORDER
- is_guest_request: true
- Assigns to event organizer for review

### Step 5: Audit Trail
```json
{
  "action": "created",
  "user_id": null,
  "metadata": {
    "request_type": "guest",
    "order_number": "ORD-2025-123456",
    "email": "customer@example.com",
    "reason": "cannot_attend"
  },
  "ip_address": "127.0.0.1",
  "user_agent": "Mozilla/5.0..."
}
```

### Step 6: Organizer Reviews
- Organizer sees refund request in dashboard
- Can approve or reject (same as organizer-initiated refunds)
- Admin processes approved refunds

### Step 7: Customer Checks Status
```bash
POST /api/guest/refunds/status
{
  "order_number": "ORD-2025-123456",
  "email": "customer@example.com"
}
```

Returns current status: PENDING, APPROVED, REJECTED, or PROCESSED

---

## Security Features

### 1. Email + Order Number Validation
- **Cannot request refund without knowing both**
- Protects against unauthorized refund requests
- No brute-force risk (order numbers are long + random)

### 2. Single Refund Per Order
- Checks for existing refund requests
- Returns 409 Conflict if duplicate

### 3. Order Status Validation
- Only "paid" orders can be refunded
- Prevents refunding already-refunded orders

### 4. Deadline Enforcement
- Same 1-day deadline as organizer requests
- Prevents abuse of late refunds

### 5. Audit Logging
- All guest requests logged with IP + user agent
- Tracks who requested what and when
- No user_id (guest request)

### 6. Rate Limiting
- Standard API rate limiting applies
- Prevents spam/abuse

---

## Refund Reasons

| Reason | Description | Common Use Case |
|--------|-------------|-----------------|
| `event_cancelled` | Event was cancelled | Organizer cancelled event |
| `cannot_attend` | Customer can't attend | Sick, travel issues, scheduling conflict |
| `duplicate_purchase` | Bought ticket twice | Accidental double purchase |
| `other` | Other reason | Miscellaneous |

---

## Testing Examples

### Test 1: Successful Refund Request
```bash
curl -X POST https://your-api.com/api/guest/refunds/request \
  -H "Content-Type: application/json" \
  -d '{
    "order_number": "ORD-2025-123456",
    "email": "customer@example.com",
    "reason": "cannot_attend",
    "description": "Family emergency"
  }'
```

**Expected:** 201 Created with refund_id

### Test 2: Check Refund Status
```bash
curl -X POST https://your-api.com/api/guest/refunds/status \
  -H "Content-Type: application/json" \
  -d '{
    "order_number": "ORD-2025-123456",
    "email": "customer@example.com"
  }'
```

**Expected:** 200 OK with refund status

### Test 3: Duplicate Request
```bash
# Submit refund request twice with same order
```

**Expected:** First: 201 Created, Second: 409 Conflict

### Test 4: Wrong Email
```bash
curl -X POST https://your-api.com/api/guest/refunds/request \
  -H "Content-Type: application/json" \
  -d '{
    "order_number": "ORD-2025-123456",
    "email": "wrong@example.com",
    "reason": "cannot_attend"
  }'
```

**Expected:** 404 Not Found

### Test 5: After Deadline
```bash
# Request refund more than 1 day after event ended
```

**Expected:** 403 Forbidden

---

## Frontend Integration

### React Example - Refund Request Form

```typescript
import { useState } from 'react';

export function GuestRefundForm() {
  const [formData, setFormData] = useState({
    order_number: '',
    email: '',
    reason: 'cannot_attend',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/guest/refunds/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          type: 'success',
          message: data.message,
          refundId: data.data.refund_id
        });
      } else {
        setResult({
          type: 'error',
          message: data.message
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Failed to submit refund request'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Order Number (e.g., ORD-2025-123456)"
        value={formData.order_number}
        onChange={(e) => setFormData({...formData, order_number: e.target.value})}
        required
      />

      <input
        type="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />

      <select
        value={formData.reason}
        onChange={(e) => setFormData({...formData, reason: e.target.value})}
        required
      >
        <option value="cannot_attend">Cannot Attend</option>
        <option value="event_cancelled">Event Cancelled</option>
        <option value="duplicate_purchase">Duplicate Purchase</option>
        <option value="other">Other</option>
      </select>

      <textarea
        placeholder="Additional details (optional)"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        maxLength={1000}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Request Refund'}
      </button>

      {result && (
        <div className={result.type === 'success' ? 'success' : 'error'}>
          {result.message}
          {result.refundId && (
            <p>Refund ID: {result.refundId}</p>
          )}
        </div>
      )}
    </form>
  );
}
```

### React Example - Check Status

```typescript
export function GuestRefundStatus() {
  const [formData, setFormData] = useState({
    order_number: '',
    email: ''
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/guest/refunds/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to check status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={checkStatus}>
        <input
          type="text"
          placeholder="Order Number"
          value={formData.order_number}
          onChange={(e) => setFormData({...formData, order_number: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <button type="submit" disabled={loading}>Check Status</button>
      </form>

      {status && (
        <div>
          {status.has_refund_request ? (
            <div>
              <h3>Refund Request Status</h3>
              <p>Status: <strong>{status.status}</strong></p>
              <p>Amount: {status.amount_formatted} {status.currency}</p>
              <p>Reason: {status.reason}</p>
              <p>Requested: {new Date(status.requested_at).toLocaleString()}</p>
              {status.processed_at && (
                <p>Processed: {new Date(status.processed_at).toLocaleString()}</p>
              )}
              {status.rejection_reason && (
                <p>Rejection Reason: {status.rejection_reason}</p>
              )}
            </div>
          ) : (
            <p>No refund request found for this order.</p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Admin/Organizer View

### Organizer Dashboard
Refund requests from guests appear in the organizer's refund list with:
- **Type:** SINGLE_ORDER
- **is_guest_request:** true
- **customer_email:** Displayed
- **customer_name:** Displayed

### Approval Process
1. Organizer reviews guest refund request
2. Can approve or reject (same workflow as organizer refunds)
3. Admin processes approved refunds via Stripe

---

## Monitoring & Analytics

### Track Guest Refund Requests
```sql
-- Count guest refund requests
SELECT COUNT(*)
FROM refund_requests
WHERE is_guest_request = true
AND created_at > NOW() - INTERVAL 30 DAY;

-- Guest refund success rate
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM refund_requests
WHERE is_guest_request = true
GROUP BY status;

-- Most common guest refund reasons
SELECT
  reason,
  COUNT(*) as count
FROM refund_requests
WHERE is_guest_request = true
GROUP BY reason
ORDER BY count DESC;
```

---

## Best Practices

### For Customers
1. Keep order confirmation email
2. Submit refund request before deadline
3. Provide clear description
4. Check status using same email + order number

### For Organizers
1. Review guest refunds promptly
2. Communicate with customer if rejecting
3. Process approved refunds quickly

### For Admins
1. Monitor guest refund patterns
2. Flag suspicious activity (same IP, multiple requests)
3. Track refund reasons for insights

---

## Troubleshooting

### Issue: Customer can't find order number
**Solution:** Check spam folder for order confirmation email, or contact support

### Issue: Email doesn't match
**Solution:** Use exact email address from purchase (case-insensitive check)

### Issue: "Order not found"
**Possible Causes:**
- Wrong order number
- Wrong email address
- Order not paid yet
**Solution:** Double-check both fields, wait if recent purchase

### Issue: "Refund already exists"
**Solution:** Check refund status instead of submitting new request

---

## Summary

✅ **No account required** - Just order number + email
✅ **Secure validation** - Must know both to request refund
✅ **Deadline enforcement** - Same 1-day rule as organizer refunds
✅ **Duplicate prevention** - One refund per order
✅ **Complete audit trail** - All requests logged
✅ **Status checking** - Customers can track their request
✅ **Integrates seamlessly** - Uses existing refund workflow

---

**Status:** ✅ Implemented
**Endpoints:** 2 public routes
**Migration:** Required before use
**Security:** Email + order number validation

