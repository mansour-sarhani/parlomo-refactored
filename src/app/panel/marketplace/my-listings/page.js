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
import { fetchUserListings, setUserListingPage } from "@/features/marketplace/adListingsSlice";
import { MyListingsTable } from "@/features/marketplace/components/MyListingsTable";
import { ViewListingModal } from "@/features/marketplace/components/ViewListingModal";

export default function MyListingsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { userList, userLoading, userError, userPagination } = useAppSelector(
        (state) => state.marketplaceAdListings
    );

    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState(null);

    const memoisedLimit = useMemo(() => userPagination.limit || 10, [userPagination.limit]);

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

        dispatch(setUserListingPage(page));

        dispatch(
            fetchUserListings({
                page,
                per_page: 10,
            })
        );
    }, [searchParams, dispatch]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchUserListings({
                    page: userPagination.page,
                    per_page: memoisedLimit,
                })
            ).unwrap();

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (error) {
            // Errors are surfaced through the slice/toasts; no-op here.
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch, memoisedLimit, userPagination.page]);

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

    const handleView = useCallback((listing) => {
        if (!listing?.id) {
            toast.error("Unable to open listing details");
            return;
        }
        // Open modal to view listing details
        setSelectedListingId(listing.id);
        setViewModalOpen(true);
    }, []);

    const handleEdit = useCallback(
        (listing) => {
            if (!listing?.id) {
                toast.error("Unable to open listing for editing");
                return;
            }
            // Navigate to wizard for editing
            router.push(`/panel/marketplace/new-listing?id=${listing.id}`);
        },
        [router]
    );

    const handleEditFromModal = useCallback(
        (listing) => {
            if (!listing?.id) {
                toast.error("Unable to open listing for editing");
                return;
            }
            setViewModalOpen(false);
            router.push(`/panel/marketplace/new-listing?id=${listing.id}`);
        },
        [router]
    );

    const totalListings = userPagination.total || userList.length || 0;

    return (
        <ContentWrapper className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        My Listings ({totalListings})
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Manage your marketplace listings. View details, edit, or create new
                        listings.
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
                    <Button onClick={() => router.push("/panel/marketplace/new-listing")}>
                        Create listing
                    </Button>
                </div>
            </div>

            <Card>
                {userLoading ? (
                    <SkeletonTable rows={6} />
                ) : userError ? (
                    <div className="py-12 text-center space-y-4">
                        <p style={{ color: "var(--color-error)" }}>{userError}</p>
                        <Button onClick={handleRefresh}>Try again</Button>
                    </div>
                ) : userList.length === 0 ? (
                    <EmptyState
                        title="No listings yet"
                        description="Start your first listing to showcase your items on Parlomo marketplace."
                        action={
                            <Button onClick={() => router.push("/panel/marketplace/new-listing")}>
                                Start new listing
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <MyListingsTable
                            listings={userList}
                            onView={handleView}
                            onEdit={handleEdit}
                        />
                        <div className="mt-6">
                            <Pagination
                                currentPage={userPagination.page || 1}
                                totalPages={userPagination.pages || 1}
                                totalItems={userPagination.total || 0}
                                itemsPerPage={memoisedLimit}
                                onPageChange={handlePageChange}
                                showItemsPerPage={false}
                            />
                        </div>
                    </>
                )}
            </Card>

            <ViewListingModal
                listingId={selectedListingId}
                isOpen={viewModalOpen}
                onClose={() => {
                    setViewModalOpen(false);
                    setSelectedListingId(null);
                }}
                onEdit={handleEditFromModal}
            />
        </ContentWrapper>
    );
}
