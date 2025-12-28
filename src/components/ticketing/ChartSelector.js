'use client';

/**
 * ChartSelector Component
 * Allows organizers to select from available venue charts or create a new one
 */

import { useState, useEffect } from 'react';
import { MapPin, Users, Plus, Building2, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import seatingService from '@/services/seating.service';

/**
 * ChartSelector component
 * @param {Object} props
 * @param {function(import('@/types/seating-types').VenueChart): void} props.onSelect - Callback when chart is selected
 * @param {function(): void} props.onCreateNew - Callback to open chart creation flow
 * @param {string} [props.selectedChartId] - Currently selected chart ID
 * @param {string} [props.className] - Additional CSS classes
 */
export default function ChartSelector({
    onSelect,
    onCreateNew,
    selectedChartId,
    className = '',
}) {
    const [charts, setCharts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'admin' | 'own'

    useEffect(() => {
        fetchCharts();
    }, []);

    const fetchCharts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await seatingService.getCharts();
            if (response.success) {
                setCharts(response.data || []);
            } else {
                setError(response.message || 'Failed to load charts');
            }
        } catch (err) {
            setError('Failed to load charts. Please try again.');
            console.error('Error fetching charts:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCharts = charts.filter(chart => {
        if (filter === 'admin') return chart.is_admin_chart;
        if (filter === 'own') return !chart.is_admin_chart;
        return true;
    });

    const adminCharts = filteredCharts.filter(c => c.is_admin_chart);
    const ownCharts = filteredCharts.filter(c => !c.is_admin_chart);

    if (loading) {
        return (
            <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-gray-600">Loading available charts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-xl p-6 text-center ${className}`}>
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <p className="text-red-700 font-medium mb-2">Unable to load charts</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <Button onClick={fetchCharts} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Select Venue Chart</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Choose a pre-built venue or design your own seating layout
                    </p>
                </div>
                <Button
                    onClick={onCreateNew}
                    variant="secondary"
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Design Custom Chart
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-3">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        filter === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    All Charts ({charts.length})
                </button>
                <button
                    onClick={() => setFilter('admin')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        filter === 'admin'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    Pre-built Venues ({charts.filter(c => c.is_admin_chart).length})
                </button>
                <button
                    onClick={() => setFilter('own')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        filter === 'own'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    My Charts ({charts.filter(c => !c.is_admin_chart).length})
                </button>
            </div>

            {/* Pre-built Venues Section */}
            {(filter === 'all' || filter === 'admin') && adminCharts.length > 0 && (
                <div className="space-y-3">
                    <div>
                        <h4 className="font-semibold text-gray-900">Pre-built Venue Charts</h4>
                        <p className="text-sm text-gray-500">Popular venues ready to use</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {adminCharts.map(chart => (
                            <ChartCard
                                key={chart.id}
                                chart={chart}
                                isSelected={selectedChartId === chart.id}
                                onSelect={() => onSelect(chart)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Own Charts Section */}
            {(filter === 'all' || filter === 'own') && ownCharts.length > 0 && (
                <div className="space-y-3">
                    <div>
                        <h4 className="font-semibold text-gray-900">My Custom Charts</h4>
                        <p className="text-sm text-gray-500">Charts you've created</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ownCharts.map(chart => (
                            <ChartCard
                                key={chart.id}
                                chart={chart}
                                isSelected={selectedChartId === chart.id}
                                onSelect={() => onSelect(chart)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredCharts.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-2">No charts found</p>
                    <p className="text-gray-500 text-sm mb-4">
                        {filter === 'own'
                            ? "You haven't created any custom charts yet."
                            : 'No venue charts are available.'}
                    </p>
                    <Button onClick={onCreateNew} variant="primary">
                        Design Custom Chart
                    </Button>
                </div>
            )}
        </div>
    );
}

/**
 * Chart Card Sub-component
 */
function ChartCard({ chart, isSelected, onSelect }) {
    return (
        <div
            onClick={onSelect}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
        >
            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                </div>
            )}

            {/* Admin Badge */}
            {chart.is_admin_chart && (
                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full mb-2">
                    Official
                </span>
            )}

            {/* Thumbnail */}
            <div className="bg-gray-100 rounded-lg h-24 mb-3 flex items-center justify-center overflow-hidden">
                {chart.thumbnail_url ? (
                    <img
                        src={chart.thumbnail_url}
                        alt={chart.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Building2 className="w-10 h-10 text-gray-300" />
                )}
            </div>

            {/* Chart Info */}
            <h5 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                {chart.name}
            </h5>
            <p className="text-xs text-gray-600 mb-2 truncate">
                {chart.venue_name}
            </p>

            {/* Details */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                {chart.city && (
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {chart.city}
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {chart.total_capacity?.toLocaleString() || 0} seats
                </span>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1">
                {chart.categories?.slice(0, 3).map(cat => (
                    <span
                        key={cat.key}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                        />
                        {cat.label}
                    </span>
                ))}
                {chart.categories?.length > 3 && (
                    <span className="text-xs text-gray-400">
                        +{chart.categories.length - 3} more
                    </span>
                )}
            </div>
        </div>
    );
}
