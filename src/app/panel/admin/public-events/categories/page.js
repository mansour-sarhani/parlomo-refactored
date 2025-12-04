"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCcw, Search as SearchIcon, Database } from "lucide-react";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/Modal";
import { SkeletonTable } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import {
    PublicEventCategoryTable,
    PublicEventCategoryCreateModal,
    PublicEventCategoryEditModal,
} from "@/components/public-events/categories";
import {
    fetchPublicEventCategories,
    deletePublicEventCategory,
    updatePublicEventCategory,
    seedPublicEventCategories,
    setFilters,
    setPage,
} from "@/features/public-events/publicEventCategoriesSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export default function PublicEventCategoriesPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        list: categories,
        loading,
        error,
        pagination,
        filters,
        seeding,
    } = useAppSelector((state) => state.publicEventCategories);

    const [formValues, setFormValues] = useState({
        search: "",
        status: "all",
    });

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deleteCategory, setDeleteCategory] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    const memoisedLimit = useMemo(() => pagination.limit || 20, [pagination.limit]);

    const updateUrl = useCallback(
        (params) => {
            const url = new URL(window.location.href);

            Object.entries(params).forEach(([key, value]) => {
                if (value && value !== "" && value !== "all") {
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
        const status = searchParams.get("status") || "all";

        setFormValues((prev) => {
            if (prev.search === search && prev.status === status) {
                return prev;
            }
            return { search, status };
        });

        dispatch(setPage(page));
        dispatch(
            setFilters({
                search,
                status,
            })
        );

        dispatch(
            fetchPublicEventCategories({
                page,
                limit: memoisedLimit,
                search,
                status: status !== "all" ? status : null,
            })
        );
    }, [searchParams, dispatch, memoisedLimit]);

    const handleSearchSubmit = useCallback(
        (event) => {
            event.preventDefault();
            updateUrl({
                page: 1,
                search: formValues.search,
                status: formValues.status,
            });
        },
        [formValues.search, formValues.status, updateUrl]
    );

    const handleInputChange = useCallback((event) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchPublicEventCategories({
                    page: pagination.page,
                    limit: memoisedLimit,
                    search: filters.search,
                    status: filters.status !== "all" ? filters.status : null,
                })
            ).unwrap();

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (err) {
            // Errors are surfaced through the slice/toasts
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch, filters.search, filters.status, memoisedLimit, pagination.page]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({
                page: newPage,
                search: filters.search,
                status: filters.status,
            });

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        },
        [filters.search, filters.status, updateUrl]
    );

    const handleSeedCategories = useCallback(async () => {
        try {
            const result = await dispatch(seedPublicEventCategories(false)).unwrap();
            if (result.created > 0) {
                toast.success(`Created ${result.created} default categories`);
                handleRefresh();
            } else {
                toast.info(result.message || "Categories already exist");
            }
        } catch (err) {
            toast.error(err || "Failed to seed categories");
        }
    }, [dispatch, handleRefresh]);

    const handleDeleteCategory = useCallback((category) => {
        if (!category) return;
        setDeleteCategory(category);
    }, []);

    const handleStatusChange = useCallback(async (category, newStatus) => {
        if (!category) return;

        const categoryId = category.id || category._id;
        setUpdatingStatusId(categoryId);
        try {
            await dispatch(updatePublicEventCategory({
                id: categoryId,
                changes: { status: newStatus },
            })).unwrap();
            toast.success(`Category ${newStatus === "active" ? "activated" : "deactivated"}`);
        } catch (err) {
            toast.error(err || "Failed to update status");
        } finally {
            setUpdatingStatusId(null);
        }
    }, [dispatch]);

    const confirmDelete = useCallback(async () => {
        if (!deleteCategory) return;

        setIsDeleting(true);
        try {
            await dispatch(deletePublicEventCategory(deleteCategory.id || deleteCategory._id)).unwrap();
            toast.success("Category deleted successfully");
            setDeleteCategory(null);
            handleRefresh();
        } catch (err) {
            toast.error(err || "Failed to delete category");
        } finally {
            setIsDeleting(false);
        }
    }, [deleteCategory, dispatch, handleRefresh]);

    const totalCategories = pagination.total || 0;

    return (
        <ContentWrapper>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Public Event Categories ({totalCategories})
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Manage categories for public ticketed events
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {showReloadNotice && (
                        <span className="text-sm" style={{ color: "var(--color-success)" }}>
                            List reloaded!
                        </span>
                    )}
                    <Button
                        variant="secondary"
                        icon={<Database size={16} />}
                        onClick={handleSeedCategories}
                        loading={seeding}
                        title="Seed default categories if none exist"
                    >
                        Seed Defaults
                    </Button>
                    <Button
                        variant="secondary"
                        icon={<RefreshCcw size={16} />}
                        onClick={handleRefresh}
                        loading={isRefreshing}
                    >
                        Refresh
                    </Button>
                    <Button icon={<Plus size={16} />} onClick={() => setCreateModalOpen(true)}>
                        Add Category
                    </Button>
                </div>
            </div>

            <Card className="mb-6">
                <form
                    onSubmit={handleSearchSubmit}
                    className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4"
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
                            placeholder="Search by name or description"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border"
                            style={{
                                borderColor: "var(--color-border)",
                                backgroundColor: "var(--color-background)",
                                color: "var(--color-text-primary)",
                            }}
                        />
                    </div>
                    <select
                        name="status"
                        value={formValues.status}
                        onChange={handleInputChange}
                        className="px-4 py-2 rounded-lg border"
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-background)",
                            color: "var(--color-text-primary)",
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
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
                        description={
                            filters.search || filters.status !== "all"
                                ? "Try adjusting your search or filters."
                                : "Click 'Seed Defaults' to add default categories or 'Add Category' to create one."
                        }
                    />
                ) : (
                    <>
                        <PublicEventCategoryTable
                            categories={categories}
                            onEdit={(category) => setEditCategoryId(category.id || category._id)}
                            onDelete={handleDeleteCategory}
                            onStatusChange={handleStatusChange}
                            updatingId={updatingStatusId}
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

            {/* Create Modal */}
            <PublicEventCategoryCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreated={() => handleRefresh()}
            />

            {/* Edit Modal */}
            <PublicEventCategoryEditModal
                isOpen={Boolean(editCategoryId)}
                categoryId={editCategoryId}
                onClose={() => setEditCategoryId(null)}
                onUpdated={() => handleRefresh()}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={Boolean(deleteCategory)}
                onClose={() => setDeleteCategory(null)}
                onConfirm={confirmDelete}
                title="Delete Category"
                message={`Are you sure you want to delete "${deleteCategory?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={isDeleting}
            />
        </ContentWrapper>
    );
}
