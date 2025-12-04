/**
 * @fileoverview MongoDB Ticketing Database Access Layer
 * Provides CRUD operations for ticketing system using MongoDB
 * Replaces mock-ticketing-db.js JSON file-based storage
 */

import { connectDB } from './mongodb.js';
import {
    PublicEvent,
    TicketType,
    Order,
    OrderItem,
    Ticket,
    PromoCode,
    Fee,
    SettlementRequest,
    RefundRequest,
} from '@/models/ticketing/index.js';
import { isValidObjectId, toObjectId } from './utils/objectid-helpers.js';

// ==================== TICKET TYPES ====================

/**
 * Get all ticket types
 * @returns {Promise<Array>} Array of ticket types
 */
export async function getAllTicketTypes() {
    await connectDB();
    const ticketTypes = await TicketType.find().lean();
    
    // Convert to object format for backward compatibility
    const result = {};
    ticketTypes.forEach(tt => {
        result[tt._id.toString()] = {
            ...tt,
            id: tt._id.toString(),
        };
    });
    return result;
}

/**
 * Get ticket types for a specific event
 * @param {string} eventId - Event ID (ObjectId)
 * @returns {Promise<Array>} Array of ticket types
 */
export async function getTicketTypesByEvent(eventId) {
    await connectDB();
    const eventObjectId = toObjectId(eventId);
    if (!eventObjectId) return [];

    const ticketTypes = await TicketType.findByEvent(eventObjectId)
        .populate('eventId')
        .lean();
    return ticketTypes.map(tt => ({
        ...tt,
        id: tt._id.toString(),
    }));
}

/**
 * Get single ticket type by ID
 * @param {string} id - Ticket type ID
 * @returns {Promise<Object|null>} Ticket type or null
 */
export async function getTicketType(id) {
    await connectDB();
    const ticketType = await TicketType.findById(id).lean();
    if (!ticketType) return null;
    
    return {
        ...ticketType,
        id: ticketType._id.toString(),
    };
}

/**
 * Create new ticket type
 * @param {Object} ticketTypeData - Ticket type data
 * @returns {Promise<Object>} Created ticket type
 */
export async function createTicketType(ticketTypeData) {
    await connectDB();
    const ticketType = new TicketType(ticketTypeData);
    await ticketType.save();
    
    return {
        ...ticketType.toObject(),
        id: ticketType._id.toString(),
    };
}

/**
 * Update ticket type
 * @param {string} id - Ticket type ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated ticket type or null
 */
export async function updateTicketType(id, updates) {
    await connectDB();
    const ticketType = await TicketType.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
    ).lean();
    
    if (!ticketType) return null;
    
    return {
        ...ticketType,
        id: ticketType._id.toString(),
    };
}

/**
 * Reserve ticket inventory
 * @param {string} ticketTypeId - Ticket type ID
 * @param {number} quantity - Quantity to reserve
 * @returns {Promise<boolean>} Success status
 */
export async function reserveTickets(ticketTypeId, quantity) {
    await connectDB();
    
    try {
        const ticketType = await TicketType.findById(ticketTypeId);
        if (!ticketType) return false;
        
        await ticketType.reserve(quantity);
        return true;
    } catch (error) {
        console.error('Error reserving tickets:', error);
        return false;
    }
}

/**
 * Release reserved tickets
 * @param {string} ticketTypeId - Ticket type ID
 * @param {number} quantity - Quantity to release
 * @returns {Promise<void>}
 */
export async function releaseTickets(ticketTypeId, quantity) {
    await connectDB();
    
    const ticketType = await TicketType.findById(ticketTypeId);
    if (ticketType) {
        await ticketType.release(quantity);
    }
}

/**
 * Mark tickets as sold
 * @param {string} ticketTypeId - Ticket type ID
 * @param {number} quantity - Quantity sold
 * @returns {Promise<void>}
 */
export async function markTicketsSold(ticketTypeId, quantity) {
    await connectDB();
    
    const ticketType = await TicketType.findById(ticketTypeId);
    if (ticketType) {
        await ticketType.markSold(quantity);
    }
}

// ==================== ORDERS ====================

/**
 * Get all orders
 * @returns {Promise<Object>} Orders indexed by ID
 */
export async function getAllOrders() {
    await connectDB();
    const orders = await Order.find()
        .populate('promoCodeId')
        .populate('eventId')
        .lean();
    
    const result = {};
    orders.forEach(order => {
        result[order._id.toString()] = {
            ...order,
            id: order._id.toString(),
        };
    });
    return result;
}

/**
 * Get order by ID
 * @param {string} id - Order ID
 * @returns {Promise<Object|null>} Order or null
 */
export async function getOrder(id) {
    await connectDB();
    const order = await Order.findById(id)
        .populate('promoCodeId')
        .populate('eventId')
        .lean();
    if (!order) return null;
    
    return {
        ...order,
        id: order._id.toString(),
    };
}

/**
 * Get orders by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of orders
 */
export async function getOrdersByUser(userId) {
    await connectDB();
    const orders = await Order.findByUser(userId)
        .populate('promoCodeId')
        .populate('eventId')
        .lean();
    return orders.map(order => ({
        ...order,
        id: order._id.toString(),
    }));
}

/**
 * Get orders by event ID
 * @param {string} eventId - Event ID (ObjectId)
 * @returns {Promise<Array>} Array of orders
 */
export async function getOrdersByEvent(eventId) {
    await connectDB();
    const eventObjectId = toObjectId(eventId);
    if (!eventObjectId) return [];

    const orders = await Order.findByEvent(eventObjectId)
        .populate('promoCodeId')
        .populate('eventId')
        .lean();
    return orders.map(order => ({
        ...order,
        id: order._id.toString(),
    }));
}

/**
 * Create new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Created order
 */
export async function createOrder(orderData) {
    await connectDB();
    
    // Generate order number
    const orderNumber = await Order.generateOrderNumber();
    
    const order = new Order({
        ...orderData,
        orderNumber,
        status: 'pending',
    });
    
    await order.save();
    
    return {
        ...order.toObject(),
        id: order._id.toString(),
    };
}

/**
 * Update order
 * @param {string} id - Order ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated order or null
 */
export async function updateOrder(id, updates) {
    await connectDB();
    const order = await Order.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
    )
        .populate('promoCodeId')
        .populate('eventId')
        .lean();
    
    if (!order) return null;
    
    return {
        ...order,
        id: order._id.toString(),
    };
}

// ==================== ORDER ITEMS ====================

/**
 * Get all order items
 * @returns {Promise<Object>} Order items indexed by ID
 */
export async function getAllOrderItems() {
    await connectDB();
    const items = await OrderItem.find().lean();
    
    const result = {};
    items.forEach(item => {
        result[item._id.toString()] = {
            ...item,
            id: item._id.toString(),
        };
    });
    return result;
}

/**
 * Get order items by order ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Array>} Array of order items
 */
export async function getOrderItemsByOrder(orderId) {
    await connectDB();
    const items = await OrderItem.findByOrder(orderId).lean();
    return items.map(item => ({
        ...item,
        id: item._id.toString(),
    }));
}

/**
 * Create order item
 * @param {Object} itemData - Order item data
 * @returns {Promise<Object>} Created order item
 */
export async function createOrderItem(itemData) {
    await connectDB();
    const item = new OrderItem(itemData);
    await item.save();
    
    return {
        ...item.toObject(),
        id: item._id.toString(),
    };
}

// ==================== TICKETS ====================

/**
 * Get all tickets
 * @returns {Promise<Object>} Tickets indexed by ID
 */
export async function getAllTickets() {
    await connectDB();
    const tickets = await Ticket.find().lean();
    
    const result = {};
    tickets.forEach(ticket => {
        result[ticket._id.toString()] = {
            ...ticket,
            id: ticket._id.toString(),
        };
    });
    return result;
}

/**
 * Get ticket by ID
 * @param {string} id - Ticket ID
 * @returns {Promise<Object|null>} Ticket or null
 */
export async function getTicket(id) {
    await connectDB();
    const ticket = await Ticket.findById(id).lean();
    if (!ticket) return null;
    
    return {
        ...ticket,
        id: ticket._id.toString(),
    };
}

/**
 * Get ticket by code
 * @param {string} code - Ticket code
 * @returns {Promise<Object|null>} Ticket or null
 */
export async function getTicketByCode(code) {
    await connectDB();
    const ticket = await Ticket.findOne({ code }).lean();
    if (!ticket) return null;
    
    return {
        ...ticket,
        id: ticket._id.toString(),
    };
}

/**
 * Get tickets by order ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Array>} Array of tickets
 */
export async function getTicketsByOrder(orderId) {
    await connectDB();
    const tickets = await Ticket.findByOrder(orderId)
        .populate('eventId')
        .lean();
    return tickets.map(ticket => ({
        ...ticket,
        id: ticket._id.toString(),
    }));
}

/**
 * Create ticket
 * @param {Object} ticketData - Ticket data
 * @returns {Promise<Object>} Created ticket
 */
export async function createTicket(ticketData) {
    await connectDB();
    
    // Generate unique ticket code if not provided
    const code = ticketData.code || await Ticket.generateTicketCode();
    
    const ticket = new Ticket({
        ...ticketData,
        code,
        status: 'valid',
    });
    
    await ticket.save();
    
    return {
        ...ticket.toObject(),
        id: ticket._id.toString(),
    };
}

/**
 * Update ticket
 * @param {string} id - Ticket ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated ticket or null
 */
export async function updateTicket(id, updates) {
    await connectDB();
    const ticket = await Ticket.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
    ).lean();
    
    if (!ticket) return null;
    
    return {
        ...ticket,
        id: ticket._id.toString(),
    };
}

// ==================== PROMO CODES ====================

/**
 * Get all promo codes
 * @returns {Promise<Object>} Promo codes indexed by ID
 */
export async function getAllPromoCodes() {
    await connectDB();
    const promoCodes = await PromoCode.find().lean();
    
    const result = {};
    promoCodes.forEach(pc => {
        result[pc._id.toString()] = {
            ...pc,
            id: pc._id.toString(),
        };
    });
    return result;
}

/**
 * Get promo code by code string
 * @param {string} code - Promo code string
 * @returns {Promise<Object|null>} Promo code or null
 */
export async function getPromoCodeByCode(code) {
    await connectDB();
    const promoCode = await PromoCode.findByCode(code).lean();
    if (!promoCode) return null;
    
    return {
        ...promoCode,
        id: promoCode._id.toString(),
    };
}

/**
 * Get promo codes for a specific event
 * @param {string} eventId - Event ID (ObjectId)
 * @returns {Promise<Array>} Array of promo codes
 */
export async function getPromoCodesByEvent(eventId) {
    await connectDB();
    const eventObjectId = toObjectId(eventId);
    if (!eventObjectId) return [];

    const promoCodes = await PromoCode.findByEvent(eventObjectId)
        .populate('eventId')
        .lean();
    return promoCodes.map(pc => ({
        ...pc,
        id: pc._id.toString(),
    }));
}

/**
 * Create promo code
 * @param {Object} promoData - Promo code data
 * @returns {Promise<Object>} Created promo code
 */
export async function createPromoCode(promoData) {
    await connectDB();
    const promoCode = new PromoCode({
        ...promoData,
        currentUses: 0,
        active: true,
    });
    
    await promoCode.save();
    
    return {
        ...promoCode.toObject(),
        id: promoCode._id.toString(),
    };
}

/**
 * Update promo code
 * @param {string} id - Promo code ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated promo code or null
 */
export async function updatePromoCode(id, updates) {
    await connectDB();
    const promoCode = await PromoCode.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
    ).lean();
    
    if (!promoCode) return null;
    
    return {
        ...promoCode,
        id: promoCode._id.toString(),
    };
}

/**
 * Delete promo code
 * @param {string} id - Promo code ID
 * @returns {Promise<boolean>} Success status
 */
export async function deletePromoCode(id) {
    await connectDB();
    const result = await PromoCode.findByIdAndDelete(id);
    return !!result;
}

/**
 * Increment promo code usage
 * @param {string} id - Promo code ID
 * @returns {Promise<Object|null>} Updated promo code or null
 */
export async function incrementPromoUse(id) {
    await connectDB();
    const promoCode = await PromoCode.findById(id);
    if (!promoCode) return null;
    
    await promoCode.incrementUse();
    
    return {
        ...promoCode.toObject(),
        id: promoCode._id.toString(),
    };
}

// ==================== FEES ====================

/**
 * Get all fees
 * @returns {Promise<Object>} Fees indexed by ID
 */
export async function getAllFees() {
    await connectDB();
    const fees = await Fee.find().lean();
    
    const result = {};
    fees.forEach(fee => {
        result[fee._id.toString()] = {
            ...fee,
            id: fee._id.toString(),
        };
    });
    return result;
}

/**
 * Get active fees
 * @returns {Promise<Array>} Array of active fees
 */
export async function getActiveFees() {
    await connectDB();
    const fees = await Fee.findActive().lean();
    return fees.map(fee => ({
        ...fee,
        id: fee._id.toString(),
    }));
}

/**
 * Create fee
 * @param {Object} feeData - Fee data
 * @returns {Promise<Object>} Created fee
 */
export async function createFee(feeData) {
    await connectDB();
    const fee = new Fee({
        ...feeData,
        active: true,
    });
    
    await fee.save();
    
    return {
        ...fee.toObject(),
        id: fee._id.toString(),
    };
}

// ==================== SETTLEMENT REQUESTS ====================

/**
 * Get all settlement requests
 * @returns {Promise<Object>} Settlement requests indexed by ID
 */
export async function getAllSettlementRequests() {
    await connectDB();
    const requests = await SettlementRequest.find()
        .populate('eventId')
        .lean();
    
    const result = {};
    requests.forEach(req => {
        result[req._id.toString()] = {
            ...req,
            id: req._id.toString(),
        };
    });
    return result;
}

/**
 * Get settlement request by ID
 * @param {string} id - Settlement request ID
 * @returns {Promise<Object|null>} Settlement request or null
 */
export async function getSettlementRequest(id) {
    await connectDB();
    const request = await SettlementRequest.findById(id)
        .populate('eventId')
        .lean();
    if (!request) return null;
    
    return {
        ...request,
        id: request._id.toString(),
    };
}

/**
 * Get settlement requests by organizer ID
 * @param {string} organizerId - Organizer ID
 * @returns {Promise<Array>} Array of settlement requests
 */
export async function getSettlementRequestsByOrganizer(organizerId) {
    await connectDB();
    const requests = await SettlementRequest.findByOrganizer(organizerId)
        .populate('eventId')
        .lean();
    return requests.map(req => ({
        ...req,
        id: req._id.toString(),
    }));
}

/**
 * Create new settlement request
 * @param {Object} requestData - Settlement request data
 * @returns {Promise<Object>} Created settlement request
 */
export async function createSettlementRequest(requestData) {
    await connectDB();
    const request = new SettlementRequest({
        ...requestData,
        status: 'PENDING',
        requestedAt: new Date(),
    });
    
    await request.save();
    
    return {
        ...request.toObject(),
        id: request._id.toString(),
    };
}

/**
 * Update settlement request
 * @param {string} id - Settlement request ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated settlement request or null
 */
export async function updateSettlementRequest(id, updates) {
    await connectDB();
    const request = await SettlementRequest.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
    )
        .populate('eventId')
        .lean();
    
    if (!request) return null;
    
    return {
        ...request,
        id: request._id.toString(),
    };
}

// ==================== REFUND REQUESTS ====================

/**
 * Get all refund requests
 * @returns {Promise<Object>} Refund requests indexed by ID
 */
export async function getAllRefundRequests() {
    await connectDB();
    const requests = await RefundRequest.find()
        .populate('eventId')
        .lean();
    
    const result = {};
    requests.forEach(req => {
        result[req._id.toString()] = {
            ...req,
            id: req._id.toString(),
        };
    });
    return result;
}

/**
 * Get refund request by ID
 * @param {string} id - Refund request ID
 * @returns {Promise<Object|null>} Refund request or null
 */
export async function getRefundRequest(id) {
    await connectDB();
    const request = await RefundRequest.findById(id)
        .populate('eventId')
        .lean();
    if (!request) return null;
    
    return {
        ...request,
        id: request._id.toString(),
    };
}

/**
 * Get refund requests by organizer ID
 * @param {string} organizerId - Organizer ID
 * @returns {Promise<Array>} Array of refund requests
 */
export async function getRefundRequestsByOrganizer(organizerId) {
    await connectDB();
    const requests = await RefundRequest.findByOrganizer(organizerId)
        .populate('eventId')
        .lean();
    return requests.map(req => ({
        ...req,
        id: req._id.toString(),
    }));
}

/**
 * Create new refund request
 * @param {Object} requestData - Refund request data
 * @returns {Promise<Object>} Created refund request
 */
export async function createRefundRequest(requestData) {
    await connectDB();
    const request = new RefundRequest({
        ...requestData,
        status: 'PENDING',
        requestedAt: new Date(),
    });
    
    await request.save();
    
    return {
        ...request.toObject(),
        id: request._id.toString(),
    };
}

/**
 * Update refund request
 * @param {string} id - Refund request ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated refund request or null
 */
export async function updateRefundRequest(id, updates) {
    await connectDB();
    const request = await RefundRequest.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
    )
        .populate('eventId')
        .lean();
    
    if (!request) return null;
    
    return {
        ...request,
        id: request._id.toString(),
    };
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Reset all data (for testing/seeding)
 * Drops all collections
 */
export async function resetAllData() {
    await connectDB();
    
    await Promise.all([
        TicketType.deleteMany({}),
        Order.deleteMany({}),
        OrderItem.deleteMany({}),
        Ticket.deleteMany({}),
        PromoCode.deleteMany({}),
        Fee.deleteMany({}),
        SettlementRequest.deleteMany({}),
        RefundRequest.deleteMany({}),
    ]);
    
    console.log('✅ All ticketing data cleared from MongoDB');
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Statistics
 */
export async function getStats() {
    await connectDB();
    
    const [
        ticketTypes,
        orders,
        orderItems,
        tickets,
        promoCodes,
        fees,
    ] = await Promise.all([
        TicketType.countDocuments(),
        Order.countDocuments(),
        OrderItem.countDocuments(),
        Ticket.countDocuments(),
        PromoCode.countDocuments(),
        Fee.countDocuments(),
    ]);
    
    return {
        ticketTypes,
        orders,
        orderItems,
        tickets,
        promoCodes,
        fees,
    };
}
