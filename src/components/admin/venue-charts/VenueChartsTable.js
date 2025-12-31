'use client';

/**
 * VenueChartsTable Component
 * Displays venue charts in a responsive table with action buttons
 */

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Edit, Trash2, MapPin, Copy } from 'lucide-react';
import { Button } from '@/components/common/Button';
import ChartStatusBadge from './ChartStatusBadge';
import ChartTypeBadge from './ChartTypeBadge';
import DeleteChartModal from './DeleteChartModal';
import DuplicateChartModal from './DuplicateChartModal';
import { useRouter } from 'next/navigation';

/**
 * VenueChartsTable component
 * @param {Object} props
 * @param {Array<import('@/types/seating-types').VenueChart>} props.charts - Charts to display
 * @param {function(): void} props.onRefresh - Callback to refresh the list after actions
 * @param {string} [props.className] - Additional CSS classes
 */
export default function VenueChartsTable({ charts = [], onRefresh, className = '' }) {
    const router = useRouter();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [chartToDelete, setChartToDelete] = useState(null);
    const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
    const [chartToDuplicate, setChartToDuplicate] = useState(null);

    const handleDeleteClick = (chart) => {
        setChartToDelete(chart);
        setDeleteModalOpen(true);
    };

    const handleDeleteSuccess = () => {
        setDeleteModalOpen(false);
        setChartToDelete(null);
        onRefresh();
    };

    const handleDuplicateClick = (chart) => {
        setChartToDuplicate(chart);
        setDuplicateModalOpen(true);
    };

    const handleDuplicateSuccess = (duplicatedChart) => {
        setDuplicateModalOpen(false);
        setChartToDuplicate(null);
        // Navigate to the newly duplicated chart
        router.push(`/panel/admin/seatsio/venue-charts/${duplicatedChart.id}`);
    };

    if (!charts || charts.length === 0) {
        return (
            <div className={`text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">No venue charts found</p>
                <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className={`hidden lg:block bg-white rounded-lg shadow overflow-hidden ${className}`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Chart Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Venue
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Capacity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created By
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {charts.map((chart) => (
                            <tr key={chart.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {chart.name}
                                    </div>
                                    {chart.description && (
                                        <div className="text-xs text-gray-500 truncate max-w-xs">
                                            {chart.description}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{chart.venue_name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {[chart.city, chart.country].filter(Boolean).join(', ') || '—'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {chart.total_capacity ? chart.total_capacity.toLocaleString() : '0'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <ChartTypeBadge chartType={chart.chart_type} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <ChartStatusBadge isActive={chart.is_active} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm">
                                        {chart.chart_type === 'admin' ? (
                                            <span className="text-gray-600 font-medium">Platform Admin</span>
                                        ) : (
                                            <div>
                                                <div className="text-gray-900">
                                                    {chart.created_by?.name || chart.created_by?.email || '—'}
                                                </div>
                                                {chart.created_by?.email && chart.created_by?.name && (
                                                    <div className="text-xs text-gray-500">{chart.created_by.email}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/panel/admin/seatsio/venue-charts/${chart.id}`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                icon={<Eye className="w-4 h-4" />}
                                                title="View details"
                                            />
                                        </Link>
                                        <Link href={`/panel/admin/seatsio/venue-charts/${chart.id}/edit`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                icon={<Edit className="w-4 h-4" />}
                                                title="Edit chart"
                                            />
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDuplicateClick(chart)}
                                            icon={<Copy className="w-4 h-4" />}
                                            title="Duplicate chart"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteClick(chart)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            icon={<Trash2 className="w-4 h-4" />}
                                            title="Delete chart"
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className={`lg:hidden space-y-4 ${className}`}>
                {charts.map((chart) => (
                    <div
                        key={chart.id}
                        className="bg-white rounded-lg shadow border border-gray-200 p-4"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 truncate">
                                    {chart.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-0.5">{chart.venue_name}</p>
                            </div>
                            <div className="flex flex-col gap-1.5 items-end">
                                <ChartTypeBadge chartType={chart.chart_type} />
                                <ChartStatusBadge isActive={chart.is_active} />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                            {(chart.city || chart.country) && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <span>{[chart.city, chart.country].filter(Boolean).join(', ')}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Capacity:</span>
                                <span className="font-medium text-gray-900">
                                    {chart.total_capacity ? chart.total_capacity.toLocaleString() : '0'}
                                </span>
                            </div>
                            {chart.chart_type === 'organizer' && chart.created_by && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Created by:</span>
                                    <span className="text-gray-900">
                                        {chart.created_by.name || chart.created_by.email || '—'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t border-gray-200">
                            <Link href={`/panel/admin/seatsio/venue-charts/${chart.id}`} className="flex-1">
                                <Button variant="secondary" size="sm" fullWidth icon={<Eye className="w-4 h-4" />}>
                                    View
                                </Button>
                            </Link>
                            <Link href={`/panel/admin/seatsio/venue-charts/${chart.id}/edit`} className="flex-1">
                                <Button variant="secondary" size="sm" fullWidth icon={<Edit className="w-4 h-4" />}>
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDuplicateClick(chart)}
                                icon={<Copy className="w-4 h-4" />}
                                title="Duplicate"
                            />
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(chart)}
                                icon={<Trash2 className="w-4 h-4" />}
                                title="Delete"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Modal */}
            {chartToDelete && (
                <DeleteChartModal
                    isOpen={deleteModalOpen}
                    chartId={chartToDelete.id}
                    chartName={chartToDelete.name}
                    onClose={() => setDeleteModalOpen(false)}
                    onSuccess={handleDeleteSuccess}
                />
            )}

            {/* Duplicate Modal */}
            {chartToDuplicate && (
                <DuplicateChartModal
                    chartId={chartToDuplicate.id}
                    chartName={chartToDuplicate.name}
                    onClose={() => setDuplicateModalOpen(false)}
                    onSuccess={handleDuplicateSuccess}
                />
            )}
        </>
    );
}
