'use client';

/**
 * Admin Venue Charts List Page
 * Displays all venue charts with search, filters, and pagination
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import adminVenueChartsService from '@/services/admin/adminVenueCharts.service';
import VenueChartsTable from '@/components/admin/venue-charts/VenueChartsTable';
import ChartFilters from '@/components/admin/venue-charts/ChartFilters';

export default function VenueChartsPage() {
    const { user, loading: authLoading } = useAuth();
    const { role, loading: permissionsLoading } = usePermissions();
    const router = useRouter();

    const [charts, setCharts] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [limit] = useState(20);

    // Auth check - redirect if not super-admin
    useEffect(() => {
        if (!authLoading && !permissionsLoading && (!user || role !== 'super-admin')) {
            router.push('/panel/admin');
        }
    }, [user, role, authLoading, permissionsLoading, router]);

    // Fetch charts
    useEffect(() => {
        fetchCharts();
    }, [search, activeFilter, typeFilter, page, limit]);

    const fetchCharts = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                search: search || undefined,
                active: activeFilter !== 'all' ? activeFilter === 'true' : undefined,
                type: typeFilter !== 'all' ? typeFilter : undefined,
                page,
                limit,
            };

            const response = await adminVenueChartsService.getVenueCharts(params);

            if (response.success) {
                setCharts(response.data || []);
                setMeta(response.meta || null);
            } else {
                setError(response.message || 'Failed to load venue charts');
            }
        } catch (err) {
            console.error('Error fetching charts:', err);
            setError(err.message || 'Failed to load venue charts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (newSearch) => {
        setSearch(newSearch);
        setPage(1); // Reset to first page on search
    };

    const handleActiveFilterChange = (newFilter) => {
        setActiveFilter(newFilter);
        setPage(1); // Reset to first page on filter change
    };

    const handleTypeFilterChange = (newFilter) => {
        setTypeFilter(newFilter);
        setPage(1); // Reset to first page on filter change
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Venue Charts</h1>
                    <p className="text-gray-600 mt-1">
                        Manage seating charts for venues across the platform
                    </p>
                </div>
                <Link href="/panel/admin/seatsio/venue-charts/new">
                    <Button icon={<Plus className="w-4 h-4" />}>
                        Create New Chart
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <ChartFilters
                search={search}
                onSearchChange={handleSearchChange}
                activeFilter={activeFilter}
                onActiveFilterChange={handleActiveFilterChange}
                typeFilter={typeFilter}
                onTypeFilterChange={handleTypeFilterChange}
            />

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
                    <p className="text-red-700 font-medium mb-2">Error Loading Charts</p>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <Button onClick={fetchCharts} variant="outline">
                        Try Again
                    </Button>
                </div>
            )}

            {/* Table */}
            {!loading && !error && (
                <>
                    <VenueChartsTable charts={charts} onRefresh={fetchCharts} />

                    {/* Pagination */}
                    {meta && meta.total > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                            <span className="text-sm text-gray-600">
                                Showing {((page - 1) * limit) + 1} to{' '}
                                {Math.min(page * limit, meta.total)} of {meta.total} charts
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-4 text-sm text-gray-700">
                                    Page {page} of {meta.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page >= meta.last_page}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
