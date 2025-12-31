'use client';

/**
 * DeleteChartModal Component
 * Confirmation modal for deleting a venue chart
 * Includes safety measures and handles "chart in use" errors
 */

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import adminVenueChartsService from '@/services/admin/adminVenueCharts.service';

/**
 * DeleteChartModal component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {string} props.chartId - Chart ID to delete
 * @param {string} props.chartName - Chart name for display
 * @param {function(): void} props.onClose - Close callback
 * @param {function(): void} props.onSuccess - Success callback
 */
export default function DeleteChartModal({
    isOpen,
    chartId,
    chartName,
    onClose,
    onSuccess,
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [confirmText, setConfirmText] = useState('');

    const handleDelete = async () => {
        if (confirmText !== chartName) {
            setError('Please type the chart name exactly as shown to confirm deletion.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await adminVenueChartsService.deleteVenueChart(chartId);

            if (response.success) {
                // Success - trigger callback
                onSuccess();
            } else {
                setError(response.message || 'Failed to delete chart');
            }
        } catch (err) {
            console.error('Error deleting chart:', err);

            // Check if chart is in use
            if (err.message && err.message.includes('being used')) {
                setError(err.message);
            } else {
                setError(err.message || 'Failed to delete chart. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setConfirmText('');
            setError(null);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Delete Venue Chart"
            size="md"
            closeOnBackdrop={!loading}
            closeOnEsc={!loading}
            footer={
                <>
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        loading={loading}
                        disabled={confirmText !== chartName}
                    >
                        Delete Chart
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                {/* Warning Icon */}
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                        <p className="font-medium text-red-900">This action cannot be undone!</p>
                        <p className="text-sm text-red-700 mt-1">
                            Deleting this chart will permanently remove it from the system.
                        </p>
                    </div>
                </div>

                {/* Chart Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">You are about to delete:</p>
                    <p className="font-semibold text-gray-900 text-lg">{chartName}</p>
                </div>

                {/* Confirmation Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type <span className="font-mono font-semibold">{chartName}</span> to confirm:
                    </label>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type chart name here"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        disabled={loading}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Info Note */}
                <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="font-medium mb-1">Note:</p>
                    <p>
                        Charts that are currently being used by events cannot be deleted.
                        If this chart is in use, you'll need to remove it from those events first.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
