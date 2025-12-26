/**
 * Public Events Service
 * Client-side API wrapper for public events endpoints
 * Uses dedicated ticketing axios instance for local Next.js API routes
 */

import ticketingAxios from '@/lib/ticketing-axios';

/**
 * Parse age restriction to integer
 * Handles formats like "21+", "18", "21 and over", etc.
 * @param {string|number|null} value - Age restriction value
 * @returns {number|null} Parsed integer or null
 */
const parseAgeRestriction = (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return value;
    // Extract numeric part from strings like "21+", "18 and over", etc.
    const match = String(value).match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
};

/**
 * Transform frontend data to FormData for multipart upload
 * @param {Object} data - Frontend event data
 * @returns {FormData} FormData object for multipart submission
 */
const transformToFormData = (data) => {
    const formData = new FormData();

    // Organizer ID - only append if provided (null means backend uses auth user)
    if (data.organizerId) formData.append('organizerId', data.organizerId);

    // Text fields - only append if value exists
    if (data.status) formData.append('status', data.status);
    if (data.category_id) formData.append('category_id', data.category_id);
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.eventType) formData.append('event_type', data.eventType);
    if (data.startDate) formData.append('start_date', data.startDate);
    if (data.endDate) formData.append('end_date', data.endDate);
    if (data.bookingDeadline) formData.append('booking_deadline', data.bookingDeadline);
    if (data.doorsOpen) formData.append('doors_open', data.doorsOpen);
    if (data.timezone) formData.append('timezone', data.timezone);
    if (data.venueName) formData.append('venue_name', data.venueName);
    if (data.venueCapacity) formData.append('venue_capacity', data.venueCapacity);
    if (data.venueAddress) formData.append('address', data.venueAddress);
    if (data.city) formData.append('city', data.city);
    if (data.state) formData.append('state', data.state);
    if (data.country) formData.append('country', data.country);
    if (data.postcode) formData.append('postcode', data.postcode);
    if (data.latitude) formData.append('lat', data.latitude);
    if (data.longitude) formData.append('lng', data.longitude);
    if (data.globalCapacity) formData.append('global_capacity', data.globalCapacity);
    if (data.currency) formData.append('currency', data.currency);
    formData.append('waitlist_enabled', data.waitlistEnabled ? '1' : '0');
    if (data.videoUrl) formData.append('video_url', data.videoUrl);

    const ageRestriction = parseAgeRestriction(data.ageRestriction);
    if (ageRestriction !== null) formData.append('age_restriction', ageRestriction);

    if (data.refundPolicy) formData.append('refund_policy', data.refundPolicy);
    if (data.termsAndConditions) formData.append('terms_and_conditions', data.termsAndConditions);
    if (data.taxRate !== null && data.taxRate !== undefined) formData.append('tax_rate', data.taxRate);
    formData.append('featured', data.featured ? '1' : '0');
    // Send show_remaining_tickets if backend supports it
    if (data.showRemainingTickets !== undefined) {
        formData.append('show_remaining_tickets', data.showRemainingTickets ? '1' : '0');
    }

    // Send show_organizer_info for admin settings
    if (data.showOrganizerInfo !== undefined) {
        formData.append('show_organizer_info', data.showOrganizerInfo ? '1' : '0');
    }

    // Send parlomo_fee_percentage for admin settings
    if (data.parlomoFeePercentage !== undefined && data.parlomoFeePercentage !== null) {
        formData.append('parlomo_fee_percentage', data.parlomoFeePercentage);
    }

    // Send fee_paid_by (buyer or organizer)
    if (data.fee_paid_by) {
        formData.append('fee_paid_by', data.fee_paid_by);
    }

    // Organizer fields
    if (data.organizerName) formData.append('organizer_name', data.organizerName);
    if (data.organizerEmail) formData.append('organizer_email', data.organizerEmail);
    if (data.organizerPhone) formData.append('organizer_phone', data.organizerPhone);
    if (data.organizerWebsite) formData.append('organizer_website', data.organizerWebsite);
    if (data.organizerFacebook) formData.append('organizer_facebook', data.organizerFacebook);
    if (data.organizerInstagram) formData.append('organizer_instagram', data.organizerInstagram);
    if (data.organizerWhatsApp) formData.append('organizer_whatsapp', data.organizerWhatsApp);

    // Arrays - need to be JSON stringified or sent individually
    if (data.tags && data.tags.length > 0) {
        data.tags.forEach((tag, index) => {
            formData.append(`tags[${index}]`, tag);
        });
    }

    if (data.serviceCharges && data.serviceCharges.length > 0) {
        data.serviceCharges.forEach((charge, index) => {
            formData.append(`service_charges[${index}][title]`, charge.title);
            formData.append(`service_charges[${index}][type]`, charge.type);
            formData.append(`service_charges[${index}][amountType]`, charge.amountType);
            formData.append(`service_charges[${index}][amount]`, charge.amount);
        });
    }

    // Handle cover image - send as File object
    if (data.coverImage && data.coverImage instanceof File) {
        formData.append('cover_image', data.coverImage);
    }

    // Handle gallery images - send both new File objects and existing image filenames
    // galleryImages can be: array of Files, array of strings (URLs), or JSON string from API
    if (data.galleryImages) {
        let galleryImages = data.galleryImages;

        // If it's a JSON string, parse it
        if (typeof galleryImages === 'string') {
            try {
                galleryImages = JSON.parse(galleryImages);
            } catch {
                // Not valid JSON, skip
                galleryImages = [];
            }
        }

        // Separate existing images (strings/URLs) from new uploads (File objects)
        const existingImages = [];

        // Now iterate if it's an array
        if (Array.isArray(galleryImages) && galleryImages.length > 0) {
            galleryImages.forEach((image) => {
                if (image instanceof File) {
                    // New upload - send as file
                    formData.append('gallery_images[]', image);
                } else if (typeof image === 'string' && image) {
                    // Existing image - extract filename from URL and track it
                    // URL format: https://api.parlomo.co.uk/images/public-events/filename.jpg
                    const filename = image.split('/').pop();
                    if (filename) {
                        existingImages.push(filename);
                    }
                }
            });
        }

        // Send existing image filenames so backend knows which to keep
        if (existingImages.length > 0) {
            existingImages.forEach((filename, index) => {
                formData.append(`existing_gallery_images[${index}]`, filename);
            });
        }
    }

    return formData;
};

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
     * Backend uses authenticated user's ID from token
     * @param {Object} params - Query parameters
     * @returns {Promise} Organizer's events
     */
    async getMyEvents(params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {})
        ).toString();

        const response = await ticketingAxios.get(
            `/api/public-events/my-event${queryString ? `?${queryString}` : ''}`
        );
        return response.data;
    },

    /**
     * Get all events (admin only)
     * @param {Object} params - Query parameters
     * @returns {Promise} All events for admin view
     */
    async getAdminEvents(params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {})
        ).toString();

        const response = await ticketingAxios.get(
            `/api/public-events/admin${queryString ? `?${queryString}` : ''}`
        );
        return response.data;
    },

    /**
     * Get single event by slug (for public website pages)
     * @param {string} slug - Event slug
     * @returns {Promise} Event details
     */
    async getEventBySlug(slug) {
        const response = await ticketingAxios.get(`/api/public-events/slug/${slug}`);
        return response.data;
    },

    /**
     * Get single event by ID (for panel/admin pages)
     * @param {string} id - Event ID
     * @returns {Promise} Event details
     */
    async getEventById(id) {
        const response = await ticketingAxios.get(`/api/public-events/${id}`);
        return response.data;
    },

    /**
     * Create new public event
     * @param {Object} eventData - Event data
     * @returns {Promise} Created event
     */
    async createEvent(eventData) {
        const formData = transformToFormData(eventData);
        // Must explicitly set multipart/form-data to override the default 'application/json'
        // Axios will automatically add the boundary when it detects FormData
        const response = await ticketingAxios.post('/api/public-events', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Update existing event
     * @param {number} id - Event ID
     * @param {Object} updates - Fields to update
     * @returns {Promise} Updated event
     */
    async updateEvent(id, updates) {
        const formData = transformToFormData(updates);
        // Laravel doesn't support PATCH with multipart, use POST with _method
        formData.append('_method', 'PATCH');
        // Must explicitly set multipart/form-data to override the default 'application/json'
        // Axios will automatically add the boundary when it detects FormData
        const response = await ticketingAxios.post(`/api/public-events/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
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
        const response = await ticketingAxios.get('/api/public-events/categories?list=true');
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
     * @param {string} id - Event ID to duplicate
     * @returns {Promise} Duplicated event
     */
    async duplicateEvent(id) {
        // Get the original event by ID
        const { event: originalEvent } = await this.getEventById(id);

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

        // Required fields (organizerId is optional - backend uses auth user if not provided)
        const requiredFields = [
            { field: 'title', message: 'Event title is required' },
            { field: 'description', message: 'Event description is required' },
            { field: 'category_id', message: 'Event category is required' },
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
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                errors.push(message);
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
