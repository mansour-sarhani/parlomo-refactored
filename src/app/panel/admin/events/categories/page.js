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
import {
    EventCategoryTable,
    EventCategoryCreateModal,
    EventCategoryEditModal,
} from "@/features/eventCategories";
import {
    fetchEventCategories,
    setFilters,
    setPage,
} from "@/features/eventCategories/eventCategoriesSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export default function EventCategoriesPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        list: categories,
        loading,
        error,
        pagination,
        filters,
    } = useAppSelector((state) => state.eventCategories);

    const [formValues, setFormValues] = useState({
        search: "",
    });

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editCategoryId, setEditCategoryId] = useState(null);
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
        let page = parseInt(searchParams.get("page") || "1", 10);
        if (Number.isNaN(page) || page < 1) {
            page = 1;
        }

        const search = searchParams.get("search") || "";

        setFormValues((prev) => {
            if (prev.search === search) {
                return prev;
            }
            return { search };
        });

        dispatch(setPage(page));
        dispatch(
            setFilters({
                search,
            })
        );

        dispatch(
            fetchEventCategories({
                page,
                limit: memoisedLimit,
                search,
            })
        );
    }, [searchParams, dispatch, memoisedLimit]);

    const handleSearchSubmit = useCallback(
        (event) => {
            event.preventDefault();
            updateUrl({
                page: 1,
                search: formValues.search,
            });
        },
        [formValues.search, updateUrl]
    );

    const handleInputChange = useCallback((event) => {
        const { value } = event.target;
        setFormValues({ search: value });
    }, []);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchEventCategories({
                    page: pagination.page,
                    limit: memoisedLimit,
                    search: filters.search,
                })
            ).unwrap();

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (error) {
            // Errors are surfaced through the slice/toasts; no-op here.
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch, filters.search, memoisedLimit, pagination.page]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({
                page: newPage,
                search: filters.search,
            });

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        },
        [filters.search, updateUrl]
    );

    const totalCategories = pagination.total || 0;
    return (
        <ContentWrapper>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Event Categories ({totalCategories})
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Manage event categories synced from the legacy admin portal
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
                        New Category
                    </Button>
                </div>
            </div>

            <Card className="mb-6">
                <form
                    onSubmit={handleSearchSubmit}
                    className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4"
                >
                    <div className="relative">
                        <SearchIcon
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: "var(--color-text-secondary)" }}
                        />
                        <input
                            name="search"
                            value={formValues.search}
                            onChange={handleInputChange}
                            placeholder="Search by title"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border"
                            style={{
                                borderColor: "var(--color-border)",
                                backgroundColor: "var(--color-background)",
                                color: "var(--color-text-primary)",
                            }}
                        />
                    </div>
                    <div className="flex md:justify-end">
                        <Button type="submit" className="w-full md:w-auto">
                            Search
                        </Button>
                    </div>
                </form>
            </Card>

            <Card>
                {loading ? (
                    <SkeletonTable rows={8} />
                ) : error ? (
                    <div className="py-12 text-center space-y-4">
                        <p style={{ color: "var(--color-error)" }}>{error}</p>
                        <Button onClick={handleRefresh}>Try Again</Button>
                    </div>
                ) : categories.length === 0 ? (
                    <EmptyState
                        title="No categories found"
                        description="Create a new category to get started."
                    />
                ) : (
                    <>
                        <EventCategoryTable
                            categories={categories}
                            onEdit={(category) => setEditCategoryId(category.id)}
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

            <EventCategoryCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreated={() => handleRefresh()}
            />

            <EventCategoryEditModal
                isOpen={Boolean(editCategoryId)}
                categoryId={editCategoryId}
                onClose={() => setEditCategoryId(null)}
                onUpdated={() => handleRefresh()}
            />
        </ContentWrapper>
    );
}
