/**
 * Organizer Sales Service
 * Client-side API wrapper for organizer sales endpoints
 * Allows organizers to view their own event sales including complimentary tickets
 */

import ticketingAxios from '@/lib/ticketing-axios';

/**
 * Organizer Sales API Service
 */
const organizerSalesService = {
    /**
     * Get all sales for the authenticated organizer's events
     * @param {Object} params - Query parameters
     * @param {string} [params.eventId] - Filter by specific event (must be owned by organizer)
     * @param {string} [params.status] - Filter by order status (paid, refunded) - default: paid
     * @param {boolean} [params.includeComplimentary] - Include complimentary tickets (default: true)
     * @param {string} [params.search] - Search by order number or customer name
     * @param {string} [params.dateFrom] - Filter orders created from this date (YYYY-MM-DD)
     * @param {string} [params.dateTo] - Filter orders created to this date (YYYY-MM-DD)
     * @param {string} [params.sortBy] - Sort field (created_at, paid_at, total, order_number) - default: created_at
     * @param {string} [params.sortOrder] - Sort order (asc, desc) - default: desc
     * @param {number} [params.limit] - Results per page (default: 15)
     * @param {number} [params.page] - Page number (default: 1)
     * @returns {Promise} Sales list with summary statistics and pagination
     */
    async getSales(params = {}) {
        // Build query string from params
        const queryParams = new URLSearchParams();

        // Add filters if provided
        if (params.eventId) queryParams.append('eventId', params.eventId);
        if (params.status) queryParams.append('status', params.status);
        if (params.includeComplimentary !== undefined) queryParams.append('includeComplimentary', params.includeComplimentary);
        if (params.search) queryParams.append('search', params.search);
        if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
        if (params.dateTo) queryParams.append('dateTo', params.dateTo);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.page) queryParams.append('page', params.page);

        const queryString = queryParams.toString();
        const response = await ticketingAxios.get(
            `/api/ticketing/organizer/sales${queryString ? `?${queryString}` : ''}`
        );
        return response.data;
    },

    /**
     * Get sale details by order ID
     * @param {string} orderId - Order ID
     * @returns {Promise} Sale details
     */
    async getSaleDetails(orderId) {
        const response = await ticketingAxios.get(`/api/ticketing/orders/${orderId}`);
        return response.data;
    },

    /**
     * Export sales to CSV
     * @param {Object} params - Same parameters as getSales
     * @returns {Promise} CSV blob
     */
    async exportSales(params = {}) {
        // Build query string from params
        const queryParams = new URLSearchParams();

        if (params.eventId) queryParams.append('eventId', params.eventId);
        if (params.status) queryParams.append('status', params.status);
        if (params.includeComplimentary !== undefined) queryParams.append('includeComplimentary', params.includeComplimentary);
        if (params.search) queryParams.append('search', params.search);
        if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
        if (params.dateTo) queryParams.append('dateTo', params.dateTo);

        const queryString = queryParams.toString();
        const response = await ticketingAxios.get(
            `/api/ticketing/organizer/sales/export${queryString ? `?${queryString}` : ''}`,
            { responseType: 'blob' }
        );
        return response.data;
    },
};

export default organizerSalesService;
