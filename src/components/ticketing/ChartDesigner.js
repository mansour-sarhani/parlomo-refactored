'use client';

/**
 * ChartDesigner Component
 * Embeds the seats.io Chart Designer for creating/editing seating layouts
 *
 * API Response format from /api/ticketing/seatsio/charts/{id}/designer:
 * {
 *   "success": true,
 *   "data": {
 *     "chart_key": "abc123-seatsio-chart-key",
 *     "secret_key": "your-workspace-secret-key",
 *     "region": "eu",
 *     "mode": "safe"
 *   }
 * }
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import seatingService from '@/services/seating.service';
import { toast } from 'sonner';

/**
 * Get CDN URL based on region
 * @param {string} region - "eu" or "na"
 * @returns {string} CDN script URL
 */
const getSeatsioScriptUrl = (region) => {
    const regionLower = (region || 'eu').toLowerCase();
    return regionLower === 'na'
        ? 'https://cdn-na.seatsio.net/chart.js'
        : 'https://cdn-eu.seatsio.net/chart.js';
};

/**
 * ChartDesigner component
 * @param {Object} props
 * @param {string} props.chartId - Chart ID to design
 * @param {function(): void} props.onSave - Callback after chart is saved/published
 * @param {function(): void} props.onCancel - Callback to go back
 */
export default function ChartDesigner({ chartId, onSave, onCancel }) {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const designerRef = useRef(null);
    const isDestroyedRef = useRef(false);

    // Fetch designer configuration first
    useEffect(() => {
        if (chartId) {
            fetchDesignerConfig();
        }
    }, [chartId]);

    // Load seats.io script after config is fetched (to use correct region)
    useEffect(() => {
        if (!config) return;

        const scriptId = 'seatsio-chart-script';
        const existingScript = document.getElementById(scriptId);

        if (existingScript) {
            // Script already loaded, check if seatsio is available
            if (typeof window.seatsio !== 'undefined') {
                setScriptLoaded(true);
            } else {
                existingScript.onload = () => setScriptLoaded(true);
            }
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = getSeatsioScriptUrl(config.region);
        script.async = true;
        script.onload = () => {
            setScriptLoaded(true);
        };
        script.onerror = () => {
            setError('Failed to load seats.io script');
        };
        document.body.appendChild(script);

        return () => {
            // Don't remove the script on unmount as it may be needed later
        };
    }, [config]);

    const fetchDesignerConfig = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await seatingService.getDesignerConfig(chartId);
            if (response.success) {
                setConfig(response.data);
            } else {
                setError(response.message || 'Failed to load designer configuration');
            }
        } catch (err) {
            setError('Failed to load designer configuration');
            console.error('Error fetching designer config:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle chart published callback
    const handleChartPublished = useCallback(async () => {
        setSyncing(true);

        try {
            const response = await seatingService.syncChart(chartId);
            if (response.success) {
                toast.success('Chart saved successfully');
                onSave();
            } else {
                toast.error('Chart published but failed to sync: ' + response.message);
            }
        } catch (err) {
            toast.error('Chart published but failed to sync');
            console.error('Error syncing chart:', err);
        } finally {
            setSyncing(false);
        }
    }, [chartId, onSave]);

    // Initialize the designer once script is loaded and config is available
    useEffect(() => {
        if (!config || loading || !scriptLoaded) return;

        // Reset destroyed flag when starting fresh
        isDestroyedRef.current = false;

        const initDesigner = () => {
            // Check if seatsio is available
            if (typeof window === 'undefined' || typeof window.seatsio === 'undefined') {
                // Retry after a short delay
                setTimeout(initDesigner, 100);
                return;
            }

            // Don't initialize if already destroyed (Strict Mode cleanup ran)
            if (isDestroyedRef.current) {
                return;
            }

            // Create new designer instance with updated config format
            try {
                designerRef.current = new window.seatsio.SeatingChartDesigner({
                    divId: 'chart-designer-container',
                    secretKey: config.secret_key,
                    chartKey: config.chart_key,
                    mode: config.mode || 'safe',
                    onChartPublished: handleChartPublished,
                    onExitRequested: onCancel,
                    language: 'en',
                }).render();
            } catch (err) {
                console.error('Error initializing designer:', err);
                setError('Failed to initialize the chart designer');
            }
        };

        initDesigner();

        return () => {
            isDestroyedRef.current = true;
            if (designerRef.current) {
                try {
                    designerRef.current.destroy();
                } catch (e) {
                    // Ignore cleanup errors (already destroyed)
                }
                designerRef.current = null;
            }
        };
    }, [config, loading, scriptLoaded, handleChartPublished, onCancel]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-gray-600">Loading chart designer...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 font-medium mb-2">Unable to load chart designer</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <div className="flex items-center justify-center gap-3">
                    <Button onClick={onCancel} variant="secondary">
                        Go Back
                    </Button>
                    <Button onClick={fetchDesignerConfig} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Handle manual "Done Designing" button click
    const handleDoneDesigning = async () => {
        setSyncing(true);
        try {
            const response = await seatingService.syncChart(chartId);
            if (response.success) {
                toast.success('Chart saved successfully');
                onSave();
            } else {
                toast.error('Failed to sync chart: ' + (response.message || 'Unknown error'));
            }
        } catch (err) {
            toast.error('Failed to sync chart');
            console.error('Error syncing chart:', err);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="chart-designer-wrapper">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                    <Button
                        onClick={onCancel}
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Design Your Seating Chart</h2>
                        <p className="text-sm text-gray-600">
                            Add sections, rows, and seats. Changes are auto-saved.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleDoneDesigning}
                    disabled={syncing}
                    className="gap-2"
                >
                    {syncing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Done Designing'
                    )}
                </Button>
            </div>

            {/* Designer Container */}
            <div
                id="chart-designer-container"
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                style={{ width: '100%', height: 'calc(100vh - 200px)', minHeight: '500px' }}
            />

            {/* Syncing Overlay */}
            {syncing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                        <p className="text-gray-900 font-medium">Saving chart...</p>
                        <p className="text-gray-600 text-sm">Please wait while we sync your chart</p>
                    </div>
                </div>
            )}
        </div>
    );
}
