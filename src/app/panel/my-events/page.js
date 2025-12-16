"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Calendar, Filter, Search, ScanLine } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { SkeletonTable } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useAuth } from "@/contexts/AuthContext";
import {
    fetchMyEvents,
    setFilters,
    clearFilters,
    selectMyEvents,
    selectPagination,
    selectFilters,
    selectPublicEventsLoading,
    selectPublicEventsError,
    selectEventCount,
} from "@/features/public-events/publicEventsSlice";
import { EventsTable } from "@/components/public-events/EventsTable";
import { EventFilters } from "@/components/public-events/EventFilters";

export default function MyEventsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const myEvents = useAppSelector(selectMyEvents);
    const pagination = useAppSelector(selectPagination);
    const filters = useAppSelector(selectFilters);
    const loading = useAppSelector(selectPublicEventsLoading);
    const error = useAppSelector(selectPublicEventsError);
    const eventCount = useAppSelector(selectEventCount);

    const [showFilters, setShowFilters] = useState(false);
    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const memoisedLimit = useMemo(() => pagination.limit || 10, [pagination.limit]);

    const updateUrl = useCallback(
        (params) => {
            const url = new URL(window.location.href);

            Object.entries(params).forEach(([key, value]) => {
                if (value && value !== "") {
                    url.searchParams.set(key, value);
                } else {
                    url.searchParams.delete(key);
                }
            });

            if (url.searchParams.get("page") === "1") {
                url.searchParams.delete("page");
            }

            router.push(`${url.pathname}${url.search}`, { scroll: false });
        },
        [router]
    );

    useEffect(() => {
        if (!user?.id) return;

        let page = parseInt(searchParams.get("page") || "1", 10);
        if (Number.isNaN(page) || page < 1) {
            page = 1;
        }

        const status = searchParams.get("status") || null;
        const category = searchParams.get("category") || null;
        const search = searchParams.get("search") || null;

        // Update filters in Redux
        dispatch(setFilters({ status, category, search }));

        // Fetch events
        dispatch(
            fetchMyEvents({
                page,
                limit: 10,
                status,
                category,
                search,
                sortBy: "createdAt",
                sortOrder: "desc",
            })
        );
    }, [searchParams, dispatch, user?.id]);

    const handleRefresh = useCallback(async () => {
        if (!user?.id) return;

        setIsRefreshing(true);
        try {
            await dispatch(
                fetchMyEvents({
                    page: pagination.page,
                    limit: memoisedLimit,
                    ...filters,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                })
            ).unwrap();

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (error) {
            toast.error("Failed to refresh events");
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch, memoisedLimit, pagination.page, filters, user?.id]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({
                page: newPage,
                status: filters.status,
                category: filters.category,
                search: filters.search,
            });

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        },
        [updateUrl, filters]
    );

    const handleFilterChange = useCallback(
        (newFilters) => {
            updateUrl({
                page: 1,
                ...newFilters,
            });
        },
        [updateUrl]
    );

    const handleClearFilters = useCallback(() => {
        dispatch(clearFilters());
        updateUrl({
            page: 1,
            status: null,
            category: null,
            search: null,
        });
    }, [dispatch, updateUrl]);

    const handleViewEvent = useCallback(
        (event) => {
            if (!event?.id) {
                toast.error("Unable to open event details");
                return;
            }
            router.push(`/panel/my-events/${event.id}`);
        },
        [router]
    );

    const handleManageTicketing = useCallback(
        (event) => {
            if (!event?.id) {
                toast.error("Unable to open ticketing");
                return;
            }
            router.push(`/panel/my-events/${event.id}/ticketing`);
        },
        [router]
    );

    const hasActiveFilters = filters.status || filters.category || filters.search;

    return (
        <ContentWrapper className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        <Calendar className="inline-block w-6 h-6 mr-2 mb-1" />
                        My Events ({eventCount})
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Create and manage your ticketed events. Set up ticket types, track sales,
                        and more.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {showReloadNotice && (
                        <span className="text-sm" style={{ color: "var(--color-success)" }}>
                            List reloaded!
                        </span>
                    )}
                    <Button
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        icon={<Filter className="w-4 h-4" />}
                    >
                        {showFilters ? "Hide Filters" : "Filters"}
                    </Button>
                    <Button variant="secondary" onClick={handleRefresh} loading={isRefreshing}>
                        Refresh
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => router.push("/panel/my-events/scanner")}
                        icon={<ScanLine className="w-4 h-4" />}
                    >
                        Scanner
                    </Button>
                    <Button
                        onClick={() => router.push("/panel/my-events/create")}
                        icon={<Plus className="w-4 h-4" />}
                    >
                        Create Event
                    </Button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <Card>
                    <EventFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                    />
                </Card>
            )}

            {/* Active Filters Badge */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: "var(--color-text-secondary)" }}>Active filters:</span>
                    {filters.status && (
                        <span
                            className="px-2 py-1 rounded"
                            style={{
                                backgroundColor: "var(--color-surface-secondary)",
                                color: "var(--color-text-primary)",
                            }}
                        >
                            Status: {filters.status}
                        </span>
                    )}
                    {filters.category && (
                        <span
                            className="px-2 py-1 rounded"
                            style={{
                                backgroundColor: "var(--color-surface-secondary)",
                                color: "var(--color-text-primary)",
                            }}
                        >
                            Category: {filters.category}
                        </span>
                    )}
                    {filters.search && (
                        <span
                            className="px-2 py-1 rounded"
                            style={{
                                backgroundColor: "var(--color-surface-secondary)",
                                color: "var(--color-text-primary)",
                            }}
                        >
                            Search: {filters.search}
                        </span>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                        Clear all
                    </Button>
                </div>
            )}

            {/* Events Table */}
            <Card>
                {loading ? (
                    <SkeletonTable rows={6} />
                ) : error ? (
                    <div className="py-12 text-center space-y-4">
                        <p style={{ color: "var(--color-error)" }}>{error}</p>
                        <Button onClick={handleRefresh}>Try again</Button>
                    </div>
                ) : myEvents.length === 0 ? (
                    <EmptyState
                        icon={Plus}
                        title={hasActiveFilters ? "No events found" : "No events yet"}
                        description={
                            hasActiveFilters
                                ? "Try adjusting your filters to find what you're looking for."
                                : "Create your first event to start selling tickets and managing attendees."
                        }
                        action={
                            hasActiveFilters ? (
                                <Button onClick={handleClearFilters}>Clear filters</Button>
                            ) : (
                                <Button
                                    onClick={() => router.push("/panel/my-events/create")}
                                    icon={<Plus className="w-4 h-4" />}
                                >
                                    Create Your First Event
                                </Button>
                            )
                        }
                    />
                ) : (
                    <>
                        <EventsTable
                            events={myEvents}
                            onView={handleViewEvent}
                            onManageTicketing={handleManageTicketing}
                        />
                        {pagination.totalPages > 1 && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={pagination.page || 1}
                                    totalPages={pagination.totalPages || 1}
                                    totalItems={pagination.total || 0}
                                    itemsPerPage={memoisedLimit}
                                    onPageChange={handlePageChange}
                                    showItemsPerPage={false}
                                />
                            </div>
                        )}
                    </>
                )}
            </Card>
        </ContentWrapper>
    );
}
