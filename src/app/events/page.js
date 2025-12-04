"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FrontLayout } from "@/components/layout/FrontLayout";
import { EventCard } from "@/components/public-events/EventCard";
import { EventArchiveFilters } from "@/components/public-events/EventArchiveFilters";
import { Button } from "@/components/common/Button";
import { Calendar, ChevronLeft, ChevronRight, Frown } from "lucide-react";

export default function EventsArchivePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
    });
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Get initial filters from URL
    const [filters, setFilters] = useState({
        category: searchParams.get("category") || "",
        search: searchParams.get("search") || "",
        dateRange: searchParams.get("dateRange") || "upcoming",
        sortBy: searchParams.get("sortBy") || "startDate",
    });

    // Build query params for API
    const buildQueryParams = useCallback((currentFilters, page = 1) => {
        const params = new URLSearchParams();

        params.set("page", page.toString());
        params.set("limit", pagination.limit.toString());
        // Only show published events on the public archive
        params.set("status", "published");

        if (currentFilters.search) {
            params.set("search", currentFilters.search);
        }

        if (currentFilters.category) {
            params.set("category", currentFilters.category);
        }

        // Handle date range
        const now = new Date();
        switch (currentFilters.dateRange) {
            case "upcoming":
                params.set("startDateFrom", now.toISOString());
                break;
            case "this-week":
                params.set("startDateFrom", now.toISOString());
                const endOfWeek = new Date(now);
                endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
                params.set("startDateTo", endOfWeek.toISOString());
                break;
            case "this-month":
                params.set("startDateFrom", now.toISOString());
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                params.set("startDateTo", endOfMonth.toISOString());
                break;
            case "all":
                // No date filter
                break;
        }

        // Sort
        params.set("sortBy", currentFilters.sortBy || "startDate");
        params.set("sortOrder", currentFilters.sortBy === "startDate" ? "asc" : "desc");

        return params;
    }, [pagination.limit]);

    // Fetch events
    const fetchEvents = useCallback(async (currentFilters, page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const params = buildQueryParams(currentFilters, page);
            const response = await fetch(`/api/public-events?${params.toString()}`);

            if (!response.ok) {
                throw new Error("Failed to fetch events");
            }

            const data = await response.json();

            setEvents(data.events || []);
            setPagination(prev => ({
                ...prev,
                page: data.pagination?.page || page,
                total: data.pagination?.total || 0,
                totalPages: data.pagination?.totalPages || 0,
            }));
        } catch (err) {
            console.error("Error fetching events:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [buildQueryParams]);

    // Initial fetch and URL sync
    useEffect(() => {
        const page = parseInt(searchParams.get("page") || "1", 10);
        fetchEvents(filters, page);
    }, []);

    // Update URL when filters change
    const updateUrl = useCallback((newFilters, page = 1) => {
        const params = new URLSearchParams();

        if (newFilters.search) params.set("search", newFilters.search);
        if (newFilters.category) params.set("category", newFilters.category);
        if (newFilters.dateRange && newFilters.dateRange !== "upcoming") {
            params.set("dateRange", newFilters.dateRange);
        }
        if (newFilters.sortBy && newFilters.sortBy !== "startDate") {
            params.set("sortBy", newFilters.sortBy);
        }
        if (page > 1) params.set("page", page.toString());

        const queryString = params.toString();
        router.push(`/events${queryString ? `?${queryString}` : ""}`, { scroll: false });
    }, [router]);

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        updateUrl(newFilters, 1);
        fetchEvents(newFilters, 1);
    };

    // Clear all filters
    const handleClearFilters = () => {
        const defaultFilters = {
            category: "",
            search: "",
            dateRange: "upcoming",
            sortBy: "startDate",
        };
        setFilters(defaultFilters);
        updateUrl(defaultFilters, 1);
        fetchEvents(defaultFilters, 1);
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        updateUrl(filters, newPage);
        fetchEvents(filters, newPage);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const { page, totalPages } = pagination;

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (page > 3) {
                pages.push("...");
            }

            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }

            if (page < totalPages - 2) {
                pages.push("...");
            }

            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <FrontLayout>
            <div className="bg-gray-50 min-h-screen">
                {/* Hero Section */}
                <div
                    className="text-white py-16 md:py-24"
                    style={{
                        background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-dark, var(--color-primary)))'
                    }}
                >
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                Discover Events
                            </h1>
                            <p className="text-lg md:text-xl opacity-90">
                                Find amazing events happening near you. From concerts and festivals to workshops and networking events.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 md:py-12">
                    {/* Filters */}
                    <div className="mb-8">
                        <EventArchiveFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            showMobileFilters={showMobileFilters}
                            onToggleMobileFilters={() => setShowMobileFilters(!showMobileFilters)}
                        />
                    </div>

                    {/* Results Count */}
                    {!loading && (
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-600">
                                {pagination.total === 0
                                    ? "No events found"
                                    : pagination.total === 1
                                        ? "1 event found"
                                        : `${pagination.total} events found`}
                            </p>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                                    <div className="aspect-[16/9] bg-gray-200" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                                <Frown className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Something went wrong
                            </h2>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <Button onClick={() => fetchEvents(filters, pagination.page)}>
                                Try Again
                            </Button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && events.length === 0 && (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                No events found
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Try adjusting your filters or check back later for new events.
                            </p>
                            <Button onClick={handleClearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    )}

                    {/* Events Grid */}
                    {!loading && !error && events.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {events.map((event) => (
                                <EventCard key={event.id || event._id} event={event} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && pagination.totalPages > 1 && (
                        <div className="mt-12 flex items-center justify-center">
                            <nav className="flex items-center gap-1">
                                {/* Previous Button */}
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {/* Page Numbers */}
                                {getPageNumbers().map((pageNum, idx) => (
                                    pageNum === "..." ? (
                                        <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-400">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`min-w-[40px] h-10 rounded-lg font-medium transition-colors ${pagination.page === pageNum
                                                ? "bg-primary-600 text-white"
                                                : "text-gray-600 hover:bg-gray-100"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                ))}

                                {/* Next Button */}
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </FrontLayout>
    );
}
