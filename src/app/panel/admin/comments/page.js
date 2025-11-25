"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw, MessageSquareOff } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SkeletonTable } from "@/components/common/Skeleton";
import { AdminCommentsTable, ReplyToCommentModal } from "@/features/adminComments";
import { fetchAdminComments, replyToComment, setPage } from "@/features/adminComments";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export default function AdminCommentsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { list, loadingList, replying, error, pagination } = useAppSelector(
        (state) => state.adminComments
    );

    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isReplyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
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

        dispatch(setPage(page));
        dispatch(fetchAdminComments({ page, limit: 10 }));
    }, [searchParams, dispatch]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({
                page: newPage,
            });

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
                fetchAdminComments({
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

    const handleOpenReply = useCallback((comment) => {
        setSelectedComment(comment);
        setReplyModalOpen(true);
    }, []);

    const handleReplySubmit = useCallback(
        async (data) => {
            if (!selectedComment) return;
            await dispatch(replyToComment(data)).unwrap();
            await handleRefresh();
            setReplyModalOpen(false);
            setSelectedComment(null);
        },
        [dispatch, handleRefresh, selectedComment]
    );

    return (
        <ContentWrapper>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Comments to Review ({pagination.total || 0})
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Reply to directory comments from users.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {showReloadNotice && (
                        <span className="text-sm" style={{ color: "var(--color-success)" }}>
                            List Reloaded!
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
                            title="No comments found"
                            description="Directory comments awaiting replies will appear here."
                            icon={MessageSquareOff}
                        />
                    ) : (
                        <>
                            <AdminCommentsTable comments={list} onReply={handleOpenReply} />
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

            <ReplyToCommentModal
                isOpen={isReplyModalOpen}
                onClose={() => {
                    setReplyModalOpen(false);
                    setSelectedComment(null);
                }}
                comment={selectedComment}
                onSubmit={handleReplySubmit}
            />
        </ContentWrapper>
    );
}
