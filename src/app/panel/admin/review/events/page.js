"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw, Filter, X, CalendarX } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SkeletonTable } from "@/components/common/Skeleton";
import { Input } from "@/components/common/Input";
import {
    AdminReviewEventsTable,
    AdminReviewDecisionModal,
    AdminReviewDetailModal,
} from "@/features/adminReview";
import {
    fetchAdminReviewEvents,
    updateAdminReviewEventStatus,
    setAdminReviewEventsFilters,
    setAdminReviewEventsPage,
} from "@/features/adminReview";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { formatDateTime } from "@/features/adminReview/utils";

const STATUS_OPTIONS = [
    { value: "Active", label: "Approve" },
    { value: "Reject", label: "Reject" },
];

export default function AdminReviewEventsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        list,
        loadingList,
        updating,
        error,
        pagination,
        filters,
    } = useAppSelector((state) => state.adminReviewEvents);

    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDecisionOpen, setDecisionOpen] = useState(false);
    const [isDetailOpen, setDetailOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [localFilters, setLocalFilters] = useState({
        name: filters.name || "",
        category: filters.category || "",
    });
    const tableRef = useRef(null);

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
        let page = parseInt(searchParams.get("page") || "1", 10);
        if (Number.isNaN(page) || page < 1) {
            page = 1;
        }

        const name = searchParams.get("name") || "";
        const category = searchParams.get("category") || "";

        setLocalFilters({ name, category });
        dispatch(setAdminReviewEventsFilters({ name, category }));
        dispatch(setAdminReviewEventsPage(page));
        dispatch(
            fetchAdminReviewEvents({
                page,
                limit: 10,
                name,
                category,
            })
        );
    }, [searchParams, dispatch]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({
                page: newPage,
                name: filters.name,
                category: filters.category,
            });

            if (tableRef.current) {
                tableRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        },
        [filters.name, filters.category, updateUrl]
    );

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchAdminReviewEvents({
                    page: pagination.page || 1,
                    limit: memoisedLimit,
                    name: filters.name,
                    category: filters.category,
                })
            ).unwrap();

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (error) {
            // Errors are surfaced through the slice/toasts; no-op here.
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch, filters.name, filters.category, memoisedLimit, pagination.page]);

    const handleFilterSubmit = useCallback(
        (event) => {
            event.preventDefault();
            updateUrl({
                page: 1,
                name: localFilters.name.trim(),
                category: localFilters.category.trim(),
            });
        },
        [localFilters, updateUrl]
    );

    const handleClearFilters = useCallback(() => {
        setLocalFilters({ name: "", category: "" });
        updateUrl({ page: 1, name: "", category: "" });
    }, [updateUrl]);

    const handleOpenDecision = useCallback((eventItem) => {
        setSelectedEvent(eventItem);
        setDecisionOpen(true);
    }, []);

    const handleOpenDetails = useCallback((eventItem) => {
        setSelectedEvent(eventItem);
        setDetailOpen(true);
    }, []);

    const handleDecisionSubmit = useCallback(
        async (values) => {
            if (!selectedEvent) return;
            await dispatch(
                updateAdminReviewEventStatus({
                    id: selectedEvent.id,
                    status: values.status,
                    reason: values.reason,
                })
            ).unwrap();
            await handleRefresh();
        },
        [dispatch, handleRefresh, selectedEvent]
    );

    const detailMetadata = selectedEvent
        ? [
              { label: "Event ID", value: selectedEvent.id },
              { label: "Title", value: selectedEvent.title },
              {
                  label: "Category",
                  value:
                      selectedEvent.categoryName ||
                      selectedEvent.category ||
                      "—",
              },
              {
                  label: "Owner",
                  value:
                      selectedEvent.user?.name ||
                      selectedEvent.user ||
                      selectedEvent.organiser,
              },
              {
                  label: "City",
                  value: selectedEvent.city || selectedEvent.location,
              },
              {
                  label: "Valid From",
                  value: selectedEvent.start_date
                      ? formatDateTime(selectedEvent.start_date)
                      : selectedEvent.valid_from,
              },
              {
                  label: "Valid Until",
                  value:
                      selectedEvent.validDate ||
                      selectedEvent.valid_until ||
                      formatDateTime(selectedEvent.valid_to),
              },
              {
                  label: "Status",
                  value: selectedEvent.status || "Pending",
              },
          ]
        : [];

    return (
        <ContentWrapper>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Events Pending Review ({pagination.total || 0})
                    </h1>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Approve time-sensitive events submitted by organizers.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {showReloadNotice && (
                        <span
                            className="text-sm"
                            style={{ color: "var(--color-success)" }}
                        >
                            List reloaded!
                        </span>
                    )}
                    <Button
                        variant="secondary"
                        icon={<RefreshCcw size={16} />}
                        onClick={handleRefresh}
                        loading={isRefreshing}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            <Card>
                <form
                    onSubmit={handleFilterSubmit}
                    className="mb-6 grid gap-3 md:grid-cols-4"
                >
                    <div className="md:col-span-2">
                        <Input
                            label="Search by title"
                            placeholder="e.g. Networking"
                            value={localFilters.name}
                            onChange={(event) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    name: event.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="md:col-span-1">
                        <Input
                            label="Category"
                            placeholder="e.g. Business"
                            value={localFilters.category}
                            onChange={(event) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    category: event.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <Button
                            type="submit"
                            variant="primary"
                            icon={<Filter size={16} />}
                        >
                            Apply filters
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            icon={<X size={16} />}
                            onClick={handleClearFilters}
                        >
                            Clear
                        </Button>
                    </div>
                </form>

                <div ref={tableRef}>
                    {loadingList ? (
                        <SkeletonTable rows={6} />
                    ) : error ? (
                        <div className="space-y-4 py-12 text-center">
                            <p style={{ color: "var(--color-error)" }}>{error}</p>
                            <Button onClick={handleRefresh}>Try Again</Button>
                        </div>
                    ) : !list || list.length === 0 ? (
                        <EmptyState
                            title="No events waiting for review"
                            description="New event submissions will appear here once organizers publish them."
                            icon={CalendarX}
                        />
                    ) : (
                        <>
                            <AdminReviewEventsTable
                                events={list}
                                onView={handleOpenDetails}
                                onReview={handleOpenDecision}
                            />
                            <div className="mt-6">
                                <Pagination
                                    currentPage={pagination.page || 1}
                                    totalPages={pagination.pages || 1}
                                    totalItems={pagination.total || 0}
                                    itemsPerPage={memoisedLimit}
                                    onPageChange={handlePageChange}
                                    showItemsPerPage={false}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Card>

            <AdminReviewDecisionModal
                isOpen={isDecisionOpen}
                onClose={() => {
                    setDecisionOpen(false);
                    setSelectedEvent(null);
                }}
                title="Approve or reject event"
                description={
                    selectedEvent?.title
                        ? `Decide whether "${selectedEvent.title}" should be published.`
                        : undefined
                }
                statusOptions={STATUS_OPTIONS}
                requireReasonFor={["Reject"]}
                submitting={updating}
                onSubmit={handleDecisionSubmit}
            />

            <AdminReviewDetailModal
                isOpen={isDetailOpen}
                onClose={() => {
                    setDetailOpen(false);
                    setSelectedEvent(null);
                }}
                title="Event details"
                subtitle={
                    selectedEvent?.title
                        ? `Submitted by ${selectedEvent.user?.name || selectedEvent.user || "Unknown organizer"}`
                        : undefined
                }
                metadata={detailMetadata}
                tags={
                    selectedEvent?.tags
                        ? Array.isArray(selectedEvent.tags)
                            ? selectedEvent.tags
                            : [selectedEvent.tags]
                        : []
                }
                content={
                    selectedEvent?.description && (
                        <div className="space-y-2">
                            <h3
                                className="text-sm font-semibold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                Description
                            </h3>
                            <p
                                className="whitespace-pre-line text-sm leading-6"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {selectedEvent.description}
                            </p>
                        </div>
                    )
                }
            />
        </ContentWrapper>
    );
}

