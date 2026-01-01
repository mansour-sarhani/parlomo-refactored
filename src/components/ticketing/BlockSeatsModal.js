'use client';

/**
 * BlockSeatsModal Component
 * Modal for blocking specific seats with reason and notes
 * Supports both visual seat selection (via Seats.io chart) and manual entry
 */

import { useState, useEffect } from 'react';
import { X, Lock, Loader2, MousePointer2, Type } from 'lucide-react';
import { Button } from '@/components/common/Button';
import seatBlockingService, { BLOCK_REASONS, getBlockReasonDisplay } from '@/services/seatBlocking.service';
import SeatingChart from '@/components/ticketing/SeatingChart';
import { toast } from 'sonner';

/**
 * BlockSeatsModal component
 * @param {Object} props
 * @param {string} props.eventId - Event ID
 * @param {Array<string>} [props.seatLabels] - Pre-selected seat labels (optional)
 * @param {function(): void} props.onClose - Close modal callback
 * @param {function(): void} props.onSuccess - Success callback after blocking seats
 */
export default function BlockSeatsModal({ eventId, seatLabels = [], onClose, onSuccess }) {
    const [reason, setReason] = useState(BLOCK_REASONS.VIP);
    const [notes, setNotes] = useState('');
    const [blocking, setBlocking] = useState(false);
    const [errors, setErrors] = useState({});
    const [manualSeatInput, setManualSeatInput] = useState('');
    const [manualSeatLabels, setManualSeatLabels] = useState([]);
    const [selectionMode, setSelectionMode] = useState('visual'); // 'visual' or 'manual'
    const [visuallySelectedSeats, setVisuallySelectedSeats] = useState([]);

    // Use pre-selected seats, visual selection, or manual input
    const finalSeatLabels = seatLabels && seatLabels.length > 0 
        ? seatLabels 
        : selectionMode === 'visual' 
            ? visuallySelectedSeats.map(seat => seat.label)
            : manualSeatLabels;
    
    const isManualInput = !seatLabels || seatLabels.length === 0;

    // Parse manual seat input (comma or newline separated)
    const handleManualInputChange = (value) => {
        setManualSeatInput(value);
        // Parse seats: split by comma, newline, or space, then trim and filter empty
        const parsed = value
            .split(/[,\n\s]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        setManualSeatLabels(parsed);
    };

    // Handle seat selection from visual chart
    const handleVisualSelectionChange = (selectedSeats) => {
        setVisuallySelectedSeats(selectedSeats);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!reason) {
            newErrors.reason = 'Please select a reason';
        }

        if (finalSeatLabels.length === 0) {
            newErrors.seats = 'Please enter at least one seat label';
        }

        if (notes && notes.length > 500) {
            newErrors.notes = 'Notes must be 500 characters or less';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setBlocking(true);

        try {
            const response = await seatBlockingService.blockSeats(eventId, {
                seat_labels: finalSeatLabels,
                reason: reason,
                notes: notes.trim() || undefined,
            });

            if (response.success) {
                toast.success(response.message || `${finalSeatLabels.length} seat(s) blocked successfully`);
                onSuccess();
                onClose();
            } else {
                toast.error(response.message || 'Failed to block seats');
            }
        } catch (err) {
            console.error('Error blocking seats:', err);
            const errorMsg = err.message || 'Failed to block seats';
            toast.error(errorMsg);

            // Show specific error if seats are already booked
            if (errorMsg.includes('already booked')) {
                setErrors({ general: errorMsg });
            }
        } finally {
            setBlocking(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Lock className="w-5 h-5 text-orange-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Block {finalSeatLabels.length > 0 ? `${finalSeatLabels.length} ` : ''}Seat{finalSeatLabels.length !== 1 ? 's' : ''}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={blocking}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
                    {/* General Error */}
                    {errors.general && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{errors.general}</p>
                        </div>
                    )}

                    {/* Seat Selection Mode - Only show if no pre-selected seats */}
                    {isManualInput && (
                        <div className="flex gap-2 mb-4">
                            <Button
                                type="button"
                                variant={selectionMode === 'visual' ? 'primary' : 'outline'}
                                onClick={() => setSelectionMode('visual')}
                                className="gap-2"
                                disabled={blocking}
                            >
                                <MousePointer2 className="w-4 h-4" />
                                Visual Selection
                            </Button>
                            <Button
                                type="button"
                                variant={selectionMode === 'manual' ? 'primary' : 'outline'}
                                onClick={() => setSelectionMode('manual')}
                                className="gap-2"
                                disabled={blocking}
                            >
                                <Type className="w-4 h-4" />
                                Manual Entry
                            </Button>
                        </div>
                    )}

                    {/* Seat Input - Visual, Manual, or Pre-selected */}
                    {isManualInput ? (
                        selectionMode === 'visual' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Seats from Chart <span className="text-red-500">*</span>
                                </label>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <SeatingChart
                                        eventId={eventId}
                                        onSelectionChange={handleVisualSelectionChange}
                                        maxSeats={100}
                                        className=""
                                    />
                                </div>
                                {visuallySelectedSeats.length > 0 && (
                                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                                        <strong>Selected {visuallySelectedSeats.length} seat(s):</strong>{' '}
                                        {visuallySelectedSeats.map(s => s.label).join(', ')}
                                    </div>
                                )}
                                {errors.seats && (
                                    <p className="mt-1 text-sm text-red-600">{errors.seats}</p>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="seatLabels" className="block text-sm font-medium text-gray-700 mb-2">
                                    Seat Labels <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="seatLabels"
                                    value={manualSeatInput}
                                    onChange={(e) => handleManualInputChange(e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent font-mono text-sm ${
                                        errors.seats ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="A-1, A-2, A-3&#10;or A-1, A-2, A-3"
                                    rows={4}
                                    disabled={blocking}
                                />
                                {errors.seats && (
                                    <p className="mt-1 text-sm text-red-600">{errors.seats}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Enter seat labels separated by commas, spaces, or new lines (e.g., "A-1, A-2, A-3" or one per line)
                                </p>
                                {manualSeatLabels.length > 0 && (
                                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                        <strong>Parsed {manualSeatLabels.length} seat(s):</strong> {manualSeatLabels.join(', ')}
                                    </div>
                                )}
                            </div>
                        )
                    ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Selected seats:</p>
                            <p className="font-medium text-gray-900">{finalSeatLabels.join(', ')}</p>
                        </div>
                    )}

                    {/* Reason Selection */}
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Blocking <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${
                                errors.reason ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={blocking}
                        >
                            {Object.values(BLOCK_REASONS).map((reasonOption) => (
                                <option key={reasonOption} value={reasonOption}>
                                    {getBlockReasonDisplay(reasonOption)}
                                </option>
                            ))}
                        </select>
                        {errors.reason && (
                            <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Choose the reason why these seats need to be blocked
                        </p>
                    </div>

                    {/* Notes Input */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${
                                errors.notes ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Reserved for John Smith party"
                            rows={3}
                            maxLength={500}
                            disabled={blocking}
                        />
                        {errors.notes && (
                            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {notes.length}/500 characters
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Blocked seats will not be available for public purchase. They will appear as unavailable on the seating chart.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 mt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="secondary"
                            fullWidth
                            disabled={blocking}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            disabled={blocking}
                            className="gap-2"
                        >
                            {blocking ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Blocking...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Block {finalSeatLabels.length > 0 ? `${finalSeatLabels.length} ` : ''}Seat{finalSeatLabels.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
