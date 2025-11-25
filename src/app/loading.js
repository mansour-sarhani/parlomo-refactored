import { Loader } from "@/components/common/Loader";

/**
 * Root loading UI - shown during initial navigation
 * Covers the entire viewport with a centered spinner
 */
export default function RootLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
            <div className="text-center">
                <Loader size="lg" />
                <p className="mt-4 text-[var(--color-text-secondary)]">
                    Loading Parlomo Admin Panel...
                </p>
            </div>
        </div>
    );
}
