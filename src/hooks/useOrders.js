/**
 * Custom Hooks for Orders
 * Convenient hooks for accessing orders state and actions
 */

import { useDispatch, useSelector } from 'react-redux';
import {
    // Actions
    clearCurrentOrder,
    setCurrentPage,
    resetOrders,
    // Async Thunks
    fetchUserOrders,
    fetchOrderDetails,
    fetchOrderTickets,
    // Selectors
    selectOrders,
    selectOrdersLoading,
    selectOrdersError,
    selectCurrentOrder,
    selectCurrentOrderLoading,
    selectCurrentOrderError,
    selectCurrentOrderTickets,
    selectTicketsLoading,
    selectTicketsError,
    selectOrdersPagination,
    selectOrderById,
    selectCurrentOrderTicketCount,
    selectValidTickets,
    selectUsedTickets,
} from '@/features/ticketing/ordersSlice';

/**
 * Hook for orders state and actions
 */
export function useOrders() {
    const dispatch = useDispatch();

    // Selectors
    const orders = useSelector(selectOrders);
    const ordersLoading = useSelector(selectOrdersLoading);
    const ordersError = useSelector(selectOrdersError);
    const currentOrder = useSelector(selectCurrentOrder);
    const currentOrderLoading = useSelector(selectCurrentOrderLoading);
    const currentOrderError = useSelector(selectCurrentOrderError);
    const currentOrderTickets = useSelector(selectCurrentOrderTickets);
    const ticketsLoading = useSelector(selectTicketsLoading);
    const ticketsError = useSelector(selectTicketsError);
    const pagination = useSelector(selectOrdersPagination);
    const ticketCount = useSelector(selectCurrentOrderTicketCount);
    const validTickets = useSelector(selectValidTickets);
    const usedTickets = useSelector(selectUsedTickets);

    // Actions
    const handleClearCurrentOrder = () => {
        dispatch(clearCurrentOrder());
    };

    const handleSetCurrentPage = (page) => {
        dispatch(setCurrentPage(page));
    };

    const handleResetOrders = () => {
        dispatch(resetOrders());
    };

    // Async actions
    const handleFetchUserOrders = (userId) => {
        return dispatch(fetchUserOrders(userId));
    };

    const handleFetchOrderDetails = (orderId) => {
        return dispatch(fetchOrderDetails(orderId));
    };

    const handleFetchOrderTickets = (orderId) => {
        return dispatch(fetchOrderTickets(orderId));
    };

    return {
        // State
        orders,
        ordersLoading,
        ordersError,
        currentOrder,
        currentOrderLoading,
        currentOrderError,
        currentOrderTickets,
        ticketsLoading,
        ticketsError,
        pagination,
        ticketCount,
        validTickets,
        usedTickets,
        // Actions
        clearCurrentOrder: handleClearCurrentOrder,
        setCurrentPage: handleSetCurrentPage,
        resetOrders: handleResetOrders,
        // Async actions
        fetchUserOrders: handleFetchUserOrders,
        fetchOrderDetails: handleFetchOrderDetails,
        fetchOrderTickets: handleFetchOrderTickets,
    };
}

/**
 * Hook for a specific order
 */
export function useOrder(orderId) {
    const dispatch = useDispatch();
    const order = useSelector(selectOrderById(orderId));
    const currentOrder = useSelector(selectCurrentOrder);
    const loading = useSelector(selectCurrentOrderLoading);
    const error = useSelector(selectCurrentOrderError);

    const fetchOrder = () => {
        return dispatch(fetchOrderDetails(orderId));
    };

    return {
        order: currentOrder?.id === orderId ? currentOrder : order,
        loading,
        error,
        fetchOrder,
    };
}

/**
 * Hook for order tickets
 */
export function useOrderTickets(orderId) {
    const dispatch = useDispatch();
    const tickets = useSelector(selectCurrentOrderTickets);
    const loading = useSelector(selectTicketsLoading);
    const error = useSelector(selectTicketsError);
    const validTickets = useSelector(selectValidTickets);
    const usedTickets = useSelector(selectUsedTickets);

    const fetchTickets = () => {
        return dispatch(fetchOrderTickets(orderId));
    };

    return {
        tickets,
        validTickets,
        usedTickets,
        loading,
        error,
        fetchTickets,
        validCount: validTickets.length,
        usedCount: usedTickets.length,
        totalCount: tickets.length,
    };
}
