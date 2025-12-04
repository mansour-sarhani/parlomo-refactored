/**
 * Payment Service
 * Handles payment processing for ticket orders
 */

import axios from '@/lib/axios';

/**
 * Payment API Service
 */
const paymentService = {
    /**
     * Create payment intent (Stripe)
     * @param {Object} params - Payment parameters
     * @param {number} params.amount - Amount in cents
     * @param {string} params.currency - Currency code
     * @param {Object} params.metadata - Additional metadata
     * @returns {Promise} Payment intent
     */
    async createPaymentIntent({ amount, currency = 'GBP', metadata = {} }) {
        const response = await axios.post('/api/payments/create-intent', {
            amount,
            currency,
            metadata,
        });
        return response.data;
    },

    /**
     * Confirm payment
     * @param {string} paymentIntentId - Payment intent ID
     * @returns {Promise} Confirmation result
     */
    async confirmPayment(paymentIntentId) {
        const response = await axios.post('/api/payments/confirm', {
            paymentIntentId,
        });
        return response.data;
    },

    /**
     * Process refund
     * @param {Object} params - Refund parameters
     * @param {string} params.paymentIntentId - Payment intent ID
     * @param {number} params.amount - Amount to refund (optional, full refund if not specified)
     * @param {string} params.reason - Refund reason
     * @returns {Promise} Refund result
     */
    async processRefund({ paymentIntentId, amount, reason }) {
        const response = await axios.post('/api/payments/refund', {
            paymentIntentId,
            amount,
            reason,
        });
        return response.data;
    },

    /**
     * Get payment status
     * @param {string} paymentIntentId - Payment intent ID
     * @returns {Promise} Payment status
     */
    async getPaymentStatus(paymentIntentId) {
        const response = await axios.get(`/api/payments/status/${paymentIntentId}`);
        return response.data;
    },

    /**
     * Get payment methods for user
     * @param {number} userId - User ID
     * @returns {Promise} Payment methods
     */
    async getPaymentMethods(userId) {
        const response = await axios.get(`/api/payments/methods/${userId}`);
        return response.data;
    },

    /**
     * Add payment method
     * @param {number} userId - User ID
     * @param {Object} paymentMethodData - Payment method data
     * @returns {Promise} Added payment method
     */
    async addPaymentMethod(userId, paymentMethodData) {
        const response = await axios.post(`/api/payments/methods/${userId}`, paymentMethodData);
        return response.data;
    },

    /**
     * Remove payment method
     * @param {string} paymentMethodId - Payment method ID
     * @returns {Promise} Result
     */
    async removePaymentMethod(paymentMethodId) {
        const response = await axios.delete(`/api/payments/methods/${paymentMethodId}`);
        return response.data;
    },

    /**
     * Get transaction history
     * @param {number} userId - User ID
     * @param {Object} params - Query parameters
     * @returns {Promise} Transactions
     */
    async getTransactions(userId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await axios.get(
            `/api/payments/transactions/${userId}${queryString ? `?${queryString}` : ''}`
        );
        return response.data;
    },

    /**
     * Mock payment (for testing)
     * @param {Object} params - Payment parameters
     * @returns {Promise} Mock payment result
     */
    async mockPayment(params) {
        // Simulate payment processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        return {
            success: true,
            paymentIntentId: `pi_mock_${Date.now()}`,
            status: 'succeeded',
            amount: params.amount,
            currency: params.currency || 'GBP',
        };
    },
};

export default paymentService;
