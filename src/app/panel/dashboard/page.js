"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { Plus, Rocket, Building2, Store } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { DashboardDirectoryCard } from "@/components/dashboard/DashboardDirectoryCard";
import { DashboardAdCard } from "@/components/dashboard/DashboardAdCard";
import { fetchMyBusinessListings } from "@/features/businesses/businessListingsSlice";
import { fetchUserListings } from "@/features/marketplace/adListingsSlice";

export default function DashboardPage() {
    const dispatch = useDispatch();

    // Business listings state
    const {
        myList: directories,
        myLoading: directoriesLoading,
        myError: directoriesError,
        pagination: directoriesPagination,
    } = useSelector((state) => state.businessListings);

    // Ad listings state
    const {
        userList: ads,
        userLoading: adsLoading,
        userError: adsError,
        pagination: adsPagination,
    } = useSelector((state) => state.marketplaceAdListings);

    useEffect(() => {
        // Fetch user directories and ads on mount
        dispatch(fetchMyBusinessListings({ page: 1, limit: 4 }));
        dispatch(fetchUserListings({ page: 1, limit: 4 }));
    }, [dispatch]);

    const quickActions = [
        {
            href: "/panel/marketplace/new-listing",
            icon: Plus,
            title: "Create New Ad",
            description: "Post a classified advertisement",
        },
        {
            href: "/panel/businesses/new-business",
            icon: Building2,
            title: "Create New Business",
            description: "Add your business to the directory",
        },
        {
            href: "/panel/businesses/buy-advertising",
            icon: Rocket,
            title: "Buy Advertising Package",
            description: "Promote your business with ads",
        },
        {
            href: "/panel/businesses/buy-badges",
            icon: Rocket,
            title: "Buy a Badge",
            description: "Get verified or sponsored badges",
        },
    ];

    const recentDirectories = directories.slice(0, 4);
    const recentAds = ads.slice(0, 4);
    const directoryTotal = directoriesPagination?.total || directories.length;
    const adsTotal = adsPagination?.total || ads.length;
    const isLoading = directoriesLoading || adsLoading;
    const hasError = directoriesError || adsError;

    return (
        <ContentWrapper
            title="Dashboard"
            description="Welcome to Parlomo Dashboard. You can view, create and edit your posts here."
        >
            <div className="space-y-8">
                {/* Quick Actions */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)]">
                        Quick Actions
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {quickActions.map((action) => (
                            <QuickActionCard key={action.href} {...action} />
                        ))}
                    </div>
                </div>

                {/* Error State */}
                {hasError && (
                    <Card>
                        <div className="rounded-lg border border-[var(--color-error)] bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)]">
                            {directoriesError || adsError || "Failed to load dashboard data"}
                        </div>
                    </Card>
                )}

                {/* Recent Businesses */}
                {directoriesLoading ? (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                Your Businesses
                            </h2>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} variant="card" className="aspect-[4/3]" />
                            ))}
                        </div>
                    </div>
                ) : recentDirectories.length > 0 ? (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                Your Businesses ({directoryTotal})
                            </h2>
                            <Link
                                href="/panel/businesses/my-business"
                                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                            >
                                See All →
                            </Link>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {recentDirectories.map((directory) => (
                                <DashboardDirectoryCard key={directory.id} directory={directory} />
                            ))}
                        </div>
                    </div>
                ) : null}

                {/* Recent Ads */}
                {adsLoading ? (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                Your Ads
                            </h2>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} variant="card" className="aspect-[4/3]" />
                            ))}
                        </div>
                    </div>
                ) : recentAds.length > 0 ? (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                Your Ads ({adsTotal})
                            </h2>
                            <Link
                                href="/panel/marketplace/my-listings"
                                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                            >
                                See All →
                            </Link>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {recentAds.map((ad) => (
                                <DashboardAdCard key={ad.id} ad={ad} />
                            ))}
                        </div>
                    </div>
                ) : null}

                {/* Empty State - Only show if not loading and no data */}
                {!isLoading &&
                    recentDirectories.length === 0 &&
                    recentAds.length === 0 &&
                    !hasError && (
                        <Card>
                            <EmptyState
                                title="Get Started"
                                description="Create your first business listing or classified ad to get started."
                            />
                        </Card>
                    )}
            </div>
        </ContentWrapper>
    );
}
