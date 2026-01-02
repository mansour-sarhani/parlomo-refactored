/**
 * @fileoverview Type definitions for complimentary ticket issuance system
 */

/**
 * Recipient information for complimentary tickets
 * @typedef {Object} RecipientInfo
 * @property {string} name - Recipient full name (max 255 chars)
 * @property {string} email - Recipient email address
 * @property {string} [phone] - Optional phone number (max 30 chars)
 */

/**
 * Ticket item for complimentary ticket request
 * @typedef {Object} TicketItem
 * @property {string} ticketTypeId - UUID of ticket type
 * @property {number} quantity - Number of tickets (1-50)
 */

/**
 * Request payload for issuing complimentary tickets
 * @typedef {Object} ComplimentaryTicketRequest
 * @property {TicketItem[]} ticket_items - Array of ticket types and quantities
 * @property {RecipientInfo} recipient - Recipient information
 * @property {string[]} [selected_seats] - Required for seated events. Array of seat labels (e.g., ["A-1", "A-2"])
 * @property {string} reason - Reason for issuing tickets (max 200 chars)
 * @property {string} [notes] - Additional notes (max 1000 chars)
 */

/**
 * Order information in complimentary ticket response
 * @typedef {Object} ComplimentaryOrderInfo
 * @property {string} id - Order UUID
 * @property {string} order_number - Order number (e.g., "ORD-2026-000123")
 * @property {string} status - Order status (will be "paid")
 * @property {number} total - Total amount (will be 0)
 * @property {string} currency - Currency code (e.g., "GBP")
 * @property {string} customer_email - Customer email
 * @property {string} customer_name - Customer name
 * @property {boolean} is_complimentary - Always true for complimentary tickets
 * @property {string} reason - Reason for issuance
 */

/**
 * Individual ticket information
 * @typedef {Object} ComplimentaryTicketInfo
 * @property {string} id - Ticket UUID
 * @property {string} code - Ticket QR code
 * @property {string} ticket_type_name - Name of ticket type
 * @property {string} [seat_label] - Seat label (for seated events, e.g., "A-1")
 * @property {string} [seat_display] - Formatted seat display (e.g., "Section: VIP, Row: A, Seat: 1")
 * @property {string} attendee_name - Attendee name
 * @property {string} attendee_email - Attendee email
 * @property {string} [status] - Ticket status (e.g., "valid", "used", "cancelled")
 */

/**
 * Response from issuing complimentary tickets
 * @typedef {Object} ComplimentaryTicketResult
 * @property {ComplimentaryOrderInfo} order - Order information
 * @property {number} ticket_count - Total number of tickets issued
 * @property {ComplimentaryTicketInfo[]} tickets - Array of ticket details
 */

/**
 * Summary of a complimentary ticket order (list view)
 * @typedef {Object} ComplimentaryTicketSummary
 * @property {string} id - Order UUID
 * @property {string} order_number - Order number
 * @property {string} customer_name - Recipient name
 * @property {string} customer_email - Recipient email
 * @property {number} ticket_count - Number of tickets in this order
 * @property {string} reason - Reason for issuance
 * @property {string} issued_by - UUID of user who issued the tickets
 * @property {string} [issued_by_name] - Name of user who issued the tickets
 * @property {string} created_at - ISO date string (e.g., "2026-01-02T11:00:00Z")
 */

/**
 * Detailed complimentary ticket order information
 * @typedef {Object} ComplimentaryTicketOrder
 * @property {string} id - Order UUID
 * @property {string} order_number - Order number
 * @property {Object} event - Event basic information
 * @property {string} event.id - Event UUID
 * @property {string} event.title - Event title
 * @property {string} customer_name - Customer name
 * @property {string} customer_email - Customer email
 * @property {string} [customer_phone] - Customer phone
 * @property {number} ticket_count - Total tickets in order
 * @property {string} reason - Issuance reason
 * @property {string} [notes] - Additional notes
 * @property {string} issued_by - User UUID who issued tickets
 * @property {string} issued_by_name - User name who issued tickets
 * @property {string} created_at - ISO date string
 * @property {ComplimentaryTicketInfo[]} tickets - Array of ticket details with seat info
 */

/**
 * API response wrapper for successful operations
 * @typedef {Object} ComplimentaryTicketApiResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {string} [message] - Success or error message
 * @property {ComplimentaryTicketResult | ComplimentaryTicketSummary[] | ComplimentaryTicketOrder} [data] - Response data
 */

/**
 * API error response structure
 * @typedef {Object} ComplimentaryTicketApiError
 * @property {boolean} success - Always false for errors
 * @property {string} message - Error message
 * @property {Object.<string, string[]>} [errors] - Validation errors (422 responses)
 */

export {};
