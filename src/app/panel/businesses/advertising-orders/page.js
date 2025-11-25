"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { SkeletonTable } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchUserAdvertisingOrders } from "@/features/advertising";
import { setPage } from "@/features/advertising/userAdvertisingOrdersSlice";
import { UserAdvertisingOrdersTable } from "@/features/advertising/components";

export default function AdvertisingOrdersPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        list: orders,
        loading,
        error,
        pagination,
    } = useAppSelector((state) => state.userAdvertisingOrders);

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

        dispatch(setPage(page));

        dispatch(
            fetchUserAdvertisingOrders({
                page,
                limit: 10,
            })
        );
    }, [searchParams, dispatch]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchUserAdvertisingOrders({
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

    const totalItems = pagination.total || 0;

    return (
        <ContentWrapper className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1
                        className="text-2xl font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        My Advertising Orders ({totalItems})
                    </h1>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Track all banner and video placements you have purchased for your business
                        listings.
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
                </div>
            </div>

            <Card>
                {loading ? (
                    <SkeletonTable rows={8} />
                ) : error ? (
                    <div className="py-12 text-center space-y-4">
                        <p style={{ color: "var(--color-error)" }}>{error}</p>
                        <Button onClick={handleRefresh}>Try Again</Button>
                    </div>
                ) : orders.length === 0 ? (
                    <EmptyState
                        title="No advertising orders yet"
                        description="Once you purchase an advertising package, it will appear here for easy tracking."
                        actionLabel="Buy advertising"
                        onAction={() => router.push("/panel/businesses/buy-advertising")}
                    />
                ) : (
                    <>
                        <UserAdvertisingOrdersTable orders={orders} />
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
