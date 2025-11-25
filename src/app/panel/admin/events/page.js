"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCcw, Search as SearchIcon } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { SkeletonTable } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { EventTable, EventCreateModal, EventEditModal } from "@/features/events";
import {
    fetchEvents,
    fetchEventCategories,
    setFilters,
    setPage,
    clearCurrentEvent,
} from "@/features/events/eventsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

const buildCategoryOptions = (categories = []) => {
    return [
        { label: "All categories", value: "" },
        ...categories.map((category) => ({
            label: category.title,
            value: String(category.id ?? category.value ?? ""),
        })),
    ];
};

export default function EventsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        list: events,
        loading,
        error,
        pagination,
        filters,
        categories,
        categoriesLoaded,
        categoriesLoading,
    } = useAppSelector((state) => state.events);

    const [formValues, setFormValues] = useState({
        name: "",
        category: "",
    });

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editEventId, setEditEventId] = useState(null);
    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const memoisedLimit = useMemo(() => pagination.limit || 10, [pagination.limit]);

    useEffect(() => {
        if (!categoriesLoaded && !categoriesLoading) {
            dispatch(fetchEventCategories());
        }
    }, [categoriesLoaded, categoriesLoading, dispatch]);

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

        setFormValues((prev) => {
            if (prev.name === name && prev.category === category) {
                return prev;
            }
            return {
                name,
                category,
            };
        });

        dispatch(setPage(page));
        dispatch(
            setFilters({
                name,
                category,
            })
        );

        dispatch(
            fetchEvents({
                page,
                limit: 10,
                name,
                category,
            })
        );
    }, [searchParams, dispatch]);

    const handleSearchSubmit = useCallback(
        (event) => {
            event.preventDefault();
            updateUrl({
                page: 1,
                name: formValues.name,
                category: formValues.category,
            });
        },
        [formValues.category, formValues.name, updateUrl]
    );

    const handleInputChange = useCallback((event) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchEvents({
                    page: pagination.page,
                    limit: memoisedLimit,
                    name: filters.name,
                    category: filters.category,
                })
            ).unwrap();

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (err) {
            // handled upstream
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch, filters.category, filters.name, memoisedLimit, pagination.page]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({
                page: newPage,
                name: filters.name,
                category: filters.category,
            });

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        },
        [filters.category, filters.name, updateUrl]
    );

    const handleViewEvent = useCallback(
        (event) => {
            dispatch(clearCurrentEvent());
            router.push(`/panel/admin/events/${event.id}`);
        },
        [dispatch, router]
    );

    const totalEvents = pagination.total || 0;

    return (
        <ContentWrapper>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Events ({totalEvents})
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Manage events synchronised from the legacy platform.
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
                        icon={<RefreshCcw size={16} />}
                        onClick={handleRefresh}
                        loading={isRefreshing}
                    >
                        Refresh
                    </Button>
                    <Button icon={<Plus size={16} />} onClick={() => setCreateModalOpen(true)}>
                        New Event
                    </Button>
                </div>
            </div>

            <Card className="mb-6">
                <form
                    onSubmit={handleSearchSubmit}
                    className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_auto] gap-4"
                >
                    <div className="relative">
                        <SearchIcon
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: "var(--color-text-secondary)" }}
                        />
                        <input
                            name="name"
                            value={formValues.name}
                            onChange={handleInputChange}
                            placeholder="Search by name"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border"
                            style={{
                                borderColor: "var(--color-border)",
                                backgroundColor: "var(--color-background)",
                                color: "var(--color-text-primary)",
                            }}
                        />
                    </div>

                    <select
                        name="category"
                        value={formValues.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border"
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-background)",
                            color: "var(--color-text-primary)",
                        }}
                    >
                        {buildCategoryOptions(categories).map((option) => (
                            <option value={option.value} key={option.value || "all"}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <div className="flex lg:justify-end">
                        <Button type="submit" className="w-full lg:w-auto">
                            Search
                        </Button>
                    </div>
                </form>
            </Card>

            <Card>
                {loading ? (
                    <SkeletonTable rows={10} />
                ) : error ? (
                    <div className="py-12 text-center space-y-4">
                        <p style={{ color: "var(--color-error)" }}>{error}</p>
                        <Button onClick={handleRefresh}>Try Again</Button>
                    </div>
                ) : events.length === 0 ? (
                    <EmptyState
                        title="No events found"
                        description="Create a new event to get started."
                    />
                ) : (
                    <>
                        <EventTable
                            events={events}
                            onEdit={(event) => setEditEventId(event.id)}
                            onView={handleViewEvent}
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
            </Card>

            <EventCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreated={() => handleRefresh()}
            />

            <EventEditModal
                isOpen={Boolean(editEventId)}
                eventId={editEventId}
                onClose={() => setEditEventId(null)}
                onUpdated={() => handleRefresh()}
            />
        </ContentWrapper>
    );
}
