"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { SkeletonTable } from "@/components/common/Skeleton";
import { BusinessProfileView } from "@/components/businesses/BusinessProfileView";
import BusinessAdminActions from "@/components/businesses/BusinessAdminActions";
import {
    fetchBusinessListingById,
    clearCurrentAdminBusiness,
} from "@/features/businesses/businessListingsSlice";

export default function BusinessListingDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const listingId = params?.id;
    const redirect = searchParams.get("from") || "list";

    const {
        currentAdminListing,
        loading,
        error,
    } = useAppSelector((state) => state.businessListings);

    const [changeOwnerRefreshKey, setChangeOwnerRefreshKey] = useState(0);

    useEffect(() => {
        if (!listingId) return;
        dispatch(fetchBusinessListingById(listingId));
        return () => {
            dispatch(clearCurrentAdminBusiness());
        };
    }, [dispatch, listingId, changeOwnerRefreshKey]);

    const handleBack = () => {
        switch (redirect) {
            case "my":
                router.push("/panel/businesses/my-business");
                break;
            default:
                router.push("/panel/admin/businesses/list");
        }
    };

    const handleEdit = () => {
        if (!listingId) return;
        router.push(`/panel/businesses/new-business?id=${listingId}`);
    };

    const handleBuyBadge = () => {
        if (!listingId) return;
        router.push(`/panel/businesses/buy-badges?business=${listingId}`);
    };

    const handleRefresh = () => {
        setChangeOwnerRefreshKey((key) => key + 1);
    };

    const headingTitle = useMemo(
        () => currentAdminListing?.title || "Business profile",
        [currentAdminListing?.title]
    );

    return (
        <ContentWrapper className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                        {headingTitle}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Review full details, manage ownership, and maintain this business listing.
                    </p>
                </div>
                <Button variant="secondary" onClick={handleBack}>
                    Back to list
                </Button>
            </div>

            {loading && !currentAdminListing ? (
                <Card>
                    <SkeletonTable rows={8} />
                </Card>
            ) : error && !currentAdminListing ? (
                <Card>
                    <div className="space-y-3 text-center py-12">
                        <p style={{ color: "var(--color-error)" }}>{error}</p>
                        <div className="flex justify-center gap-3">
                            <Button variant="secondary" onClick={handleBack}>
                                Back
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : currentAdminListing ? (
                <div className="space-y-6">
                    <BusinessAdminActions business={currentAdminListing} onUpdated={handleRefresh} />
                    <BusinessProfileView
                        business={currentAdminListing}
                        onEdit={handleEdit}
                        onBuyBadge={handleBuyBadge}
                        onRefresh={handleRefresh}
                        showAdminActions={true}
                    />
                </div>
            ) : null}
        </ContentWrapper>
    );
}

