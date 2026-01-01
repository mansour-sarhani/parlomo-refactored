'use client';

/**
 * SeatAvailabilityCard Component
 * Displays seat availability statistics by category
 */

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw, Users, Lock, ShoppingCart, Clock } from 'lucide-react';
import { Button } from '@/components/common/Button';
import seatBlockingService from '@/services/seatBlocking.service';

/**
 * SeatAvailabilityCard component
 * @param {Object} props
 * @param {string} props.eventId - Event ID
 * @param {string} [props.className] - Additional CSS classes
 */
export default function SeatAvailabilityCard({ eventId, className = '' }) {
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (eventId) {
            fetchAvailability();
        }
    }, [eventId]);

    const fetchAvailability = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await seatBlockingService.getAvailability(eventId);
            if (response.success) {
                setAvailability(response.data || {});
            } else {
                setError('Failed to load availability data');
            }
        } catch (err) {
            console.error('Error fetching availability:', err);
            setError(err.message || 'Failed to load availability data');
        } finally {
            setLoading(false);
        }
    };

    const calculatePercentage = (value, total) => {
        return total > 0 ? Math.round((value / total) * 100) : 0;
    };

    if (loading) {
        return (
            <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
                <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                    <p className="text-gray-600">Loading availability...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
                <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-red-700 font-medium mb-2">Unable to load availability</p>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <Button onClick={fetchAvailability} variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    const categories = Object.values(availability || {});

    if (categories.length === 0) {
        return (
            <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
                <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No availability data</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Seat Availability</h3>
                <Button
                    onClick={fetchAvailability}
                    variant="ghost"
                    size="sm"
                    icon={<RefreshCw className="w-4 h-4" />}
                    title="Refresh availability"
                />
            </div>

            {/* Categories */}
            <div className="p-6 space-y-6">
                {categories.map((category) => {
                    const availablePercent = calculatePercentage(category.available, category.total);
                    const bookedPercent = calculatePercentage(category.booked, category.total);
                    const blockedPercent = calculatePercentage(category.blocked, category.total);
                    const heldPercent = calculatePercentage(category.held, category.total);

                    return (
                        <div key={category.category_key} className="space-y-3">
                            {/* Category Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{category.category_label}</h4>
                                    {category.ticket_type && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {category.ticket_type.name} • {category.ticket_type.price_formatted}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {category.available} / {category.total}
                                    </p>
                                    <p className="text-xs text-gray-500">available</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                                {/* Available */}
                                {category.available > 0 && (
                                    <div
                                        className="bg-green-500"
                                        style={{ width: `${availablePercent}%` }}
                                        title={`${category.available} available (${availablePercent}%)`}
                                    />
                                )}
                                {/* Booked */}
                                {category.booked > 0 && (
                                    <div
                                        className="bg-blue-500"
                                        style={{ width: `${bookedPercent}%` }}
                                        title={`${category.booked} booked (${bookedPercent}%)`}
                                    />
                                )}
                                {/* Held */}
                                {category.held > 0 && (
                                    <div
                                        className="bg-yellow-500"
                                        style={{ width: `${heldPercent}%` }}
                                        title={`${category.held} held (${heldPercent}%)`}
                                    />
                                )}
                                {/* Blocked */}
                                {category.blocked > 0 && (
                                    <div
                                        className="bg-orange-500"
                                        style={{ width: `${blockedPercent}%` }}
                                        title={`${category.blocked} blocked (${blockedPercent}%)`}
                                    />
                                )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {/* Available */}
                                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                    <Users className="w-4 h-4 text-green-600" />
                                    <div>
                                        <p className="text-xs text-green-700 font-medium">Available</p>
                                        <p className="text-sm font-semibold text-green-900">
                                            {category.available}
                                        </p>
                                    </div>
                                </div>

                                {/* Booked */}
                                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                                    <div>
                                        <p className="text-xs text-blue-700 font-medium">Booked</p>
                                        <p className="text-sm font-semibold text-blue-900">
                                            {category.booked}
                                        </p>
                                    </div>
                                </div>

                                {/* Held */}
                                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                                    <Clock className="w-4 h-4 text-yellow-600" />
                                    <div>
                                        <p className="text-xs text-yellow-700 font-medium">Held</p>
                                        <p className="text-sm font-semibold text-yellow-900">
                                            {category.held}
                                        </p>
                                    </div>
                                </div>

                                {/* Blocked */}
                                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                                    <Lock className="w-4 h-4 text-orange-600" />
                                    <div>
                                        <p className="text-xs text-orange-700 font-medium">Blocked</p>
                                        <p className="text-sm font-semibold text-orange-900">
                                            {category.blocked}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="px-6 pb-6">
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-gray-600">Available for purchase</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-gray-600">Already purchased</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <span className="text-gray-600">Held during checkout</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full" />
                        <span className="text-gray-600">Blocked/Reserved</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
