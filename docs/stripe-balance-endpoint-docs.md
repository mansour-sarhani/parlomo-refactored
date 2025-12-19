# Stripe Balance Endpoint - Documentation

## Overview

A new admin endpoint has been added to check the Stripe account balance before initiating payouts. This helps prevent "insufficient funds" errors.

---

## Endpoint Details

### **GET /api/financials/settlements/stripe-balance**

**Authentication:** Required (Bearer token)
**Authorization:** super-admin role required
**Rate Limit:** Standard API rate limits apply

---

## Request

### Headers
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

### Example Request
```bash
curl -X GET https://your-api.com/api/financials/settlements/stripe-balance \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"
```

---

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "available": [
      {
        "amount": 125000,
        "currency": "GBP",
        "amount_formatted": "1250.00",
        "display": "£1250.00"
      }
    ],
    "pending": [
      {
        "amount": 50000,
        "currency": "GBP",
        "amount_formatted": "500.00",
        "display": "£500.00"
      }
    ],
    "total_available": 125000,
    "total_pending": 50000,
    "total_available_formatted": "1250.00",
    "total_pending_formatted": "500.00",
    "total_available_display": "£1250.00",
    "total_pending_display": "£500.00",
    "currency": "GBP"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `available` | array | Array of available balances by currency |
| `available[].amount` | integer | Amount in cents/pence |
| `available[].currency` | string | Currency code (GBP, USD, EUR, etc.) |
| `available[].amount_formatted` | string | Amount formatted as decimal (1250.00) |
| `available[].display` | string | Amount with currency symbol (£1250.00) |
| `pending` | array | Array of pending balances by currency |
| `pending[].amount` | integer | Amount in cents/pence |
| `pending[].currency` | string | Currency code |
| `pending[].amount_formatted` | string | Amount formatted as decimal |
| `pending[].display` | string | Amount with currency symbol |
| `total_available` | integer | Total available in default currency (cents) |
| `total_pending` | integer | Total pending in default currency (cents) |
| `total_available_formatted` | string | Total available formatted |
| `total_pending_formatted` | string | Total pending formatted |
| `total_available_display` | string | Total available with symbol |
| `total_pending_display` | string | Total pending with symbol |
| `currency` | string | Default currency from config |

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Failed to retrieve Stripe balance",
  "message": "API key expired or invalid."
}
```

### Error Response (401 Unauthorized)

```json
{
  "success": false,
  "message": "Unauthenticated"
}
```

### Error Response (403 Forbidden)

```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

---

## Understanding Stripe Balance

### Available Balance
- **Definition:** Funds that can be immediately paid out to organizers
- **Source:** Completed payments from ticket sales
- **Can be used:** Yes, for payouts right now

### Pending Balance
- **Definition:** Funds that are not yet available for payout
- **Source:** Recent payments still being processed by Stripe
- **Can be used:** No, must wait until they become available
- **Timeline:** Typically becomes available within 2-7 days

### Important Notes

1. **Test Mode:** In test mode, you'll likely have £0.00 balance unless you've created test payments
2. **Multi-Currency:** If you accept multiple currencies, each will show separately
3. **Payout Limits:** You can only payout up to the available balance amount
4. **Reserves:** Stripe may hold reserves for high-risk accounts

---

## Use Cases

### Use Case 1: Check Before Initiating Payout

**Scenario:** Admin wants to pay an organizer £500 but unsure if sufficient balance exists

**Steps:**
1. Call `/settlements/stripe-balance` to check available funds
2. If available balance >= £500, proceed with payout
3. If insufficient, wait or use manual payment method

**Example:**
```bash
# 1. Check balance
GET /api/financials/settlements/stripe-balance
# Response: available = £1,250

# 2. Settlement amount = £500
# 3. Sufficient funds! Proceed with Stripe payout
PATCH /api/financials/settlements/{id}
{
  "status": "PAID",
  "payout_method": "stripe"
}
```

### Use Case 2: Dashboard Balance Display

**Scenario:** Display Stripe balance on admin dashboard

**Implementation:**
```javascript
// Fetch balance on dashboard load
const response = await fetch('/api/financials/settlements/stripe-balance', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const { data } = await response.json();

// Display on dashboard
console.log(`Available: ${data.total_available_display}`);
console.log(`Pending: ${data.total_pending_display}`);
```

### Use Case 3: Prevent Insufficient Funds Error

**Scenario:** Before initiating multiple payouts, verify total doesn't exceed balance

**Steps:**
```javascript
// 1. Get all approved settlements
const settlements = await getApprovedSettlements();
const totalRequired = settlements.reduce((sum, s) => sum + s.final_amount, 0);

// 2. Check Stripe balance
const balance = await getStripeBalance();

// 3. Compare
if (balance.data.total_available >= totalRequired) {
  // Process all payouts
  for (const settlement of settlements) {
    await initiateStripePayout(settlement.id);
  }
} else {
  console.error('Insufficient balance for all payouts');
  console.log(`Required: £${totalRequired / 100}`);
  console.log(`Available: £${balance.data.total_available / 100}`);
}
```

---

## Testing

### Test Mode Balance (Starts at £0)

```json
{
  "success": true,
  "data": {
    "available": [
      {
        "amount": 0,
        "currency": "GBP",
        "amount_formatted": "0.00",
        "display": "£0.00"
      }
    ],
    "pending": [],
    "total_available": 0,
    "total_pending": 0,
    "total_available_formatted": "0.00",
    "total_pending_formatted": "0.00",
    "total_available_display": "£0.00",
    "total_pending_display": "£0.00",
    "currency": "GBP"
  }
}
```

### After Creating Test Payments (£1,000 in sales)

```json
{
  "success": true,
  "data": {
    "available": [
      {
        "amount": 100000,
        "currency": "GBP",
        "amount_formatted": "1000.00",
        "display": "£1000.00"
      }
    ],
    "pending": [],
    "total_available": 100000,
    "total_pending": 0,
    "total_available_formatted": "1000.00",
    "total_pending_formatted": "0.00",
    "total_available_display": "£1000.00",
    "total_pending_display": "£0.00",
    "currency": "GBP"
  }
}
```

---

## Integration Examples

### React/Next.js Example

```typescript
import { useState, useEffect } from 'react';

interface StripeBalance {
  total_available: number;
  total_pending: number;
  total_available_display: string;
  total_pending_display: string;
  currency: string;
}

export function StripeBalanceWidget() {
  const [balance, setBalance] = useState<StripeBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const response = await fetch('/api/financials/settlements/stripe-balance', {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.success) {
          setBalance(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to load balance');
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, []);

  if (loading) return <div>Loading balance...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!balance) return null;

  return (
    <div className="stripe-balance-widget">
      <h3>Stripe Account Balance</h3>
      <div className="balance-item">
        <span>Available:</span>
        <span className="amount">{balance.total_available_display}</span>
      </div>
      <div className="balance-item">
        <span>Pending:</span>
        <span className="amount pending">{balance.total_pending_display}</span>
      </div>
      {balance.total_available === 0 && (
        <div className="warning">
          ⚠️ Insufficient balance for payouts. Create test payments to build balance.
        </div>
      )}
    </div>
  );
}
```

### PHP/Laravel Example

```php
use Illuminate\Support\Facades\Http;

class SettlementService
{
    public function canProcessPayout(SettlementRequest $settlement): bool
    {
        $balance = $this->getStripeBalance();

        if (!$balance) {
            return false;
        }

        $requiredAmount = $settlement->getFinalPayoutAmount();
        $availableAmount = $balance['total_available'];

        return $availableAmount >= $requiredAmount;
    }

    private function getStripeBalance(): ?array
    {
        try {
            $response = Http::withToken(auth()->user()->createToken('api')->plainTextToken)
                ->get(config('app.url') . '/api/financials/settlements/stripe-balance');

            if ($response->successful()) {
                return $response->json('data');
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Failed to fetch Stripe balance', ['error' => $e->getMessage()]);
            return null;
        }
    }
}
```

---

## Monitoring & Alerts

### Set Up Balance Alerts

**Low Balance Alert:**
```php
// Check balance daily
$balance = $this->getStripeBalance();

if ($balance['total_available'] < 100000) { // Less than £1,000
    // Send alert to admin
    Mail::to('admin@example.com')->send(new LowBalanceAlert($balance));
}
```

**Insufficient Balance Before Payout:**
```php
$settlement = SettlementRequest::find($id);
$balance = $this->getStripeBalance();

if ($balance['total_available'] < $settlement->getFinalPayoutAmount()) {
    Log::warning('Insufficient balance for payout', [
        'settlement_id' => $settlement->id,
        'required' => $settlement->getFinalPayoutAmount(),
        'available' => $balance['total_available'],
    ]);

    // Use manual payment instead
    return $this->processManualPayment($settlement);
}
```

---

## API Reference Summary

| Aspect | Details |
|--------|---------|
| **Endpoint** | GET `/api/financials/settlements/stripe-balance` |
| **Auth** | Required (Bearer token) |
| **Role** | super-admin |
| **Rate Limit** | Standard |
| **Response Time** | ~200-500ms (Stripe API call) |
| **Cache** | Not cached (real-time balance) |
| **Idempotent** | Yes (GET request) |

---

## Troubleshooting

### Issue: Balance shows £0 in test mode
**Solution:** Create test ticket purchases to build balance, or use manual payment method

### Issue: Balance API returns error
**Possible Causes:**
- Invalid Stripe API keys
- Stripe API unavailable
- Network timeout
**Solution:** Check Stripe Dashboard, verify API keys in .env

### Issue: Balance doesn't match Stripe Dashboard
**Possible Causes:**
- Multi-currency display differences
- Recent payouts not yet reflected
- Pending balance vs available balance
**Solution:** Refresh both, wait a few minutes, check currency filters

---

## Security Considerations

1. **Admin Only:** Endpoint restricted to super-admin role
2. **No Caching:** Balance is fetched fresh from Stripe on each request
3. **Rate Limiting:** Standard API rate limits apply
4. **Logging:** All balance checks logged for audit purposes
5. **Error Messages:** Generic error messages to prevent information leakage

---

## Next Steps

1. **Add to Admin Dashboard:** Display balance prominently
2. **Pre-Payout Check:** Check balance before initiating Stripe payouts
3. **Set Up Alerts:** Monitor low balance conditions
4. **Testing:** Test in both test and live modes
5. **Documentation:** Share with admin users

---

**Created:** December 18, 2025
**Endpoint:** `/api/financials/settlements/stripe-balance`
**Version:** 1.0
**Status:** ✅ Ready for Use
