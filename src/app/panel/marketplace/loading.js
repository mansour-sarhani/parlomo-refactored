import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Skeleton } from "@/components/common/Skeleton";

export default function MarketplaceLoading() {
    return (
        <ContentWrapper title="Marketplace">
            <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full" />
            </div>
        </ContentWrapper>
    );
}
