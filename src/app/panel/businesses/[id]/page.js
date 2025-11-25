"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { SkeletonTable } from "@/components/common/Skeleton";
import { BusinessProfileView } from "@/components/businesses/BusinessProfileView";
import {
    fetchMyBusinessById,
    clearCurrentMyBusiness,
} from "@/features/businesses/businessListingsSlice";

export default function MyBusinessViewPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const listingId = params?.id;

    const {
        currentMyListing,
        myLoading,
        myError,
    } = useAppSelector((state) => state.businessListings);

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!listingId) return;
        dispatch(fetchMyBusinessById(listingId));
        return () => {
            dispatch(clearCurrentMyBusiness());
        };
    }, [dispatch, listingId, refreshKey]);

    const handleBack = () => {
        router.push("/panel/businesses/my-business");
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
        setRefreshKey((key) => key + 1);
    };

    const headingTitle = useMemo(
        () => currentMyListing?.title || "Business profile",
        [currentMyListing?.title]
    );

    return (
        <ContentWrapper className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                        {headingTitle}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        View and manage your business listing details.
                    </p>
                </div>
                <Button variant="secondary" onClick={handleBack}>
                    Back to my businesses
                </Button>
            </div>

            {myLoading && !currentMyListing ? (
                <Card>
                    <SkeletonTable rows={8} />
                </Card>
            ) : myError && !currentMyListing ? (
                <Card>
                    <div className="space-y-3 text-center py-12">
                        <p style={{ color: "var(--color-error)" }}>{myError}</p>
                        <div className="flex justify-center gap-3">
                            <Button variant="secondary" onClick={handleBack}>
                                Back
                            </Button>
                            <Button onClick={handleRefresh}>Try again</Button>
                        </div>
                    </div>
                </Card>
            ) : currentMyListing ? (
                <BusinessProfileView
                    business={currentMyListing}
                    onEdit={handleEdit}
                    onBuyBadge={handleBuyBadge}
                    onRefresh={handleRefresh}
                />
            ) : null}
        </ContentWrapper>
    );
}

