/**
 * Redux Slice: Organizer Sales
 * Manages organizer view of their own event sales and complimentary tickets
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import organizerSalesService from '@/services/organizerSales.service';

// ==================== HELPERS ====================

/**
 * Normalize sale data from API
 */
export const normalizeSaleData = (sale) => ({
    id: sale.id,
    orderNumber: sale.order_number,
    status: sale.status,
    total: sale.total,
    currency: sale.currency,
    customerName: sale.customer_name,
    customerEmail: sale.customer_email,
    isComplimentary: sale.is_complimentary,
    complimentaryReason: sale.complimentary_reason,
    ticketCount: sale.ticket_count,
    paidAt: sale.paid_at,
    createdAt: sale.created_at,
    event: sale.event ? {
        id: sale.event.id,
        title: sale.event.title,
        startDate: sale.event.start_date,
    } : null,
});

// ==================== ASYNC THUNKS ====================

/**
 * Fetch organizer sales with filters
 */
export const fetchOrganizerSales = createAsyncThunk(
    'organizerSales/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await organizerSalesService.getSales(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || error.response?.data || { error: 'Failed to fetch sales' });
        }
    }
);

/**
 * Fetch sale details
 */
export const fetchSaleDetails = createAsyncThunk(
    'organizerSales/fetchDetails',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await organizerSalesService.getSaleDetails(orderId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || error.response?.data || { error: 'Failed to fetch sale details' });
        }
    }
);

/**
 * Export sales to CSV
 */
export const exportSales = createAsyncThunk(
    'organizerSales/export',
    async (params, { rejectWithValue }) => {
        try {
            const blob = await organizerSalesService.exportSales(params);
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sales-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            return { success: true };
        } catch (error) {
            return rejectWithValue(error.message || error.response?.data || { error: 'Failed to export sales' });
        }
    }
);

// ==================== INITIAL STATE ====================

const initialState = {
    // Sales data
    sales: [],
    currentSale: null,

    // Summary statistics
    summary: {
        total_orders: 0,
        total_revenue: 0,
        total_tickets_sold: 0,
        paid_orders: 0,
        complimentary_orders: 0,
        complimentary_tickets: 0,
    },

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
        status: 'paid',
        includeComplimentary: true,
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

const organizerSalesSlice = createSlice({
    name: 'organizerSales',
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
                status: 'paid',
                includeComplimentary: true,
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
         * Clear current sale
         */
        clearCurrentSale: (state) => {
            state.currentSale = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch all sales
        builder
            .addCase(fetchOrganizerSales.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrganizerSales.fulfilled, (state, action) => {
                state.loading = false;
                state.sales = action.payload.data || [];
                state.summary = action.payload.summary || initialState.summary;
                state.meta = action.payload.meta || initialState.meta;
                state.error = null;
            })
            .addCase(fetchOrganizerSales.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.payload?.error || 'Failed to fetch sales';
                state.sales = [];
            });

        // Fetch sale details
        builder
            .addCase(fetchSaleDetails.pending, (state) => {
                state.detailsLoading = true;
                state.detailsError = null;
            })
            .addCase(fetchSaleDetails.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.currentSale = normalizeSaleData(action.payload.data || action.payload);
                state.detailsError = null;
            })
            .addCase(fetchSaleDetails.rejected, (state, action) => {
                state.detailsLoading = false;
                state.detailsError = action.payload?.message || action.payload?.error || 'Failed to fetch sale details';
            });

        // Export sales
        builder
            .addCase(exportSales.pending, (state) => {
                state.exporting = true;
                state.error = null;
            })
            .addCase(exportSales.fulfilled, (state) => {
                state.exporting = false;
                state.successMessage = 'Sales exported successfully';
            })
            .addCase(exportSales.rejected, (state, action) => {
                state.exporting = false;
                state.error = action.payload?.message || action.payload?.error || 'Failed to export sales';
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
    clearCurrentSale,
} = organizerSalesSlice.actions;

// Selectors
export const selectSales = (state) => state.organizerSales.sales;
export const selectCurrentSale = (state) => state.organizerSales.currentSale;
export const selectSummary = (state) => state.organizerSales.summary;
export const selectMeta = (state) => state.organizerSales.meta;
export const selectFilters = (state) => state.organizerSales.filters;
export const selectLoading = (state) => state.organizerSales.loading;
export const selectDetailsLoading = (state) => state.organizerSales.detailsLoading;
export const selectError = (state) => state.organizerSales.error;
export const selectDetailsError = (state) => state.organizerSales.detailsError;
export const selectExporting = (state) => state.organizerSales.exporting;
export const selectSuccessMessage = (state) => state.organizerSales.successMessage;

export default organizerSalesSlice.reducer;
