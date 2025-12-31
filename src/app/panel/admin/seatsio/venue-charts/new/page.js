'use client';

/**
 * Admin Create Venue Chart Page
 * Form page for creating a new venue chart
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import adminVenueChartsService from '@/services/admin/adminVenueCharts.service';
import VenueChartForm from '@/components/admin/venue-charts/VenueChartForm';

export default function CreateVenueChartPage() {
    const { user, loading: authLoading } = useAuth();
    const { role, loading: permissionsLoading } = usePermissions();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState({});

    // Auth check - redirect if not super-admin
    useEffect(() => {
        if (!authLoading && !permissionsLoading && (!user || role !== 'super-admin')) {
            router.push('/panel/admin');
        }
    }, [user, role, authLoading, permissionsLoading, router]);

    const handleSubmit = async (formData) => {
        try {
            setLoading(true);
            setServerErrors({});

            const response = await adminVenueChartsService.createVenueChart(formData);

            if (response.success) {
                toast.success(response.message || 'Chart created successfully');
                // Redirect to the detail page of the newly created chart
                router.push(`/panel/admin/seatsio/venue-charts/${response.data.id}`);
            } else {
                toast.error(response.message || 'Failed to create chart');
                if (response.errors) {
                    setServerErrors(response.errors);
                }
            }
        } catch (err) {
            console.error('Error creating chart:', err);

            // Handle validation errors (422)
            if (err.status === 422 && err.errors) {
                setServerErrors(err.errors);
                toast.error('Please fix the validation errors');
            } else {
                toast.error(err.message || 'Failed to create chart. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/panel/admin/seatsio/venue-charts');
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
                href="/panel/admin/seatsio/venue-charts"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Venue Charts
            </Link>

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Create Venue Chart</h1>
                <p className="text-gray-600 mt-2">
                    Create a new seating chart for a venue. After creating the chart, you'll be able
                    to design the seating layout using the Seats.io designer.
                </p>
            </div>

            {/* Form */}
            <VenueChartForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
                serverErrors={serverErrors}
            />
        </div>
    );
}
