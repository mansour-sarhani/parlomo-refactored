import { FrontLayout } from "@/components/layout/FrontLayout";
import DirectorySearchPage from "@/components/front/search/directory/DirectorySearchPage";
import { Suspense } from "react";

export const metadata = {
    title: "Directory Search Results | Parlomo",
    description: "Search for businesses and services in the Parlomo directory.",
};

export default function DirectorySearch() {
    return (
        <FrontLayout>
            <Suspense fallback={
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">Loading...</div>
                </div>
            }>
                <DirectorySearchPage />
            </Suspense>
        </FrontLayout>
    );
}
