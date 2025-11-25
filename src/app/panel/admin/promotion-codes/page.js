"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCcw } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { SkeletonTable } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import {
    AdminPromotionCodesTable,
    AdminPromotionCodeCreateModal,
    AdminPromotionCodeEditModal,
} from "@/features/promotionCodes/components";
import {
    fetchAdminPromotionCodes,
    setPage,
} from "@/features/promotionCodes/adminPromotionCodesSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export default function AdminPromotionCodesPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        list: promotionCodes,
        loading,
        error,
        pagination,
    } = useAppSelector((state) => state.adminPromotionCodes);

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editingPromotionCode, setEditingPromotionCode] = useState(null);
    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const tableRef = useRef(null);

    const memoisedLimit = useMemo(() => pagination.limit || 10, [pagination.limit]);

    const updateUrl = useCallback(
        (params) => {
            const url = new URL(window.location.href);

            Object.entries(params).forEach(([key, value]) => {
                if (value && value !== "") {
                    url.searchParams.set(key, String(value));
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

        dispatch(setPage(page));
        dispatch(
            fetchAdminPromotionCodes({
                page,
                limit: 10,
            })
        );
    }, [searchParams, dispatch]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchAdminPromotionCodes({
                    page: pagination.page,
                    limit: memoisedLimit,
                })
            ).unwrap();

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (error) {
            // Errors are surfaced through the slice/toasts; no-op here.
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch, memoisedLimit, pagination.page]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({ page: newPage });

            if (tableRef.current) {
                tableRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        },
        [updateUrl]
    );

    const totalItems = pagination.total || promotionCodes?.length || 0;

    return (
        <ContentWrapper>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Promotion Codes ({totalItems})
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Create and manage the promotion codes that power marketplace discounts.
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
                        New Promotion Code
                    </Button>
                </div>
            </div>

            <Card>
                <div ref={tableRef}>
                    {loading ? (
                        <SkeletonTable rows={8} />
                    ) : error ? (
                        <div className="py-12 text-center space-y-4">
                            <p style={{ color: "var(--color-error)" }}>{error}</p>
                            <Button onClick={handleRefresh}>Try Again</Button>
                        </div>
                    ) : !promotionCodes || promotionCodes.length === 0 ? (
                        <EmptyState
                            title="No promotion codes yet"
                            description="Create your first promotion code to offer targeted discounts."
                            actionLabel="Create promotion code"
                            onAction={() => setCreateModalOpen(true)}
                        />
                    ) : (
                        <>
                            <AdminPromotionCodesTable
                                promotionCodes={promotionCodes}
                                onEdit={(item) => setEditingPromotionCode(item)}
                                showActions
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

            <AdminPromotionCodeCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreated={handleRefresh}
            />

            <AdminPromotionCodeEditModal
                isOpen={Boolean(editingPromotionCode)}
                promotionCode={editingPromotionCode}
                onClose={() => setEditingPromotionCode(null)}
                onUpdated={handleRefresh}
            />
        </ContentWrapper>
    );
}
