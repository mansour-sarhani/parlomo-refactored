import { FrontLayout } from "@/components/layout/FrontLayout";
import AdSearchPage from "@/components/front/search/ad/AdSearchPage";
import { Suspense } from "react";

export const metadata = {
    title: "Ad Search Results",
    description: "Search for classified ads on Parlomo.",
};

export default function AdSearch() {
    return (
        <FrontLayout>
            <Suspense fallback={
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">Loading...</div>
                </div>
            }>
                <AdSearchPage />
            </Suspense>
        </FrontLayout>
    );
}
