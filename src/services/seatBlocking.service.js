/**
 * Seat Blocking Service
 * API wrapper for blocking and managing reserved seats for events
 *
 * Allows organizers and super-admins to reserve specific seats that should not
 * be available for public purchase (VIP, sponsors, accessibility, production, etc.)
 */

import ticketingAxios from '@/lib/ticketing-axios';

/**
 * Block reason options
 */
export const BLOCK_REASONS = {
    VIP: 'VIP',
    SPONSOR: 'Sponsor',
    ACCESSIBILITY: 'Accessibility',
    PRODUCTION: 'Production',
    TECHNICAL: 'Technical',
    OTHER: 'Other',
};

/**
 * Get display text for block reason
 * @param {string} reason - Block reason code
 * @returns {string} Display text
 */
export const getBlockReasonDisplay = (reason) => {
    const displays = {
        'VIP': 'VIP Reserved',
        'Sponsor': 'Sponsor Reserved',
        'Accessibility': 'Accessibility Reserved',
        'Production': 'Production Equipment',
        'Technical': 'Technical Crew',
        'Other': 'Reserved',
    };
    return displays[reason] || 'Reserved';
};

/**
 * Seat Blocking API Service
 */
const seatBlockingService = {
    /**
     * Block specific seats for an event
     * @param {string} eventId - Event ID
     * @param {Object} data - Block data
     * @param {Array<string>} data.seat_labels - Array of seat labels to block (e.g., ["A-1", "A-2"])
     * @param {string} data.reason - Reason for blocking (VIP, Sponsor, Accessibility, Production, Technical, Other)
     * @param {string} [data.notes] - Additional notes (max 500 chars)
     * @returns {Promise<{success: boolean, message: string, data: Object}>}
     */
    async blockSeats(eventId, data) {
        const response = await ticketingAxios.post(
            `/api/ticketing/seatsio/events/${eventId}/block-seats`,
            data
        );
        return response.data;
    },

    /**
     * Unblock/release specific seats for an event
     * @param {string} eventId - Event ID
     * @param {Object} data - Unblock data
     * @param {Array<string>} data.seat_labels - Array of seat labels to unblock
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async unblockSeats(eventId, data) {
        const response = await ticketingAxios.post(
            `/api/ticketing/seatsio/events/${eventId}/unblock-seats`,
            data
        );
        return response.data;
    },

    /**
     * Get all blocked seats for an event
     * @param {string} eventId - Event ID
     * @returns {Promise<{success: boolean, data: Array<Object>}>}
     *
     * Response data format:
     * {
     *   id: UUID,
     *   event_id: UUID,
     *   seat_labels: ["A-1", "A-2"],
     *   reason: "VIP",
     *   notes: "John Smith party",
     *   blocked_by: { id, name, email },
     *   blocked_at: "2025-12-31T19:00:00.000000Z"
     * }
     */
    async getBlockedSeats(eventId) {
        const response = await ticketingAxios.get(
            `/api/ticketing/seatsio/events/${eventId}/blocked-seats`
        );
        return response.data;
    },

    /**
     * Get seat availability breakdown by category
     * @param {string} eventId - Event ID
     * @returns {Promise<{success: boolean, data: Object}>}
     *
     * Response data format (by category):
     * {
     *   "vip": {
     *     category_key: "vip",
     *     category_label: "VIP Section",
     *     total: 100,
     *     available: 85,
     *     booked: 10,
     *     held: 2,
     *     blocked: 3,
     *     ticket_type: { id, name, price, price_formatted, currency }
     *   }
     * }
     */
    async getAvailability(eventId) {
        const response = await ticketingAxios.get(
            `/api/ticketing/seatsio/events/${eventId}/availability`
        );
        return response.data;
    },
};

export default seatBlockingService;
