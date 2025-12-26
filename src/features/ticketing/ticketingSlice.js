/**
 * Redux Slice: Ticketing
 * Manages event ticketing, shopping cart, promo codes, and checkout flow
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ticketingService from '@/services/ticketing.service';

// ==================== ASYNC THUNKS ====================

/**
 * Fetch event ticketing information
 */
export const fetchEventTicketing = createAsyncThunk(
    'ticketing/fetchEventTicketing',
    async (eventId, { rejectWithValue }) => {
        try {
            return await ticketingService.getEventTicketing(eventId);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to fetch event ticketing' });
        }
    }
);

/**
 * Validate promo code
 */
export const validatePromoCode = createAsyncThunk(
    'ticketing/validatePromoCode',
    async ({ eventId, code, cartItems }, { rejectWithValue }) => {
        try {
            return await ticketingService.validatePromoCode({ eventId, code, cartItems });
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to validate promo code' });
        }
    }
);

/**
 * Start checkout session
 */
export const startCheckout = createAsyncThunk(
    'ticketing/startCheckout',
    async ({ eventId, cartItems, promoCode }, { rejectWithValue }) => {
        try {
            return await ticketingService.startCheckout({ eventId, cartItems, promoCode });
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to start checkout' });
        }
    }
);

/**
 * Complete checkout
 */
export const completeCheckout = createAsyncThunk(
    'ticketing/completeCheckout',
    async (checkoutData, { rejectWithValue }) => {
        try {
            return await ticketingService.completeCheckout(checkoutData);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to complete checkout' });
        }
    }
);

// ==================== INITIAL STATE ====================

const initialState = {
    // Event ticketing data
    currentEvent: null,
    ticketTypes: [],
    eventStats: null,
    serviceCharges: [],
    taxRate: 0,

    // Shopping cart
    cart: [],
    cartTotal: 0,

    // Promo code
    promoCode: null,
    promoDiscount: 0,
    promoError: null,

    // Checkout session
    checkoutSession: null,

    // UI states
    loading: false,
    error: null,

    // Checkout flow state
    checkoutStep: 'cart', // 'cart' | 'details' | 'payment' | 'complete'
};

// ==================== SLICE ====================

const ticketingSlice = createSlice({
    name: 'ticketing',
    initialState,
    reducers: {
        /**
         * Add item to cart
         */
        addToCart: (state, action) => {
            const { ticketTypeId, quantity } = action.payload;

            // Find ticket type
            const ticketType = state.ticketTypes.find(tt => tt.id === ticketTypeId);
            if (!ticketType) return;

            // Check if item already in cart
            const existingItem = state.cart.find(item => item.ticketTypeId === ticketTypeId);

            if (existingItem) {
                // Update quantity
                const newQuantity = existingItem.quantity + quantity;

                // Check max per order
                if (newQuantity > ticketType.maxPerOrder) {
                    existingItem.quantity = ticketType.maxPerOrder;
                } else {
                    existingItem.quantity = newQuantity;
                }

                existingItem.subtotal = existingItem.quantity * ticketType.price;
            } else {
                // Add new item
                state.cart.push({
                    ticketTypeId,
                    ticketTypeName: ticketType.name,
                    quantity: Math.min(quantity, ticketType.maxPerOrder),
                    unitPrice: ticketType.price,
                    subtotal: Math.min(quantity, ticketType.maxPerOrder) * ticketType.price,
                    maxPerOrder: ticketType.maxPerOrder,
                    minPerOrder: ticketType.minPerOrder,
                });
            }

            // Recalculate cart total
            state.cartTotal = state.cart.reduce((sum, item) => sum + item.subtotal, 0);
        },

        /**
         * Update cart item quantity
         */
        updateCartQuantity: (state, action) => {
            const { ticketTypeId, quantity } = action.payload;

            const item = state.cart.find(item => item.ticketTypeId === ticketTypeId);
            if (!item) return;

            const ticketType = state.ticketTypes.find(tt => tt.id === ticketTypeId);
            if (!ticketType) return;

            // Validate quantity
            if (quantity < ticketType.minPerOrder) {
                item.quantity = ticketType.minPerOrder;
            } else if (quantity > ticketType.maxPerOrder) {
                item.quantity = ticketType.maxPerOrder;
            } else {
                item.quantity = quantity;
            }

            item.subtotal = item.quantity * item.unitPrice;

            // Recalculate cart total
            state.cartTotal = state.cart.reduce((sum, item) => sum + item.subtotal, 0);
        },

        /**
         * Remove item from cart
         */
        removeFromCart: (state, action) => {
            const ticketTypeId = action.payload;
            state.cart = state.cart.filter(item => item.ticketTypeId !== ticketTypeId);

            // Recalculate cart total
            state.cartTotal = state.cart.reduce((sum, item) => sum + item.subtotal, 0);

            // Clear promo if cart is empty
            if (state.cart.length === 0) {
                state.promoCode = null;
                state.promoDiscount = 0;
                state.promoError = null;
            }
        },

        /**
         * Clear cart
         */
        clearCart: (state) => {
            state.cart = [];
            state.cartTotal = 0;
            state.promoCode = null;
            state.promoDiscount = 0;
            state.promoError = null;
            state.checkoutSession = null;
            state.checkoutStep = 'cart';
        },

        /**
         * Set promo code
         */
        setPromoCode: (state, action) => {
            state.promoCode = action.payload;
        },

        /**
         * Clear promo code
         */
        clearPromoCode: (state) => {
            state.promoCode = null;
            state.promoDiscount = 0;
            state.promoError = null;
        },

        /**
         * Set checkout step
         */
        setCheckoutStep: (state, action) => {
            state.checkoutStep = action.payload;
        },

        /**
         * Reset ticketing state
         */
        resetTicketing: () => initialState,

        /**
         * Set ticket types directly (used when ticket types come from event response)
         */
        setTicketTypes: (state, action) => {
            const { eventId, ticketTypes, stats, serviceCharges, taxRate } = action.payload;
            state.currentEvent = eventId;
            state.ticketTypes = ticketTypes || [];
            state.eventStats = stats || null;
            state.serviceCharges = serviceCharges || [];
            state.taxRate = taxRate || 0;
        },
    },
    extraReducers: (builder) => {
        // Fetch Event Ticketing
        builder
            .addCase(fetchEventTicketing.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEventTicketing.fulfilled, (state, action) => {
                state.loading = false;
                state.currentEvent = action.payload.eventId;
                state.ticketTypes = action.payload.ticketTypes || [];
                state.eventStats = action.payload.stats || null;
            })
            .addCase(fetchEventTicketing.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to fetch event ticketing';
            });

        // Validate Promo Code
        builder
            .addCase(validatePromoCode.pending, (state) => {
                state.loading = true;
                state.promoError = null;
            })
            .addCase(validatePromoCode.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload.data || action.payload;

                if (data.valid) {
                    // Use calculated_discount from response (in cents)
                    state.promoDiscount = data.calculated_discount || data.discount_amount || 0;
                    state.promoError = null;
                } else {
                    state.promoDiscount = 0;
                    state.promoError = data.message || data.error || 'Invalid promo code';
                    state.promoCode = null;
                }
            })
            .addCase(validatePromoCode.rejected, (state, action) => {
                state.loading = false;
                state.promoError = action.payload?.message || action.payload?.error || 'Failed to validate promo code';
                state.promoDiscount = 0;
                state.promoCode = null;
            });

        // Start Checkout
        builder
            .addCase(startCheckout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(startCheckout.fulfilled, (state, action) => {
                state.loading = false;
                // Extract session data from response (handles both {data: ...} and {session: ...} formats)
                const sessionData = action.payload.data || action.payload.session || action.payload;
                state.checkoutSession = {
                    sessionId: sessionData.session_id,
                    eventId: sessionData.event_id,
                    cartItems: sessionData.cart_items?.map(item => ({
                        ticketTypeId: item.ticket_type_id,
                        ticketTypeName: item.ticket_type_name,
                        quantity: item.quantity,
                        unitPrice: item.unit_price,
                        subtotal: item.subtotal,
                    })) || [],
                    subtotal: sessionData.subtotal,
                    discount: sessionData.discount || sessionData.discount_amount || sessionData.calculated_discount || 0,
                    promoCode: sessionData.promo_code || sessionData.promoCode,
                    promoCodeId: sessionData.promo_code_id || sessionData.promoCodeId,
                    tax: sessionData.tax || 0, // Actual tax amount
                    fees: sessionData.fees || 0, // Total fees (includes parlomo_fee when buyer pays)
                    feeBreakdown: sessionData.fee_breakdown?.map(fee => ({
                        name: fee.name,
                        amount: fee.amount,
                        type: fee.type,
                    })) || [], // Fee breakdown with names
                    parlomoFee: sessionData.parlomo_fee || 0,
                    parlomoFeePercentage: sessionData.parlomo_fee_percentage || 0,
                    feePaidBy: sessionData.fee_paid_by || 'buyer',
                    total: sessionData.total,
                    currency: sessionData.currency,
                    status: sessionData.status,
                    expiresAt: sessionData.expires_at,
                    timeRemainingSeconds: sessionData.time_remaining_seconds,
                    isActive: sessionData.is_active,
                };
                state.checkoutStep = 'details';
            })
            .addCase(startCheckout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.payload?.error || 'Failed to start checkout';
            });

        // Complete Checkout
        builder
            .addCase(completeCheckout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(completeCheckout.fulfilled, (state, action) => {
                state.loading = false;
                state.checkoutStep = 'complete';
                // Cart will be cleared by the component after redirect
            })
            .addCase(completeCheckout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to complete checkout';
            });
    },
});

// ==================== EXPORTS ====================

export const {
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setPromoCode,
    clearPromoCode,
    setCheckoutStep,
    resetTicketing,
    setTicketTypes,
} = ticketingSlice.actions;

// Selectors
export const selectTicketTypes = (state) => state.ticketing.ticketTypes;
export const selectCart = (state) => state.ticketing.cart;
export const selectCartTotal = (state) => state.ticketing.cartTotal;
export const selectCartCount = (state) => state.ticketing.cart.reduce((sum, item) => sum + item.quantity, 0);
export const selectPromoCode = (state) => state.ticketing.promoCode;
export const selectPromoDiscount = (state) => state.ticketing.promoDiscount;
export const selectPromoError = (state) => state.ticketing.promoError;
export const selectCheckoutSession = (state) => state.ticketing.checkoutSession;
export const selectCheckoutStep = (state) => state.ticketing.checkoutStep;
export const selectTicketingLoading = (state) => state.ticketing.loading;
export const selectTicketingError = (state) => state.ticketing.error;
export const selectEventStats = (state) => state.ticketing.eventStats;
export const selectCurrentEventId = (state) => state.ticketing.currentEvent;
export const selectServiceCharges = (state) => state.ticketing.serviceCharges;
export const selectTaxRate = (state) => state.ticketing.taxRate;

// Calculate final total with promo and fees
export const selectFinalTotal = (state) => {
    const session = state.ticketing.checkoutSession;
    return session ? session.total : state.ticketing.cartTotal;
};

export default ticketingSlice.reducer;
