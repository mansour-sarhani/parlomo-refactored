"use client";

/**
 * Skeleton Component
 * Flexible skeleton loader for various UI elements
 * 
 * Usage:
 * - <Skeleton /> - Default rectangle
 * - <Skeleton variant="text" /> - Text line
 * - <Skeleton variant="circle" /> - Circle (avatar)
 * - <Skeleton variant="card" /> - Card skeleton
 * - <Skeleton variant="table-row" /> - Table row skeleton
 * - <Skeleton count={3} /> - Multiple instances
 */

const SkeletonBase = ({ width, height, className = "", variant = "rectangle" }) => {
    const baseClasses = "animate-pulse";
    
    const variants = {
        text: `h-4 ${width || "w-full"} rounded`,
        rectangle: `${height || "h-12"} ${width || "w-full"} rounded-lg`,
        circle: `${width || "w-12"} ${height || "h-12"} rounded-full`,
        card: "h-48 w-full rounded-lg",
        "table-row": "h-12 w-full rounded",
    };

    return (
        <div
            className={`${baseClasses} ${variants[variant]} ${className}`}
            style={{
                backgroundColor: "var(--color-background-tertiary)",
            }}
        />
    );
};

export const Skeleton = ({ count = 1, variant = "rectangle", width, height, className = "" }) => {
    if (count === 1) {
        return <SkeletonBase variant={variant} width={width} height={height} className={className} />;
    }

    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonBase
                    key={index}
                    variant={variant}
                    width={width}
                    height={height}
                    className={className}
                />
            ))}
        </div>
    );
};

// Predefined compound skeletons for common use cases

export const SkeletonCard = () => (
    <div
        className="p-6 rounded-lg space-y-4"
        style={{
            backgroundColor: "var(--color-background-elevated)",
            borderColor: "var(--color-border)",
            borderWidth: "1px",
        }}
    >
        <div className="flex items-center gap-3">
            <Skeleton variant="circle" width="w-12" height="h-12" />
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="w-32" />
                <Skeleton variant="text" width="w-24" />
            </div>
        </div>
        <Skeleton variant="rectangle" height="h-24" />
        <div className="flex gap-2">
            <Skeleton variant="rectangle" width="w-20" height="h-8" />
            <Skeleton variant="rectangle" width="w-20" height="h-8" />
        </div>
    </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
    <div className="space-y-2">
        {/* Header */}
        <div
            className="h-12 rounded-lg animate-pulse"
            style={{
                backgroundColor: "var(--color-background-tertiary)",
            }}
        />
        {/* Rows */}
        {Array.from({ length: rows }).map((_, index) => (
            <div
                key={index}
                className="h-16 rounded animate-pulse"
                style={{
                    backgroundColor: "var(--color-background-elevated)",
                    borderColor: "var(--color-border)",
                    borderWidth: "1px",
                }}
            />
        ))}
    </div>
);

export const SkeletonForm = () => (
    <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
                <Skeleton variant="text" width="w-24" />
                <Skeleton variant="rectangle" height="h-10" />
            </div>
        ))}
        <div className="flex gap-3 pt-4">
            <Skeleton variant="rectangle" width="w-24" height="h-10" />
            <Skeleton variant="rectangle" width="w-24" height="h-10" />
        </div>
    </div>
);

