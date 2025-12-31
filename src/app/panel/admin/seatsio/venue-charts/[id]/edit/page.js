'use client';

/**
 * Admin Edit Venue Chart Page
 * Form page for editing an existing venue chart
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import { Button } from '@/components/common/Button';
import adminVenueChartsService from '@/services/admin/adminVenueCharts.service';
import VenueChartForm from '@/components/admin/venue-charts/VenueChartForm';

export default function EditVenueChartPage() {
    const { user, loading: authLoading } = useAuth();
    const { role, loading: permissionsLoading } = usePermissions();
    const router = useRouter();
    const params = useParams();
    const chartId = params.id;

    const [chart, setChart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [serverErrors, setServerErrors] = useState({});

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

    const handleSubmit = async (formData) => {
        try {
            setSaving(true);
            setServerErrors({});

            const response = await adminVenueChartsService.updateVenueChart(chartId, formData);

            if (response.success) {
                toast.success(response.message || 'Chart updated successfully');
                // Redirect to the detail page
                router.push(`/panel/admin/seatsio/venue-charts/${chartId}`);
            } else {
                toast.error(response.message || 'Failed to update chart');
                if (response.errors) {
                    setServerErrors(response.errors);
                }
            }
        } catch (err) {
            console.error('Error updating chart:', err);

            // Handle validation errors (422)
            if (err.status === 422 && err.errors) {
                setServerErrors(err.errors);
                toast.error('Please fix the validation errors');
            } else {
                toast.error(err.message || 'Failed to update chart. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.push(`/panel/admin/seatsio/venue-charts/${chartId}`);
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Back Button */}
            <Link
                href={`/panel/admin/seatsio/venue-charts/${chartId}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Chart Details
            </Link>

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Edit Venue Chart</h1>
                <p className="text-gray-600 mt-2">
                    Update the venue chart information. Note: Categories cannot be modified after
                    creation.
                </p>
            </div>

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

            {/* Form */}
            {!loading && !error && chart && (
                <VenueChartForm
                    initialData={chart}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={saving}
                    serverErrors={serverErrors}
                />
            )}
        </div>
    );
}
