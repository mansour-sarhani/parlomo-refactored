"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { SkeletonTable } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchMyBusinessListings,
    setBusinessListingPage,
} from "@/features/businesses/businessListingsSlice";
import { BusinessMyListingTable } from "@/features/businesses";

export default function MyBusinessPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { myList, myLoading, myError, pagination } = useAppSelector(
        (state) => state.businessListings
    );

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

        dispatch(setBusinessListingPage(page));

        dispatch(
            fetchMyBusinessListings({
                page,
                limit: 10,
            })
        );
    }, [searchParams, dispatch]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchMyBusinessListings({
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
            updateUrl({
                page: newPage,
            });

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        },
        [updateUrl]
    );

    const handlePreview = useCallback(
        (listing) => {
            if (!listing?.id) {
                toast.error("Unable to open business details");
                return;
            }
            router.push(`/panel/businesses/${listing.id}`);
        },
        [router]
    );

    const handleResume = useCallback(
        (listing) => {
            if (!listing?.id) {
                toast.error("Unable to open listing for editing");
                return;
            }
            router.push(`/panel/businesses/new-business?id=${listing.id}`);
        },
        [router]
    );

    const handleBuyBadge = useCallback(
        (listing) => {
            router.push(`/panel/businesses/buy-badges?business=${listing.id}`);
        },
        [router]
    );

    const totalBusinesses = pagination.total || myList.length || 0;

    return (
        <ContentWrapper className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        My Business ({totalBusinesses})
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Manage the businesses you’ve created. Resume drafts, update details, or
                        upgrade with badges.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {showReloadNotice && (
                        <span className="text-sm" style={{ color: "var(--color-success)" }}>
                            List reloaded!
                        </span>
                    )}
                    <Button variant="secondary" onClick={handleRefresh} loading={isRefreshing}>
                        Refresh
                    </Button>
                    <Button onClick={() => router.push("/panel/businesses/new-business")}>
                        Create listing
                    </Button>
                </div>
            </div>

            <Card>
                {myLoading ? (
                    <SkeletonTable rows={6} />
                ) : myError ? (
                    <div className="py-12 text-center space-y-4">
                        <p style={{ color: "var(--color-error)" }}>{myError}</p>
                        <Button onClick={handleRefresh}>Try again</Button>
                    </div>
                ) : myList.length === 0 ? (
                    <EmptyState
                        title="No businesses yet"
                        description="Start your first listing to showcase your business on Parlomo."
                        action={
                            <Button onClick={() => router.push("/panel/businesses/new-business")}>
                                Start new business
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <BusinessMyListingTable
                            listings={myList}
                            onView={handlePreview}
                            onResume={handleResume}
                            onBuyBadge={handleBuyBadge}
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
        </ContentWrapper>
    );
}
