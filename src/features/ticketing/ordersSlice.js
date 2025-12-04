/**
 * Redux Slice: Orders
 * Manages user orders, order history, and tickets
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ticketingService from '@/services/ticketing.service';

// ==================== ASYNC THUNKS ====================

/**
 * Fetch user orders
 */
export const fetchUserOrders = createAsyncThunk(
    'orders/fetchUserOrders',
    async (userId, { rejectWithValue }) => {
        try {
            return await ticketingService.getUserOrders(userId);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to fetch orders' });
        }
    }
);

/**
 * Fetch order details
 */
export const fetchOrderDetails = createAsyncThunk(
    'orders/fetchOrderDetails',
    async (orderId, { rejectWithValue }) => {
        try {
            return await ticketingService.getOrder(orderId);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to fetch order details' });
        }
    }
);

/**
 * Fetch order tickets
 */
export const fetchOrderTickets = createAsyncThunk(
    'orders/fetchOrderTickets',
    async (orderId, { rejectWithValue }) => {
        try {
            return await ticketingService.getOrderTickets(orderId);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to fetch order tickets' });
        }
    }
);

// ==================== INITIAL STATE ====================

const initialState = {
    // Orders list
    orders: [],
    ordersLoading: false,
    ordersError: null,

    // Current order details
    currentOrder: null,
    currentOrderLoading: false,
    currentOrderError: null,

    // Current order tickets
    currentOrderTickets: [],
    ticketsLoading: false,
    ticketsError: null,

    // Pagination (for future use)
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
};

// ==================== SLICE ====================

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        /**
         * Clear current order
         */
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
            state.currentOrderTickets = [];
            state.currentOrderError = null;
            state.ticketsError = null;
        },

        /**
         * Set current page
         */
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },

        /**
         * Reset orders state
         */
        resetOrders: () => initialState,
    },
    extraReducers: (builder) => {
        // Fetch User Orders
        builder
            .addCase(fetchUserOrders.pending, (state) => {
                state.ordersLoading = true;
                state.ordersError = null;
            })
            .addCase(fetchUserOrders.fulfilled, (state, action) => {
                state.ordersLoading = false;
                state.orders = action.payload.orders || [];
                state.totalOrders = action.payload.total || 0;
                state.totalPages = action.payload.totalPages || 1;
            })
            .addCase(fetchUserOrders.rejected, (state, action) => {
                state.ordersLoading = false;
                state.ordersError = action.payload?.error || 'Failed to fetch orders';
            });

        // Fetch Order Details
        builder
            .addCase(fetchOrderDetails.pending, (state) => {
                state.currentOrderLoading = true;
                state.currentOrderError = null;
            })
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.currentOrderLoading = false;
                state.currentOrder = action.payload.order;
            })
            .addCase(fetchOrderDetails.rejected, (state, action) => {
                state.currentOrderLoading = false;
                state.currentOrderError = action.payload?.error || 'Failed to fetch order details';
            });

        // Fetch Order Tickets
        builder
            .addCase(fetchOrderTickets.pending, (state) => {
                state.ticketsLoading = true;
                state.ticketsError = null;
            })
            .addCase(fetchOrderTickets.fulfilled, (state, action) => {
                state.ticketsLoading = false;
                state.currentOrderTickets = action.payload.tickets || [];
            })
            .addCase(fetchOrderTickets.rejected, (state, action) => {
                state.ticketsLoading = false;
                state.ticketsError = action.payload?.error || 'Failed to fetch order tickets';
            });
    },
});

// ==================== EXPORTS ====================

export const {
    clearCurrentOrder,
    setCurrentPage,
    resetOrders,
} = ordersSlice.actions;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectOrdersLoading = (state) => state.orders.ordersLoading;
export const selectOrdersError = (state) => state.orders.ordersError;

export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectCurrentOrderLoading = (state) => state.orders.currentOrderLoading;
export const selectCurrentOrderError = (state) => state.orders.currentOrderError;

export const selectCurrentOrderTickets = (state) => state.orders.currentOrderTickets;
export const selectTicketsLoading = (state) => state.orders.ticketsLoading;
export const selectTicketsError = (state) => state.orders.ticketsError;

export const selectOrdersPagination = (state) => ({
    currentPage: state.orders.currentPage,
    totalPages: state.orders.totalPages,
    totalOrders: state.orders.totalOrders,
});

// Get order by ID from cached orders
export const selectOrderById = (orderId) => (state) => {
    return state.orders.orders.find(order => order.id === orderId);
};

// Get ticket count for current order
export const selectCurrentOrderTicketCount = (state) => {
    return state.orders.currentOrderTickets.length;
};

// Get valid tickets (not used/cancelled)
export const selectValidTickets = (state) => {
    return state.orders.currentOrderTickets.filter(
        ticket => ticket.status === 'valid'
    );
};

// Get used tickets
export const selectUsedTickets = (state) => {
    return state.orders.currentOrderTickets.filter(
        ticket => ticket.status === 'used'
    );
};

export default ordersSlice.reducer;
