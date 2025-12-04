# Redux Slices - Ticketing System

## Overview

Component 4 implements Redux state management for the ticketing system using Redux Toolkit.

---

## Slices

### 1. Ticketing Slice (`ticketingSlice.js`)

Manages event ticketing, shopping cart, promo codes, and checkout flow.

#### State Structure

```javascript
{
  // Event ticketing data
  currentEvent: null,
  ticketTypes: [],
  eventStats: null,
  
  // Shopping cart
  cart: [],
  cartTotal: 0,
  
  // Promo code
  promoCode: null,
  promoDiscount: 0,
  promoError: null,
  
  // Checkout session
  checkoutSession: null,
  
  // UI states
  loading: false,
  error: null,
  
  // Checkout flow
  checkoutStep: 'cart' // 'cart' | 'details' | 'payment' | 'complete'
}
```

#### Actions

**Synchronous:**
- `addToCart(ticketTypeId, quantity)` - Add tickets to cart
- `updateCartQuantity(ticketTypeId, quantity)` - Update quantity
- `removeFromCart(ticketTypeId)` - Remove from cart
- `clearCart()` - Empty cart
- `setPromoCode(code)` - Set promo code
- `clearPromoCode()` - Clear promo code
- `setCheckoutStep(step)` - Update checkout step
- `resetTicketing()` - Reset entire state

**Asynchronous (Thunks):**
- `fetchEventTicketing(eventId)` - Fetch event with ticket types
- `validatePromoCode({ code, cartTotal, ticketTypeIds })` - Validate promo
- `startCheckout({ eventId, cartItems, promoCode })` - Start checkout
- `completeCheckout(checkoutData)` - Complete order

#### Selectors

- `selectTicketTypes` - All ticket types
- `selectCart` - Cart items
- `selectCartTotal` - Cart subtotal
- `selectCartCount` - Total ticket count
- `selectPromoCode` - Current promo code
- `selectPromoDiscount` - Discount amount
- `selectPromoError` - Promo validation error
- `selectCheckoutSession` - Checkout session data
- `selectCheckoutStep` - Current checkout step
- `selectFinalTotal` - Total with fees and discount

---

### 2. Orders Slice (`ordersSlice.js`)

Manages user orders, order history, and tickets.

#### State Structure

```javascript
{
  // Orders list
  orders: [],
  ordersLoading: false,
  ordersError: null,
  
  // Current order details
  currentOrder: null,
  currentOrderLoading: false,
  currentOrderError: null,
  
  // Current order tickets
  currentOrderTickets: [],
  ticketsLoading: false,
  ticketsError: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalOrders: 0
}
```

#### Actions

**Synchronous:**
- `clearCurrentOrder()` - Clear current order
- `setCurrentPage(page)` - Set pagination page
- `resetOrders()` - Reset entire state

**Asynchronous (Thunks):**
- `fetchUserOrders(userId)` - Fetch user's orders
- `fetchOrderDetails(orderId)` - Fetch order details
- `fetchOrderTickets(orderId)` - Fetch order tickets

#### Selectors

- `selectOrders` - All orders
- `selectCurrentOrder` - Current order details
- `selectCurrentOrderTickets` - Current order tickets
- `selectOrdersPagination` - Pagination info
- `selectOrderById(orderId)` - Get specific order
- `selectValidTickets` - Valid tickets only
- `selectUsedTickets` - Used tickets only

---

## Custom Hooks

### `useTicketing()`

Complete ticketing functionality in one hook.

```javascript
const {
  // State
  ticketTypes,
  cart,
  cartTotal,
  cartCount,
  promoCode,
  promoDiscount,
  checkoutSession,
  loading,
  
  // Actions
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setPromoCode,
  clearPromoCode,
  
  // Async actions
  fetchEventTicketing,
  validatePromoCode,
  startCheckout,
  completeCheckout,
} = useTicketing();
```

### `useCart()`

Cart-specific operations.

```javascript
const {
  cart,
  cartTotal,
  cartCount,
  isEmpty,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = useCart();
```

### `usePromoCode()`

Promo code management.

```javascript
const {
  promoCode,
  promoDiscount,
  promoError,
  hasPromo,
  setPromoCode,
  clearPromoCode,
  validatePromoCode,
} = usePromoCode();
```

### `useOrders()`

Complete orders functionality.

```javascript
const {
  // State
  orders,
  currentOrder,
  currentOrderTickets,
  validTickets,
  usedTickets,
  loading,
  
  // Actions
  fetchUserOrders,
  fetchOrderDetails,
  fetchOrderTickets,
  clearCurrentOrder,
} = useOrders();
```

### `useOrder(orderId)`

Single order operations.

```javascript
const {
  order,
  loading,
  error,
  fetchOrder,
} = useOrder(orderId);
```

### `useOrderTickets(orderId)`

Order tickets with filtering.

```javascript
const {
  tickets,
  validTickets,
  usedTickets,
  validCount,
  usedCount,
  totalCount,
  loading,
  fetchTickets,
} = useOrderTickets(orderId);
```

---

## Usage Examples

### Add to Cart

```javascript
import { useTicketing } from '@/hooks/useTicketing';

function TicketTypeCard({ ticketType }) {
  const { addToCart } = useTicketing();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(ticketType.id, quantity);
  };

  return (
    <button onClick={handleAddToCart}>
      Add {quantity} to Cart
    </button>
  );
}
```

### Validate Promo Code

```javascript
import { usePromoCode, useCart } from '@/hooks/useTicketing';

function PromoCodeInput() {
  const { promoCode, promoError, validatePromoCode } = usePromoCode();
  const { cart } = useCart();
  const [code, setCode] = useState('');

  const handleApply = async () => {
    const ticketTypeIds = cart.map(item => item.ticketTypeId);
    await validatePromoCode(code, ticketTypeIds);
  };

  return (
    <div>
      <input value={code} onChange={(e) => setCode(e.target.value)} />
      <button onClick={handleApply}>Apply</button>
      {promoError && <p>{promoError}</p>}
    </div>
  );
}
```

### Fetch Order Tickets

```javascript
import { useOrderTickets } from '@/hooks/useOrders';
import { useEffect } from 'react';

function OrderTicketsPage({ orderId }) {
  const { tickets, validCount, usedCount, fetchTickets } = useOrderTickets(orderId);

  useEffect(() => {
    fetchTickets();
  }, [orderId]);

  return (
    <div>
      <p>Valid: {validCount} | Used: {usedCount}</p>
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
```

---

## Integration with Store

The slices are registered in `src/lib/store.js`:

```javascript
import ticketingReducer from '@/features/ticketing/ticketingSlice';
import ordersReducer from '@/features/ticketing/ordersSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      ticketing: ticketingReducer,
      orders: ordersReducer,
      // ... other reducers
    },
  });
};
```

---

## Features

✅ **Cart Management**
- Add/update/remove items
- Quantity validation (min/max per order)
- Automatic subtotal calculation

✅ **Promo Code System**
- Validation with error handling
- Automatic discount calculation
- Clear on cart empty

✅ **Checkout Flow**
- Multi-step process (cart → details → payment → complete)
- Session management
- Inventory reservation

✅ **Order Management**
- Order history
- Order details with items
- Ticket retrieval with filtering

✅ **Type Safety**
- Full Redux Toolkit integration
- Async thunk error handling
- Serializable state

---

**Created:** 2025-11-25  
**Version:** 1.0  
**Status:** Complete - Phase 1 MVP
