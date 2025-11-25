"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SkeletonTable } from "@/components/common/Skeleton";
import { Button } from "@/components/common/Button";
import {
    ReportsHeader,
    ReportsFilters,
    ReportsTable,
} from "@/features/reports";
import {
    fetchUserReports,
    setUserFilters,
    setUserPage,
} from "@/features/reports/reportsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

const DEFAULT_PAGE_SIZE = 10;

const sanitizePage = (value) => {
    const parsed = parseInt(value, 10);

    if (Number.isNaN(parsed) || parsed < 1) {
        return 1;
    }

    return parsed;
};

const sanitizeDate = (value) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return value;
};

export default function UserInvoicesPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { user } = useAppSelector((state) => state.reports);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const reloadNoticeTimeoutRef = useRef();

    const searchParamsString = useMemo(
        () => searchParams.toString(),
        [searchParams]
    );

    const filterValues = useMemo(
        () => ({
            startDate: user.filters.startDate || "",
            endDate: user.filters.endDate || "",
        }),
        [user.filters.endDate, user.filters.startDate]
    );

    const currentRequestParams = useMemo(
        () => ({
            page: user.pagination.page || 1,
            limit: DEFAULT_PAGE_SIZE,
            startDate: user.filters.startDate || undefined,
            endDate: user.filters.endDate || undefined,
        }),
        [
            user.filters.endDate,
            user.filters.startDate,
            user.pagination.page,
        ]
    );

    useEffect(() => {
        const urlPage = sanitizePage(searchParams.get("page") || "1");
        const urlStartDate = sanitizeDate(searchParams.get("startDate"));
        const urlEndDate = sanitizeDate(searchParams.get("endDate"));

        dispatch(setUserPage(urlPage));
        dispatch(
            setUserFilters({
                startDate: urlStartDate,
                endDate: urlEndDate,
            })
        );

        dispatch(
            fetchUserReports({
                page: urlPage,
                limit: DEFAULT_PAGE_SIZE,
                startDate: urlStartDate || undefined,
                endDate: urlEndDate || undefined,
            })
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, searchParamsString]);

    useEffect(() => {
        return () => {
            if (reloadNoticeTimeoutRef.current) {
                clearTimeout(reloadNoticeTimeoutRef.current);
            }
        };
    }, []);

    const updateUrl = useCallback(
        (params) => {
            const nextParams = new URLSearchParams(searchParams.toString());

            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === undefined || value === "") {
                    nextParams.delete(key);
                } else {
                    nextParams.set(key, String(value));
                }
            });

            if (nextParams.get("page") === "1") {
                nextParams.delete("page");
            }

            const queryString = nextParams.toString();

            router.push(
                queryString ? `${pathname}?${queryString}` : pathname,
                {
                    scroll: false,
                }
            );
        },
        [pathname, router, searchParams]
    );

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({ page: newPage });

            if (typeof window !== "undefined") {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            }
        },
        [updateUrl]
    );

    const handleFilterSubmit = useCallback(
        (values) => {
            updateUrl({
                page: 1,
                startDate: values.startDate || null,
                endDate: values.endDate || null,
            });
        },
        [updateUrl]
    );

    const handleFilterReset = useCallback(() => {
        updateUrl({
            page: 1,
            startDate: null,
            endDate: null,
        });
    }, [updateUrl]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchUserReports(currentRequestParams)).unwrap();

            setShowReloadNotice(true);
            if (reloadNoticeTimeoutRef.current) {
                clearTimeout(reloadNoticeTimeoutRef.current);
            }
            reloadNoticeTimeoutRef.current = setTimeout(() => {
                setShowReloadNotice(false);
            }, 4000);
        } catch (error) {
            // errors handled in slice state
        } finally {
            setIsRefreshing(false);
        }
    }, [currentRequestParams, dispatch]);

    const totalReports = user.pagination.total || 0;

    return (
        <ContentWrapper>
            <div className="space-y-6">
                <ReportsHeader
                    title="My Invoices"
                    subtitle="Review purchases and downloads your invoice history."
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

                        {user.loading ? (
                            <SkeletonTable rows={8} />
                        ) : user.error ? (
                            <div className="py-12 text-center space-y-4">
                                <p
                                    className="font-medium"
                                    style={{ color: "var(--color-error)" }}
                                >
                                    {user.error}
                                </p>
                                <Button onClick={handleRefresh}>Try Again</Button>
                            </div>
                        ) : user.list.length === 0 ? (
                            <EmptyState
                                title="No invoices yet"
                                description="Once you make a purchase, your invoices will appear here."
                                actionLabel={
                                    user.filters.startDate || user.filters.endDate
                                        ? "Clear filters"
                                        : undefined
                                }
                                onAction={
                                    user.filters.startDate || user.filters.endDate
                                        ? handleFilterReset
                                        : undefined
                                }
                            />
                        ) : (
                            <>
                                <ReportsTable reports={user.list} />
                                <div className="mt-6">
                                    <Pagination
                                        currentPage={user.pagination.page || 1}
                                        totalPages={user.pagination.pages || 1}
                                        totalItems={user.pagination.total || 0}
                                        itemsPerPage={user.pagination.limit || DEFAULT_PAGE_SIZE}
                                        onPageChange={handlePageChange}
                                        showItemsPerPage={false}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </ContentWrapper>
    );
}

