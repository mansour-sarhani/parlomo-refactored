"use client";

import { useEffect } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Button } from "@/components/common/Button";

export default function MarketplaceError({ error, reset }) {
    useEffect(() => {
        if (error) {
            console.error("Marketplace route error:", error);
        }
    }, [error]);

    return (
        <ContentWrapper title="Marketplace">
            <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6 text-red-900">
                <h2 className="text-xl font-semibold">Something went wrong</h2>
                <p>{error?.message || "We couldn’t load the marketplace section."}</p>
                <Button variant="default" onClick={reset}>
                    Try again
                </Button>
            </div>
        </ContentWrapper>
    );
}
