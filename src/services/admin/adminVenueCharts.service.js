/**
 * Admin Venue Charts Service
 * API wrapper for admin-level venue chart management endpoints
 * Requires super-admin role
 */

import ticketingAxios from '@/lib/ticketing-axios';

/**
 * Admin Venue Charts API Service
 */
const adminVenueChartsService = {
    /**
     * Get list of venue charts with filters
     * @param {Object} params - Query parameters
     * @param {string} [params.search] - Search by name, venue_name, or city
     * @param {boolean} [params.active] - Filter by active status
     * @param {string} [params.type] - Filter by chart type ('admin' or 'organizer')
     * @param {string} [params.created_by] - Filter by organizer UUID
     * @param {number} [params.limit=20] - Items per page
     * @param {number} [params.page=1] - Page number
     * @returns {Promise<{success: boolean, data: Array, meta: Object}>}
     */
    async getVenueCharts({ search, active, type, created_by, limit = 20, page = 1 } = {}) {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (active !== undefined) params.append('active', active);
        if (type) params.append('type', type);
        if (created_by) params.append('created_by', created_by);
        params.append('limit', limit);
        params.append('page', page);

        const response = await ticketingAxios.get(
            `/api/admin/seatsio/venue-charts?${params}`
        );
        return response.data;
    },

    /**
     * Get single venue chart by ID
     * @param {string} id - Chart ID
     * @returns {Promise<{success: boolean, data: import('@/types/seating-types').VenueChart}>}
     */
    async getVenueChart(id) {
        const response = await ticketingAxios.get(
            `/api/admin/seatsio/venue-charts/${id}`
        );
        return response.data;
    },

    /**
     * Create new venue chart
     * @param {Object} data - Chart data
     * @param {string} data.name - Chart name (required, max 200 chars)
     * @param {string} [data.description] - Chart description
     * @param {string} data.venue_name - Venue name (required, max 200 chars)
     * @param {string} [data.venue_address] - Venue address
     * @param {string} [data.city] - City (max 100 chars)
     * @param {string} [data.country] - Country (max 100 chars)
     * @param {Array<{key: string, label: string, color: string}>} [data.categories] - Seating categories
     * @returns {Promise<{success: boolean, message: string, data: import('@/types/seating-types').VenueChart}>}
     */
    async createVenueChart(data) {
        const response = await ticketingAxios.post(
            '/api/admin/seatsio/venue-charts',
            data
        );
        return response.data;
    },

    /**
     * Update existing venue chart
     * @param {string} id - Chart ID
     * @param {Object} data - Updated chart data (partial)
     * @param {string} [data.name] - Chart name (max 200 chars)
     * @param {string} [data.description] - Chart description
     * @param {string} [data.venue_name] - Venue name (max 200 chars)
     * @param {string} [data.venue_address] - Venue address
     * @param {string} [data.city] - City (max 100 chars)
     * @param {string} [data.country] - Country (max 100 chars)
     * @returns {Promise<{success: boolean, message: string, data: import('@/types/seating-types').VenueChart}>}
     */
    async updateVenueChart(id, data) {
        const response = await ticketingAxios.patch(
            `/api/admin/seatsio/venue-charts/${id}`,
            data
        );
        return response.data;
    },

    /**
     * Delete venue chart
     * Note: Chart cannot be deleted if it's being used by any public events
     * @param {string} id - Chart ID
     * @returns {Promise<{success: boolean, message: string}>}
     * @throws {Error} If chart is in use by events
     */
    async deleteVenueChart(id) {
        const response = await ticketingAxios.delete(
            `/api/admin/seatsio/venue-charts/${id}`
        );
        return response.data;
    },

    /**
     * Get chart designer configuration
     * Returns configuration needed to embed the Seats.io Chart Designer
     * Includes secret_key since route is protected by super-admin role
     * @param {string} id - Chart ID
     * @returns {Promise<{success: boolean, data: {chart_key: string, secret_key: string, region: string, mode: string}}>}
     */
    async getDesignerConfig(id) {
        const response = await ticketingAxios.get(
            `/api/admin/seatsio/venue-charts/${id}/designer`
        );
        return response.data;
    },

    /**
     * Sync chart data from Seats.io
     * Updates categories and capacity from Seats.io platform
     * @param {string} id - Chart ID
     * @returns {Promise<{success: boolean, message: string, data: import('@/types/seating-types').VenueChart}>}
     */
    async syncChart(id) {
        const response = await ticketingAxios.post(
            `/api/admin/seatsio/venue-charts/${id}/sync`
        );
        return response.data;
    },

    /**
     * Publish chart changes
     * Publishes draft changes in the Seats.io chart
     * @param {string} id - Chart ID
     * @returns {Promise<{success: boolean, message: string, data: Object}>}
     */
    async publishChart(id) {
        const response = await ticketingAxios.post(
            `/api/admin/seatsio/venue-charts/${id}/publish`
        );
        return response.data;
    },

    /**
     * Activate chart
     * Makes the chart available for organizers to use when creating events
     * @param {string} id - Chart ID
     * @returns {Promise<{success: boolean, message: string, data: Object}>}
     */
    async activateChart(id) {
        const response = await ticketingAxios.post(
            `/api/admin/seatsio/venue-charts/${id}/activate`
        );
        return response.data;
    },

    /**
     * Deactivate chart
     * Hides the chart from organizers (existing events keep using it)
     * @param {string} id - Chart ID
     * @returns {Promise<{success: boolean, message: string, data: Object}>}
     */
    async deactivateChart(id) {
        const response = await ticketingAxios.post(
            `/api/admin/seatsio/venue-charts/${id}/deactivate`
        );
        return response.data;
    },

    /**
     * Duplicate chart
     * Creates a copy of the chart in Seats.io and database
     * @param {string} id - Chart ID to duplicate
     * @param {Object} data - Duplication data
     * @param {string} data.name - Name for the duplicated chart
     * @param {boolean} [data.is_admin_chart=true] - Whether the duplicate should be an admin chart
     * @returns {Promise<{success: boolean, message: string, data: import('@/types/seating-types').VenueChart}>}
     */
    async duplicateChart(id, data) {
        const response = await ticketingAxios.post(
            `/api/admin/seatsio/venue-charts/${id}/duplicate`,
            data
        );
        return response.data;
    },
};

export default adminVenueChartsService;
