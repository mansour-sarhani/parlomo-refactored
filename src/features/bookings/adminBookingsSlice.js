/**
 * Redux Slice: Admin Bookings
 * Manages admin view of all bookings across all events
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminBookingsService from '@/services/adminBookings.service';

// ==================== HELPERS ====================

/**
 * Normalize booking data from API
 */
export const normalizeBookingData = (booking) => ({
    id: booking.id,
    orderNumber: booking.order_number,
    status: booking.status,
    subtotal: booking.subtotal,
    discount: booking.discount,
    fees: booking.fees,
    tax: booking.tax,
    total: booking.total,
    currency: booking.currency,
    customerName: booking.customer_name,
    customerEmail: booking.customer_email,
    customerPhone: booking.customer_phone,
    isComplimentary: booking.is_complimentary,
    complimentaryReason: booking.complimentary_reason,
    paidAt: booking.paid_at,
    createdAt: booking.created_at,
    event: booking.event ? {
        id: booking.event.id,
        title: booking.event.title,
        startDate: booking.event.start_date,
        organizer: booking.event.organizer ? {
            id: booking.event.organizer.id,
            name: booking.event.organizer.name,
            email: booking.event.organizer.email,
        } : null,
    } : null,
    ticketCount: booking.ticket_count,
    items: booking.items || [],
});

// ==================== ASYNC THUNKS ====================

/**
 * Fetch all bookings with filters
 */
export const fetchAdminBookings = createAsyncThunk(
    'adminBookings/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await adminBookingsService.getAllBookings(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || error.response?.data || { error: 'Failed to fetch bookings' });
        }
    }
);

/**
 * Fetch booking details
 */
export const fetchBookingDetails = createAsyncThunk(
    'adminBookings/fetchDetails',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await adminBookingsService.getBookingDetails(orderId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || error.response?.data || { error: 'Failed to fetch booking details' });
        }
    }
);

/**
 * Export bookings to CSV
 */
export const exportBookings = createAsyncThunk(
    'adminBookings/export',
    async (params, { rejectWithValue }) => {
        try {
            const blob = await adminBookingsService.exportBookings(params);
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            return { success: true };
        } catch (error) {
            return rejectWithValue(error.message || error.response?.data || { error: 'Failed to export bookings' });
        }
    }
);

// ==================== INITIAL STATE ====================

const initialState = {
    // Bookings data
    bookings: [],
    currentBooking: null,

    // Pagination
    meta: {
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
    },

    // Filters
    filters: {
        eventId: null,
        status: null,
        complimentary: null,
        organizerId: null,
        search: '',
        dateFrom: null,
        dateTo: null,
        sortBy: 'created_at',
        sortOrder: 'desc',
        page: 1,
        limit: 15,
    },

    // UI states
    loading: false,
    error: null,
    detailsLoading: false,
    detailsError: null,
    exporting: false,

    // Success messages
    successMessage: null,
};

// ==================== SLICE ====================

const adminBookingsSlice = createSlice({
    name: 'adminBookings',
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
                eventId: null,
                status: null,
                complimentary: null,
                organizerId: null,
                search: '',
                dateFrom: null,
                dateTo: null,
                sortBy: 'created_at',
                sortOrder: 'desc',
                page: 1,
                limit: 15,
            };
        },

        /**
         * Set page
         */
        setPage: (state, action) => {
            state.filters.page = action.payload;
        },

        /**
         * Clear error
         */
        clearError: (state) => {
            state.error = null;
            state.detailsError = null;
        },

        /**
         * Clear success message
         */
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },

        /**
         * Clear current booking
         */
        clearCurrentBooking: (state) => {
            state.currentBooking = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch all bookings
        builder
            .addCase(fetchAdminBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.bookings = action.payload.data || [];
                state.meta = action.payload.meta || initialState.meta;
                state.error = null;
            })
            .addCase(fetchAdminBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.payload?.error || 'Failed to fetch bookings';
                state.bookings = [];
            });

        // Fetch booking details
        builder
            .addCase(fetchBookingDetails.pending, (state) => {
                state.detailsLoading = true;
                state.detailsError = null;
            })
            .addCase(fetchBookingDetails.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.currentBooking = normalizeBookingData(action.payload.data || action.payload);
                state.detailsError = null;
            })
            .addCase(fetchBookingDetails.rejected, (state, action) => {
                state.detailsLoading = false;
                state.detailsError = action.payload?.message || action.payload?.error || 'Failed to fetch booking details';
            });

        // Export bookings
        builder
            .addCase(exportBookings.pending, (state) => {
                state.exporting = true;
                state.error = null;
            })
            .addCase(exportBookings.fulfilled, (state) => {
                state.exporting = false;
                state.successMessage = 'Bookings exported successfully';
            })
            .addCase(exportBookings.rejected, (state, action) => {
                state.exporting = false;
                state.error = action.payload?.message || action.payload?.error || 'Failed to export bookings';
            });
    },
});

// ==================== EXPORTS ====================

export const {
    setFilters,
    clearFilters,
    setPage,
    clearError,
    clearSuccessMessage,
    clearCurrentBooking,
} = adminBookingsSlice.actions;

// Selectors
export const selectBookings = (state) => state.adminBookings.bookings;
export const selectCurrentBooking = (state) => state.adminBookings.currentBooking;
export const selectMeta = (state) => state.adminBookings.meta;
export const selectFilters = (state) => state.adminBookings.filters;
export const selectLoading = (state) => state.adminBookings.loading;
export const selectDetailsLoading = (state) => state.adminBookings.detailsLoading;
export const selectError = (state) => state.adminBookings.error;
export const selectDetailsError = (state) => state.adminBookings.detailsError;
export const selectExporting = (state) => state.adminBookings.exporting;
export const selectSuccessMessage = (state) => state.adminBookings.successMessage;

export default adminBookingsSlice.reducer;
