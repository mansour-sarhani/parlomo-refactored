/**
 * Seating Service
 * Client-side API wrapper for seats.io seating endpoints
 */

import ticketingAxios from '@/lib/ticketing-axios';

/**
 * Seating API Service
 */
const seatingService = {
    /**
     * Get seating configuration for an event
     * Returns workspace key, event key, pricing info for seats.io chart
     * @param {string} eventId - Event ID
     * @returns {Promise<{success: boolean, data: import('@/types/seating-types').SeatingConfig}>}
     */
    async getSeatingConfig(eventId) {
        const response = await ticketingAxios.get(
            `/api/ticketing/events/${eventId}/seating-config`
        );
        return response.data;
    },

    /**
     * Get seat availability by category (authenticated - for organizers)
     * @param {string} eventId - Event ID
     * @returns {Promise<{success: boolean, data: Object}>}
     */
    async getSeatAvailability(eventId) {
        const response = await ticketingAxios.get(
            `/api/ticketing/seatsio/events/${eventId}/availability`
        );
        return response.data;
    },

    /**
     * Check if a specific seat is available
     * @param {string} eventId - Event ID
     * @param {string} seatLabel - Seat label to check
     * @returns {Promise<{success: boolean, data: {seat_label: string, is_available: boolean}}>}
     */
    async checkSeatAvailability(eventId, seatLabel) {
        const formData = new FormData();
        formData.append('seat_label', seatLabel);

        const response = await ticketingAxios.post(
            `/api/ticketing/seatsio/events/${eventId}/check-seat-availability`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    /**
     * Get blocked seats for an event (authenticated - for organizers)
     * @param {string} eventId - Event ID
     * @returns {Promise<{success: boolean, data: Array}>}
     */
    async getBlockedSeats(eventId) {
        const response = await ticketingAxios.get(
            `/api/ticketing/seatsio/events/${eventId}/blocked-seats`
        );
        return response.data;
    },

    // ========================================
    // CHART MANAGEMENT (Organizer Flow)
    // ========================================

    /**
     * Get available venue charts (admin charts + organizer's own charts)
     * @returns {Promise<{success: boolean, data: import('@/types/seating-types').VenueChart[]}>}
     */
    async getCharts() {
        const response = await ticketingAxios.get('/api/ticketing/seatsio/charts');
        return response.data;
    },

    /**
     * Get single chart details
     * @param {string} chartId - Chart ID
     * @returns {Promise<{success: boolean, data: import('@/types/seating-types').VenueChart}>}
     */
    async getChart(chartId) {
        const response = await ticketingAxios.get(
            `/api/ticketing/seatsio/charts/${chartId}`
        );
        return response.data;
    },

    /**
     * Create a custom chart
     * @param {Object} chartData - Chart data
     * @param {string} chartData.name - Chart name
     * @param {string} chartData.venue_name - Venue name
     * @param {string} [chartData.venue_address] - Venue address
     * @param {string} [chartData.city] - City
     * @param {string} [chartData.country] - Country
     * @param {Array<{key: string, label: string, color: string}>} chartData.categories - Seating categories
     * @returns {Promise<{success: boolean, data: import('@/types/seating-types').VenueChart}>}
     */
    async createChart(chartData) {
        const response = await ticketingAxios.post(
            '/api/ticketing/seatsio/charts',
            chartData
        );
        return response.data;
    },

    /**
     * Get chart designer configuration (includes secret key for embedding)
     * @param {string} chartId - Chart ID
     * @returns {Promise<{success: boolean, data: import('@/types/seating-types').DesignerConfig}>}
     */
    async getDesignerConfig(chartId) {
        const response = await ticketingAxios.get(
            `/api/ticketing/seatsio/charts/${chartId}/designer`
        );
        return response.data;
    },

    /**
     * Sync chart data from seats.io after designing
     * @param {string} chartId - Chart ID
     * @returns {Promise<{success: boolean, data: import('@/types/seating-types').VenueChart}>}
     */
    async syncChart(chartId) {
        const response = await ticketingAxios.post(
            `/api/ticketing/seatsio/charts/${chartId}/sync`
        );
        return response.data;
    },

    /**
     * Assign a chart to an event
     * @param {string} eventId - Event ID
     * @param {string} chartId - Chart ID to assign
     * @returns {Promise<{success: boolean, message: string, data: Object}>}
     */
    async assignChartToEvent(eventId, chartId) {
        const response = await ticketingAxios.post(
            `/api/ticketing/seatsio/events/${eventId}/assign-chart`,
            { chart_id: chartId }
        );
        return response.data;
    },

    /**
     * Map chart categories to ticket types
     * @param {string} eventId - Event ID
     * @param {Array<{category_key: string, category_label: string, ticket_type_id: string}>} mappings - Category to ticket type mappings
     * @returns {Promise<{success: boolean, message: string, data: Array}>}
     */
    async mapCategoriesToTicketTypes(eventId, mappings) {
        const response = await ticketingAxios.post(
            `/api/ticketing/seatsio/events/${eventId}/map-categories`,
            { mappings }
        );
        return response.data;
    },

    /**
     * Get existing category mappings for an event
     * @param {string} eventId - Event ID
     * @returns {Promise<{success: boolean, data: Array}>}
     */
    async getCategoryMappings(eventId) {
        const response = await ticketingAxios.get(
            `/api/ticketing/seatsio/events/${eventId}/category-mappings`
        );
        return response.data;
    },
};

export default seatingService;
