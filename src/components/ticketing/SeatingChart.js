'use client';

/**
 * SeatingChart Component
 * Renders seats.io seating chart for seated events
 */

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { SeatsioSeatingChart } from '@seatsio/seatsio-react';
import { useSeating } from '@/hooks/useTicketing';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';

/**
 * SeatingChart component for seats.io integration
 * @param {Object} props
 * @param {string} props.eventId - Parlomo event ID
 * @param {function(import('@/types/seating-types').SelectedSeat[]): void} [props.onSelectionChange] - Callback when seats change
 * @param {number} [props.maxSeats] - Optional max seats override
 * @param {string} [props.currency='GBP'] - Currency for price formatting
 * @param {string} [props.className] - Additional CSS classes
 */
export default function SeatingChart({
    eventId,
    onSelectionChange,
    maxSeats,
    currency = 'GBP',
    className = '',
}) {
    const {
        seatingConfig,
        seatingLoading,
        seatingError,
        selectedSeats,
        fetchSeatingConfig,
        setSelectedSeats,
        addSelectedSeat,
        removeSelectedSeat,
    } = useSeating();

    const chartRef = useRef(null);
    const [chartReady, setChartReady] = useState(false);
    const [localError, setLocalError] = useState(null);

    // Fetch seating config on mount
    useEffect(() => {
        if (eventId) {
            fetchSeatingConfig(eventId);
        }
    }, [eventId, fetchSeatingConfig]);

    // Get currency symbol
    const getCurrencySymbol = useCallback((curr) => {
        switch (curr) {
            case 'GBP': return '£';
            case 'USD': return '$';
            case 'EUR': return '€';
            default: return curr + ' ';
        }
    }, []);

    // Handle seat selection
    const handleObjectSelected = useCallback((object) => {
        if (!seatingConfig?.pricing) return;

        // Find matching ticket type from pricing config
        // Use String() comparison because seats.io returns category key as number
        // but our API might return it as string
        const categoryKey = String(object.category?.key);
        const ticketType = seatingConfig.pricing.find(
            p => String(p.category) === categoryKey
        );

        if (!ticketType) {
            console.warn('No ticket type found for category:', object.category?.key);
            return;
        }

        const newSeat = {
            label: object.label,
            category: object.category?.key,
            ticketTypeId: ticketType.ticketTypeId,
            ticketTypeName: ticketType.ticketTypeName,
            price: ticketType.price,
        };

        addSelectedSeat(newSeat);

        // Notify parent of selection change
        if (onSelectionChange) {
            onSelectionChange([...selectedSeats, newSeat]);
        }
    }, [seatingConfig, selectedSeats, addSelectedSeat, onSelectionChange]);

    // Handle seat deselection
    const handleObjectDeselected = useCallback((object) => {
        removeSelectedSeat(object.label);

        // Notify parent of selection change
        if (onSelectionChange) {
            const updatedSeats = selectedSeats.filter(seat => seat.label !== object.label);
            onSelectionChange(updatedSeats);
        }
    }, [selectedSeats, removeSelectedSeat, onSelectionChange]);

    // Handle chart rendered
    const handleChartRendered = useCallback((chart) => {
        chartRef.current = chart;
        setChartReady(true);
        setLocalError(null);
    }, []);

    // Handle chart render error
    const handleChartRenderStarted = useCallback((chart) => {
        chartRef.current = chart;
    }, []);

    // Retry loading seating config
    const handleRetry = useCallback(() => {
        setLocalError(null);
        fetchSeatingConfig(eventId);
    }, [eventId, fetchSeatingConfig]);

    // Loading state
    if (seatingLoading) {
        return (
            <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-gray-600">Loading seating chart...</p>
            </div>
        );
    }

    // Error state
    if (seatingError || localError) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-xl p-8 text-center ${className}`}>
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 font-medium mb-2">Unable to load seating chart</p>
                <p className="text-red-600 text-sm mb-4">
                    {seatingError || localError || 'An error occurred while loading the seating chart.'}
                </p>
                <Button onClick={handleRetry} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </Button>
            </div>
        );
    }

    // No config available
    if (!seatingConfig) {
        return (
            <div className={`bg-gray-50 border border-gray-200 rounded-xl p-8 text-center ${className}`}>
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">Seating chart not available</p>
                <p className="text-gray-500 text-sm mt-2">
                    This event does not have a seating chart configured.
                </p>
            </div>
        );
    }

    // Build pricing for seats.io - memoize to prevent recreation
    const chartPricing = useMemo(() => {
        return seatingConfig.pricing?.map(p => ({
            category: p.category,
            price: p.price,
        })) || [];
    }, [seatingConfig.pricing]);

    // Price formatter - memoize to prevent recreation
    const priceFormatter = useCallback((price) => {
        return `${getCurrencySymbol(currency)}${price.toFixed(2)}`;
    }, [currency, getCurrencySymbol]);

    // Max selected objects
    const maxSelectedObjects = maxSeats || parseInt(seatingConfig.max_selected_objects) || 20;

    return (
        <div className={`seating-chart-wrapper ${className}`}>
            <div
                className="seating-chart-container bg-white rounded-xl border border-gray-200 overflow-hidden"
                style={{ height: '500px', minHeight: '400px' }}
            >
                <SeatsioSeatingChart
                    workspaceKey={seatingConfig.workspace_key}
                    event={seatingConfig.event_key}
                    region={seatingConfig.region || "eu"}
                    pricing={chartPricing}
                    priceFormatter={priceFormatter}
                    maxSelectedObjects={maxSelectedObjects}
                    onObjectSelected={handleObjectSelected}
                    onObjectDeselected={handleObjectDeselected}
                    onChartRendered={handleChartRendered}
                    onRenderStarted={handleChartRenderStarted}
                    showLegend
                    showMinimap
                    colorScheme="light"
                />
            </div>

            {/* Selection hint */}
            {chartReady && selectedSeats.length === 0 && (
                <p className="text-center text-gray-500 text-sm mt-4">
                    Click on seats in the chart above to select them
                </p>
            )}
        </div>
    );
}
