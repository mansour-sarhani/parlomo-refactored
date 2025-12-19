# Organizer Refund with Fine/Deduction - Documentation

## Overview

Organizers can now apply a **fine/cancellation fee** when submitting refund requests. This allows organizers to deduct a percentage from the refund amount as per their event terms and conditions.

---

## Endpoint

### **POST /api/financials/refunds**

**Authentication:** Required (Bearer token)
**Role:** Organizer (must own the event)

---

## Request Body

### Without Fine (Full Refund)
```json
{
  "event_id": "9f5992e8-8fb1-4161-ae2c-0a998fa28c6e",
  "type": "SINGLE_ORDER",
  "order_ids": ["order-uuid-1"],
  "reason": "Customer requested refund",
  "description": "Customer cannot attend the event"
}
```

### With Fine (Partial Refund)
```json
{
  "event_id": "9f5992e8-8fb1-4161-ae2c-0a998fa28c6e",
  "type": "SINGLE_ORDER",
  "order_ids": ["order-uuid-1"],
  "reason": "Customer requested refund",
  "description": "Late cancellation - within 48 hours of event",
  "fine_percentage": 25,
  "fine_reason": "25% cancellation fee as per event terms and conditions"
}
```

---

## Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event_id` | uuid | Yes | Event ID |
| `type` | string | Yes | `EVENT_CANCELLATION`, `BULK_REFUND`, or `SINGLE_ORDER` |
| `order_ids` | array | For BULK/SINGLE | Array of order UUIDs to refund |
| `reason` | string | Yes | Main reason for refund |
| `description` | string | No | Additional details |
| `fine_percentage` | number | No | Fine percentage (0-100) |
| `fine_reason` | string | Required if fine_percentage provided | Reason for the fine |

---

## Refund Types

### 1. EVENT_CANCELLATION
Refunds **all paid orders** for the event.
```json
{
  "event_id": "uuid",
  "type": "EVENT_CANCELLATION",
  "reason": "Event cancelled due to weather",
  "fine_percentage": 0
}
```

### 2. BULK_REFUND
Refunds **multiple specific orders**.
```json
{
  "event_id": "uuid",
  "type": "BULK_REFUND",
  "order_ids": ["order-1", "order-2", "order-3"],
  "reason": "Venue section closed",
  "fine_percentage": 10,
  "fine_reason": "10% admin fee for partial venue closure"
}
```

### 3. SINGLE_ORDER
Refunds **one specific order**.
```json
{
  "event_id": "uuid",
  "type": "SINGLE_ORDER",
  "order_ids": ["order-uuid"],
  "reason": "Customer requested refund",
  "fine_percentage": 20,
  "fine_reason": "20% cancellation fee - late request"
}
```

---

## Fine Calculation

### Formula
```
Fine Amount = Total Refund Amount × (Fine Percentage / 100)
Net Refund Amount = Total Refund Amount - Fine Amount
```

### Example 1: 20% Fine
| Field | Value |
|-------|-------|
| Order Total | £100.00 |
| Fine Percentage | 20% |
| Fine Amount | £20.00 |
| **Net Refund to Customer** | **£80.00** |

### Example 2: 50% Fine
| Field | Value |
|-------|-------|
| Order Total | £150.00 |
| Fine Percentage | 50% |
| Fine Amount | £75.00 |
| **Net Refund to Customer** | **£75.00** |

### Example 3: Multiple Orders with Fine
| Field | Value |
|-------|-------|
| Order 1 Total | £50.00 |
| Order 2 Total | £75.00 |
| Order 3 Total | £100.00 |
| **Combined Total** | **£225.00** |
| Fine Percentage | 15% |
| Fine Amount | £33.75 |
| **Net Refund to Customers** | **£191.25** |

---

## Success Response

### HTTP 201 Created

```json
{
  "success": true,
  "data": {
    "id": "refund-uuid",
    "event_id": "event-uuid",
    "event_title": "Summer Music Festival",
    "type": "SINGLE_ORDER",
    "affected_orders_count": 1,
    "total_refund_amount": 10000,
    "fine_percentage": 20,
    "fine_amount": 2000,
    "fine_reason": "20% cancellation fee as per event terms",
    "net_refund_amount": 8000,
    "currency": "GBP",
    "status": "PENDING",
    "requested_at": "2025-12-18T10:30:00.000000Z"
  },
  "message": "Refund request submitted with 20% fine deduction"
}
```

### Response Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `total_refund_amount` | integer | Original order total (in cents) |
| `fine_percentage` | decimal | Percentage deducted (0-100) |
| `fine_amount` | integer | Calculated fine amount (in cents) |
| `fine_reason` | string | Reason for the fine |
| `net_refund_amount` | integer | Amount customer will receive (in cents) |
| `currency` | string | Currency code (GBP, USD, etc.) |
| `status` | string | PENDING (awaiting admin approval) |

---

## Error Responses

### 400 Bad Request - Missing Fine Reason
```json
{
  "message": "The fine reason field is required when fine percentage is present.",
  "errors": {
    "fine_reason": ["The fine reason field is required when fine percentage is present."]
  }
}
```

### 400 Bad Request - Invalid Fine Percentage
```json
{
  "message": "The fine percentage must be between 0 and 100.",
  "errors": {
    "fine_percentage": ["The fine percentage must be between 0 and 100."]
  }
}
```

### 403 Forbidden - Not Event Owner
```json
{
  "success": false,
  "message": "You do not have permission to request refunds for this event"
}
```

### 403 Forbidden - Deadline Passed
```json
{
  "success": false,
  "message": "Refund requests can only be made up to 1 day after the event ends. Deadline was: 2025-12-17 20:00:00"
}
```

### 400 Bad Request - Orders Not Found
```json
{
  "success": false,
  "message": "Some orders were not found or are not eligible for refund"
}
```

---

## Common Fine Scenarios

### Scenario 1: Late Cancellation
Customer cancels within 24-48 hours of event.
```json
{
  "type": "SINGLE_ORDER",
  "order_ids": ["order-uuid"],
  "reason": "Customer requested late cancellation",
  "fine_percentage": 25,
  "fine_reason": "25% late cancellation fee (within 48 hours of event)"
}
```

### Scenario 2: No-Show
Customer didn't attend but requests refund after event.
```json
{
  "type": "SINGLE_ORDER",
  "order_ids": ["order-uuid"],
  "reason": "Customer no-show requesting refund",
  "fine_percentage": 50,
  "fine_reason": "50% no-show fee as per event policy"
}
```

### Scenario 3: Partial Event Cancellation
Part of event cancelled, partial refund with small fee.
```json
{
  "type": "BULK_REFUND",
  "order_ids": ["order-1", "order-2", "order-3"],
  "reason": "Main act cancelled, opening acts still performed",
  "fine_percentage": 30,
  "fine_reason": "30% retained - partial event still held"
}
```

### Scenario 4: Full Refund (Event Cancelled)
Event completely cancelled, no fine.
```json
{
  "type": "EVENT_CANCELLATION",
  "reason": "Event cancelled due to severe weather",
  "fine_percentage": 0
}
```

### Scenario 5: Administrative Fee
Small processing/admin fee.
```json
{
  "type": "SINGLE_ORDER",
  "order_ids": ["order-uuid"],
  "reason": "Standard refund request",
  "fine_percentage": 5,
  "fine_reason": "5% administrative processing fee"
}
```

---

## Workflow After Submission

### Step 1: Organizer Submits Refund Request
- Fine percentage and reason recorded
- Net refund amount calculated
- Status: **PENDING**

### Step 2: Admin Reviews Request
- Admin sees total amount, fine %, fine reason, and net amount
- Admin can approve or reject

### Step 3: Admin Approves
- Status: **APPROVED**
- Ready for Stripe processing

### Step 4: Admin Processes Refund
- Stripe refund issued for **net_refund_amount** (after fine)
- Status: **PROCESSING** → **PROCESSED**

### Step 5: Customer Receives Refund
- Customer receives net amount (original - fine)
- Fine amount retained by organizer

---

## Testing Examples

### Test 1: Full Refund (No Fine)
```bash
curl -X POST https://your-api.com/api/financials/refunds \
  -H "Authorization: Bearer {organizer_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "event-uuid",
    "type": "SINGLE_ORDER",
    "order_ids": ["order-uuid"],
    "reason": "Customer cannot attend"
  }'
```

**Expected:** `fine_percentage: 0`, `fine_amount: 0`, `net_refund_amount = total_refund_amount`

### Test 2: 20% Fine
```bash
curl -X POST https://your-api.com/api/financials/refunds \
  -H "Authorization: Bearer {organizer_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "event-uuid",
    "type": "SINGLE_ORDER",
    "order_ids": ["order-uuid"],
    "reason": "Late cancellation",
    "fine_percentage": 20,
    "fine_reason": "20% late cancellation fee"
  }'
```

**Expected:** `fine_percentage: 20`, `fine_amount: 20% of total`, `net_refund_amount: 80% of total`

### Test 3: Missing Fine Reason
```bash
curl -X POST https://your-api.com/api/financials/refunds \
  -H "Authorization: Bearer {organizer_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "event-uuid",
    "type": "SINGLE_ORDER",
    "order_ids": ["order-uuid"],
    "reason": "Late cancellation",
    "fine_percentage": 20
  }'
```

**Expected:** 400 Bad Request - "The fine reason field is required when fine percentage is present."

### Test 4: Invalid Fine Percentage
```bash
curl -X POST https://your-api.com/api/financials/refunds \
  -H "Authorization: Bearer {organizer_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "event-uuid",
    "type": "SINGLE_ORDER",
    "order_ids": ["order-uuid"],
    "reason": "Test",
    "fine_percentage": 150,
    "fine_reason": "Test"
  }'
```

**Expected:** 400 Bad Request - "The fine percentage must be between 0 and 100."

---

## Frontend Integration

### React Form Example

```typescript
import { useState } from 'react';

interface RefundFormData {
  event_id: string;
  type: 'SINGLE_ORDER' | 'BULK_REFUND' | 'EVENT_CANCELLATION';
  order_ids: string[];
  reason: string;
  description?: string;
  fine_percentage?: number;
  fine_reason?: string;
}

export function OrganizerRefundForm({ eventId, orderId }: { eventId: string; orderId: string }) {
  const [formData, setFormData] = useState<RefundFormData>({
    event_id: eventId,
    type: 'SINGLE_ORDER',
    order_ids: [orderId],
    reason: '',
    fine_percentage: 0,
    fine_reason: ''
  });

  const [applyFine, setApplyFine] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Build request body
    const body: any = {
      event_id: formData.event_id,
      type: formData.type,
      order_ids: formData.order_ids,
      reason: formData.reason,
      description: formData.description
    };

    // Only include fine fields if applying fine
    if (applyFine && formData.fine_percentage > 0) {
      body.fine_percentage = formData.fine_percentage;
      body.fine_reason = formData.fine_reason;
    }

    try {
      const response = await fetch('/api/financials/refunds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to submit refund request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Request Refund</h2>

      {/* Reason */}
      <div>
        <label>Reason for Refund *</label>
        <input
          type="text"
          value={formData.reason}
          onChange={(e) => setFormData({...formData, reason: e.target.value})}
          placeholder="e.g., Customer requested refund"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label>Additional Details</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Optional additional details..."
        />
      </div>

      {/* Fine Toggle */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={applyFine}
            onChange={(e) => setApplyFine(e.target.checked)}
          />
          Apply cancellation fee / fine
        </label>
      </div>

      {/* Fine Fields (shown only when toggle is on) */}
      {applyFine && (
        <>
          <div>
            <label>Fine Percentage (0-100%) *</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.fine_percentage}
              onChange={(e) => setFormData({...formData, fine_percentage: parseFloat(e.target.value)})}
              required={applyFine}
            />
          </div>

          <div>
            <label>Reason for Fine *</label>
            <input
              type="text"
              value={formData.fine_reason}
              onChange={(e) => setFormData({...formData, fine_reason: e.target.value})}
              placeholder="e.g., 20% late cancellation fee as per event terms"
              required={applyFine}
              maxLength={500}
            />
          </div>

          {/* Preview */}
          {formData.fine_percentage > 0 && (
            <div className="preview">
              <p>Fine: {formData.fine_percentage}%</p>
              <p>Customer will receive: {100 - formData.fine_percentage}% of order total</p>
            </div>
          )}
        </>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Refund Request'}
      </button>

      {/* Result */}
      {result && (
        <div className={result.success ? 'success' : 'error'}>
          <p>{result.message}</p>
          {result.success && (
            <div>
              <p>Total: £{(result.data.total_refund_amount / 100).toFixed(2)}</p>
              {result.data.fine_percentage > 0 && (
                <>
                  <p>Fine ({result.data.fine_percentage}%): £{(result.data.fine_amount / 100).toFixed(2)}</p>
                  <p>Reason: {result.data.fine_reason}</p>
                </>
              )}
              <p><strong>Customer Receives: £{(result.data.net_refund_amount / 100).toFixed(2)}</strong></p>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
```

---

## Database Schema

### refund_requests Table

| Column | Type | Description |
|--------|------|-------------|
| `total_refund_amount` | INT UNSIGNED | Original order total (cents) |
| `fine_percentage` | DECIMAL(5,2) | Fine percentage (0.00 - 100.00) |
| `fine_amount` | INT UNSIGNED | Calculated fine (cents) |
| `fine_reason` | VARCHAR(500) | Reason for fine |
| `net_refund_amount` | INT UNSIGNED | Amount after fine (cents) |

---

## Best Practices

### For Organizers

1. **Be clear in your event terms** - State cancellation policy upfront
2. **Use reasonable fine percentages** - 10-25% for late cancellations is common
3. **Provide clear fine reasons** - Helps admin approve faster
4. **Consider customer goodwill** - Full refunds for genuine emergencies

### Common Fine Percentages

| Scenario | Typical Fine |
|----------|--------------|
| 7+ days before event | 0-5% |
| 3-7 days before event | 10-15% |
| 24-72 hours before event | 20-30% |
| Less than 24 hours | 40-50% |
| After event (no-show) | 50-100% |

### When NOT to Apply Fine

- Event cancelled by organizer
- Venue issues (safety, accessibility)
- Artist/performer cancellation
- Incorrect ticket info sold
- Technical issues during purchase

---

## API Reference Summary

| Aspect | Details |
|--------|---------|
| **Endpoint** | POST `/api/financials/refunds` |
| **Auth** | Required (Organizer) |
| **Fine Range** | 0-100% |
| **Fine Reason** | Required if fine_percentage > 0 |
| **Max Reason Length** | 500 characters |
| **Status After Submit** | PENDING |

---

## Summary

✅ **Fine percentage** - 0-100%, set by organizer
✅ **Fine reason** - Required when applying fine
✅ **Auto-calculation** - Fine amount and net refund calculated automatically
✅ **Clear messaging** - Response shows breakdown of amounts
✅ **Validation** - Prevents invalid percentages and missing reasons
✅ **Audit trail** - All fine details logged and tracked

---

**Status:** ✅ Implemented
**Migration:** Run successfully
**Validation:** Fine reason required with fine percentage
