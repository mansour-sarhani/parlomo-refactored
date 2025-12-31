'use client';

/**
 * VenueChartDetail Component
 * Displays comprehensive venue chart information
 */

import { MapPin, Building2, Users, Tag, User, Calendar, Key } from 'lucide-react';
import ChartStatusBadge from './ChartStatusBadge';
import ChartTypeBadge from './ChartTypeBadge';
import CategoryList from './CategoryList';

/**
 * VenueChartDetail component
 * @param {Object} props
 * @param {import('@/types/seating-types').VenueChart} props.chart - Chart data to display
 * @param {string} [props.className] - Additional CSS classes
 */
export default function VenueChartDetail({ chart, className = '' }) {
    if (!chart) {
        return (
            <div className={`text-center py-12 ${className}`}>
                <p className="text-gray-500">No chart data available</p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{chart.name}</h2>
                        {chart.description && (
                            <p className="text-gray-600 mt-2">{chart.description}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                        <ChartTypeBadge chartType={chart.chart_type} />
                        <ChartStatusBadge isActive={chart.is_active} />
                    </div>
                </div>

                {/* Chart Key */}
                {chart.chart_key && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-200 inline-flex">
                        <Key className="w-4 h-4" />
                        <span className="font-mono">{chart.chart_key}</span>
                    </div>
                )}
            </div>

            {/* Venue Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    Venue Information
                </h3>

                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1">Venue Name</dt>
                        <dd className="text-base text-gray-900">{chart.venue_name || '—'}</dd>
                    </div>

                    {chart.venue_address && (
                        <div>
                            <dt className="text-sm font-medium text-gray-500 mb-1">Address</dt>
                            <dd className="text-base text-gray-900">{chart.venue_address}</dd>
                        </div>
                    )}

                    {chart.city && (
                        <div>
                            <dt className="text-sm font-medium text-gray-500 mb-1">City</dt>
                            <dd className="text-base text-gray-900">{chart.city}</dd>
                        </div>
                    )}

                    {chart.country && (
                        <div>
                            <dt className="text-sm font-medium text-gray-500 mb-1">Country</dt>
                            <dd className="text-base text-gray-900">{chart.country}</dd>
                        </div>
                    )}
                </dl>
            </div>

            {/* Capacity Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    Capacity Information
                </h3>

                <div className="mb-6">
                    <div className="text-sm font-medium text-gray-500 mb-2">Total Capacity</div>
                    <div className="text-3xl font-bold text-gray-900">
                        {chart.total_capacity ? chart.total_capacity.toLocaleString() : '0'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">seats</div>
                </div>

                {chart.categories && chart.categories.length > 0 && (
                    <div>
                        <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Categories & Capacity Breakdown
                        </div>
                        <CategoryList
                            categories={chart.categories}
                            capacities={chart.category_capacities}
                            readOnly={true}
                        />
                    </div>
                )}
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    Metadata
                </h3>

                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chart.chart_type === 'organizer' && chart.created_by && (
                        <div>
                            <dt className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Created By
                            </dt>
                            <dd className="text-base text-gray-900">
                                {chart.created_by.name || chart.created_by.email || '—'}
                                {chart.created_by.email && chart.created_by.name && (
                                    <span className="text-sm text-gray-500 block mt-0.5">
                                        {chart.created_by.email}
                                    </span>
                                )}
                            </dd>
                        </div>
                    )}

                    {chart.chart_type === 'admin' && (
                        <div>
                            <dt className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Created By
                            </dt>
                            <dd className="text-base text-gray-900">Platform Admin</dd>
                        </div>
                    )}

                    <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1">Created At</dt>
                        <dd className="text-base text-gray-900">{formatDate(chart.created_at)}</dd>
                    </div>

                    <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1">Last Updated</dt>
                        <dd className="text-base text-gray-900">{formatDate(chart.updated_at)}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}
