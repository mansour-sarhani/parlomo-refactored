'use client';

/**
 * ChartActions Component
 * Action buttons for venue chart operations (sync, publish, activate/deactivate)
 */

import { useState } from 'react';
import { RefreshCw, Upload, Power, PowerOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ConfirmModal } from '@/components/common/Modal';
import adminVenueChartsService from '@/services/admin/adminVenueCharts.service';

/**
 * ChartActions component
 * @param {Object} props
 * @param {string} props.chartId - Chart ID
 * @param {boolean} props.isActive - Current active status
 * @param {function(Object): void} props.onUpdate - Callback with updated chart data
 * @param {string} [props.className] - Additional CSS classes
 */
export default function ChartActions({ chartId, isActive, onUpdate, className = '' }) {
    const [syncing, setSyncing] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'sync' | 'publish' | 'activate' | 'deactivate'
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSync = async () => {
        try {
            setSyncing(true);
            setError(null);
            setSuccessMessage(null);

            const response = await adminVenueChartsService.syncChart(chartId);

            if (response.success) {
                setSuccessMessage('Chart synced successfully from Seats.io');
                onUpdate(response.data);
            } else {
                setError(response.message || 'Failed to sync chart');
            }
        } catch (err) {
            console.error('Error syncing chart:', err);
            setError(err.message || 'Failed to sync chart. Please try again.');
        } finally {
            setSyncing(false);
            setConfirmAction(null);
        }
    };

    const handlePublish = async () => {
        try {
            setPublishing(true);
            setError(null);
            setSuccessMessage(null);

            const response = await adminVenueChartsService.publishChart(chartId);

            if (response.success) {
                setSuccessMessage('Chart published successfully');
                if (response.data) {
                    onUpdate(response.data);
                }
            } else {
                setError(response.message || 'Failed to publish chart');
            }
        } catch (err) {
            console.error('Error publishing chart:', err);
            setError(err.message || 'Failed to publish chart. Please try again.');
        } finally {
            setPublishing(false);
            setConfirmAction(null);
        }
    };

    const handleToggleActive = async () => {
        try {
            setToggling(true);
            setError(null);
            setSuccessMessage(null);

            const response = isActive
                ? await adminVenueChartsService.deactivateChart(chartId)
                : await adminVenueChartsService.activateChart(chartId);

            if (response.success) {
                setSuccessMessage(
                    isActive
                        ? 'Chart deactivated successfully'
                        : 'Chart activated successfully'
                );
                if (response.data) {
                    onUpdate(response.data);
                }
            } else {
                setError(response.message || 'Failed to update chart status');
            }
        } catch (err) {
            console.error('Error toggling chart status:', err);
            setError(err.message || 'Failed to update chart status. Please try again.');
        } finally {
            setToggling(false);
            setConfirmAction(null);
        }
    };

    const executeAction = () => {
        switch (confirmAction) {
            case 'sync':
                handleSync();
                break;
            case 'publish':
                handlePublish();
                break;
            case 'activate':
            case 'deactivate':
                handleToggleActive();
                break;
            default:
                setConfirmAction(null);
        }
    };

    const getConfirmationMessage = () => {
        switch (confirmAction) {
            case 'sync':
                return 'This will update the chart data from Seats.io, including categories and capacity. Any local changes not published to Seats.io may be overwritten.';
            case 'publish':
                return 'This will publish any draft changes in the Seats.io chart designer.';
            case 'activate':
                return 'This will make the chart available for organizers to use when creating events.';
            case 'deactivate':
                return 'This will hide the chart from organizers. Existing events using this chart will not be affected.';
            default:
                return '';
        }
    };

    const getConfirmationTitle = () => {
        switch (confirmAction) {
            case 'sync':
                return 'Sync Chart from Seats.io?';
            case 'publish':
                return 'Publish Chart Changes?';
            case 'activate':
                return 'Activate Chart?';
            case 'deactivate':
                return 'Deactivate Chart?';
            default:
                return 'Confirm Action';
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <Button
                    variant="secondary"
                    onClick={() => setConfirmAction('sync')}
                    loading={syncing}
                    disabled={publishing || toggling}
                    icon={<RefreshCw className="w-4 h-4" />}
                >
                    Sync from Seats.io
                </Button>

                <Button
                    variant="secondary"
                    onClick={() => setConfirmAction('publish')}
                    loading={publishing}
                    disabled={syncing || toggling}
                    icon={<Upload className="w-4 h-4" />}
                >
                    Publish Changes
                </Button>

                {isActive ? (
                    <Button
                        variant="outline"
                        onClick={() => setConfirmAction('deactivate')}
                        loading={toggling}
                        disabled={syncing || publishing}
                        icon={<PowerOff className="w-4 h-4" />}
                        className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                        Deactivate
                    </Button>
                ) : (
                    <Button
                        variant="success"
                        onClick={() => setConfirmAction('activate')}
                        loading={toggling}
                        disabled={syncing || publishing}
                        icon={<Power className="w-4 h-4" />}
                    >
                        Activate
                    </Button>
                )}
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">{successMessage}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmAction !== null}
                onClose={() => setConfirmAction(null)}
                onConfirm={executeAction}
                title={getConfirmationTitle()}
                message={getConfirmationMessage()}
                confirmText={confirmAction === 'deactivate' ? 'Deactivate' : 'Confirm'}
                variant={confirmAction === 'deactivate' ? 'danger' : 'primary'}
                loading={syncing || publishing || toggling}
            />
        </div>
    );
}
