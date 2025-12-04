/**
 * @fileoverview Ticketing Platform Type Definitions
 * JSDoc type definitions for the entire ticketing domain
 */

/**
 * @typedef {Object} TicketType
 * @property {number} id - Unique identifier
 * @property {number} eventId - Associated event ID
 * @property {string} name - Ticket type name (e.g., "General Admission", "VIP")
 * @property {string} description - Detailed description
 * @property {string} sku - Stock keeping unit / unique code
 * @property {number} price - Price in cents
 * @property {string} currency - Currency code (e.g., "USD", "EUR")
 * @property {number} capacity - Total available tickets
 * @property {number} sold - Number of tickets sold
 * @property {number} reserved - Number of tickets currently reserved/held
 * @property {boolean} visible - Whether visible to public
 * @property {number} minPerOrder - Minimum tickets per order
 * @property {number} maxPerOrder - Maximum tickets per order
 * @property {boolean} refundable - Whether tickets can be refunded
 * @property {boolean} transferAllowed - Whether tickets can be transferred
 * @property {Date|string} saleStartsAt - When sales begin
 * @property {Date|string} saleEndsAt - When sales end
 * @property {Object} settings - Additional settings (JSON)
 * @property {Date|string} createdAt - Creation timestamp
 * @property {Date|string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} Order
 * @property {number} id - Unique identifier
 * @property {string} orderNumber - Human-readable order number (e.g., "ORD-2024-001234")
 * @property {number} userId - Buyer user ID
 * @property {number} eventId - Associated event ID
 * @property {string} status - Order status: 'pending' | 'paid' | 'cancelled' | 'refunded'
 * @property {number} subtotal - Subtotal in cents (before fees/discounts)
 * @property {number} discount - Discount amount in cents
 * @property {number} fees - Total fees in cents
 * @property {number} total - Final total in cents
 * @property {string} currency - Currency code
 * @property {number|null} promoCodeId - Applied promo code ID (if any)
 * @property {string|null} promoCode - Applied promo code string
 * @property {string|null} paymentIntentId - Stripe payment intent ID
 * @property {string|null} paymentMethod - Payment method used
 * @property {Object} buyerInfo - Buyer information (name, email, phone)
 * @property {Object} metadata - Additional metadata (JSON)
 * @property {Date|string} createdAt - Order creation timestamp
 * @property {Date|string} paidAt - Payment completion timestamp
 * @property {Date|string|null} cancelledAt - Cancellation timestamp
 */

/**
 * @typedef {Object} OrderItem
 * @property {number} id - Unique identifier
 * @property {number} orderId - Parent order ID
 * @property {number} ticketTypeId - Associated ticket type ID
 * @property {number|null} seatId - Associated seat ID (for seated events, Phase 2)
 * @property {number} quantity - Number of tickets
 * @property {number} unitPrice - Price per ticket in cents
 * @property {number} discount - Discount per ticket in cents
 * @property {number} subtotal - Line item subtotal (quantity × unitPrice)
 * @property {string} ticketTypeName - Snapshot of ticket type name
 * @property {Object} metadata - Additional metadata
 */

/**
 * @typedef {Object} Ticket
 * @property {number} id - Unique identifier
 * @property {number} orderId - Parent order ID
 * @property {number} orderItemId - Parent order item ID
 * @property {number} ticketTypeId - Associated ticket type ID
 * @property {number|null} seatId - Associated seat ID (Phase 2)
 * @property {string} code - Unique ticket code (e.g., "TKT-ABC123XYZ")
 * @property {string} qrPayload - QR code payload (signed JWT)
 * @property {string} status - Ticket status: 'valid' | 'used' | 'cancelled' | 'transferred'
 * @property {string} attendeeName - Attendee name
 * @property {string} attendeeEmail - Attendee email
 * @property {Object|null} transferHistory - Transfer history (JSON array)
 * @property {Object} metadata - Additional metadata
 * @property {Date|string|null} usedAt - Check-in timestamp
 * @property {number|null} usedBy - Staff user ID who scanned
 * @property {Date|string} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} PromoCode
 * @property {number} id - Unique identifier
 * @property {string} code - Promo code string (e.g., "EARLY2024")
 * @property {string} type - Discount type: 'percent' | 'fixed'
 * @property {number} amount - Discount amount (percentage 0-100 or cents)
 * @property {Date|string} validFrom - Start of validity period
 * @property {Date|string} validTo - End of validity period
 * @property {number} maxUses - Maximum total uses (0 = unlimited)
 * @property {number} currentUses - Current number of uses
 * @property {number} maxPerUser - Maximum uses per user (0 = unlimited)
 * @property {number[]|null} appliesToTicketTypeIds - Applicable ticket type IDs (null = all)
 * @property {number|null} minOrderValue - Minimum order value in cents
 * @property {boolean} active - Whether promo is active
 * @property {Object} metadata - Additional metadata
 * @property {Date|string} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} Fee
 * @property {number} id - Unique identifier
 * @property {string} name - Fee name (e.g., "Service Fee", "Processing Fee")
 * @property {string} type - Fee type: 'fixed' | 'percent' | 'per_ticket' | 'per_order'
 * @property {number} amount - Fee amount (cents or percentage)
 * @property {string} payer - Who pays: 'buyer' | 'organizer'
 * @property {number|null} cap - Maximum fee amount in cents (null = no cap)
 * @property {string} appliesTo - What it applies to: 'all' | 'specific_events' | 'specific_ticket_types'
 * @property {number[]|null} applicableIds - IDs of events/ticket types (if specific)
 * @property {boolean} taxable - Whether fee is taxable
 * @property {boolean} active - Whether fee is active
 * @property {Object} metadata - Additional metadata
 */

/**
 * @typedef {Object} SeatChart
 * @property {number} id - Unique identifier
 * @property {number} venueId - Associated venue ID
 * @property {string} name - Chart name (e.g., "Main Hall Layout")
 * @property {Object} chartData - Seat chart configuration (JSON)
 * @property {number} totalCapacity - Total number of seats
 * @property {Object} sections - Sections/zones configuration
 * @property {Date|string} createdAt - Creation timestamp
 * @property {Date|string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} Seat
 * @property {number} id - Unique identifier
 * @property {number} seatChartId - Parent seat chart ID
 * @property {string} section - Section/zone name
 * @property {string} row - Row identifier
 * @property {string} number - Seat number
 * @property {string} label - Display label (e.g., "A-12")
 * @property {string} status - Seat status: 'available' | 'held' | 'sold' | 'blocked'
 * @property {number|null} heldBy - Order ID holding the seat (temporary)
 * @property {Date|string|null} heldUntil - Hold expiration timestamp
 * @property {number|null} soldTo - Order ID that purchased the seat
 * @property {number} priceLevel - Price level/tier
 * @property {Object} metadata - Additional metadata (accessibility, etc.)
 */

/**
 * @typedef {Object} Payout
 * @property {number} id - Unique identifier
 * @property {number} organizerId - Organizer user ID
 * @property {number} eventId - Associated event ID
 * @property {number} amount - Payout amount in cents
 * @property {string} currency - Currency code
 * @property {string} status - Payout status: 'pending' | 'processing' | 'paid' | 'failed'
 * @property {string|null} stripePayoutId - Stripe payout ID
 * @property {Date|string} periodStart - Payout period start
 * @property {Date|string} periodEnd - Payout period end
 * @property {Object} breakdown - Revenue breakdown (tickets, fees, refunds)
 * @property {Date|string} createdAt - Creation timestamp
 * @property {Date|string|null} paidAt - Payment completion timestamp
 */

/**
 * @typedef {Object} CheckoutSession
 * @property {string} sessionId - Unique session identifier
 * @property {number} eventId - Associated event ID
 * @property {Object[]} cartItems - Cart items with ticket type IDs and quantities
 * @property {number} subtotal - Subtotal in cents
 * @property {number} discount - Discount amount in cents
 * @property {number} fees - Total fees in cents
 * @property {number} total - Final total in cents
 * @property {string|null} promoCode - Applied promo code
 * @property {Date|string} expiresAt - Session expiration timestamp
 * @property {Object} reservedInventory - Reserved ticket type IDs and quantities
 */

/**
 * @typedef {Object} ScanResult
 * @property {boolean} valid - Whether ticket is valid
 * @property {string} message - Result message
 * @property {Ticket|null} ticket - Ticket details (if valid)
 * @property {Object|null} event - Event details (if valid)
 * @property {string|null} error - Error message (if invalid)
 */

/**
 * @typedef {Object} FeeBreakdown
 * @property {number} subtotal - Subtotal before fees/discounts
 * @property {number} discount - Total discount amount
 * @property {Object[]} fees - Array of individual fees
 * @property {number} fees[].id - Fee ID
 * @property {string} fees[].name - Fee name
 * @property {number} fees[].amount - Fee amount in cents
 * @property {number} total - Final total
 * @property {string} currency - Currency code
 */

/**
 * @typedef {Object} AttendeeInfo
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} email - Email address
 * @property {string|null} phone - Phone number
 * @property {Object} metadata - Additional attendee data
 */

/**
 * @typedef {Object} CartItem
 * @property {number} ticketTypeId - Ticket type ID
 * @property {string} ticketTypeName - Ticket type name
 * @property {number} quantity - Quantity selected
 * @property {number} unitPrice - Price per ticket in cents
 * @property {number} subtotal - Line subtotal (quantity × unitPrice)
 */

export default {};
