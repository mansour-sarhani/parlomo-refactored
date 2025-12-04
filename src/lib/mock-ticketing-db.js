/**
 * @fileoverview Mock Ticketing Database
 * JSON file-based mock database for ticketing system
 * Provides CRUD operations with persistence to JSON files
 */

import fs from 'fs';
import path from 'path';

// Path to mock data directory
const MOCK_DATA_DIR = path.join(process.cwd(), 'public', 'mock-data', 'ticketing');

// Ensure directory exists
if (!fs.existsSync(MOCK_DATA_DIR)) {
    fs.mkdirSync(MOCK_DATA_DIR, { recursive: true });
}

/**
 * Read data from JSON file
 * @param {string} filename - Name of the JSON file
 * @returns {Object} Parsed JSON data
 */
function readData(filename) {
    const filePath = path.join(MOCK_DATA_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return {};
    }

    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return {};
    }
}

/**
 * Write data to JSON file
 * @param {string} filename - Name of the JSON file
 * @param {Object} data - Data to write
 */
function writeData(filename, data) {
    const filePath = path.join(MOCK_DATA_DIR, filename);

    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
    }
}

/**
 * Generate next ID for a collection
 * @param {Object} collection - Collection object
 * @returns {number} Next available ID
 */
function getNextId(collection) {
    const ids = Object.keys(collection).map(Number);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

// ==================== TICKET TYPES ====================

/**
 * Get all ticket types
 * @returns {Object} Ticket types indexed by ID
 */
export function getAllTicketTypes() {
    return readData('ticket-types.json');
}

/**
 * Get ticket types for a specific event
 * @param {number} eventId - Event ID
 * @returns {Array} Array of ticket types
 */
export function getTicketTypesByEvent(eventId) {
    const ticketTypes = getAllTicketTypes();
    return Object.values(ticketTypes).filter(tt => tt.eventId === eventId);
}

/**
 * Get single ticket type by ID
 * @param {number} id - Ticket type ID
 * @returns {Object|null} Ticket type or null
 */
export function getTicketType(id) {
    const ticketTypes = getAllTicketTypes();
    return ticketTypes[id] || null;
}

/**
 * Create new ticket type
 * @param {Object} ticketTypeData - Ticket type data
 * @returns {Object} Created ticket type
 */
export function createTicketType(ticketTypeData) {
    const ticketTypes = getAllTicketTypes();
    const id = getNextId(ticketTypes);

    const newTicketType = {
        id,
        ...ticketTypeData,
        sold: 0,
        reserved: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    ticketTypes[id] = newTicketType;
    writeData('ticket-types.json', ticketTypes);

    return newTicketType;
}

/**
 * Update ticket type
 * @param {number} id - Ticket type ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated ticket type or null
 */
export function updateTicketType(id, updates) {
    const ticketTypes = getAllTicketTypes();

    if (!ticketTypes[id]) {
        return null;
    }

    ticketTypes[id] = {
        ...ticketTypes[id],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    writeData('ticket-types.json', ticketTypes);
    return ticketTypes[id];
}

/**
 * Reserve ticket inventory
 * @param {number} ticketTypeId - Ticket type ID
 * @param {number} quantity - Quantity to reserve
 * @returns {boolean} Success status
 */
export function reserveTickets(ticketTypeId, quantity) {
    const ticketType = getTicketType(ticketTypeId);

    if (!ticketType) {
        return false;
    }

    const available = ticketType.capacity - ticketType.sold - ticketType.reserved;

    if (available < quantity) {
        return false;
    }

    updateTicketType(ticketTypeId, {
        reserved: ticketType.reserved + quantity,
    });

    return true;
}

/**
 * Release reserved tickets
 * @param {number} ticketTypeId - Ticket type ID
 * @param {number} quantity - Quantity to release
 */
export function releaseTickets(ticketTypeId, quantity) {
    const ticketType = getTicketType(ticketTypeId);

    if (!ticketType) {
        return;
    }

    updateTicketType(ticketTypeId, {
        reserved: Math.max(0, ticketType.reserved - quantity),
    });
}

/**
 * Mark tickets as sold
 * @param {number} ticketTypeId - Ticket type ID
 * @param {number} quantity - Quantity sold
 */
export function markTicketsSold(ticketTypeId, quantity) {
    const ticketType = getTicketType(ticketTypeId);

    if (!ticketType) {
        return;
    }

    updateTicketType(ticketTypeId, {
        sold: ticketType.sold + quantity,
        reserved: Math.max(0, ticketType.reserved - quantity),
    });
}

// ==================== ORDERS ====================

/**
 * Get all orders
 * @returns {Object} Orders indexed by ID
 */
export function getAllOrders() {
    return readData('orders.json');
}

/**
 * Get order by ID
 * @param {number} id - Order ID
 * @returns {Object|null} Order or null
 */
export function getOrder(id) {
    const orders = getAllOrders();
    return orders[id] || null;
}

/**
 * Get orders by user ID
 * @param {number} userId - User ID
 * @returns {Array} Array of orders
 */
export function getOrdersByUser(userId) {
    const orders = getAllOrders();
    return Object.values(orders).filter(order => order.userId === userId);
}

/**
 * Get orders by event ID
 * @param {number} eventId - Event ID
 * @returns {Array} Array of orders
 */
export function getOrdersByEvent(eventId) {
    const orders = getAllOrders();
    return Object.values(orders).filter(order => order.eventId === eventId);
}

/**
 * Create new order
 * @param {Object} orderData - Order data
 * @returns {Object} Created order
 */
export function createOrder(orderData) {
    const orders = getAllOrders();
    const id = getNextId(orders);

    const orderNumber = `ORD-${new Date().getFullYear()}-${String(id).padStart(6, '0')}`;

    const newOrder = {
        id,
        orderNumber,
        status: 'pending',
        ...orderData,
        createdAt: new Date().toISOString(),
        paidAt: null,
        cancelledAt: null,
    };

    orders[id] = newOrder;
    writeData('orders.json', orders);

    return newOrder;
}

/**
 * Update order
 * @param {number} id - Order ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated order or null
 */
export function updateOrder(id, updates) {
    const orders = getAllOrders();

    if (!orders[id]) {
        return null;
    }

    orders[id] = {
        ...orders[id],
        ...updates,
    };

    // Set paidAt timestamp if status changed to paid
    if (updates.status === 'paid' && !orders[id].paidAt) {
        orders[id].paidAt = new Date().toISOString();
    }

    // Set cancelledAt timestamp if status changed to cancelled
    if (updates.status === 'cancelled' && !orders[id].cancelledAt) {
        orders[id].cancelledAt = new Date().toISOString();
    }

    writeData('orders.json', orders);
    return orders[id];
}

// ==================== ORDER ITEMS ====================

/**
 * Get all order items
 * @returns {Object} Order items indexed by ID
 */
export function getAllOrderItems() {
    return readData('order-items.json');
}

/**
 * Get order items by order ID
 * @param {number} orderId - Order ID
 * @returns {Array} Array of order items
 */
export function getOrderItemsByOrder(orderId) {
    const orderItems = getAllOrderItems();
    return Object.values(orderItems).filter(item => item.orderId === orderId);
}

/**
 * Create order item
 * @param {Object} itemData - Order item data
 * @returns {Object} Created order item
 */
export function createOrderItem(itemData) {
    const orderItems = getAllOrderItems();
    const id = getNextId(orderItems);

    const newItem = {
        id,
        ...itemData,
    };

    orderItems[id] = newItem;
    writeData('order-items.json', orderItems);

    return newItem;
}

// ==================== TICKETS ====================

/**
 * Get all tickets
 * @returns {Object} Tickets indexed by ID
 */
export function getAllTickets() {
    return readData('tickets.json');
}

/**
 * Get ticket by ID
 * @param {number} id - Ticket ID
 * @returns {Object|null} Ticket or null
 */
export function getTicket(id) {
    const tickets = getAllTickets();
    return tickets[id] || null;
}

/**
 * Get ticket by code
 * @param {string} code - Ticket code
 * @returns {Object|null} Ticket or null
 */
export function getTicketByCode(code) {
    const tickets = getAllTickets();
    return Object.values(tickets).find(ticket => ticket.code === code) || null;
}

/**
 * Get tickets by order ID
 * @param {number} orderId - Order ID
 * @returns {Array} Array of tickets
 */
export function getTicketsByOrder(orderId) {
    const tickets = getAllTickets();
    return Object.values(tickets).filter(ticket => ticket.orderId === orderId);
}

/**
 * Create ticket
 * @param {Object} ticketData - Ticket data
 * @returns {Object} Created ticket
 */
export function createTicket(ticketData) {
    const tickets = getAllTickets();
    const id = getNextId(tickets);

    const newTicket = {
        id,
        status: 'valid',
        ...ticketData,
        usedAt: null,
        usedBy: null,
        createdAt: new Date().toISOString(),
    };

    tickets[id] = newTicket;
    writeData('tickets.json', tickets);

    return newTicket;
}

/**
 * Update ticket
 * @param {number} id - Ticket ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated ticket or null
 */
export function updateTicket(id, updates) {
    const tickets = getAllTickets();

    if (!tickets[id]) {
        return null;
    }

    tickets[id] = {
        ...tickets[id],
        ...updates,
    };

    // Set usedAt timestamp if status changed to used
    if (updates.status === 'used' && !tickets[id].usedAt) {
        tickets[id].usedAt = new Date().toISOString();
    }

    writeData('tickets.json', tickets);
    return tickets[id];
}

// ==================== PROMO CODES ====================

/**
 * Get all promo codes
 * @returns {Object} Promo codes indexed by ID
 */
export function getAllPromoCodes() {
    return readData('promo-codes.json');
}

/**
 * Get promo code by code string
 * @param {string} code - Promo code string
 * @returns {Object|null} Promo code or null
 */
export function getPromoCodeByCode(code) {
    const promoCodes = getAllPromoCodes();
    return Object.values(promoCodes).find(pc => pc.code.toLowerCase() === code.toLowerCase()) || null;
}

/**
 * Create promo code
 * @param {Object} promoData - Promo code data
 * @returns {Object} Created promo code
 */
export function createPromoCode(promoData) {
    const promoCodes = getAllPromoCodes();
    const id = getNextId(promoCodes);

    const newPromo = {
        id,
        currentUses: 0,
        active: true,
        ...promoData,
        createdAt: new Date().toISOString(),
    };

    promoCodes[id] = newPromo;
    writeData('promo-codes.json', promoCodes);

    return newPromo;
}

/**
 * Get promo codes for a specific event
 * @param {number} eventId - Event ID
 * @returns {Array} Array of promo codes
 */
export function getPromoCodesByEvent(eventId) {
    const promoCodes = getAllPromoCodes();
    return Object.values(promoCodes).filter(pc => pc.eventId === eventId);
}

/**
 * Update promo code
 * @param {number} id - Promo code ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated promo code or null
 */
export function updatePromoCode(id, updates) {
    const promoCodes = getAllPromoCodes();

    if (!promoCodes[id]) {
        return null;
    }

    promoCodes[id] = {
        ...promoCodes[id],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    writeData('promo-codes.json', promoCodes);
    return promoCodes[id];
}

/**
 * Delete promo code
 * @param {number} id - Promo code ID
 * @returns {boolean} Success status
 */
export function deletePromoCode(id) {
    const promoCodes = getAllPromoCodes();

    if (!promoCodes[id]) {
        return false;
    }

    delete promoCodes[id];
    writeData('promo-codes.json', promoCodes);
    return true;
}

/**
 * Increment promo code usage
 * @param {number} id - Promo code ID
 * @returns {Object|null} Updated promo code or null
 */
export function incrementPromoUse(id) {
    const promoCodes = getAllPromoCodes();

    if (!promoCodes[id]) {
        return null;
    }

    promoCodes[id].currentUses += 1;
    writeData('promo-codes.json', promoCodes);

    return promoCodes[id];
}

// ==================== FEES ====================

/**
 * Get all fees
 * @returns {Object} Fees indexed by ID
 */
export function getAllFees() {
    return readData('fees.json');
}

/**
 * Get active fees
 * @returns {Array} Array of active fees
 */
export function getActiveFees() {
    const fees = getAllFees();
    return Object.values(fees).filter(fee => fee.active);
}

/**
 * Create fee
 * @param {Object} feeData - Fee data
 * @returns {Object} Created fee
 */
export function createFee(feeData) {
    const fees = getAllFees();
    const id = getNextId(fees);

    const newFee = {
        id,
        active: true,
        ...feeData,
    };

    fees[id] = newFee;
    writeData('fees.json', fees);

    return newFee;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Reset all data (for testing)
 */
export function resetAllData() {
    writeData('ticket-types.json', {});
    writeData('orders.json', {});
    writeData('order-items.json', {});
    writeData('tickets.json', {});
    writeData('promo-codes.json', {});
    writeData('fees.json', {});
    writeData('settlement-requests.json', {});
    writeData('refund-requests.json', {});
}

/**
 * Get database statistics
 * @returns {Object} Statistics
 */
export function getStats() {
    return {
        ticketTypes: Object.keys(getAllTicketTypes()).length,
        orders: Object.keys(getAllOrders()).length,
        orderItems: Object.keys(getAllOrderItems()).length,
        tickets: Object.keys(getAllTickets()).length,
        promoCodes: Object.keys(getAllPromoCodes()).length,
        fees: Object.keys(getAllFees()).length,
    };
}

// ==================== SETTLEMENT REQUESTS ====================

/**
 * Get all settlement requests
 * @returns {Object} Settlement requests indexed by ID
 */
export function getAllSettlementRequests() {
    return readData('settlement-requests.json');
}

/**
 * Get settlement request by ID
 * @param {string} id - Settlement request ID
 * @returns {Object|null} Settlement request or null
 */
export function getSettlementRequest(id) {
    const requests = getAllSettlementRequests();
    return requests[id] || null;
}

/**
 * Get settlement requests by organizer ID
 * @param {string} organizerId - Organizer ID
 * @returns {Array} Array of settlement requests
 */
export function getSettlementRequestsByOrganizer(organizerId) {
    const requests = getAllSettlementRequests();
    return Object.values(requests).filter(req => req.organizerId === organizerId);
}

/**
 * Create new settlement request
 * @param {Object} requestData - Settlement request data
 * @returns {Object} Created settlement request
 */
export function createSettlementRequest(requestData) {
    const requests = getAllSettlementRequests();
    const id = getNextId(requests);

    const newRequest = {
        id: String(id),
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
        ...requestData,
    };

    requests[id] = newRequest;
    writeData('settlement-requests.json', requests);

    return newRequest;
}

/**
 * Update settlement request
 * @param {string} id - Settlement request ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated settlement request or null
 */
export function updateSettlementRequest(id, updates) {
    const requests = getAllSettlementRequests();

    if (!requests[id]) {
        return null;
    }

    requests[id] = {
        ...requests[id],
        ...updates,
    };

    if ((updates.status === 'APPROVED' || updates.status === 'REJECTED' || updates.status === 'PAID') && !requests[id].processedAt) {
        requests[id].processedAt = new Date().toISOString();
    }

    writeData('settlement-requests.json', requests);
    return requests[id];
}

// ==================== REFUND REQUESTS ====================

/**
 * Get all refund requests
 * @returns {Object} Refund requests indexed by ID
 */
export function getAllRefundRequests() {
    return readData('refund-requests.json');
}

/**
 * Get refund request by ID
 * @param {string} id - Refund request ID
 * @returns {Object|null} Refund request or null
 */
export function getRefundRequest(id) {
    const requests = getAllRefundRequests();
    return requests[id] || null;
}

/**
 * Get refund requests by organizer ID
 * @param {string} organizerId - Organizer ID
 * @returns {Array} Array of refund requests
 */
export function getRefundRequestsByOrganizer(organizerId) {
    const requests = getAllRefundRequests();
    return Object.values(requests).filter(req => req.organizerId === organizerId);
}

/**
 * Create new refund request
 * @param {Object} requestData - Refund request data
 * @returns {Object} Created refund request
 */
export function createRefundRequest(requestData) {
    const requests = getAllRefundRequests();
    const id = getNextId(requests);

    const newRequest = {
        id: String(id),
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
        ...requestData,
    };

    requests[id] = newRequest;
    writeData('refund-requests.json', requests);

    return newRequest;
}

/**
 * Update refund request
 * @param {string} id - Refund request ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated refund request or null
 */
export function updateRefundRequest(id, updates) {
    const requests = getAllRefundRequests();

    if (!requests[id]) {
        return null;
    }

    requests[id] = {
        ...requests[id],
        ...updates,
    };

    if ((updates.status === 'APPROVED' || updates.status === 'REJECTED' || updates.status === 'PROCESSED') && !requests[id].processedAt) {
        requests[id].processedAt = new Date().toISOString();
    }

    writeData('refund-requests.json', requests);
    return requests[id];
}
