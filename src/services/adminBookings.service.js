/**
 * Admin Bookings Service
 * Client-side API wrapper for admin bookings endpoints
 * Allows super-admin to view all bookings across all events
 */

import ticketingAxios from '@/lib/ticketing-axios';

/**
 * Admin Bookings API Service
 */
const adminBookingsService = {
    /**
     * Get all bookings across all events in the system
     * @param {Object} params - Query parameters
     * @param {string} [params.eventId] - Filter by specific event ID
     * @param {string} [params.status] - Filter by order status (paid, pending, cancelled, refunded)
     * @param {boolean} [params.complimentary] - Filter complimentary orders (true/false)
     * @param {string} [params.organizerId] - Filter by organizer ID
     * @param {string} [params.search] - Search by order number, customer name, or email
     * @param {string} [params.dateFrom] - Filter orders created from this date (YYYY-MM-DD)
     * @param {string} [params.dateTo] - Filter orders created to this date (YYYY-MM-DD)
     * @param {string} [params.sortBy] - Sort field (created_at, paid_at, total, order_number) - default: created_at
     * @param {string} [params.sortOrder] - Sort order (asc, desc) - default: desc
     * @param {number} [params.limit] - Results per page (default: 15)
     * @param {number} [params.page] - Page number (default: 1)
     * @returns {Promise} Bookings list with pagination
     */
    async getAllBookings(params = {}) {
        // Build query string from params
        const queryParams = new URLSearchParams();

        // Add filters if provided
        if (params.eventId) queryParams.append('eventId', params.eventId);
        if (params.status) queryParams.append('status', params.status);
        if (params.complimentary !== undefined) queryParams.append('complimentary', params.complimentary);
        if (params.organizerId) queryParams.append('organizerId', params.organizerId);
        if (params.search) queryParams.append('search', params.search);
        if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
        if (params.dateTo) queryParams.append('dateTo', params.dateTo);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.page) queryParams.append('page', params.page);

        const queryString = queryParams.toString();
        const response = await ticketingAxios.get(
            `/api/ticketing/admin/bookings${queryString ? `?${queryString}` : ''}`
        );
        return response.data;
    },

    /**
     * Get booking details by order ID
     * @param {string} orderId - Order ID
     * @returns {Promise} Booking details
     */
    async getBookingDetails(orderId) {
        const response = await ticketingAxios.get(`/api/ticketing/orders/${orderId}`);
        return response.data;
    },

    /**
     * Export bookings to CSV
     * @param {Object} params - Same parameters as getAllBookings
     * @returns {Promise} CSV blob
     */
    async exportBookings(params = {}) {
        // Build query string from params
        const queryParams = new URLSearchParams();

        if (params.eventId) queryParams.append('eventId', params.eventId);
        if (params.status) queryParams.append('status', params.status);
        if (params.complimentary !== undefined) queryParams.append('complimentary', params.complimentary);
        if (params.organizerId) queryParams.append('organizerId', params.organizerId);
        if (params.search) queryParams.append('search', params.search);
        if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
        if (params.dateTo) queryParams.append('dateTo', params.dateTo);

        const queryString = queryParams.toString();
        const response = await ticketingAxios.get(
            `/api/ticketing/admin/bookings/export${queryString ? `?${queryString}` : ''}`,
            { responseType: 'blob' }
        );
        return response.data;
    },
};

export default adminBookingsService;
