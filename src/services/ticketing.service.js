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
     * @param {string[]} params.selectedSeats - Selected seat labels for seated events (optional)
     * @returns {Promise} Checkout session
     */
    async startCheckout({ eventId, cartItems, promoCode, selectedSeats }) {
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

        // Add selected seats for seated events
        if (selectedSeats && Array.isArray(selectedSeats) && selectedSeats.length > 0) {
            selectedSeats.forEach((seatLabel, index) => {
                formData.append(`selected_seats[${index}]`, seatLabel);
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
     * Resend ticket email to customer
     * @param {string} orderId - Order ID
     * @param {Object} data - Resend data
     * @param {string} [data.email] - Optional email address (defaults to order's customer_email)
     * @param {string} [data.reason] - Optional reason for resending
     * @returns {Promise} Result with sent_to, sent_at, ticket_count
     */
    async resendTickets(orderId, data = {}) {
        const response = await ticketingAxios.post(`/api/ticketing/orders/${orderId}/resend-tickets`, data);
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
     * @param {string} status - Optional status filter (PENDING, APPROVED, REJECTED, PAID)
     * @returns {Promise} Settlement requests
     */
    async getSettlementRequests(status = null) {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        const queryString = params.toString();
        const response = await ticketingAxios.get(`/api/financials/settlements/organizer${queryString ? `?${queryString}` : ''}`);
        return response.data;
    },

    /**
     * Create settlement request
     * @param {Object} data - Request data
     * @param {string} data.event_id - Event ID
     * @param {string} data.payment_method - Payment method (bank_transfer, paypal, stripe)
     * @param {Object} data.payment_details - Payment details (varies by method)
     * @returns {Promise} Created settlement request
     */
    async createSettlementRequest(data) {
        const payload = {
            event_id: data.event_id || data.eventId,
            payment_method: data.payment_method || data.paymentMethod,
            payment_details: data.payment_details || data.paymentDetails || {}
        };
        const response = await ticketingAxios.post('/api/financials/settlements', payload);
        return response.data;
    },

    /**
     * Get refund requests for organizer
     * @param {string} organizerId - Organizer ID
     * @returns {Promise} Refund requests
     */
    async getRefundRequests(organizerId) {
        const response = await ticketingAxios.get(`/api/financials/refunds/organizer`);
        return response.data;
    },

    /**
     * Create refund request
     * @param {Object} data - Request data
     * @param {string} data.eventId - Event ID
     * @param {string} data.type - Refund type (EVENT_CANCELLATION, BULK_REFUND, SINGLE_ORDER)
     * @param {string} data.reason - Refund reason (min 10 chars)
     * @param {string} data.description - Optional additional description
     * @param {Array<string>} data.orderIds - Order IDs (required for BULK_REFUND and SINGLE_ORDER)
     * @param {number} data.finePercentage - Optional fine percentage (0-100)
     * @param {string} data.fineReason - Required if finePercentage > 0
     * @returns {Promise} Created refund request
     */
    async createRefundRequest(data) {
        const { eventId, type, reason, description, orderIds, finePercentage, fineReason } = data;
        const payload = {
            event_id: eventId,
            type,
            reason,
            description,
            order_ids: orderIds || []
        };

        // Add fine fields if provided
        if (finePercentage !== undefined && finePercentage > 0) {
            payload.fine_percentage = finePercentage;
            payload.fine_reason = fineReason;
        }

        const response = await ticketingAxios.post('/api/financials/refunds', payload);
        return response.data;
    },

    /**
     * Get refund request details
     * @param {string} refundId - Refund request ID
     * @returns {Promise} Detailed refund information
     */
    async getRefundRequestDetails(refundId) {
        const response = await ticketingAxios.get(`/api/financials/refunds/${refundId}`);
        return response.data;
    },

    /**
     * Get refund audit logs (Admin)
     * @param {string} refundId - Refund request ID
     * @returns {Promise} Audit logs array
     */
    async getRefundAuditLogs(refundId) {
        const response = await ticketingAxios.get(`/api/financials/refunds/${refundId}/audit-logs`);
        return response.data;
    },

    /**
     * Approve refund request (Admin)
     * @param {string} refundId - Refund request ID
     * @param {Object} data - Approval data
     * @param {string} data.admin_notes - Optional admin notes
     * @returns {Promise} Updated refund
     */
    async approveRefundRequest(refundId, data) {
        const response = await ticketingAxios.patch(`/api/financials/refunds/${refundId}`, {
            status: 'APPROVED',
            admin_notes: data.admin_notes
        });
        return response.data;
    },

    /**
     * Reject refund request (Admin)
     * @param {string} refundId - Refund request ID
     * @param {Object} data - Rejection data
     * @param {string} data.rejection_reason - Required rejection reason
     * @param {string} data.admin_notes - Optional admin notes
     * @returns {Promise} Updated refund
     */
    async rejectRefundRequest(refundId, data) {
        const response = await ticketingAxios.patch(`/api/financials/refunds/${refundId}`, {
            status: 'REJECTED',
            rejection_reason: data.rejection_reason,
            admin_notes: data.admin_notes
        });
        return response.data;
    },

    /**
     * Process refund (full or partial) (Admin)
     * @param {string} refundId - Refund request ID
     * @param {Object} data - Processing data
     * @param {number} data.fine_amount - Optional fine amount in cents
     * @param {string} data.fine_reason - Required if fine_amount > 0
     * @returns {Promise} Processing result
     */
    async processRefund(refundId, data) {
        const payload = {
            status: 'PROCESSED'
        };

        if (data.fine_amount && data.fine_amount > 0) {
            payload.fine_amount = data.fine_amount;
            payload.fine_reason = data.fine_reason;
        }

        const response = await ticketingAxios.patch(`/api/financials/refunds/${refundId}`, payload);
        return response.data;
    },

    /**
     * Get all settlement requests (Admin)
     * @param {Object} options - Query options
     * @param {string} options.status - Optional status filter (PENDING, APPROVED, REJECTED, PAID)
     * @param {number} options.page - Page number (default: 1)
     * @returns {Promise} Settlement requests with pagination meta
     */
    async getAllSettlementRequests({ status = null, page = 1 } = {}) {
        const params = new URLSearchParams();
        if (status && status !== 'ALL') params.append('status', status);
        params.append('page', page.toString());
        const queryString = params.toString();
        const response = await ticketingAxios.get(`/api/financials/settlements/admin?${queryString}`);
        return response.data;
    },

    /**
     * Update settlement request (Admin)
     * Supports approve, reject, and mark as paid actions
     * @param {string} id - Settlement request ID
     * @param {Object} updates - Updates to apply
     * @param {string} updates.status - New status (APPROVED, REJECTED, PAID)
     * @param {string} updates.admin_notes - Optional admin notes
     * @param {number} updates.admin_adjustment - Optional adjustment in cents (for APPROVED)
     * @param {string} updates.adjustment_reason - Required if admin_adjustment provided
     * @param {string} updates.rejection_reason - Required for REJECTED status
     * @param {string} updates.payout_method - Required for PAID status ('stripe' or 'manual')
     * @param {string} updates.transaction_reference - Required for manual payout
     * @param {string} updates.payment_description - Optional for manual payout
     * @returns {Promise} Updated settlement request
     */
    async updateSettlementRequest(id, updates) {
        const response = await ticketingAxios.patch(`/api/financials/settlements/${id}`, updates);
        return response.data;
    },

    /**
     * Get settlement audit logs (Admin)
     * @param {string} settlementId - Settlement request ID
     * @returns {Promise} Audit logs array
     */
    async getSettlementAuditLogs(settlementId) {
        const response = await ticketingAxios.get(`/api/financials/settlements/${settlementId}/audit-logs`);
        return response.data;
    },

    /**
     * Get Stripe account balance (Admin)
     * Returns available and pending balance for payouts
     * @returns {Promise} Stripe balance data
     */
    async getStripeBalance() {
        const response = await ticketingAxios.get('/api/financials/settlements/stripe-balance');
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

    // ==========================================
    // Guest Refund Endpoints (Public - No Auth)
    // ==========================================

    /**
     * Submit guest refund request
     * Allows customers to request refunds without an account
     * @param {Object} data - Request data
     * @param {string} data.order_number - Order number (e.g., "ORD-2025-123456")
     * @param {string} data.email - Customer email used during purchase
     * @param {string} data.reason - Refund reason (event_cancelled, cannot_attend, duplicate_purchase, other)
     * @param {string} data.description - Optional additional details (max 1000 chars)
     * @returns {Promise} Refund request result with refund_id, amount, status
     */
    async submitGuestRefundRequest(data) {
        const response = await ticketingAxios.post('/api/guest/refunds/request', {
            order_number: data.order_number,
            email: data.email,
            reason: data.reason,
            description: data.description || ''
        });
        return response.data;
    },

    /**
     * Check guest refund status
     * Allows customers to check the status of their refund request
     * @param {Object} data - Lookup data
     * @param {string} data.order_number - Order number
     * @param {string} data.email - Customer email
     * @returns {Promise} Refund status including has_refund_request, status, amount, dates
     */
    async checkGuestRefundStatus(data) {
        const response = await ticketingAxios.post('/api/guest/refunds/status', {
            order_number: data.order_number,
            email: data.email
        });
        return response.data;
    },

    // ==========================================
    // Complimentary Tickets Endpoints
    // ==========================================

    /**
     * Issue complimentary tickets for an event
     * Allows organizers and admins to issue free tickets to guests
     * @param {string} eventId - Event ID
     * @param {Object} data - Complimentary ticket data
     * @param {Array<{ticket_type_id: string, quantity: number}>} data.ticket_items - Ticket types and quantities
     * @param {Object} data.recipient - Recipient information
     * @param {string} data.recipient.name - Recipient full name (max 255 chars)
     * @param {string} data.recipient.email - Recipient email address
     * @param {string} [data.recipient.phone] - Optional phone number (max 30 chars)
     * @param {string[]} [data.selected_seats] - Required for seated events. Array of seat labels
     * @param {string} data.reason - Reason for issuing tickets (max 200 chars)
     * @param {string} [data.notes] - Optional additional notes (max 1000 chars)
     * @returns {Promise} Complimentary ticket result with order and tickets
     */
    async issueComplimentaryTickets(eventId, data) {
        const response = await ticketingAxios.post(
            `/api/ticketing/events/${eventId}/complimentary-tickets`,
            {
                ticket_items: data.ticket_items,
                recipient: data.recipient,
                ...(data.selected_seats && { selected_seats: data.selected_seats }),
                reason: data.reason,
                ...(data.notes && { notes: data.notes }),
            }
        );
        return response.data;
    },

    /**
     * Get all complimentary tickets issued for an event
     * @param {string} eventId - Event ID
     * @returns {Promise} List of complimentary ticket summaries
     */
    async getEventComplimentaryTickets(eventId) {
        const response = await ticketingAxios.get(
            `/api/ticketing/events/${eventId}/complimentary-tickets`
        );
        return response.data;
    },

    /**
     * Get detailed information about a complimentary ticket order
     * @param {string} orderId - Order ID
     * @returns {Promise} Detailed complimentary ticket order information
     */
    async getComplimentaryTicketDetails(orderId) {
        const response = await ticketingAxios.get(
            `/api/ticketing/complimentary-tickets/${orderId}`
        );
        return response.data;
    },

    /**
     * Resend complimentary ticket confirmation email
     * @param {string} orderId - Order ID
     * @returns {Promise} Success message
     */
    async resendComplimentaryTicketEmail(orderId) {
        try {
            const response = await ticketingAxios.post(
                `/api/ticketing/complimentary-tickets/${orderId}/resend-email`
            );
            return response.data;
        } catch (error) {
            // If endpoint doesn't exist yet, show mock success
            if (error.response?.status === 404) {
                console.warn('Email resend endpoint not implemented yet');
                return {
                    success: true,
                    message: 'Email resend feature coming soon'
                };
            }
            throw error;
        }
    },

    /**
     * Download complimentary ticket PDF
     * @param {string} orderId - Order ID
     * @returns {Promise<Blob>} PDF blob
     */
    async downloadComplimentaryTicketPDF(orderId) {
        try {
            const response = await ticketingAxios.get(
                `/api/ticketing/complimentary-tickets/${orderId}/pdf`,
                { responseType: 'blob' }
            );
            return response.data;
        } catch (error) {
            // If endpoint doesn't exist yet, throw user-friendly error
            if (error.response?.status === 404) {
                console.warn('PDF download endpoint not implemented yet');
                throw new Error('PDF download feature coming soon');
            }
            throw error;
        }
    },
};

export default ticketingService;
