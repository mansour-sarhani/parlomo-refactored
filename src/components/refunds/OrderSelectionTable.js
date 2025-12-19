'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from './CurrencyDisplay';
import { Search } from 'lucide-react';

/**
 * OrderSelectionTable Component
 *
 * Selectable table for choosing orders to refund
 *
 * @param {Object} props
 * @param {Array} props.orders - Array of order objects
 * @param {Array} props.selectedOrders - Array of selected order IDs
 * @param {Function} props.onSelectionChange - Callback when selection changes
 * @param {string} props.selectionMode - 'single' or 'multiple'
 * @param {boolean} props.loading - Loading state
 */
export const OrderSelectionTable = ({
    orders = [],
    selectedOrders = [],
    onSelectionChange,
    selectionMode = 'multiple',
    loading = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter orders based on search term
    const filteredOrders = useMemo(() => {
        if (!searchTerm) return orders;

        const term = searchTerm.toLowerCase();
        return orders.filter(order =>
            order.order_number?.toLowerCase().includes(term) ||
            order.customer_name?.toLowerCase().includes(term) ||
            order.customer_email?.toLowerCase().includes(term)
        );
    }, [orders, searchTerm]);

    // Calculate selected total
    const selectedTotal = useMemo(() => {
        return orders
            .filter(o => selectedOrders.includes(o.id))
            .reduce((sum, o) => sum + (o.total || 0), 0);
    }, [orders, selectedOrders]);

    // Handle individual order toggle
    const handleToggle = (orderId) => {
        if (selectionMode === 'single') {
            onSelectionChange([orderId]);
        } else {
            const isSelected = selectedOrders.includes(orderId);
            if (isSelected) {
                onSelectionChange(selectedOrders.filter(id => id !== orderId));
            } else {
                onSelectionChange([...selectedOrders, orderId]);
            }
        }
    };

    // Handle select all toggle
    const handleSelectAll = () => {
        if (selectionMode === 'single') return;

        if (selectedOrders.length === filteredOrders.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(filteredOrders.map(o => o.id));
        }
    };

    const allSelected = filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length;
    const someSelected = selectedOrders.length > 0 && selectedOrders.length < filteredOrders.length;

    if (loading) {
        return (
            <Card>
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading orders...</p>
                </div>
            </Card>
        );
    }

    if (orders.length === 0) {
        return (
            <Card>
                <EmptyState
                    variant="empty"
                    title="No Orders Available"
                    description="There are no paid orders available for refund."
                />
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                    type="text"
                    placeholder="Search by order number, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    {selectionMode === 'multiple' && (
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            ref={input => {
                                                if (input) {
                                                    input.indeterminate = someSelected;
                                                }
                                            }}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                                        />
                                    )}
                                </th>
                                <th className="px-4 py-3">Order #</th>
                                <th className="px-4 py-3">Customer Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-center">Tickets</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrders.map((order) => {
                                const isSelected = selectedOrders.includes(order.id);
                                return (
                                    <tr
                                        key={order.id}
                                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                                            isSelected ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => handleToggle(order.id)}
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type={selectionMode === 'single' ? 'radio' : 'checkbox'}
                                                checked={isSelected}
                                                onChange={() => {}}
                                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium text-primary">
                                            {order.order_number}
                                        </td>
                                        <td className="px-4 py-3">{order.customer_name}</td>
                                        <td className="px-4 py-3 text-gray-600">{order.customer_email}</td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            <CurrencyDisplay
                                                amount={order.total}
                                                currency={order.currency || 'GBP'}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {order.ticket_count}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No orders found matching "{searchTerm}"
                        </div>
                    )}
                </div>

                {/* Selection Summary Footer */}
                {selectedOrders.length > 0 && (
                    <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-blue-900">
                                {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
                            </span>
                            <span className="font-bold text-blue-900">
                                Total: <CurrencyDisplay amount={selectedTotal} currency="GBP" />
                            </span>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};
