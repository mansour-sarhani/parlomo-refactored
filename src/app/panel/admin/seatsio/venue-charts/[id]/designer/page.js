'use client';

/**
 * Admin Venue Chart Designer Page
 * Page for editing the seating layout of a venue chart using Seats.io designer
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import { Button } from '@/components/common/Button';
import adminVenueChartsService from '@/services/admin/adminVenueCharts.service';
import AdminChartDesigner from '@/components/admin/venue-charts/AdminChartDesigner';

export default function VenueChartDesignerPage() {
    const { user, loading: authLoading } = useAuth();
    const { role, loading: permissionsLoading } = usePermissions();
    const router = useRouter();
    const params = useParams();
    const chartId = params.id;

    const [chart, setChart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handlePublish = (updatedChart) => {
        // Update local chart state with published data
        if (updatedChart) {
            setChart(updatedChart);
        }
        // Navigate back to detail page after a short delay
        setTimeout(() => {
            router.push(`/panel/admin/seatsio/venue-charts/${chartId}`);
        }, 1500);
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

    // Loading State
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-gray-600">Loading chart...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !chart) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <p className="text-red-700 font-medium mb-2">Error Loading Chart</p>
                    <p className="text-red-600 text-sm mb-4">{error || 'Chart not found'}</p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={fetchChart} variant="outline">
                            Try Again
                        </Button>
                        <Button onClick={handleCancel} variant="secondary">
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-[1800px]">
            <AdminChartDesigner
                chartId={chartId}
                chartName={chart.name}
                onPublish={handlePublish}
                onCancel={handleCancel}
            />
        </div>
    );
}
