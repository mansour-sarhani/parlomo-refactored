/**
 * Ticket Generator Utility
 * Generates unique ticket codes and ticket instances
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate unique ticket code
 * Format: TKT-XXXXXXXXX (where X is alphanumeric)
 * @returns {string} Unique ticket code
 */
export function generateTicketCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TKT-';
    
    for (let i = 0; i < 9; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
}

/**
 * Generate multiple unique ticket codes
 * @param {number} count - Number of codes to generate
 * @returns {string[]} Array of unique ticket codes
 */
export function generateTicketCodes(count) {
    const codes = new Set();
    
    while (codes.size < count) {
        codes.add(generateTicketCode());
    }
    
    return Array.from(codes);
}

/**
 * Generate ticket instance data
 * @param {Object} params - Ticket parameters
 * @param {number} params.orderId - Order ID
 * @param {number} params.orderItemId - Order item ID
 * @param {number} params.ticketTypeId - Ticket type ID
 * @param {number} params.eventId - Event ID
 * @param {string} params.attendeeName - Attendee name
 * @param {string} params.attendeeEmail - Attendee email
 * @param {number} params.seatId - Seat ID (optional, for seated events)
 * @returns {Object} Ticket instance data
 */
export function generateTicketInstance(params) {
    const {
        orderId,
        orderItemId,
        ticketTypeId,
        eventId,
        attendeeName,
        attendeeEmail,
        seatId = null,
    } = params;

    const ticketCode = generateTicketCode();
    const ticketUUID = uuidv4();

    return {
        code: ticketCode,
        uuid: ticketUUID,
        orderId,
        orderItemId,
        ticketTypeId,
        eventId,
        seatId,
        attendeeName,
        attendeeEmail,
        status: 'valid',
        transferHistory: null,
        metadata: {
            generatedAt: new Date().toISOString(),
            version: '1.0',
        },
    };
}

/**
 * Generate multiple ticket instances
 * @param {Object} params - Base ticket parameters
 * @param {number} quantity - Number of tickets to generate
 * @returns {Object[]} Array of ticket instances
 */
export function generateTicketInstances(params, quantity) {
    const tickets = [];
    
    for (let i = 0; i < quantity; i++) {
        tickets.push(generateTicketInstance(params));
    }
    
    return tickets;
}

/**
 * Generate ticket number (sequential)
 * @param {number} eventId - Event ID
 * @param {number} sequence - Sequence number
 * @returns {string} Formatted ticket number
 */
export function generateTicketNumber(eventId, sequence) {
    return `E${eventId}-${String(sequence).padStart(6, '0')}`;
}

/**
 * Validate ticket code format
 * @param {string} code - Ticket code to validate
 * @returns {boolean} True if valid format
 */
export function isValidTicketCode(code) {
    if (!code || typeof code !== 'string') {
        return false;
    }

    // Check format: TKT-XXXXXXXXX
    const pattern = /^TKT-[A-Z0-9]{9}$/;
    return pattern.test(code);
}

/**
 * Parse ticket code to extract components
 * @param {string} code - Ticket code
 * @returns {Object|null} Parsed components or null if invalid
 */
export function parseTicketCode(code) {
    if (!isValidTicketCode(code)) {
        return null;
    }

    const parts = code.split('-');
    
    return {
        prefix: parts[0],
        identifier: parts[1],
        fullCode: code,
    };
}

/**
 * Generate barcode number (for alternative scanning methods)
 * @param {number} ticketId - Ticket ID
 * @returns {string} Barcode number
 */
export function generateBarcodeNumber(ticketId) {
    // Generate a 13-digit barcode (EAN-13 format)
    const prefix = '200'; // Custom prefix for tickets
    const ticketIdPadded = String(ticketId).padStart(9, '0');
    const baseNumber = prefix + ticketIdPadded;
    
    // Calculate check digit
    let sum = 0;
    for (let i = 0; i < baseNumber.length; i++) {
        const digit = parseInt(baseNumber[i]);
        sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    return baseNumber + checkDigit;
}

/**
 * Generate ticket metadata
 * @param {Object} params - Metadata parameters
 * @returns {Object} Ticket metadata
 */
export function generateTicketMetadata(params = {}) {
    return {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        source: 'parlomo-ticketing',
        ...params,
    };
}

/**
 * Create ticket transfer record
 * @param {Object} params - Transfer parameters
 * @param {string} params.fromEmail - Original owner email
 * @param {string} params.toEmail - New owner email
 * @param {number} params.transferredBy - User ID who initiated transfer
 * @returns {Object} Transfer record
 */
export function createTransferRecord(params) {
    const { fromEmail, toEmail, transferredBy } = params;

    return {
        id: uuidv4(),
        fromEmail,
        toEmail,
        transferredBy,
        transferredAt: new Date().toISOString(),
        status: 'completed',
    };
}

/**
 * Validate ticket status
 * @param {string} status - Ticket status
 * @returns {boolean} True if valid status
 */
export function isValidTicketStatus(status) {
    const validStatuses = ['valid', 'used', 'cancelled', 'transferred', 'refunded'];
    return validStatuses.includes(status);
}

/**
 * Get ticket status display
 * @param {string} status - Ticket status
 * @returns {Object} Display information
 */
export function getTicketStatusDisplay(status) {
    const statusMap = {
        valid: {
            label: 'Valid',
            color: 'green',
            icon: 'check-circle',
            description: 'This ticket is valid and ready to use',
        },
        used: {
            label: 'Used',
            color: 'gray',
            icon: 'check',
            description: 'This ticket has been scanned and used',
        },
        cancelled: {
            label: 'Cancelled',
            color: 'red',
            icon: 'x-circle',
            description: 'This ticket has been cancelled',
        },
        transferred: {
            label: 'Transferred',
            color: 'blue',
            icon: 'arrow-right',
            description: 'This ticket has been transferred to another person',
        },
        refunded: {
            label: 'Refunded',
            color: 'orange',
            icon: 'rotate-ccw',
            description: 'This ticket has been refunded',
        },
    };

    return statusMap[status] || {
        label: 'Unknown',
        color: 'gray',
        icon: 'help-circle',
        description: 'Unknown ticket status',
    };
}

/**
 * Check if ticket can be transferred
 * @param {Object} ticket - Ticket object
 * @param {Object} ticketType - Ticket type object
 * @returns {Object} Transfer eligibility
 */
export function canTransferTicket(ticket, ticketType) {
    if (!ticketType.transferAllowed) {
        return {
            canTransfer: false,
            reason: 'This ticket type does not allow transfers',
        };
    }

    if (ticket.status !== 'valid') {
        return {
            canTransfer: false,
            reason: `Cannot transfer ${ticket.status} tickets`,
        };
    }

    return {
        canTransfer: true,
    };
}

/**
 * Check if ticket can be refunded
 * @param {Object} ticket - Ticket object
 * @param {Object} ticketType - Ticket type object
 * @param {Date} eventDate - Event date
 * @returns {Object} Refund eligibility
 */
export function canRefundTicket(ticket, ticketType, eventDate) {
    if (!ticketType.refundable) {
        return {
            canRefund: false,
            reason: 'This ticket type is non-refundable',
        };
    }

    if (ticket.status !== 'valid') {
        return {
            canRefund: false,
            reason: `Cannot refund ${ticket.status} tickets`,
        };
    }

    // Check if event has already passed
    if (eventDate && new Date(eventDate) < new Date()) {
        return {
            canRefund: false,
            reason: 'Cannot refund tickets for past events',
        };
    }

    return {
        canRefund: true,
    };
}
