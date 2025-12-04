# Services Layer Documentation

## Overview

Component 8 provides a clean API client wrapper for all ticketing and payment operations. This layer abstracts the HTTP requests and provides a simple, promise-based interface for the frontend.

---

## Services

### 1. Ticketing Service (`ticketing.service.js`)

Client-side wrapper for all ticketing API endpoints.

#### Event Management

**`getEventTicketing(eventId)`**
- Fetches event ticketing information
- Returns: Event data with ticket types and stats

**`createTicketType(eventId, ticketTypeData)`**
- Creates new ticket type for event
- Returns: Created ticket type

**`updateTicketType(eventId, ticketTypeId, updates)`**
- Updates existing ticket type
- Returns: Updated ticket type

#### Checkout & Orders

**`validatePromoCode({ code, cartTotal, ticketTypeIds })`**
- Validates promo code
- Returns: Validation result with discount

**`startCheckout({ eventId, cartItems, promoCode })`**
- Initiates checkout session
- Returns: Checkout session with totals

**`completeCheckout(checkoutData)`**
- Completes order after payment
- Returns: Order confirmation

**`getOrder(orderId)`**
- Fetches order details
- Returns: Order with items

**`getOrderTickets(orderId)`**
- Fetches tickets for order
- Returns: Array of tickets with QR codes

#### Ticket Scanning

**`scanTicket({ ticketCode, qrPayload, scannedBy })`**
- Scans and validates ticket
- Marks ticket as used
- Returns: Scan result

**`checkTicketStatus(ticketCode)`**
- Checks ticket status without marking as used
- Returns: Ticket status

#### User Orders

**`getUserOrders(userId, params)`**
- Fetches user's order history
- Params: `{ page, limit, status }`
- Returns: Paginated orders

#### Downloads

**`downloadTicketPDF(ticketId)`**
- Downloads single ticket PDF
- Returns: PDF blob

**`downloadOrderTicketsPDF(orderId)`**
- Downloads all tickets for order as PDF
- Returns: PDF blob

#### Ticket Operations

**`transferTicket(ticketId, { toEmail })`**
- Transfers ticket to another person
- Returns: Transfer result

**`refundTicket(ticketId, { reason })`**
- Requests ticket refund
- Returns: Refund result

#### Analytics & Reporting

**`getEventAnalytics(eventId)`**
- Fetches sales analytics for event
- Returns: Revenue, sales, and performance metrics

**`getEventAttendees(eventId, params)`**
- Fetches attendee list
- Params: `{ search, status, page }`
- Returns: Attendees with check-in status

**`exportAttendees(eventId)`**
- Exports attendees as CSV
- Returns: CSV blob

#### Utilities

**`resendOrderConfirmation(orderId)`**
- Resends order confirmation email
- Returns: Success status

---

### 2. Payment Service (`payment.service.js`)

Handles payment processing (Stripe integration).

#### Payment Processing

**`createPaymentIntent({ amount, currency, metadata })`**
- Creates Stripe payment intent
- Amount in cents
- Returns: Payment intent with client secret

**`confirmPayment(paymentIntentId)`**
- Confirms payment completion
- Returns: Confirmation result

**`processRefund({ paymentIntentId, amount, reason })`**
- Processes refund
- Amount optional (full refund if not specified)
- Returns: Refund result

**`getPaymentStatus(paymentIntentId)`**
- Checks payment status
- Returns: Payment status

#### Payment Methods

**`getPaymentMethods(userId)`**
- Fetches saved payment methods
- Returns: Array of payment methods

**`addPaymentMethod(userId, paymentMethodData)`**
- Adds new payment method
- Returns: Added payment method

**`removePaymentMethod(paymentMethodId)`**
- Removes payment method
- Returns: Success status

#### Transactions

**`getTransactions(userId, params)`**
- Fetches transaction history
- Params: `{ page, limit, type }`
- Returns: Paginated transactions

#### Testing

**`mockPayment(params)`**
- Mock payment for testing
- Simulates 1.5s processing delay
- Returns: Mock payment result

---

## Usage Examples

### Basic Import

```javascript
import { ticketingService, paymentService } from '@/services';
```

### Fetch Event Tickets

```javascript
async function loadEventTickets(eventId) {
  try {
    const data = await ticketingService.getEventTicketing(eventId);
    console.log('Ticket types:', data.ticketTypes);
    console.log('Stats:', data.stats);
  } catch (error) {
    console.error('Failed to load tickets:', error);
  }
}
```

### Complete Checkout Flow

```javascript
async function checkout() {
  try {
    // 1. Validate promo code (optional)
    const promoResult = await ticketingService.validatePromoCode({
      code: 'SAVE20',
      cartTotal: 10000,
      ticketTypeIds: [1, 2],
    });

    // 2. Start checkout
    const session = await ticketingService.startCheckout({
      eventId: 1,
      cartItems: [
        { ticketTypeId: 1, quantity: 2 },
        { ticketTypeId: 2, quantity: 1 },
      ],
      promoCode: promoResult.valid ? 'SAVE20' : null,
    });

    // 3. Process payment
    const payment = await paymentService.createPaymentIntent({
      amount: session.session.total,
      currency: 'USD',
      metadata: { sessionId: session.session.sessionId },
    });

    // 4. Complete checkout
    const order = await ticketingService.completeCheckout({
      sessionId: session.session.sessionId,
      eventId: 1,
      userId: 123,
      cartItems: session.session.cartItems,
      buyerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
      subtotal: session.session.subtotal,
      discount: session.session.discount,
      fees: session.session.fees,
      total: session.session.total,
      paymentIntentId: payment.paymentIntentId,
    });

    console.log('Order created:', order.order.orderNumber);
  } catch (error) {
    console.error('Checkout failed:', error);
  }
}
```

### Scan Ticket

```javascript
async function scanTicket(qrCode) {
  try {
    const result = await ticketingService.scanTicket({
      qrPayload: qrCode,
      scannedBy: 456, // Staff user ID
    });

    if (result.valid) {
      console.log('✅ Valid ticket:', result.ticket.attendeeName);
    } else {
      console.log('❌ Invalid:', result.error);
    }
  } catch (error) {
    console.error('Scan failed:', error);
  }
}
```

### Download Tickets

```javascript
async function downloadTickets(orderId) {
  try {
    const pdfBlob = await ticketingService.downloadOrderTicketsPDF(orderId);
    
    // Create download link
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-order-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
}
```

### Get Analytics

```javascript
async function loadAnalytics(eventId) {
  try {
    const analytics = await ticketingService.getEventAnalytics(eventId);
    
    console.log('Total Revenue:', analytics.totalRevenue);
    console.log('Tickets Sold:', analytics.ticketsSold);
    console.log('Conversion Rate:', analytics.conversionRate);
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
}
```

### Export Attendees

```javascript
async function exportAttendees(eventId) {
  try {
    const csvBlob = await ticketingService.exportAttendees(eventId);
    
    // Download CSV
    const url = window.URL.createObjectURL(csvBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-event-${eventId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
  }
}
```

---

## Integration with Redux

Services are used by Redux async thunks:

```javascript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ticketingService } from '@/services';

export const fetchEventTicketing = createAsyncThunk(
  'ticketing/fetchEventTicketing',
  async (eventId, { rejectWithValue }) => {
    try {
      const data = await ticketingService.getEventTicketing(eventId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);
```

---

## Error Handling

All service methods throw errors that can be caught:

```javascript
try {
  const result = await ticketingService.scanTicket({ ticketCode: 'ABC123' });
} catch (error) {
  if (error.response) {
    // API error
    console.error('API Error:', error.response.data.error);
    console.error('Status:', error.response.status);
  } else if (error.request) {
    // Network error
    console.error('Network error - no response received');
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

---

## Response Formats

### Success Response
```javascript
{
  success: true,
  data: { ... },
  message: "Operation completed successfully"
}
```

### Error Response
```javascript
{
  error: "Error message",
  details: "Additional details",
  code: "ERROR_CODE"
}
```

---

## Best Practices

### 1. Always Handle Errors
```javascript
try {
  const result = await ticketingService.someMethod();
  // Handle success
} catch (error) {
  // Handle error
  showErrorToast(error.response?.data?.error || 'Operation failed');
}
```

### 2. Use Loading States
```javascript
const [loading, setLoading] = useState(false);

async function loadData() {
  setLoading(true);
  try {
    const data = await ticketingService.getEventTicketing(eventId);
    // Process data
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
}
```

### 3. Cancel Requests on Unmount
```javascript
useEffect(() => {
  const controller = new AbortController();
  
  async function loadData() {
    try {
      const data = await ticketingService.getEventTicketing(eventId);
      // Process data
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Handle error
      }
    }
  }
  
  loadData();
  
  return () => controller.abort();
}, [eventId]);
```

### 4. Debounce Search Requests
```javascript
import { debounce } from 'lodash';

const searchAttendees = debounce(async (searchTerm) => {
  const results = await ticketingService.getEventAttendees(eventId, {
    search: searchTerm,
  });
  setAttendees(results.attendees);
}, 300);
```

---

## Testing

### Mock Service for Tests

```javascript
// __mocks__/ticketing.service.js
export default {
  getEventTicketing: jest.fn(() => Promise.resolve({
    success: true,
    ticketTypes: [],
    stats: {},
  })),
  
  scanTicket: jest.fn(() => Promise.resolve({
    valid: true,
    ticket: { code: 'TKT-123' },
  })),
};
```

### Unit Test Example

```javascript
import { ticketingService } from '@/services';

jest.mock('@/services/ticketing.service');

test('loads event tickets', async () => {
  const mockData = { ticketTypes: [{ id: 1, name: 'GA' }] };
  ticketingService.getEventTicketing.mockResolvedValue(mockData);
  
  const result = await ticketingService.getEventTicketing(1);
  
  expect(result.ticketTypes).toHaveLength(1);
  expect(ticketingService.getEventTicketing).toHaveBeenCalledWith(1);
});
```

---

## Future Enhancements

- [ ] Request caching
- [ ] Retry logic for failed requests
- [ ] Request deduplication
- [ ] Optimistic updates
- [ ] WebSocket support for real-time updates
- [ ] Offline support with queue
- [ ] Request batching

---

**Created:** 2025-11-26  
**Version:** 1.0  
**Status:** Complete - Phase 1 MVP
