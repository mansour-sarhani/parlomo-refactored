'use client';

/**
 * Admin Venue Chart Detail Page
 * Displays comprehensive chart information and action buttons
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Loader2, AlertCircle, Layout, Copy } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import adminVenueChartsService from '@/services/admin/adminVenueCharts.service';
import VenueChartDetail from '@/components/admin/venue-charts/VenueChartDetail';
import ChartActions from '@/components/admin/venue-charts/ChartActions';
import DeleteChartModal from '@/components/admin/venue-charts/DeleteChartModal';
import DuplicateChartModal from '@/components/admin/venue-charts/DuplicateChartModal';

export default function VenueChartDetailPage() {
    const { user, loading: authLoading } = useAuth();
    const { role, loading: permissionsLoading } = usePermissions();
    const router = useRouter();
    const params = useParams();
    const chartId = params.id;

    const [chart, setChart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);

    // Auth check - redirect if not super-admin
    useEffect(() => {
        if (!authLoading && !permissionsLoading && (!user || role !== 'super-admin')) {
            router.push('/panel/admin');
        }
    }, [user, role, authLoading, permissionsLoading, router]);

    // Fetch chart details
    useEffect(() => {
        if (chartId) {
            fetchChart();
        }
    }, [chartId]);

    const fetchChart = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await adminVenueChartsService.getVenueChart(chartId);

            if (response.success) {
                setChart(response.data);
            } else {
                setError(response.message || 'Failed to load chart details');
            }
        } catch (err) {
            console.error('Error fetching chart:', err);

            if (err.status === 404) {
                setError('Chart not found');
            } else {
                setError(err.message || 'Failed to load chart details. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChartUpdate = (updatedData) => {
        // Update chart data when actions are performed
        setChart((prev) => ({
            ...prev,
            ...updatedData,
        }));
    };

    const handleDeleteSuccess = () => {
        router.push('/panel/admin/seatsio/venue-charts');
    };

    const handleDuplicateSuccess = (duplicatedChart) => {
        // Navigate to the newly duplicated chart
        router.push(`/panel/admin/seatsio/venue-charts/${duplicatedChart.id}`);
    };

    // Show loading state while checking auth
    if (authLoading || permissionsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // Auth check - only super-admin can access
    if (!user || role !== 'super-admin') {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Back Button */}
            <Link
                href="/panel/admin/seatsio/venue-charts"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Venue Charts
            </Link>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <p className="text-red-700 font-medium mb-2">Error Loading Chart</p>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={fetchChart} variant="outline">
                            Try Again
                        </Button>
                        <Link href="/panel/admin/seatsio/venue-charts">
                            <Button variant="secondary">Back to List</Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Chart Details */}
            {!loading && !error && chart && (
                <>
                    {/* Action Bar */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Link href={`/panel/admin/seatsio/venue-charts/${chartId}/designer`}>
                                <Button variant="primary" icon={<Layout className="w-4 h-4" />}>
                                    Design Layout
                                </Button>
                            </Link>
                            <Link href={`/panel/admin/seatsio/venue-charts/${chartId}/edit`}>
                                <Button variant="secondary" icon={<Edit className="w-4 h-4" />}>
                                    Edit Details
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                onClick={() => setDuplicateModalOpen(true)}
                                icon={<Copy className="w-4 h-4" />}
                            >
                                Duplicate Chart
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => setDeleteModalOpen(true)}
                                icon={<Trash2 className="w-4 h-4" />}
                            >
                                Delete Chart
                            </Button>
                        </div>
                    </div>

                    {/* Chart Information */}
                    <VenueChartDetail chart={chart} className="mb-6" />

                    {/* Chart Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Actions</h3>
                        <ChartActions
                            chartId={chartId}
                            isActive={chart.is_active}
                            onUpdate={handleChartUpdate}
                        />
                    </div>
                </>
            )}

            {/* Delete Modal */}
            {chart && (
                <DeleteChartModal
                    isOpen={deleteModalOpen}
                    chartId={chart.id}
                    chartName={chart.name}
                    onClose={() => setDeleteModalOpen(false)}
                    onSuccess={handleDeleteSuccess}
                />
            )}

            {/* Duplicate Modal */}
            {duplicateModalOpen && chart && (
                <DuplicateChartModal
                    chartId={chart.id}
                    chartName={chart.name}
                    onClose={() => setDuplicateModalOpen(false)}
                    onSuccess={handleDuplicateSuccess}
                />
            )}
        </div>
    );
}
