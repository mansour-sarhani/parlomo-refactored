# Settlement System - Complete API Reference

## Base URL
```
/api/financials
```

All endpoints require authentication via `Bearer` token in the `Authorization` header.

---

## Environment Variables

Add these to your `.env` file:

```env
# Settlement Configuration
SETTLEMENT_DEADLINE_DAYS=1
STRIPE_PAYOUT_METHOD=standard

# Existing Stripe Configuration
STRIPE_SK=sk_test_xxxxxxxxxxxxx
STRIPE_PK=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Configuration Options:**
- `SETTLEMENT_DEADLINE_DAYS`: Days after event ends before settlement can be requested (default: 1)
- `STRIPE_PAYOUT_METHOD`: `standard` (free, 1-3 days) or `instant` (2% fee, instant)

---

## Endpoints

### 1. **Create Settlement Request** (Organizer)

**Endpoint:** `POST /api/financials/settlements`

**Auth:** Organizer (must own the event)

**Description:** Request settlement payment for an event. Can only be requested X days after event ends (configurable).

**Request Body:**
```json
{
  "event_id": "uuid",
  "payment_method": "bank_transfer|paypal|stripe",
  "payment_details": {
    "account_name": "John Doe",
    "account_number": "12345678",
    "routing_number": "987654321",
    "bank_name": "Example Bank",
    "country": "GB"
  }
}
```

**Validation Rules:**
- `event_id`: required, must exist in `public_events`
- `payment_method`: required, one of: `bank_transfer`, `paypal`, `stripe`
- `payment_details`: required, array (structure depends on payment method)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "event_id": "uuid",
    "event_title": "Concert Name",
    "amount": 85000,
    "total_sales": 100000,
    "processing_fees": 3000,
    "total_refunds": 12000,
    "platform_fees": 0,
    "status": "PENDING",
    "payment_method": "bank_transfer",
    "requested_at": "2025-12-18T10:30:00Z"
  },
  "message": "Settlement request submitted successfully"
}
```

**Error Responses:**

**403 - Too Early:**
```json
{
  "success": false,
  "message": "Settlement can only be requested 1 day(s) after the event ends. Available from: 2025-12-20 20:00:00"
}
```

**400 - Already Exists:**
```json
{
  "success": false,
  "message": "A settlement request is already pending for this event"
}
```

**400 - No Amount:**
```json
{
  "success": false,
  "message": "No settlement amount available after deducting fees and refunds",
  "breakdown": {
    "total_sales": 50000,
    "processing_fees": 2000,
    "total_refunds": 50000,
    "net_amount": -2000
  }
}
```

---

### 2. **List Settlements** (Organizer)

**Endpoint:** `GET /api/financials/settlements/organizer`

**Auth:** Organizer

**Query Parameters:**
- `status` (optional): Filter by status - `PENDING`, `APPROVED`, `REJECTED`, `PAID`

**Request:**
```
GET /api/financials/settlements/organizer?status=PENDING
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "event_title": "Concert Name",
      "amount": 85000,
      "final_amount": 82000,
      "admin_adjustment": -3000,
      "adjustment_reason": "Late penalty",
      "total_sales": 100000,
      "processing_fees": 3000,
      "total_refunds": 12000,
      "platform_fees": 0,
      "currency": "GBP",
      "status": "APPROVED",
      "payment_method": "stripe",
      "requested_at": "2025-12-18T10:30:00Z",
      "approved_at": "2025-12-18T14:00:00Z",
      "paid_at": null,
      "stripe_payouts": [
        {
          "id": "uuid",
          "stripe_payout_id": "po_xxxxxxxxxxxxx",
          "amount": 82000,
          "status": "in_transit",
          "arrival_date": "2025-12-21T00:00:00Z"
        }
      ],
      "public_event": {
        "id": "uuid",
        "title": "Concert Name",
        "start_date": "2025-12-17T19:00:00Z"
      }
    }
  ]
}
```

---

### 3. **List All Settlements** (Admin)

**Endpoint:** `GET /api/financials/settlements/admin`

**Auth:** Super Admin

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)

**Request:**
```
GET /api/financials/settlements/admin?status=PENDING&page=1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "organizer_id": "uuid",
      "event_id": "uuid",
      "event_title": "Concert Name",
      "amount": 85000,
      "final_amount": null,
      "admin_adjustment": 0,
      "total_sales": 100000,
      "processing_fees": 3000,
      "total_refunds": 12000,
      "platform_fees": 0,
      "currency": "GBP",
      "status": "PENDING",
      "payment_method": "stripe",
      "payment_details": {
        "account_number": "****5678",
        "routing_number": "****4321"
      },
      "requested_at": "2025-12-18T10:30:00Z",
      "approved_at": null,
      "rejected_at": null,
      "paid_at": null,
      "organizer": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "public_event": {
        "id": "uuid",
        "title": "Concert Name"
      },
      "stripe_payouts": [],
      "approved_by": null,
      "rejected_by": null,
      "paid_by": null
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 45,
    "per_page": 15
  }
}
```

---

### 4. **Update Settlement** (Admin)

**Endpoint:** `PATCH /api/financials/settlements/{settlement}`

**Auth:** Super Admin

**Description:** Approve, reject, or mark settlement as paid. Can adjust amount during approval.

#### **4a. Approve Settlement (with optional adjustment)**

**Request Body:**
```json
{
  "status": "APPROVED",
  "admin_notes": "Approved for payout",
  "admin_adjustment": -5000,
  "adjustment_reason": "Penalty for late event cancellation notice"
}
```

**Fields:**
- `status`: required, must be `APPROVED`
- `admin_notes`: optional, string
- `admin_adjustment`: optional, integer (in cents, can be positive or negative)
- `adjustment_reason`: required if `admin_adjustment` provided

**Success Response (200):**
```json
{
  "success": true,
  "message": "Settlement request approved",
  "data": {
    "id": "uuid",
    "amount": 85000,
    "admin_adjustment": -5000,
    "adjustment_reason": "Penalty for late event cancellation notice",
    "final_amount": 80000,
    "status": "APPROVED",
    "approved_by": "admin_uuid",
    "approved_at": "2025-12-18T14:00:00Z"
  }
}
```

#### **4b. Reject Settlement**

**Request Body:**
```json
{
  "status": "REJECTED",
  "rejection_reason": "Invalid bank details provided",
  "admin_notes": "Please resubmit with correct account information"
}
```

**Fields:**
- `status`: required, must be `REJECTED`
- `rejection_reason`: required, string
- `admin_notes`: optional, string

**Success Response (200):**
```json
{
  "success": true,
  "message": "Settlement request rejected",
  "data": {
    "id": "uuid",
    "status": "REJECTED",
    "rejection_reason": "Invalid bank details provided",
    "rejected_by": "admin_uuid",
    "rejected_at": "2025-12-18T14:00:00Z"
  }
}
```

#### **4c. Mark as Paid (Stripe Automated Payout)**

**Request Body:**
```json
{
  "status": "PAID",
  "payout_method": "stripe"
}
```

**Fields:**
- `status`: required, must be `PAID`
- `payout_method`: required, must be `stripe` or `manual`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Stripe payout initiated successfully. Funds will arrive in 1-3 business days.",
  "data": {
    "id": "uuid",
    "status": "APPROVED",
    "stripe_payout_initiated_at": "2025-12-18T14:30:00Z",
    "stripe_payouts": [
      {
        "id": "uuid",
        "stripe_payout_id": "po_xxxxxxxxxxxxx",
        "amount": 80000,
        "currency": "GBP",
        "status": "pending",
        "destination_type": "bank_account",
        "arrival_date": "2025-12-21T00:00:00Z",
        "initiated_at": "2025-12-18T14:30:00Z"
      }
    ]
  }
}
```

**Note:** Settlement status remains `APPROVED` until Stripe webhook confirms payout is `paid`, then it becomes `PAID`.

#### **4d. Mark as Paid (Manual Payment)**

**Request Body:**
```json
{
  "status": "PAID",
  "payout_method": "manual",
  "transaction_reference": "BANK_TRANSFER_REF_123456",
  "payment_description": "Paid via BACS transfer on 2025-12-18"
}
```

**Fields:**
- `status`: required, must be `PAID`
- `payout_method`: required, must be `manual`
- `transaction_reference`: required, string (bank reference, PayPal transaction ID, etc.)
- `payment_description`: optional, string (additional details)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Settlement marked as paid manually",
  "data": {
    "id": "uuid",
    "status": "PAID",
    "transaction_reference": "BANK_TRANSFER_REF_123456",
    "payment_description": "Paid via BACS transfer on 2025-12-18",
    "paid_by": "admin_uuid",
    "paid_at": "2025-12-18T14:30:00Z"
  }
}
```

**Error Responses:**

**400 - Already Finalized:**
```json
{
  "success": false,
  "message": "Settlement request has already been finalized"
}
```

**400 - Must be Approved First:**
```json
{
  "success": false,
  "message": "Settlement must be approved before marking as paid"
}
```

---

### 5. **Get Settlement Audit Logs** (Admin)

**Endpoint:** `GET /api/financials/settlements/{settlement}/audit-logs`

**Auth:** Super Admin

**Description:** View complete audit trail for a settlement request.

**Request:**
```
GET /api/financials/settlements/{uuid}/audit-logs
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "settlement_request_id": "uuid",
      "user_id": "uuid",
      "action": "stripe_completed",
      "old_status": "APPROVED",
      "new_status": "PAID",
      "metadata": {
        "stripe_payout_id": "po_xxxxxxxxxxxxx",
        "amount": 80000,
        "arrival_date": 1734739200
      },
      "ip_address": null,
      "user_agent": null,
      "created_at": "2025-12-21T10:00:00Z",
      "user": null
    },
    {
      "id": "uuid",
      "settlement_request_id": "uuid",
      "user_id": "admin_uuid",
      "action": "stripe_initiated",
      "old_status": null,
      "new_status": null,
      "metadata": {
        "payout_id": "uuid",
        "amount": 80000,
        "currency": "GBP"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-12-18T14:30:00Z",
      "user": {
        "id": "admin_uuid",
        "name": "Admin User",
        "email": "admin@parlomo.com"
      }
    },
    {
      "id": "uuid",
      "settlement_request_id": "uuid",
      "user_id": "admin_uuid",
      "action": "adjusted",
      "old_status": null,
      "new_status": null,
      "metadata": {
        "old_amount": 85000,
        "new_amount": 80000,
        "adjustment": -5000,
        "reason": "Penalty for late event cancellation notice"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-12-18T14:00:00Z",
      "user": {
        "id": "admin_uuid",
        "name": "Admin User"
      }
    },
    {
      "id": "uuid",
      "settlement_request_id": "uuid",
      "user_id": "admin_uuid",
      "action": "approved",
      "old_status": "PENDING",
      "new_status": "APPROVED",
      "metadata": {
        "approved_amount": 80000,
        "admin_notes": "Approved for payout"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-12-18T14:00:00Z",
      "user": {
        "id": "admin_uuid",
        "name": "Admin User"
      }
    },
    {
      "id": "uuid",
      "settlement_request_id": "uuid",
      "user_id": "organizer_uuid",
      "action": "created",
      "old_status": null,
      "new_status": "PENDING",
      "metadata": {
        "amount": 85000,
        "total_sales": 100000,
        "processing_fees": 3000,
        "total_refunds": 12000,
        "payment_method": "stripe"
      },
      "ip_address": "203.45.67.89",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-12-18T10:30:00Z",
      "user": {
        "id": "organizer_uuid",
        "name": "John Doe"
      }
    }
  ]
}
```

**Audit Actions:**
- `created` - Settlement request submitted
- `approved` - Admin approved settlement
- `rejected` - Admin rejected settlement
- `adjusted` - Admin adjusted settlement amount
- `stripe_initiated` - Stripe payout job queued
- `stripe_completed` - Stripe payout confirmed (webhook)
- `stripe_failed` - Stripe payout failed (webhook)
- `marked_paid` - Admin manually marked as paid
- `email_sent` - Email notification sent

---

## Settlement Amount Calculation

### **Formula:**
```
Net Settlement = Total Sales - Platform Fees - Processing Fees - Total Refunds + Admin Adjustment
```

### **Example Breakdown:**

**Event Sales:**
- 50 tickets sold @ £20 each = £1,000.00
- Total Sales = £1,000.00 (100,000 cents)

**Deductions:**
- Processing Fees (Stripe): £30.00 (3,000 cents)
- Platform Fees: £0.00 (currently disabled)
- Refunds Issued: £120.00 (12,000 cents)

**Admin Adjustment:**
- Penalty: -£50.00 (-5,000 cents) [for policy violation]

**Net Settlement:**
```
£1,000.00 - £30.00 - £120.00 - £50.00 = £800.00
```

---

## Settlement Statuses

| Status | Description | Who Can Change | Next Actions |
|--------|-------------|----------------|--------------|
| **PENDING** | Awaiting admin review | Admin | Approve or Reject |
| **APPROVED** | Approved, ready for payout | Admin | Mark as PAID |
| **REJECTED** | Rejected by admin | N/A | Organizer can resubmit |
| **PAID** | Payment completed | N/A | Final state |

---

## Stripe Payout Flow

### **Standard Payout (Free, 1-3 days):**

```
1. Admin marks settlement as PAID with payout_method=stripe
2. System creates StripePayout record
3. ProcessStripePayout job queued
4. Job calls Stripe Payouts API
5. Stripe initiates payout (status: pending/in_transit)
6. Webhook received: payout.paid
7. Settlement marked as PAID
8. Email sent to organizer
```

### **Webhook Events:**
- `payout.paid` - Payout completed successfully
- `payout.failed` - Payout failed (insufficient funds, invalid bank account, etc.)
- `payout.updated` - Payout status changed

**Important:** Settlement remains in `APPROVED` status until webhook confirms `payout.paid`, then moves to `PAID`.

---

## Manual Payout Flow

```
1. Admin marks settlement as PAID with payout_method=manual
2. Admin provides transaction_reference (bank ref, PayPal ID, etc.)
3. Admin optionally adds payment_description
4. Settlement immediately marked as PAID
5. Audit log created
6. Email sent to organizer
```

---

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 403 | Settlement deadline not met | Wait X days after event ends |
| 403 | Not authorized for this event | Check organizer_id matches |
| 400 | Already pending/approved | Wait for current request to complete |
| 400 | No settlement amount | Check if refunds exceed sales |
| 400 | Already finalized | Cannot modify REJECTED/PAID settlements |
| 400 | Must be approved first | Approve before marking as PAID |
| 400 | Stripe payout failed | Check Stripe account balance/bank details |

---

## Database Migrations

Run migrations in order:

```bash
php artisan migrate
```

**Migrations created:**
1. `2025_12_18_000001_update_settlement_requests_table.php`
2. `2025_12_18_000002_create_stripe_payouts_table.php`
3. `2025_12_18_000003_create_settlement_audit_logs_table.php`

---

## Queue Configuration

Add `payouts` queue to your queue worker:

```bash
php artisan queue:work --queue=payouts,refunds,emails,webhooks,default
```

Or in supervisor:

```ini
[program:parlomo-queue-worker]
command=php /path/to/artisan queue:work --queue=payouts,refunds,emails,webhooks,default --sleep=3 --tries=3 --max-time=3600
```

---

## Stripe Dashboard Configuration

### **1. Enable Payouts:**
- Go to Stripe Dashboard → Settings → Payouts
- Ensure payouts are enabled for your account
- Add your bank account for receiving funds

### **2. Register Webhooks:**
- Go to Stripe Dashboard → Developers → Webhooks
- Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Select events to listen to:
  - `payout.paid`
  - `payout.failed`
  - `payout.updated`
  - `charge.refunded`
  - `charge.refund.updated`
- Copy webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

---

## Testing Checklist

### **Organizer Tests:**
- [ ] Cannot request settlement before deadline
- [ ] Cannot request settlement for non-owned event
- [ ] Cannot request duplicate settlement
- [ ] Settlement calculates refunds correctly
- [ ] Can view own settlement requests
- [ ] Receives status updates

### **Admin Tests:**
- [ ] Can approve with adjustment
- [ ] Can reject with reason
- [ ] Can initiate Stripe payout
- [ ] Can mark manual payment
- [ ] Cannot modify finalized settlements
- [ ] Can view all settlements
- [ ] Can view audit logs

### **Stripe Tests:**
- [ ] Payout creates successfully
- [ ] Webhook updates settlement status
- [ ] Failed payouts handled gracefully
- [ ] Arrival date displayed correctly

### **Edge Cases:**
- [ ] Event with no sales
- [ ] Event with 100% refunds
- [ ] Negative adjustment larger than amount
- [ ] Stripe API timeout
- [ ] Webhook replay (idempotency)

---

## Common Use Cases

### **Use Case 1: Simple Settlement**
1. Event ends on Dec 17
2. Wait until Dec 18 (1 day later)
3. Organizer submits settlement request
4. Admin approves without adjustment
5. Admin initiates Stripe payout
6. Funds arrive in 1-3 days
7. Webhook confirms, settlement marked PAID

### **Use Case 2: Settlement with Penalty**
1. Organizer cancels event last minute
2. Refunds processed with £50 fine per order
3. Organizer requests settlement
4. Admin reviews, applies additional -£200 penalty
5. Admin approves with adjusted amount
6. Manual bank transfer made
7. Admin marks as PAID with bank reference

### **Use Case 3: Rejected Settlement**
1. Organizer submits with invalid bank details
2. Admin reviews, finds error
3. Admin rejects with reason
4. Organizer fixes bank details
5. Organizer resubmits new settlement request
6. Admin approves and processes

---

## Support & Troubleshooting

### **Settlement not available:**
- Check event end date + deadline days
- Verify event has paid orders
- Check for existing pending/approved settlements

### **Stripe payout failed:**
- Verify Stripe account has sufficient balance
- Check bank account details are valid
- Review Stripe Dashboard for error details
- Check webhook logs

### **Webhook not received:**
- Verify webhook URL is publicly accessible
- Check STRIPE_WEBHOOK_SECRET is correct
- Review webhook delivery attempts in Stripe Dashboard
- Check queue worker is running

---

## End of API Reference
