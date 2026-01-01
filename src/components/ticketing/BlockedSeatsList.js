'use client';

/**
 * BlockedSeatsList Component
 * Displays all blocked seats for an event in a table/list format
 */

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Lock, LockOpen, User, Calendar } from 'lucide-react';
import { Button } from '@/components/common/Button';
import seatBlockingService, { getBlockReasonDisplay } from '@/services/seatBlocking.service';

/**
 * BlockedSeatsList component
 * @param {Object} props
 * @param {string} props.eventId - Event ID
 * @param {function(Object): void} [props.onUnblock] - Callback when unblock button is clicked (receives blocked record)
 * @param {function(): void} [props.onRefresh] - Callback to trigger refresh
 * @param {string} [props.className] - Additional CSS classes
 */
export default function BlockedSeatsList({ eventId, onUnblock, onRefresh, className = '' }) {
    const [blockedSeats, setBlockedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (eventId) {
            fetchBlockedSeats();
        }
    }, [eventId, onRefresh]);

    const fetchBlockedSeats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await seatBlockingService.getBlockedSeats(eventId);
            if (response.success) {
                setBlockedSeats(response.data || []);
            } else {
                setError('Failed to load blocked seats');
            }
        } catch (err) {
            console.error('Error fetching blocked seats:', err);
            setError(err.message || 'Failed to load blocked seats');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-gray-600">Loading blocked seats...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-xl p-8 text-center ${className}`}>
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 font-medium mb-2">Unable to load blocked seats</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <Button onClick={fetchBlockedSeats} variant="outline" size="sm">
                    Try Again
                </Button>
            </div>
        );
    }

    if (blockedSeats.length === 0) {
        return (
            <div className={`text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">No Blocked Seats</p>
                <p className="text-gray-500 text-sm">No seats have been blocked for this event yet.</p>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Seats
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reason
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Notes
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Blocked By
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {blockedSeats.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                                            <span className="text-sm font-semibold text-orange-700">
                                                {record.seat_labels.length}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {record.seat_labels.slice(0, 3).join(', ')}
                                                {record.seat_labels.length > 3 && (
                                                    <span className="text-gray-500">
                                                        {' '}+{record.seat_labels.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        {getBlockReasonDisplay(record.reason)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                        {record.notes || '—'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-900">
                                                {record.blocked_by?.name || '—'}
                                            </div>
                                            {record.blocked_by?.email && (
                                                <div className="text-xs text-gray-500">
                                                    {record.blocked_by.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {formatDate(record.blocked_at)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {onUnblock && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onUnblock(record)}
                                            icon={<LockOpen className="w-4 h-4" />}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            title="Unblock seats"
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {blockedSeats.map((record) => (
                    <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        {/* Seat Count Badge */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                                    <span className="text-sm font-semibold text-orange-700">
                                        {record.seat_labels.length}
                                    </span>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {record.seat_labels.slice(0, 3).join(', ')}
                                    </div>
                                    {record.seat_labels.length > 3 && (
                                        <div className="text-sm text-gray-500">
                                            +{record.seat_labels.length - 3} more seats
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {getBlockReasonDisplay(record.reason)}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-3">
                            {record.notes && (
                                <div className="text-sm text-gray-600">
                                    <strong>Notes:</strong> {record.notes}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="w-4 h-4" />
                                <span>{record.blocked_by?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(record.blocked_at)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        {onUnblock && (
                            <div className="pt-3 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    fullWidth
                                    onClick={() => onUnblock(record)}
                                    icon={<LockOpen className="w-4 h-4" />}
                                >
                                    Unblock Seats
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                    Total: <span className="font-semibold text-gray-900">{blockedSeats.length}</span> block record
                    {blockedSeats.length !== 1 ? 's' : ''}, covering{' '}
                    <span className="font-semibold text-gray-900">
                        {blockedSeats.reduce((sum, record) => sum + record.seat_labels.length, 0)}
                    </span>{' '}
                    seat{blockedSeats.reduce((sum, record) => sum + record.seat_labels.length, 0) !== 1 ? 's' : ''}
                </p>
            </div>
        </div>
    );
}
