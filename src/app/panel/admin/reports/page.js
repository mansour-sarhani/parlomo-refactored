"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SkeletonTable } from "@/components/common/Skeleton";
import { Button } from "@/components/common/Button";
import { ReportsHeader, ReportsFilters, ReportsTable } from "@/features/reports";
import { fetchAdminReports, setAdminFilters, setAdminPage } from "@/features/reports/reportsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export default function AdminReportsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { admin } = useAppSelector((state) => state.reports);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const tableRef = useRef(null);

    const memoisedLimit = useMemo(() => admin.pagination.limit || 10, [admin.pagination.limit]);

    const filterValues = useMemo(
        () => ({
            startDate: admin.filters.startDate || "",
            endDate: admin.filters.endDate || "",
        }),
        [admin.filters.endDate, admin.filters.startDate]
    );

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

        const startDate = searchParams.get("startDate") || "";
        const endDate = searchParams.get("endDate") || "";

        dispatch(setAdminPage(page));
        dispatch(
            setAdminFilters({
                startDate,
                endDate,
            })
        );

        dispatch(
            fetchAdminReports({
                page,
                limit: 10,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            })
        );
    }, [searchParams, dispatch]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({
                page: newPage,
                startDate: admin.filters.startDate,
                endDate: admin.filters.endDate,
            });

            if (tableRef.current) {
                tableRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        },
        [admin.filters.startDate, admin.filters.endDate, updateUrl]
    );

    const handleFilterSubmit = useCallback(
        (values) => {
            updateUrl({
                page: 1,
                startDate: values.startDate,
                endDate: values.endDate,
            });
        },
        [updateUrl]
    );

    const handleFilterReset = useCallback(() => {
        updateUrl({
            page: 1,
            startDate: "",
            endDate: "",
        });
    }, [updateUrl]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchAdminReports({
                    page: admin.pagination.page,
                    limit: memoisedLimit,
                    startDate: admin.filters.startDate || undefined,
                    endDate: admin.filters.endDate || undefined,
                })
            ).unwrap();

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (error) {
            // Errors are surfaced through the slice/toasts; no-op here.
        } finally {
            setIsRefreshing(false);
        }
    }, [
        dispatch,
        admin.filters.startDate,
        admin.filters.endDate,
        memoisedLimit,
        admin.pagination.page,
    ]);

    const totalReports = admin.pagination.total || 0;

    return (
        <ContentWrapper>
            <div className="space-y-6">
                <ReportsHeader
                    title="Admin Reports"
                    subtitle="Monitor all invoices generated across the platform."
                    total={totalReports}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    showReloadNotice={showReloadNotice}
                />

                <Card>
                    <div className="space-y-6">
                        <ReportsFilters
                            initialValues={filterValues}
                            onSubmit={handleFilterSubmit}
                            onReset={handleFilterReset}
                        />

                        <div ref={tableRef}>
                            {admin.loading ? (
                                <SkeletonTable rows={8} />
                            ) : admin.error ? (
                                <div className="py-12 text-center space-y-4">
                                    <p
                                        style={{ color: "var(--color-error)" }}
                                        className="font-medium"
                                    >
                                        {admin.error}
                                    </p>
                                    <Button onClick={handleRefresh}>Try Again</Button>
                                </div>
                            ) : admin.list.length === 0 ? (
                                <EmptyState
                                    title="No reports found"
                                    description="Try adjusting the date range or check back later."
                                    actionLabel={
                                        admin.filters.startDate || admin.filters.endDate
                                            ? "Clear filters"
                                            : undefined
                                    }
                                    onAction={
                                        admin.filters.startDate || admin.filters.endDate
                                            ? handleFilterReset
                                            : undefined
                                    }
                                />
                            ) : (
                                <>
                                    <ReportsTable reports={admin.list} />
                                    <div className="mt-6">
                                        <Pagination
                                            currentPage={admin.pagination.page || 1}
                                            totalPages={admin.pagination.pages || 1}
                                            totalItems={admin.pagination.total || 0}
                                            itemsPerPage={memoisedLimit}
                                            onPageChange={handlePageChange}
                                            showItemsPerPage={false}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </ContentWrapper>
    );
}
