'use client';

/**
 * UnblockSeatsModal Component
 * Confirmation dialog for unblocking seats
 */

import { useState } from 'react';
import { X, LockOpen, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import seatBlockingService, { getBlockReasonDisplay } from '@/services/seatBlocking.service';
import { toast } from 'sonner';

/**
 * UnblockSeatsModal component
 * @param {Object} props
 * @param {string} props.eventId - Event ID
 * @param {Object} props.blockedRecord - Blocked seat record to unblock
 * @param {string} props.blockedRecord.id - Block record ID
 * @param {Array<string>} props.blockedRecord.seat_labels - Array of seat labels
 * @param {string} props.blockedRecord.reason - Block reason
 * @param {string} [props.blockedRecord.notes] - Block notes
 * @param {function(): void} props.onClose - Close modal callback
 * @param {function(): void} props.onSuccess - Success callback after unblocking seats
 */
export default function UnblockSeatsModal({ eventId, blockedRecord, onClose, onSuccess }) {
    const [unblocking, setUnblocking] = useState(false);

    const handleUnblock = async () => {
        setUnblocking(true);

        try {
            const response = await seatBlockingService.unblockSeats(eventId, {
                seat_labels: blockedRecord.seat_labels,
            });

            if (response.success) {
                toast.success(response.message || 'Seats unblocked successfully');
                onSuccess();
                onClose();
            } else {
                toast.error(response.message || 'Failed to unblock seats');
            }
        } catch (err) {
            console.error('Error unblocking seats:', err);
            toast.error(err.message || 'Failed to unblock seats');
        } finally {
            setUnblocking(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <LockOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Unblock Seats</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={unblocking}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Warning Message */}
                    <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-yellow-900 mb-1">
                                Are you sure you want to unblock these seats?
                            </p>
                            <p className="text-sm text-yellow-800">
                                The seats will become available for public purchase again.
                            </p>
                        </div>
                    </div>

                    {/* Blocked Record Details */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Seats to Unblock:</p>
                            <p className="font-medium text-gray-900">
                                {blockedRecord.seat_labels.join(', ')}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                {blockedRecord.seat_labels.length} seat{blockedRecord.seat_labels.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-gray-200 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Reason:</span>
                                <span className="font-medium text-gray-900">
                                    {getBlockReasonDisplay(blockedRecord.reason)}
                                </span>
                            </div>

                            {blockedRecord.notes && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Notes:</span>
                                    <span className="text-gray-900 text-right max-w-xs">
                                        {blockedRecord.notes}
                                    </span>
                                </div>
                            )}

                            {blockedRecord.blocked_by && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Blocked by:</span>
                                    <span className="text-gray-900">
                                        {blockedRecord.blocked_by.name || blockedRecord.blocked_by.email || '—'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="secondary"
                            fullWidth
                            disabled={unblocking}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleUnblock}
                            variant="primary"
                            fullWidth
                            disabled={unblocking}
                            className="gap-2"
                        >
                            {unblocking ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Unblocking...
                                </>
                            ) : (
                                <>
                                    <LockOpen className="w-4 h-4" />
                                    Unblock Seats
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
