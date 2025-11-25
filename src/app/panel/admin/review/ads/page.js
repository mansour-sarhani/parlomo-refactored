"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw, Megaphone } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SkeletonTable } from "@/components/common/Skeleton";
import {
    AdminReviewAdsTable,
    AdminReviewDecisionModal,
    AdminReviewDetailModal,
} from "@/features/adminReview";
import {
    fetchAdminReviewAds,
    fetchAdminReviewAdById,
    updateAdminReviewAdStatus,
    setAdminReviewAdsPage,
    clearAdminReviewAd,
} from "@/features/adminReview";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { formatCurrency, formatDateTime } from "@/features/adminReview/utils";

const STATUS_OPTIONS = [
    { value: "Accept", label: "Approve" },
    { value: "Reject", label: "Reject" },
];

export default function AdminReviewAdsPage() {
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
    } = useAppSelector((state) => state.adminReviewAds);

    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDecisionOpen, setDecisionOpen] = useState(false);
    const [isDetailOpen, setDetailOpen] = useState(false);
    const [selectedAd, setSelectedAd] = useState(null);
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

        dispatch(setAdminReviewAdsPage(page));
        dispatch(fetchAdminReviewAds({ page, limit: 10 }));
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
                fetchAdminReviewAds({
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

    const handleOpenDecision = useCallback((ad) => {
        setSelectedAd(ad);
        setDecisionOpen(true);
    }, []);

    const handleOpenDetails = useCallback(
        async (ad) => {
            setSelectedAd(ad);
            setDetailOpen(true);
            await dispatch(fetchAdminReviewAdById(ad.id));
        },
        [dispatch]
    );

    const handleCloseDetails = useCallback(() => {
        setDetailOpen(false);
        dispatch(clearAdminReviewAd());
    }, [dispatch]);

    const handleDecisionSubmit = useCallback(
        async (values) => {
            if (!selectedAd) return;
            await dispatch(
                updateAdminReviewAdStatus({
                    id: selectedAd.id,
                    status: values.status,
                    reason: values.reason,
                })
            ).unwrap();
            await handleRefresh();
        },
        [dispatch, handleRefresh, selectedAd]
    );

    const detailSource = current?.data || current || selectedAd || null;

    const detailMetadata = detailSource
        ? [
              { label: "Ad ID", value: detailSource.id },
              { label: "Title", value: detailSource.title },
              { label: "Owner", value: detailSource.user?.name || detailSource.user },
              {
                  label: "Category",
                  value:
                      detailSource.categoryName ||
                      detailSource.category ||
                      detailSource.category_title,
              },
              {
                  label: "Price",
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
                  label: "Location",
                  value: detailSource.location || detailSource.city,
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
                        Ads to Review ({pagination.total || 0})
                    </h1>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Review new marketplace ads before they go live.
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
                            title="No ads waiting for review"
                            description="Once users submit new ads they will appear here for moderation."
                            icon={Megaphone}
                        />
                    ) : (
                        <>
                            <AdminReviewAdsTable
                                ads={list}
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
                    setSelectedAd(null);
                }}
                title="Approve or reject ad"
                description={
                    selectedAd?.title
                        ? `Decide whether "${selectedAd.title}" should go live.`
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
                    setSelectedAd(null);
                }}
                title="Ad details"
                subtitle={
                    selectedAd?.title
                        ? `Submitted by ${selectedAd.user?.name || selectedAd.user || "Unknown user"}`
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
                    detailSource?.description && (
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
                                {detailSource.description}
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

