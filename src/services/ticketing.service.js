/**
 * Ticketing Service
 * Client-side API wrapper for ticketing endpoints
 * Uses dedicated ticketing axios instance for local Next.js API routes
 */

import ticketingAxios from '@/lib/ticketing-axios';

/**
 * Ticketing API Service
 */
const ticketingService = {
    /**
     * Get event ticketing information
     * @param {number} eventId - Event ID
     * @returns {Promise} Event ticketing data
     */
    async getEventTicketing(eventId) {
        const response = await ticketingAxios.get(`/api/ticketing/events/${eventId}`);
        return response.data;
    },

    /**
     * Get event orders
     * @param {string} eventId - Event ID
     * @param {Object} params - Query parameters (status, limit, offset)
     * @returns {Promise} Orders list with pagination
     */
    async getEventOrders(eventId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await ticketingAxios.get(
            `/api/ticketing/events/${eventId}/orders${queryString ? `?${queryString}` : ''}`
        );
        return response.data;
    },

    /**
     * Create ticket type
     * @param {number} eventId - Event ID
     * @param {Object} ticketTypeData - Ticket type data
     * @returns {Promise} Created ticket type
     */
    async createTicketType(eventId, ticketTypeData) {
        const response = await ticketingAxios.post(
            `/api/ticketing/events/${eventId}/ticket-types`,
            ticketTypeData
        );
        return response.data;
    },

    /**
     * Update ticket type
     * @param {number} eventId - Event ID
     * @param {number} ticketTypeId - Ticket type ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise} Updated ticket type
     */
    async updateTicketType(eventId, ticketTypeId, updates) {
        // Laravel requires POST with _method: PATCH for method spoofing
        const response = await ticketingAxios.post(
            `/api/ticketing/events/${eventId}/ticket-types/${ticketTypeId}`,
            {
                _method: 'PATCH',
                ...updates,
            }
        );
        return response.data;
    },

    /**
     * Validate promo code
     * @param {Object} params - Validation parameters
     * @param {string} params.eventId - Event ID
     * @param {string} params.code - Promo code
     * @param {Array} params.cartItems - Cart items with ticketTypeId and quantity
     * @returns {Promise} Validation result
     */
    async validatePromoCode({ eventId, code, cartItems }) {
        // Build FormData with the expected format
        const formData = new FormData();
        formData.append('event_id', eventId);
        formData.append('code', code);

        // Add cart items in the expected format: cart_items[0][ticket_type_id], cart_items[0][quantity]
        if (cartItems && Array.isArray(cartItems)) {
            cartItems.forEach((item, index) => {
                formData.append(`cart_items[${index}][ticket_type_id]`, item.ticketTypeId);
                formData.append(`cart_items[${index}][quantity]`, String(item.quantity));
            });
        }

        const response = await ticketingAxios.post('/api/ticketing/promo/validate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Start checkout session
     * @param {Object} params - Checkout parameters
     * @param {string} params.eventId - Event ID
     * @param {Array} params.cartItems - Cart items with ticketTypeId and quantity
     * @param {string} params.promoCode - Promo code (optional)
     * @returns {Promise} Checkout session
     */
    async startCheckout({ eventId, cartItems, promoCode }) {
        // Build FormData with the expected format
        const formData = new FormData();
        formData.append('event_id', eventId);

        // Add promo code if provided
        if (promoCode) {
            formData.append('promo_code', promoCode);
        }

        // Add cart items in the expected format
        if (cartItems && Array.isArray(cartItems)) {
            cartItems.forEach((item, index) => {
                formData.append(`cart_items[${index}][ticket_type_id]`, item.ticketTypeId);
                formData.append(`cart_items[${index}][quantity]`, String(item.quantity));
            });
        }

        const response = await ticketingAxios.post('/api/ticketing/checkout/start', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Create payment intent for Stripe
     * @param {string} sessionId - Checkout session ID
     * @returns {Promise} Payment intent data with client_secret
     */
    async createPaymentIntent(sessionId) {
        const formData = new FormData();
        formData.append('session_id', sessionId);

        const response = await ticketingAxios.post('/api/ticketing/checkout/create-payment-intent', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Verify payment and complete order
     * @param {Object} params - Verification parameters
     * @param {string} params.sessionId - Checkout session ID
     * @param {string} params.paymentIntentId - Stripe payment intent ID
     * @param {Object} params.buyerInfo - Buyer information
     * @returns {Promise} Order confirmation with order details and download URL
     */
    async verifyPayment({ sessionId, paymentIntentId, buyerInfo }) {
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('payment_intent_id', paymentIntentId);
        formData.append('buyer_info[first_name]', buyerInfo.firstName);
        formData.append('buyer_info[last_name]', buyerInfo.lastName);
        formData.append('buyer_info[email]', buyerInfo.email);
        if (buyerInfo.phone) {
            formData.append('buyer_info[phone]', buyerInfo.phone);
        }

        const response = await ticketingAxios.post('/api/ticketing/checkout/verify-payment', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Complete checkout (legacy - use verifyPayment for Stripe payments)
     * @param {Object} checkoutData - Complete checkout data
     * @returns {Promise} Order confirmation
     */
    async completeCheckout(checkoutData) {
        const response = await ticketingAxios.post('/api/ticketing/checkout/complete', checkoutData);
        return response.data;
    },

    /**
     * Get order details
     * @param {number} orderId - Order ID
     * @returns {Promise} Order details
     */
    async getOrder(orderId) {
        const response = await ticketingAxios.get(`/api/ticketing/orders/${orderId}`);
        return response.data;
    },

    /**
     * Get guest order details (for order confirmation page)
     * @param {string} orderId - Order ID
     * @param {string} email - Customer email for verification
     * @returns {Promise} Full order details including items, event, tickets, and download URL
     */
    async getGuestOrder(orderId, email) {
        const response = await ticketingAxios.get(
            `/api/ticketing/orders/guest/${orderId}?email=${encodeURIComponent(email)}`
        );
        return response.data;
    },

    /**
     * Get order tickets
     * @param {number} orderId - Order ID
     * @returns {Promise} Order tickets
     */
    async getOrderTickets(orderId) {
        const response = await ticketingAxios.get(`/api/ticketing/orders/${orderId}/tickets`);
        return response.data;
    },

    /**
     * Scan ticket
     * @param {Object} params - Scan parameters
     * @param {string} params.ticketCode - Ticket code
     * @param {string} params.qrPayload - QR payload (alternative to ticketCode)
     * @param {number} params.scannedBy - User ID who scanned
     * @returns {Promise} Scan result
     */
    async scanTicket({ ticketCode, qrPayload, scannedBy }) {
        const response = await ticketingAxios.post('/api/ticketing/scanner/scan', {
            ticketCode,
            qrPayload,
            scannedBy,
        });
        return response.data;
    },

    /**
     * Check ticket status (without marking as used)
     * @param {string} ticketCode - Ticket code
     * @returns {Promise} Ticket status
     */
    async checkTicketStatus(ticketCode) {
        const response = await ticketingAxios.get(`/api/ticketing/scanner/scan?code=${ticketCode}`);
        return response.data;
    },

    /**
     * Get user orders
     * @param {number} userId - User ID
     * @param {Object} params - Query parameters
     * @returns {Promise} User orders
     */
    async getUserOrders(userId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await ticketingAxios.get(
            `/api/ticketing/users/${userId}/orders${queryString ? `?${queryString}` : ''}`
        );
        return response.data;
    },

    /**
     * Download ticket PDF
     * @param {number} ticketId - Ticket ID
     * @returns {Promise} PDF blob
     */
    async downloadTicketPDF(ticketId) {
        const response = await ticketingAxios.get(`/api/ticketing/tickets/${ticketId}/pdf`, {
            responseType: 'blob',
        });
        return response.data;
    },

    /**
     * Download order tickets PDF
     * @param {number} orderId - Order ID
     * @returns {Promise} PDF blob
     */
    async downloadOrderTicketsPDF(orderId) {
        const response = await ticketingAxios.get(`/api/ticketing/orders/${orderId}/tickets/pdf`, {
            responseType: 'blob',
        });
        return response.data;
    },

    /**
     * Request ticket transfer
     * @param {number} ticketId - Ticket ID
     * @param {Object} transferData - Transfer data
     * @param {string} transferData.toEmail - Recipient email
     * @returns {Promise} Transfer result
     */
    async transferTicket(ticketId, transferData) {
        const response = await ticketingAxios.post(`/api/ticketing/tickets/${ticketId}/transfer`, transferData);
        return response.data;
    },

    /**
     * Request ticket refund
     * @param {number} ticketId - Ticket ID
     * @param {Object} refundData - Refund data
     * @param {string} refundData.reason - Refund reason
     * @returns {Promise} Refund result
     */
    async refundTicket(ticketId, refundData) {
        const response = await ticketingAxios.post(`/api/ticketing/tickets/${ticketId}/refund`, refundData);
        return response.data;
    },

    /**
     * Get event sales analytics
     * @param {number} eventId - Event ID
     * @returns {Promise} Sales analytics
     */
    async getEventAnalytics(eventId) {
        const response = await ticketingAxios.get(`/api/ticketing/events/${eventId}/analytics`);
        return response.data;
    },

    /**
     * Get event attendees
     * @param {number} eventId - Event ID
     * @param {Object} params - Query parameters
     * @returns {Promise} Attendees list
     */
    async getEventAttendees(eventId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await ticketingAxios.get(
            `/api/ticketing/events/${eventId}/attendees${queryString ? `?${queryString}` : ''}`
        );
        return response.data;
    },

    /**
     * Export attendees CSV
     * @param {number} eventId - Event ID
     * @returns {Promise} CSV blob
     */
    async exportAttendees(eventId) {
        const response = await ticketingAxios.get(`/api/ticketing/events/${eventId}/attendees/export`, {
            responseType: 'blob',
        });
        return response.data;
    },

    /**
     * Resend order confirmation email
     * @param {number} orderId - Order ID
     * @returns {Promise} Result
     */
    async resendOrderConfirmation(orderId) {
        const response = await ticketingAxios.post(`/api/ticketing/orders/${orderId}/resend-confirmation`);
        return response.data;
    },

    /**
     * Get event promo codes
     * @param {number} eventId - Event ID
     * @returns {Promise} Promo codes list
     */
    async getEventPromoCodes(eventId) {
        const response = await ticketingAxios.get(`/api/ticketing/events/${eventId}/promo-codes`);
        return response.data;
    },

    /**
     * Create promo code
     * @param {number} eventId - Event ID
     * @param {Object} promoData - Promo code data
     * @returns {Promise} Created promo code
     */
    async createPromoCode(eventId, promoData) {
        const response = await ticketingAxios.post(`/api/ticketing/events/${eventId}/promo-codes`, promoData);
        return response.data;
    },

    /**
     * Update promo code
     * @param {number} eventId - Event ID
     * @param {number} promoId - Promo code ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise} Updated promo code
     */
    async updatePromoCode(eventId, promoId, updates) {
        const response = await ticketingAxios.patch(`/api/ticketing/events/${eventId}/promo-codes/${promoId}`, updates);
        return response.data;
    },

    /**
     * Delete promo code
     * @param {number} eventId - Event ID
     * @param {number} promoId - Promo code ID
     * @returns {Promise} Success status
     */
    async deletePromoCode(eventId, promoId) {
        const response = await ticketingAxios.delete(`/api/ticketing/events/${eventId}/promo-codes/${promoId}`);
        return response.data;
    },

    /**
     * Get event financials
     * @param {number} eventId - Event ID
     * @returns {Promise} Financials data
     */
    async getEventFinancials(eventId) {
        const response = await ticketingAxios.get(`/api/ticketing/events/${eventId}/financials`);
        return response.data;
    },

    /**
     * Get settlement requests for organizer
     * @param {string} organizerId - Organizer ID
     * @returns {Promise} Settlement requests
     */
    async getSettlementRequests(organizerId) {
        const response = await ticketingAxios.get(`/api/financials/settlements/organizer?organizerId=${organizerId}`);
        return response.data;
    },

    /**
     * Create settlement request
     * @param {Object} data - Request data
     * @returns {Promise} Created request
     */
    async createSettlementRequest(data) {
        const response = await ticketingAxios.post('/api/financials/settlements', data);
        return response.data;
    },

    /**
     * Get refund requests for organizer
     * @param {string} organizerId - Organizer ID
     * @returns {Promise} Refund requests
     */
    async getRefundRequests(organizerId) {
        const response = await ticketingAxios.get(`/api/financials/refunds/organizer?organizerId=${organizerId}`);
        return response.data;
    },

    /**
     * Create refund request
     * @param {Object} data - Request data (eventId, organizerId, reason, type)
     * @returns {Promise} Created request
     */
    async createRefundRequest(data) {
        const { eventId, ...rest } = data;
        const response = await ticketingAxios.patch(`/api/financials/refunds/${eventId}`, rest);
        return response.data;
    },

    /**
     * Get all settlement requests (Admin)
     * @returns {Promise} Settlement requests
     */
    async getAllSettlementRequests() {
        const response = await ticketingAxios.get('/api/financials/settlements/admin');
        return response.data;
    },

    /**
     * Update settlement request (Admin)
     * @param {string} id - Request ID
     * @param {Object} updates - Updates (status, adminNotes)
     * @returns {Promise} Updated request
     */
    async updateSettlementRequest(id, updates) {
        const response = await ticketingAxios.patch(`/api/financials/settlements/${id}`, updates);
        return response.data;
    },

    /**
     * Get all refund requests (Admin)
     * @returns {Promise} Refund requests
     */
    async getAllRefundRequests() {
        const response = await ticketingAxios.get('/api/financials/refunds/admin');
        return response.data;
    },

    /**
     * Update refund request (Admin)
     * @param {string} id - Request ID
     * @param {Object} updates - Updates (status, adminNotes)
     * @returns {Promise} Updated request
     */
    async updateRefundRequest(id, updates) {
        const response = await ticketingAxios.patch(`/api/financials/refunds/${id}`, updates);
        return response.data;
    },
};

export default ticketingService;
