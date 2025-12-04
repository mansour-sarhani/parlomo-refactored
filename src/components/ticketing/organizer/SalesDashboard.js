'use client';

/**
 * Sales Dashboard Component
 * Display sales analytics and revenue metrics
 */

import { useEffect, useState } from 'react';
import ticketingService from '@/services/ticketing.service';
import { DollarSign, Ticket, TrendingUp, Users, Loader2 } from 'lucide-react';

export default function SalesDashboard({ eventId }) {
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSalesData();
    }, [eventId]);

    const fetchSalesData = async () => {
        try {
            setLoading(true);

            // Fetch event ticketing data
            const eventData = await ticketingService.getEventTicketing(eventId);
            const ticketTypes = eventData.ticketTypes || [];

            // Calculate stats from ticket types
            const totalRevenue = ticketTypes.reduce(
                (sum, tt) => sum + (tt.sold * tt.price),
                0
            );
            const totalSold = ticketTypes.reduce((sum, tt) => sum + tt.sold, 0);
            const totalCapacity = ticketTypes.reduce((sum, tt) => sum + tt.capacity, 0);

            setStats({
                totalRevenue,
                totalSold,
                totalCapacity,
                averageOrderValue: totalSold > 0 ? totalRevenue / totalSold : 0,
                ticketTypes,
            });

            // Fetch recent orders for this event (limit to 10 most recent)
            const ordersResponse = await ticketingService.getEventOrders(eventId, { limit: 10 });
            setOrders(ordersResponse.orders || []);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12 text-gray-600">
                No sales data available
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="bg-white/20 rounded-lg p-2">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        £{(stats.totalRevenue / 100).toFixed(2)}
                    </div>
                    <div className="text-green-100 text-sm">Total Revenue</div>
                </div>

                {/* Tickets Sold */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="bg-white/20 rounded-lg p-2">
                            <Ticket className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        {stats.totalSold}
                    </div>
                    <div className="text-blue-100 text-sm">Tickets Sold</div>
                </div>

                {/* Capacity */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="bg-white/20 rounded-lg p-2">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        {((stats.totalSold / stats.totalCapacity) * 100).toFixed(0)}%
                    </div>
                    <div className="text-purple-100 text-sm">
                        Capacity ({stats.totalSold}/{stats.totalCapacity})
                    </div>
                </div>

                {/* Average Order */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="bg-white/20 rounded-lg p-2">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        £{(stats.averageOrderValue / 100).toFixed(2)}
                    </div>
                    <div className="text-orange-100 text-sm">Avg. Per Ticket</div>
                </div>
            </div>

            {/* Sales by Ticket Type */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sales by Ticket Type</h3>
                <div className="space-y-3">
                    {stats.ticketTypes.map((ticketType) => {
                        const percentage = (ticketType.sold / ticketType.capacity) * 100;
                        const revenue = ticketType.sold * ticketType.price;

                        return (
                            <div key={ticketType.id} className="border-b border-gray-100 pb-3 last:border-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            {ticketType.name}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            £{(ticketType.price / 100).toFixed(2)} per ticket
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">
                                            £{(revenue / 100).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {ticketType.sold} sold
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{percentage.toFixed(0)}% sold</span>
                                    <span>{ticketType.capacity - ticketType.sold} remaining</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
                {orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                        No orders yet
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Order #
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Customer
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Tickets
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Total
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                            {order.orderNumber}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {order.customerName}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {order.ticketCount}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                                            £{(order.total / 100).toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
