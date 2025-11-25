"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw, Building2 } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SkeletonTable } from "@/components/common/Skeleton";
import {
    AdminReviewDirectoriesTable,
    AdminReviewDecisionModal,
    AdminReviewDetailModal,
} from "@/features/adminReview";
import {
    fetchAdminReviewDirectories,
    fetchAdminReviewDirectoryById,
    updateAdminReviewDirectoryStatus,
    setAdminReviewDirectoriesPage,
    clearAdminReviewDirectory,
} from "@/features/adminReview";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    formatDateTime,
    formatCurrency,
} from "@/features/adminReview/utils";

const STATUS_OPTIONS = [
    { value: "Active", label: "Approve" },
    { value: "Reject", label: "Reject" },
];

export default function AdminReviewDirectoriesPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        list,
        loadingList,
        loadingDetail,
        updating,
        error,
        pagination,
        current,
    } = useAppSelector((state) => state.adminReviewDirectories);

    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDecisionOpen, setDecisionOpen] = useState(false);
    const [isDetailOpen, setDetailOpen] = useState(false);
    const [selectedDirectory, setSelectedDirectory] = useState(null);
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

        dispatch(setAdminReviewDirectoriesPage(page));
        dispatch(fetchAdminReviewDirectories({ page, limit: 10 }));
    }, [searchParams, dispatch]);

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

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchAdminReviewDirectories({
                    page: pagination.page || 1,
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

    const handleOpenDecision = useCallback((directory) => {
        setSelectedDirectory(directory);
        setDecisionOpen(true);
    }, []);

    const handleOpenDetails = useCallback(
        async (directory) => {
            setSelectedDirectory(directory);
            setDetailOpen(true);
            await dispatch(fetchAdminReviewDirectoryById(directory.id));
        },
        [dispatch]
    );

    const handleCloseDetails = useCallback(() => {
        setDetailOpen(false);
        dispatch(clearAdminReviewDirectory());
    }, [dispatch]);

    const handleDecisionSubmit = useCallback(
        async (values) => {
            if (!selectedDirectory) return;
            await dispatch(
                updateAdminReviewDirectoryStatus({
                    id: selectedDirectory.id,
                    status: values.status,
                    reason: values.reason,
                })
            ).unwrap();
            await handleRefresh();
        },
        [dispatch, handleRefresh, selectedDirectory]
    );

    const detailSource =
        current?.data || current || selectedDirectory || null;

    const detailMetadata = detailSource
        ? [
              { label: "Business ID", value: detailSource.id },
              { label: "Name", value: detailSource.title || detailSource.name },
              {
                  label: "Owner",
                  value:
                      detailSource.user?.name ||
                      detailSource.user ||
                      detailSource.owner,
              },
              {
                  label: "Category",
                  value:
                      detailSource.categoryName ||
                      detailSource.category ||
                      detailSource.category_title,
              },
              {
                  label: "Plan",
                  value: detailSource.plan || detailSource.package,
              },
              {
                  label: "Subscription Price",
                  value: formatCurrency(detailSource.price),
              },
              {
                  label: "Status",
                  value: detailSource.status,
              },
              {
                  label: "Created",
                  value:
                      detailSource.createdAtHuman ||
                      detailSource.created_at_human ||
                      formatDateTime(detailSource.created_at),
              },
              {
                  label: "Phone",
                  value: detailSource.phone || detailSource.contact_phone,
              },
              {
                  label: "Website",
                  value: detailSource.website,
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
                        Businesses to Review ({pagination.total || 0})
                    </h1>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Confirm new business listings before they appear in the
                        directory.
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
                            title="No businesses waiting for review"
                            description="New business submissions will appear here once users publish them."
                            icon={Building2}
                        />
                    ) : (
                        <>
                            <AdminReviewDirectoriesTable
                                directories={list}
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
                    setSelectedDirectory(null);
                }}
                title="Approve or reject business"
                description={
                    selectedDirectory?.title
                        ? `Decide whether "${selectedDirectory.title}" should be published.`
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
                    handleCloseDetails();
                    setSelectedDirectory(null);
                }}
                title="Business details"
                subtitle={
                    selectedDirectory?.title
                        ? `Submitted by ${selectedDirectory.user?.name || selectedDirectory.user || "Unknown user"}`
                        : undefined
                }
                metadata={detailMetadata}
                tags={
                    detailSource?.tags
                        ? Array.isArray(detailSource.tags)
                            ? detailSource.tags
                            : [detailSource.tags]
                        : []
                }
                content={
                    (detailSource?.description ||
                        detailSource?.about ||
                        detailSource?.body) && (
                        <div className="space-y-2">
                            <h3
                                className="text-sm font-semibold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                About this business
                            </h3>
                            <p
                                className="whitespace-pre-line text-sm leading-6"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {detailSource.description ||
                                    detailSource.about ||
                                    detailSource.body}
                            </p>
                        </div>
                    )
                }
            />

            {loadingDetail && isDetailOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
                    <div
                        className="rounded-lg px-6 py-4 text-sm font-medium shadow-lg"
                        style={{
                            backgroundColor: "var(--color-card-bg)",
                            color: "var(--color-text-primary)",
                        }}
                    >
                        Loading details…
                    </div>
                </div>
            )}
        </ContentWrapper>
    );
}

