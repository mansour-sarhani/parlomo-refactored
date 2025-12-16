/**
 * Redux Slice: Public Events
 * Manages organizer-created public events, categories, and event statistics
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import publicEventsService from '@/services/public-events.service';

// ==================== HELPERS ====================

/**
 * Build full image URL from path and filename
 */
const buildImageUrl = (path, filename) => {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    const baseUrl = process.env.NEXT_PUBLIC_URL_KEY || 'https://api.parlomo.co.uk';
    return `${baseUrl}${path || '/images/public-events'}/${filename}`;
};

/**
 * Parse gallery images - handles JSON string or array
 */
const parseGalleryImages = (galleryImages) => {
    if (!galleryImages) return [];
    if (Array.isArray(galleryImages)) return galleryImages;
    if (typeof galleryImages === 'string') {
        try {
            const parsed = JSON.parse(galleryImages);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

/**
 * Convert age restriction integer to form string format
 * Backend stores: 18 (integer)
 * Form expects: '18+' (string)
 */
const normalizeAgeRestriction = (ageRestriction) => {
    if (ageRestriction === null || ageRestriction === undefined || ageRestriction === 0) {
        return 'all_ages';
    }
    // If it's already a string in the expected format, return as-is
    if (typeof ageRestriction === 'string') {
        return ageRestriction;
    }
    // Convert integer to string format (e.g., 18 -> '18+')
    return `${ageRestriction}+`;
};

/**
 * Normalize event data from API (snake_case) to frontend (camelCase)
 */
export const normalizeEventData = (event) => ({
    id: event.id,
    categoryId: event.category_id,
    organizerId: event.organizer_id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    status: event.status,
    eventType: event.event_type,
    startDate: event.start_date,
    endDate: event.end_date,
    bookingDeadline: event.booking_deadline,
    doorsOpen: event.doors_open,
    timezone: event.timezone,
    venueName: event.venue_name,
    venueCapacity: event.venue_capacity,
    venueAddress: event.address,
    location: {
        address: event.address,
        city: event.city,
        state: event.state,
        country: event.country,
        postcode: event.postcode,
        coordinates: {
            lat: event.lat != null ? parseFloat(event.lat) : null,
            lng: event.lng != null ? parseFloat(event.lng) : null,
        },
    },
    globalCapacity: event.global_capacity,
    currency: event.currency,
    waitlistEnabled: event.waitlist_enabled,
    coverImage: buildImageUrl(event.path, event.cover_image),
    galleryImages: parseGalleryImages(event.gallery_images).map(img => buildImageUrl(event.path, img)),
    videoUrl: event.video_url,
    ageRestriction: normalizeAgeRestriction(event.age_restriction),
    showRemainingTickets: event.show_remaining_tickets || false,
    refundPolicy: event.refund_policy,
    termsAndConditions: event.terms_and_conditions,
    taxRate: event.tax_rate,
    serviceCharges: event.service_charges,
    tags: event.tags,
    featured: event.featured,
    organizerName: event.organizer_name,
    organizerEmail: event.organizer_email,
    organizerPhone: event.organizer_phone,
    organizerWebsite: event.organizer_website,
    organizerFacebook: event.organizer_facebook,
    organizerInstagram: event.organizer_instagram,
    organizerWhatsApp: event.organizer_whatsapp,
    category: event.category,
    organizer: {
        id: event.organizer?.id || event.organizer_id,
        name: event.organizer_name || event.organizer?.name,
        email: event.organizer_email || event.organizer?.email,
        phone: event.organizer_phone || event.organizer?.phone,
        website: event.organizer_website || event.organizer?.website,
        facebook: event.organizer_facebook || event.organizer?.facebook,
        instagram: event.organizer_instagram || event.organizer?.instagram,
        whatsApp: event.organizer_whatsapp || event.organizer?.whatsapp,
    },
    createdAt: event.created_at,
    updatedAt: event.updated_at,
});

// ==================== ASYNC THUNKS ====================

/**
 * Fetch organizer's events
 */
export const fetchMyEvents = createAsyncThunk(
    'publicEvents/fetchMyEvents',
    async (params, { rejectWithValue }) => {
        try {
            return await publicEventsService.getMyEvents(params);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to fetch events' });
        }
    }
);

/**
 * Fetch single event by ID (for panel/admin pages)
 */
export const fetchEventById = createAsyncThunk(
    'publicEvents/fetchEventById',
    async (eventId, { rejectWithValue }) => {
        try {
            return await publicEventsService.getEventById(eventId);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to fetch event' });
        }
    }
);

/**
 * Create new event
 */
export const createEvent = createAsyncThunk(
    'publicEvents/createEvent',
    async (eventData, { rejectWithValue }) => {
        try {
            // Validate data before submission
            const validation = publicEventsService.validateEventData(eventData);
            if (!validation.valid) {
                return rejectWithValue({ error: 'Validation failed', errors: validation.errors });
            }

            return await publicEventsService.createEvent(eventData);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to create event' });
        }
    }
);

/**
 * Update existing event
 */
export const updateEvent = createAsyncThunk(
    'publicEvents/updateEvent',
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            return await publicEventsService.updateEvent(id, updates);
        } catch (error) {
            // Handle both axios interceptor format and raw axios error format
            const errorMessage = error.message || error.response?.data?.message || error.response?.data?.error || 'Failed to update event';
            return rejectWithValue({ error: errorMessage });
        }
    }
);

/**
 * Delete event
 */
export const deleteEvent = createAsyncThunk(
    'publicEvents/deleteEvent',
    async (eventId, { rejectWithValue }) => {
        try {
            await publicEventsService.deleteEvent(eventId);
            return eventId;
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to delete event' });
        }
    }
);

/**
 * Publish event
 */
export const publishEvent = createAsyncThunk(
    'publicEvents/publishEvent',
    async (eventId, { rejectWithValue }) => {
        try {
            return await publicEventsService.publishEvent(eventId);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to publish event' });
        }
    }
);

/**
 * Unpublish event
 */
export const unpublishEvent = createAsyncThunk(
    'publicEvents/unpublishEvent',
    async (eventId, { rejectWithValue }) => {
        try {
            return await publicEventsService.unpublishEvent(eventId);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to unpublish event' });
        }
    }
);

/**
 * Cancel event
 */
export const cancelEvent = createAsyncThunk(
    'publicEvents/cancelEvent',
    async (eventId, { rejectWithValue }) => {
        try {
            return await publicEventsService.cancelEvent(eventId);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to cancel event' });
        }
    }
);

/**
 * Fetch event statistics
 */
export const fetchEventStats = createAsyncThunk(
    'publicEvents/fetchEventStats',
    async (eventId, { rejectWithValue }) => {
        try {
            return await publicEventsService.getEventStats(eventId);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to fetch event statistics' });
        }
    }
);

/**
 * Fetch event categories
 */
export const fetchCategories = createAsyncThunk(
    'publicEvents/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            return await publicEventsService.getCategories();
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to fetch categories' });
        }
    }
);

/**
 * Duplicate event
 */
export const duplicateEvent = createAsyncThunk(
    'publicEvents/duplicateEvent',
    async (eventId, { rejectWithValue }) => {
        try {
            return await publicEventsService.duplicateEvent(eventId);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to duplicate event' });
        }
    }
);

/**
 * Fetch upcoming events (public)
 */
export const fetchUpcomingEvents = createAsyncThunk(
    'publicEvents/fetchUpcomingEvents',
    async (limit = 10, { rejectWithValue }) => {
        try {
            return await publicEventsService.getUpcomingEvents(limit);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to fetch upcoming events' });
        }
    }
);

// ==================== INITIAL STATE ====================

const initialState = {
    // Events data
    myEvents: [],
    currentEvent: null,
    upcomingEvents: [],

    // Categories
    categories: [],

    // Event statistics
    currentEventStats: null,

    // Pagination
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
    },

    // Filters
    filters: {
        status: null,
        category: null,
        search: null,
    },

    // UI states
    loading: false,
    error: null,

    // Operation states
    creating: false,
    updating: false,
    deleting: false,

    // Success messages
    successMessage: null,
};

// ==================== SLICE ====================

const publicEventsSlice = createSlice({
    name: 'publicEvents',
    initialState,
    reducers: {
        /**
         * Set filters
         */
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        /**
         * Clear filters
         */
        clearFilters: (state) => {
            state.filters = {
                status: null,
                category: null,
                search: null,
            };
        },

        /**
         * Set current event
         */
        setCurrentEvent: (state, action) => {
            state.currentEvent = action.payload;
        },

        /**
         * Clear current event
         */
        clearCurrentEvent: (state) => {
            state.currentEvent = null;
            state.currentEventStats = null;
        },

        /**
         * Clear error
         */
        clearError: (state) => {
            state.error = null;
        },

        /**
         * Clear success message
         */
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },

        /**
         * Reset public events state
         */
        resetPublicEvents: () => initialState,
    },
    extraReducers: (builder) => {
        // Fetch My Events
        builder
            .addCase(fetchMyEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.myEvents = (action.payload.data || []).map(normalizeEventData);
                state.pagination = action.payload.meta ? {
                    page: action.payload.meta.current_page,
                    limit: action.payload.meta.per_page,
                    total: action.payload.meta.total,
                    totalPages: action.payload.meta.last_page,
                } : state.pagination;
            })
            .addCase(fetchMyEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to fetch events';
            });

        // Fetch Event By ID
        builder
            .addCase(fetchEventById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEventById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentEvent = action.payload.data || action.payload.event;
            })
            .addCase(fetchEventById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to fetch event';
            });

        // Create Event
        builder
            .addCase(createEvent.pending, (state) => {
                state.creating = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createEvent.fulfilled, (state, action) => {
                state.creating = false;
                const event = action.payload.data || action.payload.event;
                const normalizedEvent = normalizeEventData(event);
                state.currentEvent = normalizedEvent;
                state.myEvents.unshift(normalizedEvent);
                state.successMessage = 'Event created successfully';
            })
            .addCase(createEvent.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload?.error || 'Failed to create event';
            });

        // Update Event
        builder
            .addCase(updateEvent.pending, (state) => {
                state.updating = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateEvent.fulfilled, (state, action) => {
                state.updating = false;
                const event = action.payload.data || action.payload.event;
                const normalizedEvent = normalizeEventData(event);
                state.currentEvent = normalizedEvent;

                // Update in myEvents list
                const index = state.myEvents.findIndex(e => e.id === event.id);
                if (index !== -1) {
                    state.myEvents[index] = normalizedEvent;
                }

                state.successMessage = 'Event updated successfully';
            })
            .addCase(updateEvent.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.error || 'Failed to update event';
            });

        // Delete Event
        builder
            .addCase(deleteEvent.pending, (state) => {
                state.deleting = true;
                state.error = null;
            })
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.deleting = false;

                // Remove from myEvents list
                state.myEvents = state.myEvents.filter(e => e.id !== action.payload);

                // Clear current event if it was deleted
                if (state.currentEvent?.id === action.payload) {
                    state.currentEvent = null;
                }

                state.successMessage = 'Event deleted successfully';
            })
            .addCase(deleteEvent.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload?.error || 'Failed to delete event';
            });

        // Publish Event
        builder
            .addCase(publishEvent.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(publishEvent.fulfilled, (state, action) => {
                state.updating = false;
                const event = action.payload.data || action.payload.event;
                const normalizedEvent = normalizeEventData(event);
                state.currentEvent = normalizedEvent;

                // Update in myEvents list
                const index = state.myEvents.findIndex(e => e.id === event.id);
                if (index !== -1) {
                    state.myEvents[index] = normalizedEvent;
                }

                state.successMessage = 'Event published successfully';
            })
            .addCase(publishEvent.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.error || 'Failed to publish event';
            });

        // Unpublish Event
        builder
            .addCase(unpublishEvent.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(unpublishEvent.fulfilled, (state, action) => {
                state.updating = false;
                const event = action.payload.data || action.payload.event;
                const normalizedEvent = normalizeEventData(event);
                state.currentEvent = normalizedEvent;

                // Update in myEvents list
                const index = state.myEvents.findIndex(e => e.id === event.id);
                if (index !== -1) {
                    state.myEvents[index] = normalizedEvent;
                }

                state.successMessage = 'Event unpublished successfully';
            })
            .addCase(unpublishEvent.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.error || 'Failed to unpublish event';
            });

        // Cancel Event
        builder
            .addCase(cancelEvent.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(cancelEvent.fulfilled, (state, action) => {
                state.updating = false;
                const event = action.payload.data || action.payload.event;
                const normalizedEvent = normalizeEventData(event);
                state.currentEvent = normalizedEvent;

                // Update in myEvents list
                const index = state.myEvents.findIndex(e => e.id === event.id);
                if (index !== -1) {
                    state.myEvents[index] = normalizedEvent;
                }

                state.successMessage = 'Event cancelled successfully';
            })
            .addCase(cancelEvent.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.error || 'Failed to cancel event';
            });

        // Fetch Event Stats
        builder
            .addCase(fetchEventStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEventStats.fulfilled, (state, action) => {
                state.loading = false;
                state.currentEventStats = action.payload.stats;
            })
            .addCase(fetchEventStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to fetch event statistics';
            });

        // Fetch Categories
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.data || action.payload.categories || [];
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to fetch categories';
            });

        // Duplicate Event
        builder
            .addCase(duplicateEvent.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(duplicateEvent.fulfilled, (state, action) => {
                state.creating = false;
                const event = action.payload.data || action.payload.event;
                const normalizedEvent = normalizeEventData(event);
                state.currentEvent = normalizedEvent;
                state.myEvents.unshift(normalizedEvent);
                state.successMessage = 'Event duplicated successfully';
            })
            .addCase(duplicateEvent.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload?.error || 'Failed to duplicate event';
            });

        // Fetch Upcoming Events
        builder
            .addCase(fetchUpcomingEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.upcomingEvents = action.payload.events || [];
            })
            .addCase(fetchUpcomingEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to fetch upcoming events';
            });
    },
});

// ==================== EXPORTS ====================

export const {
    setFilters,
    clearFilters,
    setCurrentEvent,
    clearCurrentEvent,
    clearError,
    clearSuccessMessage,
    resetPublicEvents,
} = publicEventsSlice.actions;

// Selectors
export const selectMyEvents = (state) => state.publicEvents.myEvents;
export const selectCurrentEvent = (state) => state.publicEvents.currentEvent;
export const selectUpcomingEvents = (state) => state.publicEvents.upcomingEvents;
export const selectCategories = (state) => state.publicEvents.categories;
export const selectCurrentEventStats = (state) => state.publicEvents.currentEventStats;
export const selectPagination = (state) => state.publicEvents.pagination;
export const selectFilters = (state) => state.publicEvents.filters;
export const selectPublicEventsLoading = (state) => state.publicEvents.loading;
export const selectPublicEventsError = (state) => state.publicEvents.error;
export const selectIsCreating = (state) => state.publicEvents.creating;
export const selectIsUpdating = (state) => state.publicEvents.updating;
export const selectIsDeleting = (state) => state.publicEvents.deleting;
export const selectSuccessMessage = (state) => state.publicEvents.successMessage;

// Computed selectors
export const selectDraftEvents = (state) =>
    state.publicEvents.myEvents.filter(e => e.status === 'draft');

export const selectPublishedEvents = (state) =>
    state.publicEvents.myEvents.filter(e => e.status === 'published');

export const selectCancelledEvents = (state) =>
    state.publicEvents.myEvents.filter(e => e.status === 'cancelled');

export const selectEventsByCategory = (state, category) =>
    state.publicEvents.myEvents.filter(e => {
        // Handle both populated category object and category slug/id
        const eventCategory = e.category;
        if (!eventCategory) return false;
        // If category is a populated object
        if (typeof eventCategory === 'object') {
            return eventCategory._id === category ||
                   eventCategory.id === category ||
                   eventCategory.slug === category;
        }
        // If category is a string (id or slug)
        return eventCategory === category;
    });

export const selectEventCount = (state) => state.publicEvents.myEvents.length;

export const selectHasEvents = (state) => state.publicEvents.myEvents.length > 0;

/**
 * Helper to extract category name from an event's populated category
 * Returns the category name if populated, otherwise the category id/slug
 */
export const getCategoryName = (event) => {
    if (!event?.category) return '';
    if (typeof event.category === 'object') {
        return event.category.name || event.category.slug || '';
    }
    return event.category;
};

/**
 * Helper to extract category slug from an event's populated category
 */
export const getCategorySlug = (event) => {
    if (!event?.category) return '';
    if (typeof event.category === 'object') {
        return event.category.slug || '';
    }
    return event.category;
};

export default publicEventsSlice.reducer;
