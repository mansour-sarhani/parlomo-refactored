# Ticketing Utilities Documentation

## Overview

Component 7 provides core utility functions for the ticketing system, including QR code generation, fee calculation, promo code validation, and ticket generation.

---

## Utilities

### 1. QR Code Generator (`qr-generator.js`)

Generates and validates secure QR codes for tickets using JWT signing.

#### Functions

**`generateQRPayload(ticketData)`**
- Generates signed JWT token for QR code
- Parameters: `{ ticketId, ticketCode, eventId, ticketTypeId, orderId }`
- Returns: Signed JWT string
- Expires: 365 days

**`verifyQRPayload(token)`**
- Verifies and decodes QR code token
- Returns: Decoded ticket data or null if invalid

**`isValidQRFormat(qrData)`**
- Checks if QR data has valid JWT format
- Returns: boolean

**`extractTicketCode(token)`**
- Extracts ticket code without full verification
- Useful for quick lookups

**`isQRExpired(token)`**
- Checks if QR code has expired
- Returns: boolean

#### Example Usage

```javascript
import { generateQRPayload, verifyQRPayload } from '@/lib/ticketing';

// Generate QR payload
const qrToken = generateQRPayload({
  ticketId: 123,
  ticketCode: 'TKT-ABC123XYZ',
  eventId: 1,
  ticketTypeId: 2,
  orderId: 456,
});

// Verify QR payload
const ticketData = verifyQRPayload(qrToken);
if (ticketData) {
  console.log('Valid ticket:', ticketData.ticketCode);
}
```

---

### 2. Fee Calculator (`fee-calculator.js`)

Calculates platform fees, taxes, and order totals.

#### Fee Configuration

- **Service Fee**: 5% (capped at $10)
- **Processing Fee**: $2.00 per order
- **Platform Fee**: 3% (paid by organizer)

#### Functions

**`calculateBuyerFees(subtotal)`**
- Calculates all buyer-facing fees
- Returns: `{ serviceFee, processingFee, totalFees, breakdown }`

**`calculateOrganizerFees(subtotal)`**
- Calculates organizer fees (deducted from revenue)
- Returns: `{ platformFee, totalFees, breakdown }`

**`calculateOrderTotal({ subtotal, discount, includeFees })`**
- Calculates complete order breakdown
- Returns: `{ subtotal, discount, fees, total, feeBreakdown }`

**`calculateOrganizerPayout({ ticketRevenue, refunds })`**
- Calculates organizer payout after fees
- Returns: `{ ticketRevenue, refunds, platformFee, payout, breakdown }`

**`formatCurrency(cents, currency)`**
- Formats cents as currency string
- Returns: Formatted string (e.g., "$49.99")

**`applyDiscount({ amount, discountType, discountValue })`**
- Applies percentage or fixed discount
- Returns: Discount amount in cents

#### Example Usage

```javascript
import { calculateOrderTotal, formatCurrency } from '@/lib/ticketing';

const order = calculateOrderTotal({
  subtotal: 10000, // $100.00
  discount: 2000,  // $20.00
  includeFees: true,
});

console.log('Total:', formatCurrency(order.total)); // "$82.00"
```

---

### 3. Promo Code Validator (`promo-validator.js`)

Validates promo codes and calculates discounts.

#### Functions

**`validatePromoCode(promoCode, context)`**
- Validates promo code against all rules
- Context: `{ cartTotal, ticketTypeIds, userId, userUseCount }`
- Returns: `{ valid, error, errorCode }` or `{ valid, promoCode }`

**Validation Rules:**
- Active status
- Validity period (validFrom - validTo)
- Max uses (global)
- Max uses per user
- Minimum order value
- Applicable ticket types

**`calculatePromoDiscount(promoCode, cartTotal)`**
- Calculates discount amount
- Supports: percent and fixed discounts
- Returns: Discount in cents

**`getPromoDisplayInfo(promoCode)`**
- Gets display-friendly promo information
- Returns: `{ code, discountDisplay, description, validUntil }`

**`isPromoExpiringSoon(promoCode, daysThreshold)`**
- Checks if promo expires within threshold days
- Default threshold: 7 days

**`generatePromoCode(options)`**
- Generates random promo code
- Options: `{ length, includeNumbers, prefix }`

**`sanitizePromoCode(code)`**
- Cleans user input (uppercase, trim, remove special chars)

#### Example Usage

```javascript
import { validatePromoCode, calculatePromoDiscount } from '@/lib/ticketing';

const result = validatePromoCode(promoCode, {
  cartTotal: 10000,
  ticketTypeIds: [1, 2],
  userId: 123,
  userUseCount: 0,
});

if (result.valid) {
  const discount = calculatePromoDiscount(promoCode, 10000);
  console.log('Discount:', discount); // e.g., 2000 (20%)
} else {
  console.error('Invalid:', result.error);
}
```

---

### 4. Ticket Generator (`ticket-generator.js`)

Generates unique ticket codes and manages ticket instances.

#### Functions

**`generateTicketCode()`**
- Generates unique ticket code
- Format: `TKT-XXXXXXXXX`
- Uses alphanumeric characters (excluding confusing ones)

**`generateTicketCodes(count)`**
- Generates multiple unique codes
- Ensures no duplicates

**`generateTicketInstance(params)`**
- Creates complete ticket instance
- Parameters: `{ orderId, orderItemId, ticketTypeId, eventId, attendeeName, attendeeEmail, seatId }`
- Returns: Ticket object with code, UUID, and metadata

**`generateTicketInstances(params, quantity)`**
- Generates multiple ticket instances

**`isValidTicketCode(code)`**
- Validates ticket code format
- Returns: boolean

**`generateBarcodeNumber(ticketId)`**
- Generates EAN-13 barcode number
- For alternative scanning methods

**`getTicketStatusDisplay(status)`**
- Gets display information for ticket status
- Returns: `{ label, color, icon, description }`

**`canTransferTicket(ticket, ticketType)`**
- Checks if ticket can be transferred
- Returns: `{ canTransfer, reason }`

**`canRefundTicket(ticket, ticketType, eventDate)`**
- Checks if ticket can be refunded
- Returns: `{ canRefund, reason }`

#### Example Usage

```javascript
import { 
  generateTicketInstance, 
  isValidTicketCode,
  getTicketStatusDisplay 
} from '@/lib/ticketing';

// Generate ticket
const ticket = generateTicketInstance({
  orderId: 123,
  orderItemId: 456,
  ticketTypeId: 2,
  eventId: 1,
  attendeeName: 'John Doe',
  attendeeEmail: 'john@example.com',
});

console.log('Ticket code:', ticket.code); // "TKT-ABC123XYZ"

// Validate code
const isValid = isValidTicketCode(ticket.code); // true

// Get status display
const statusInfo = getTicketStatusDisplay('valid');
console.log(statusInfo.label); // "Valid"
```

---

## Centralized Import

All utilities can be imported from a single location:

```javascript
import {
  // QR utilities
  generateQRPayload,
  verifyQRPayload,
  
  // Fee utilities
  calculateOrderTotal,
  formatCurrency,
  
  // Promo utilities
  validatePromoCode,
  calculatePromoDiscount,
  
  // Ticket utilities
  generateTicketCode,
  generateTicketInstance,
} from '@/lib/ticketing';
```

---

## Security Considerations

### QR Code Security
- Uses JWT signing with secret key
- Set `JWT_SECRET` environment variable in production
- Tokens expire after 365 days
- Includes issuer and subject verification

### Promo Code Security
- Validates all rules server-side
- Sanitizes user input
- Prevents over-use (global and per-user limits)
- Checks minimum order values

### Ticket Code Security
- Uses non-confusing characters (excludes I, O, 0, 1)
- Generates cryptographically random codes
- Validates format before processing
- Includes UUID for additional uniqueness

---

## Testing

### Unit Test Examples

```javascript
// Fee calculation
test('calculates buyer fees correctly', () => {
  const fees = calculateBuyerFees(10000);
  expect(fees.serviceFee).toBe(500); // 5% of $100
  expect(fees.processingFee).toBe(200); // $2
  expect(fees.totalFees).toBe(700);
});

// Promo validation
test('validates expired promo code', () => {
  const expiredPromo = {
    active: true,
    validFrom: '2023-01-01',
    validTo: '2023-12-31',
    // ...
  };
  
  const result = validatePromoCode(expiredPromo, { cartTotal: 10000 });
  expect(result.valid).toBe(false);
  expect(result.errorCode).toBe('EXPIRED');
});

// Ticket code generation
test('generates valid ticket codes', () => {
  const code = generateTicketCode();
  expect(isValidTicketCode(code)).toBe(true);
  expect(code).toMatch(/^TKT-[A-Z0-9]{9}$/);
});
```

---

## Performance Considerations

- **QR Generation**: JWT signing is fast (~1ms per token)
- **Fee Calculation**: All calculations use integer math (cents)
- **Promo Validation**: Runs in O(1) time for most checks
- **Ticket Generation**: Batch generation available for efficiency

---

## Future Enhancements

- [ ] Add QR code image generation (server-side)
- [ ] Support for dynamic fee configuration
- [ ] Promo code usage analytics
- [ ] Ticket transfer workflow
- [ ] Refund processing automation
- [ ] Multi-currency support
- [ ] Tax calculation by region

---

**Created:** 2025-11-26  
**Version:** 1.0  
**Status:** Complete - Phase 1 MVP
