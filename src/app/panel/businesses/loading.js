"use client";

import { Loader } from "@/components/common/Loader";
import { Skeleton } from "@/components/common/Skeleton";

export default function BusinessesLoading() {
    return (
        <div className="space-y-6 p-6">
            <div className="space-y-2">
                <Skeleton variant="text" className="h-8 w-56" />
                <Skeleton variant="text" className="h-4 w-96" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-background)] p-5"
                    >
                        <Skeleton variant="text" className="h-4 w-24 mb-3" />
                        <Skeleton variant="text" className="h-6 w-32 mb-2" />
                        <Skeleton variant="text" className="h-3 w-20" />
                    </div>
                ))}
            </div>

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-background)] p-6">
                <Skeleton variant="text" className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((row) => (
                        <Skeleton key={row} variant="text" className="h-12 w-full" />
                    ))}
                </div>
            </div>

            <div className="flex justify-center">
                <Loader size="md" />
            </div>
        </div>
    );
}


