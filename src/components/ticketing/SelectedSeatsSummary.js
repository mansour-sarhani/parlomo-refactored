'use client';

/**
 * SelectedSeatsSummary Component
 * Displays selected seats grouped by category with remove functionality
 */

import { useMemo } from 'react';
import { X, Armchair } from 'lucide-react';
import { Button } from '@/components/common/Button';

/**
 * SelectedSeatsSummary component
 * @param {Object} props
 * @param {import('@/types/seating-types').SelectedSeat[]} props.seats - Selected seats array
 * @param {string} [props.currency='GBP'] - Currency code
 * @param {function(string): void} [props.onRemoveSeat] - Callback to remove seat by label
 * @param {string} [props.className] - Additional CSS classes
 */
export default function SelectedSeatsSummary({
    seats = [],
    currency = 'GBP',
    onRemoveSeat,
    className = '',
}) {
    // Get currency symbol
    const currencySymbol = useMemo(() => {
        switch (currency) {
            case 'GBP': return '£';
            case 'USD': return '$';
            case 'EUR': return '€';
            default: return currency + ' ';
        }
    }, [currency]);

    // Group seats by ticket type
    const groupedSeats = useMemo(() => {
        return seats.reduce((groups, seat) => {
            const key = seat.ticketTypeName || seat.category;
            if (!groups[key]) {
                groups[key] = {
                    seats: [],
                    price: seat.price,
                };
            }
            groups[key].seats.push(seat);
            return groups;
        }, {});
    }, [seats]);

    // Calculate total
    const total = useMemo(() => {
        return seats.reduce((sum, seat) => sum + (seat.price || 0), 0);
    }, [seats]);

    // Empty state
    if (seats.length === 0) {
        return (
            <div className={`bg-gray-50 border border-gray-200 rounded-xl p-6 text-center ${className}`}>
                <Armchair className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No seats selected</p>
                <p className="text-gray-500 text-sm mt-1">
                    Click on seats in the chart to select them
                </p>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Armchair className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Your Seats</h3>
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                        {seats.length} {seats.length === 1 ? 'seat' : 'seats'}
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Grouped seats by category */}
                {Object.entries(groupedSeats).map(([typeName, group]) => (
                    <div key={typeName} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm">
                                {typeName}
                            </h4>
                            <span className="text-xs text-gray-500">
                                {currencySymbol}{group.price?.toFixed(2)} each
                            </span>
                        </div>
                        <div className="space-y-1">
                            {group.seats.map((seat) => (
                                <div
                                    key={seat.label}
                                    className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-gray-100"
                                >
                                    <span className="text-sm text-gray-700 font-medium">
                                        {seat.label}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {currencySymbol}{seat.price?.toFixed(2)}
                                        </span>
                                        {onRemoveSeat && (
                                            <button
                                                onClick={() => onRemoveSeat(seat.label)}
                                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                aria-label={`Remove seat ${seat.label}`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-2xl text-primary">
                            {currencySymbol}{total.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
