/**
 * Custom Hooks for Ticketing
 * Convenient hooks for accessing ticketing state and actions
 */

import { useDispatch, useSelector } from 'react-redux';
import {
    // Actions
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setPromoCode,
    clearPromoCode,
    setCheckoutStep,
    resetTicketing,
    setTicketTypes,
    // Async Thunks
    fetchEventTicketing,
    validatePromoCode,
    startCheckout,
    completeCheckout,
    // Selectors
    selectTicketTypes,
    selectCart,
    selectCartTotal,
    selectCartCount,
    selectPromoCode,
    selectPromoDiscount,
    selectPromoError,
    selectCheckoutSession,
    selectCheckoutStep,
    selectTicketingLoading,
    selectTicketingError,
    selectEventStats,
    selectFinalTotal,
    selectCurrentEventId,
    selectServiceCharges,
    selectTaxRate,
} from '@/features/ticketing/ticketingSlice';

/**
 * Hook for ticketing state and actions
 */
export function useTicketing() {
    const dispatch = useDispatch();

    // Selectors
    const ticketTypes = useSelector(selectTicketTypes);
    const cart = useSelector(selectCart);
    const cartTotal = useSelector(selectCartTotal);
    const cartCount = useSelector(selectCartCount);
    const promoCode = useSelector(selectPromoCode);
    const promoDiscount = useSelector(selectPromoDiscount);
    const promoError = useSelector(selectPromoError);
    const checkoutSession = useSelector(selectCheckoutSession);
    const checkoutStep = useSelector(selectCheckoutStep);
    const loading = useSelector(selectTicketingLoading);
    const error = useSelector(selectTicketingError);
    const eventStats = useSelector(selectEventStats);
    const finalTotal = useSelector(selectFinalTotal);
    const currentEventId = useSelector(selectCurrentEventId);
    const serviceCharges = useSelector(selectServiceCharges);
    const taxRate = useSelector(selectTaxRate);

    // Actions
    const handleAddToCart = (ticketTypeId, quantity) => {
        dispatch(addToCart({ ticketTypeId, quantity }));
    };

    const handleUpdateQuantity = (ticketTypeId, quantity) => {
        dispatch(updateCartQuantity({ ticketTypeId, quantity }));
    };

    const handleRemoveFromCart = (ticketTypeId) => {
        dispatch(removeFromCart(ticketTypeId));
    };

    const handleClearCart = () => {
        dispatch(clearCart());
    };

    const handleSetPromoCode = (code) => {
        dispatch(setPromoCode(code));
    };

    const handleClearPromoCode = () => {
        dispatch(clearPromoCode());
    };

    const handleSetCheckoutStep = (step) => {
        dispatch(setCheckoutStep(step));
    };

    const handleResetTicketing = () => {
        dispatch(resetTicketing());
    };

    const handleSetTicketTypes = (eventId, ticketTypes, stats, serviceCharges, taxRate) => {
        dispatch(setTicketTypes({ eventId, ticketTypes, stats, serviceCharges, taxRate }));
    };

    // Async actions
    const handleFetchEventTicketing = (eventId) => {
        return dispatch(fetchEventTicketing(eventId));
    };

    const handleValidatePromoCode = (eventId, code, cartItems) => {
        return dispatch(validatePromoCode({ eventId, code, cartItems }));
    };

    const handleStartCheckout = (eventId, cartItems, promoCode) => {
        return dispatch(startCheckout({ eventId, cartItems, promoCode }));
    };

    const handleCompleteCheckout = (checkoutData) => {
        return dispatch(completeCheckout(checkoutData));
    };

    return {
        // State
        ticketTypes,
        cart,
        cartTotal,
        cartCount,
        promoCode,
        promoDiscount,
        promoError,
        checkoutSession,
        checkoutStep,
        loading,
        error,
        eventStats,
        finalTotal,
        currentEventId,
        serviceCharges,
        taxRate,
        // Actions
        addToCart: handleAddToCart,
        updateQuantity: handleUpdateQuantity,
        removeFromCart: handleRemoveFromCart,
        clearCart: handleClearCart,
        setPromoCode: handleSetPromoCode,
        clearPromoCode: handleClearPromoCode,
        setCheckoutStep: handleSetCheckoutStep,
        resetTicketing: handleResetTicketing,
        setTicketTypes: handleSetTicketTypes,
        // Async actions
        fetchEventTicketing: handleFetchEventTicketing,
        validatePromoCode: handleValidatePromoCode,
        startCheckout: handleStartCheckout,
        completeCheckout: handleCompleteCheckout,
    };
}

/**
 * Hook for cart-specific operations
 */
export function useCart() {
    const dispatch = useDispatch();
    const cart = useSelector(selectCart);
    const cartTotal = useSelector(selectCartTotal);
    const cartCount = useSelector(selectCartCount);

    return {
        cart,
        cartTotal,
        cartCount,
        isEmpty: cart.length === 0,
        addToCart: (ticketTypeId, quantity) => dispatch(addToCart({ ticketTypeId, quantity })),
        updateQuantity: (ticketTypeId, quantity) => dispatch(updateCartQuantity({ ticketTypeId, quantity })),
        removeFromCart: (ticketTypeId) => dispatch(removeFromCart(ticketTypeId)),
        clearCart: () => dispatch(clearCart()),
    };
}

/**
 * Hook for promo code operations
 */
export function usePromoCode() {
    const dispatch = useDispatch();
    const promoCode = useSelector(selectPromoCode);
    const promoDiscount = useSelector(selectPromoDiscount);
    const promoError = useSelector(selectPromoError);
    const cart = useSelector(selectCart);
    const currentEventId = useSelector(selectCurrentEventId);

    return {
        promoCode,
        promoDiscount,
        promoError,
        hasPromo: !!promoCode && !promoError,
        setPromoCode: (code) => dispatch(setPromoCode(code)),
        clearPromoCode: () => dispatch(clearPromoCode()),
        validatePromoCode: (code) =>
            dispatch(validatePromoCode({
                eventId: currentEventId,
                code,
                cartItems: cart.map(item => ({
                    ticketTypeId: item.ticketTypeId,
                    quantity: item.quantity,
                })),
            })),
    };
}
