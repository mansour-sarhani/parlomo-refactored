import { FrontLayout } from "@/components/layout/FrontLayout";
import DirectorySearchMapPage from "@/components/front/search/directory/DirectorySearchMapPage";
import { Suspense } from "react";

export const metadata = {
    title: "Directory Search Map | Parlomo",
    description: "Search for businesses and services on an interactive map.",
};

export default function DirectorySearchMap() {
    return (
        <FrontLayout>
            <Suspense fallback={
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">Loading map...</div>
                </div>
            }>
                <DirectorySearchMapPage />
            </Suspense>
        </FrontLayout>
    );
}
