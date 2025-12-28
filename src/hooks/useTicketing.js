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
    // Seating Actions
    setSelectedSeats,
    addSelectedSeat,
    removeSelectedSeat,
    clearSelectedSeats,
    setSeatingConfig,
    setIsSeatedEvent,
    setSeatingError,
    clearSeatingState,
    // Async Thunks
    fetchEventTicketing,
    validatePromoCode,
    startCheckout,
    completeCheckout,
    fetchSeatingConfig,
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
    // Seating Selectors
    selectSelectedSeats,
    selectSeatingConfig,
    selectIsSeatedEvent,
    selectSeatingLoading,
    selectSeatingError,
    selectSelectedSeatsCount,
    selectSelectedSeatsTotal,
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

    // Seating Selectors
    const selectedSeats = useSelector(selectSelectedSeats);
    const seatingConfig = useSelector(selectSeatingConfig);
    const isSeatedEvent = useSelector(selectIsSeatedEvent);
    const seatingLoading = useSelector(selectSeatingLoading);
    const seatingError = useSelector(selectSeatingError);
    const selectedSeatsCount = useSelector(selectSelectedSeatsCount);
    const selectedSeatsTotal = useSelector(selectSelectedSeatsTotal);

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

    const handleStartCheckout = (eventId, cartItems, promoCode, selectedSeats = null) => {
        return dispatch(startCheckout({ eventId, cartItems, promoCode, selectedSeats }));
    };

    const handleCompleteCheckout = (checkoutData) => {
        return dispatch(completeCheckout(checkoutData));
    };

    // Seating Actions
    const handleSetSelectedSeats = (seats) => {
        dispatch(setSelectedSeats(seats));
    };

    const handleAddSelectedSeat = (seat) => {
        dispatch(addSelectedSeat(seat));
    };

    const handleRemoveSelectedSeat = (seatLabel) => {
        dispatch(removeSelectedSeat(seatLabel));
    };

    const handleClearSelectedSeats = () => {
        dispatch(clearSelectedSeats());
    };

    const handleSetSeatingConfig = (config) => {
        dispatch(setSeatingConfig(config));
    };

    const handleSetIsSeatedEvent = (isSeated) => {
        dispatch(setIsSeatedEvent(isSeated));
    };

    const handleClearSeatingState = () => {
        dispatch(clearSeatingState());
    };

    const handleFetchSeatingConfig = (eventId) => {
        return dispatch(fetchSeatingConfig(eventId));
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
        // Seating State
        selectedSeats,
        seatingConfig,
        isSeatedEvent,
        seatingLoading,
        seatingError,
        selectedSeatsCount,
        selectedSeatsTotal,
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
        // Seating Actions
        setSelectedSeats: handleSetSelectedSeats,
        addSelectedSeat: handleAddSelectedSeat,
        removeSelectedSeat: handleRemoveSelectedSeat,
        clearSelectedSeats: handleClearSelectedSeats,
        setSeatingConfig: handleSetSeatingConfig,
        setIsSeatedEvent: handleSetIsSeatedEvent,
        clearSeatingState: handleClearSeatingState,
        fetchSeatingConfig: handleFetchSeatingConfig,
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

/**
 * Hook for seating-specific operations
 */
export function useSeating() {
    const dispatch = useDispatch();
    const selectedSeats = useSelector(selectSelectedSeats);
    const seatingConfig = useSelector(selectSeatingConfig);
    const isSeatedEvent = useSelector(selectIsSeatedEvent);
    const seatingLoading = useSelector(selectSeatingLoading);
    const seatingError = useSelector(selectSeatingError);
    const selectedSeatsCount = useSelector(selectSelectedSeatsCount);
    const selectedSeatsTotal = useSelector(selectSelectedSeatsTotal);

    return {
        selectedSeats,
        seatingConfig,
        isSeatedEvent,
        seatingLoading,
        seatingError,
        selectedSeatsCount,
        selectedSeatsTotal,
        isEmpty: selectedSeats.length === 0,
        setSelectedSeats: (seats) => dispatch(setSelectedSeats(seats)),
        addSelectedSeat: (seat) => dispatch(addSelectedSeat(seat)),
        removeSelectedSeat: (label) => dispatch(removeSelectedSeat(label)),
        clearSelectedSeats: () => dispatch(clearSelectedSeats()),
        setSeatingConfig: (config) => dispatch(setSeatingConfig(config)),
        setIsSeatedEvent: (isSeated) => dispatch(setIsSeatedEvent(isSeated)),
        clearSeatingState: () => dispatch(clearSeatingState()),
        fetchSeatingConfig: (eventId) => dispatch(fetchSeatingConfig(eventId)),
    };
}
