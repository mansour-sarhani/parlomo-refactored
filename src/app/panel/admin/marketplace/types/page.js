"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import TypeSummary from "@/components/marketplace/TypeSummary";
import { Button } from "@/components/common/Button";
import { SkeletonTable } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableCell,
    TableBody,
    TableActions,
} from "@/components/tables";
import {
    fetchAdTypes,
    setAdTypePage,
    fetchAllAdTypes,
} from "@/features/marketplace/adTypesSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export default function MarketplaceTypesPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { list, loading, error, pagination } = useAppSelector(
        (state) => state.marketplaceAdTypes
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
        dispatch(fetchAllAdTypes());
    }, [dispatch]);

    useEffect(() => {
        let page = parseInt(searchParams.get("page") || "1", 10);
        if (Number.isNaN(page) || page < 1) {
            page = 1;
        }

        dispatch(setAdTypePage(page));

        dispatch(
            fetchAdTypes({
                page,
                limit: 10,
            })
        );
    }, [searchParams, dispatch]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchAdTypes({
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

    const stats = {
        total: pagination.total,
        activeCategories: list.reduce((acc, type) => acc + (type.totalActiveCategory || 0), 0),
        syncedAt: new Date(),
    };

    const totalTypes = pagination.total || 0;

    return (
        <ContentWrapper>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Ad Types ({totalTypes})
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Manage high-level groupings for marketplace listings.
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
                    <Button>New Type</Button>
                </div>
            </div>

            <Card className="mb-6">
                <TypeSummary stats={stats} />
            </Card>

            <Card>
                {loading ? (
                    <SkeletonTable rows={8} />
                ) : error ? (
                    <div className="py-12 text-center space-y-4">
                        <p style={{ color: "var(--color-error)" }}>{error}</p>
                        <Button onClick={handleRefresh}>Try Again</Button>
                    </div>
                ) : list.length === 0 ? (
                    <EmptyState
                        title="No ad types found"
                        description="Create a new ad type to get started."
                    />
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell>ID</TableHeaderCell>
                                    <TableHeaderCell>Title</TableHeaderCell>
                                    <TableHeaderCell>Price</TableHeaderCell>
                                    <TableHeaderCell>Categories</TableHeaderCell>
                                    <TableHeaderCell>Status</TableHeaderCell>
                                    <TableHeaderCell className="w-[150px]">Actions</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.map((type) => (
                                    <TableRow key={type.id}>
                                        <TableCell>{type.id}</TableCell>
                                        <TableCell>{type.title}</TableCell>
                                        <TableCell>{type.price || "—"}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <span className="font-medium text-neutral-900">
                                                    {type.totalActiveCategory}
                                                </span>{" "}
                                                active / {type.totalCategory} total
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    type.status
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-neutral-200 text-neutral-600"
                                                }`}
                                            >
                                                {type.status ? "Active" : "Inactive"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <TableActions
                                                actions={["edit"]}
                                                onEdit={() => {
                                                    // Edit flow coming soon
                                                }}
                                                loading={loading}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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

