/**
 * Public Events Service
 * Client-side API wrapper for public events endpoints
 * Uses dedicated ticketing axios instance for local Next.js API routes
 */

import ticketingAxios from '@/lib/ticketing-axios';

/**
 * Public Events API Service
 */
const publicEventsService = {
    /**
     * Get all public events with filters
     * @param {Object} params - Query parameters
     * @param {number} params.organizerId - Filter by organizer ID
     * @param {string} params.status - Filter by status (draft, published, cancelled, completed)
     * @param {string} params.category - Filter by category
     * @param {boolean} params.isPublic - Filter by visibility
     * @param {string} params.search - Search query
     * @param {string} params.startDateFrom - Filter events starting after this date
     * @param {string} params.startDateTo - Filter events starting before this date
     * @param {number} params.page - Page number (default: 1)
     * @param {number} params.limit - Items per page (default: 10)
     * @param {string} params.sortBy - Sort field (default: createdAt)
     * @param {string} params.sortOrder - Sort order (asc/desc, default: desc)
     * @returns {Promise} Paginated events list
     */
    async getEvents(params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {})
        ).toString();

        const response = await ticketingAxios.get(
            `/api/public-events${queryString ? `?${queryString}` : ''}`
        );
        return response.data;
    },

    /**
     * Get my events (organizer's events)
     * @param {number} organizerId - Organizer user ID
     * @param {Object} params - Additional query parameters
     * @returns {Promise} Organizer's events
     */
    async getMyEvents(organizerId, params = {}) {
        return this.getEvents({ organizerId, ...params });
    },

    /**
     * Get single event by ID
     * @param {number} id - Event ID
     * @returns {Promise} Event details
     */
    async getEvent(id) {
        const response = await ticketingAxios.get(`/api/public-events/${id}`);
        return response.data;
    },

    /**
     * Create new public event
     * @param {Object} eventData - Event data
     * @returns {Promise} Created event
     */
    async createEvent(eventData) {
        const response = await ticketingAxios.post('/api/public-events', eventData);
        return response.data;
    },

    /**
     * Update existing event
     * @param {number} id - Event ID
     * @param {Object} updates - Fields to update
     * @returns {Promise} Updated event
     */
    async updateEvent(id, updates) {
        const response = await ticketingAxios.patch(`/api/public-events/${id}`, updates);
        return response.data;
    },

    /**
     * Delete event (soft delete)
     * @param {number} id - Event ID
     * @returns {Promise} Deletion result
     */
    async deleteEvent(id) {
        const response = await ticketingAxios.delete(`/api/public-events/${id}`);
        return response.data;
    },

    /**
     * Publish event
     * @param {number} id - Event ID
     * @returns {Promise} Published event
     */
    async publishEvent(id) {
        const response = await ticketingAxios.post(`/api/public-events/${id}/publish`);
        return response.data;
    },

    /**
     * Unpublish event
     * @param {number} id - Event ID
     * @returns {Promise} Unpublished event
     */
    async unpublishEvent(id) {
        const response = await ticketingAxios.post(`/api/public-events/${id}/unpublish`);
        return response.data;
    },

    /**
     * Cancel event
     * @param {number} id - Event ID
     * @returns {Promise} Cancelled event
     */
    async cancelEvent(id) {
        const response = await ticketingAxios.post(`/api/public-events/${id}/cancel`);
        return response.data;
    },

    /**
     * Get event statistics
     * @param {number} id - Event ID
     * @returns {Promise} Event statistics (sales, revenue, attendance)
     */
    async getEventStats(id) {
        const response = await ticketingAxios.get(`/api/public-events/${id}/stats`);
        return response.data;
    },

    /**
     * Get active event categories (for dropdowns/forms)
     * @returns {Promise} Categories list
     */
    async getCategories() {
        const response = await ticketingAxios.get('/api/public-events/categories?activeOnly=true');
        return response.data;
    },

    /**
     * Seed sample events data (development only)
     * @returns {Promise} Seed result
     */
    async seedEvents() {
        const response = await ticketingAxios.post('/api/seed-public-events');
        return response.data;
    },

    /**
     * Get seed data summary (development only)
     * @returns {Promise} Seed summary
     */
    async getSeedSummary() {
        const response = await ticketingAxios.get('/api/seed-public-events');
        return response.data;
    },

    /**
     * Get upcoming events
     * @param {number} limit - Maximum number of events
     * @returns {Promise} Upcoming events
     */
    async getUpcomingEvents(limit = 10) {
        const now = new Date().toISOString();
        return this.getEvents({
            status: 'published',
            isPublic: true,
            startDateFrom: now,
            sortBy: 'startDate',
            sortOrder: 'asc',
            limit,
        });
    },

    /**
     * Get past events
     * @param {number} limit - Maximum number of events
     * @returns {Promise} Past events
     */
    async getPastEvents(limit = 10) {
        const now = new Date().toISOString();
        return this.getEvents({
            startDateTo: now,
            sortBy: 'startDate',
            sortOrder: 'desc',
            limit,
        });
    },

    /**
     * Get events by category
     * @param {string} category - Category slug
     * @param {Object} params - Additional parameters
     * @returns {Promise} Events in category
     */
    async getEventsByCategory(category, params = {}) {
        return this.getEvents({ category, ...params });
    },

    /**
     * Search events
     * @param {string} query - Search query
     * @param {Object} params - Additional parameters
     * @returns {Promise} Search results
     */
    async searchEvents(query, params = {}) {
        return this.getEvents({ search: query, ...params });
    },

    /**
     * Get draft events for organizer
     * @param {number} organizerId - Organizer user ID
     * @param {Object} params - Additional parameters
     * @returns {Promise} Draft events
     */
    async getDraftEvents(organizerId, params = {}) {
        return this.getEvents({
            organizerId,
            status: 'draft',
            ...params
        });
    },

    /**
     * Get published events for organizer
     * @param {number} organizerId - Organizer user ID
     * @param {Object} params - Additional parameters
     * @returns {Promise} Published events
     */
    async getPublishedEvents(organizerId, params = {}) {
        return this.getEvents({
            organizerId,
            status: 'published',
            ...params
        });
    },

    /**
     * Duplicate event
     * Creates a copy of an existing event as a draft
     * @param {number} id - Event ID to duplicate
     * @returns {Promise} Duplicated event
     */
    async duplicateEvent(id) {
        // Get the original event
        const { event: originalEvent } = await this.getEvent(id);

        // Create a copy with modified title and draft status
        const duplicateData = {
            ...originalEvent,
            title: `${originalEvent.title} (Copy)`,
            status: 'draft',
            isPublic: false,
        };

        // Remove fields that shouldn't be copied
        delete duplicateData.id;
        delete duplicateData.slug;
        delete duplicateData.createdAt;
        delete duplicateData.updatedAt;

        return this.createEvent(duplicateData);
    },

    /**
     * Validate event data before submission
     * @param {Object} eventData - Event data to validate
     * @returns {Object} Validation result { valid: boolean, errors: array }
     */
    validateEventData(eventData) {
        const errors = [];

        // Required fields
        const requiredFields = [
            { field: 'organizerId', message: 'Organizer ID is required' },
            { field: 'title', message: 'Event title is required' },
            { field: 'description', message: 'Event description is required' },
            { field: 'category', message: 'Event category is required' },
            { field: 'startDate', message: 'Start date is required' },
            { field: 'timezone', message: 'Timezone is required' },
            { field: 'venueName', message: 'Venue name is required' },
            { field: 'venueAddress', message: 'Venue address is required' },
            { field: 'city', message: 'City is required' },
            { field: 'country', message: 'Country is required' },
            { field: 'eventType', message: 'Event type is required' },
            { field: 'currency', message: 'Currency is required' },
            { field: 'organizerName', message: 'Organizer name is required' },
            { field: 'organizerEmail', message: 'Organizer email is required' },
        ];

        requiredFields.forEach(({ field, message }) => {
            const value = eventData[field];
            // For organizerId (number), check if it exists and is not null/undefined
            // For strings, check if they exist and are not empty after trimming
            if (field === 'organizerId') {
                if (value === null || value === undefined || value === '') {
                    errors.push(message);
                }
            } else {
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    errors.push(message);
                }
            }
        });

        // Validate email format
        if (eventData.organizerEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(eventData.organizerEmail)) {
                errors.push('Invalid organizer email format');
            }
        }

        // Validate dates
        if (eventData.startDate) {
            const startDate = new Date(eventData.startDate);
            if (isNaN(startDate.getTime())) {
                errors.push('Invalid start date format');
            }

            // Check if end date is after start date
            if (eventData.endDate) {
                const endDate = new Date(eventData.endDate);
                if (endDate <= startDate) {
                    errors.push('End date must be after start date');
                }
            }
        }

        // Validate capacity
        if (eventData.globalCapacity !== null && eventData.globalCapacity !== undefined) {
            if (eventData.globalCapacity < 0) {
                errors.push('Capacity cannot be negative');
            }
        }

        // Validate tax rate
        if (eventData.taxRate !== undefined) {
            if (eventData.taxRate < 0 || eventData.taxRate > 100) {
                errors.push('Tax rate must be between 0 and 100');
            }
        }

        // Validate service charges
        if (eventData.serviceCharges && Array.isArray(eventData.serviceCharges)) {
            eventData.serviceCharges.forEach((charge, index) => {
                if (!charge.title?.trim()) {
                    errors.push(`Service charge #${index + 1} requires a title`);
                }
                if (!['per_ticket', 'per_cart'].includes(charge.type)) {
                    errors.push(`Service charge #${index + 1} has invalid type`);
                }
                if (!['fixed_price', 'percentage'].includes(charge.amountType)) {
                    errors.push(`Service charge #${index + 1} has invalid amount type`);
                }
                if (typeof charge.amount !== 'number' || charge.amount < 0) {
                    errors.push(`Service charge #${index + 1} requires a valid non-negative amount`);
                }
                // Validate percentage is not greater than 100
                if (charge.amountType === 'percentage' && charge.amount > 100) {
                    errors.push(`Service charge #${index + 1} percentage cannot exceed 100%`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },
};

export default publicEventsService;
