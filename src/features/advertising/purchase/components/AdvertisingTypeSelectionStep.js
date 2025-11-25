"use client";

import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";

const buildTypeImageUrl = (type) => {
    if (!type?.image) {
        return null;
    }

    if (typeof type.image === "string" && type.image.startsWith("http")) {
        return type.image;
    }

    const base = (process.env.NEXT_PUBLIC_URL_KEY || "").replace(/\/+$/, "");
    const path = type.path ? `/${String(type.path).replace(/^\/+/, "").replace(/\/+$/, "")}` : "";

    return `${base}${path}${path ? "/" : ""}${type.image}`;
};

export function AdvertisingTypeSelectionStep({
    types = [],
    selectedTypeId,
    loading,
    error,
    onSelect,
    onContinue,
    selectionError,
}) {
    const renderBody = () => {
        if (loading) {
            return (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, index) => (
                        <Card
                            key={index}
                            className="h-64 animate-pulse"
                            style={{ backgroundColor: "var(--color-background-elevated)" }}
                        />
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
                >
                    {error}
                </div>
            );
        }

        if (!Array.isArray(types) || types.length === 0) {
            return (
                <Card>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        We couldn&apos;t find any advertising placements yet. Please check back
                        later or contact support for help setting up placements.
                    </p>
                </Card>
            );
        }

        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {types.map((type) => {
                    const isSelected = String(selectedTypeId) === String(type.id);
                    const imageUrl = buildTypeImageUrl(type);

                    return (
                        <Card
                            key={type.id}
                            className={`group relative flex h-full cursor-pointer flex-col gap-4 border transition-all duration-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                                isSelected
                                    ? "ring-2 ring-[var(--color-primary)] shadow-lg scale-[1.02]"
                                    : "hover:scale-[1.01]"
                            }`}
                            style={{
                                borderColor: isSelected
                                    ? "var(--color-primary)"
                                    : "var(--color-border)",
                                backgroundColor: isSelected
                                    ? "var(--color-background-elevated)"
                                    : "var(--color-card-bg)",
                            }}
                            role="button"
                            tabIndex={0}
                            onClick={() => onSelect?.(type.id)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    onSelect?.(type.id);
                                }
                            }}
                        >
                            {/* Selected indicator */}
                            {isSelected && (
                                <div
                                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full"
                                    style={{ backgroundColor: "var(--color-primary)" }}
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        style={{ color: "var(--color-text-inverse)" }}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            )}

                            {/* Image or placeholder */}
                            {imageUrl ? (
                                <div
                                    className="relative h-48 w-full overflow-hidden rounded-lg border"
                                    style={{ borderColor: "var(--color-border)" }}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={type.title}
                                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="relative h-48 w-full overflow-hidden rounded-lg border flex items-center justify-center"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor: "var(--color-background-elevated)",
                                    }}
                                >
                                    <div
                                        className="flex h-12 w-12 items-center justify-center rounded-lg"
                                        style={{ backgroundColor: "var(--color-primary-light)" }}
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            style={{ color: "var(--color-primary)" }}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 space-y-2 px-1 pt-2">
                                <div>
                                    <h3
                                        className="text-base font-semibold leading-tight"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        {type.title}
                                    </h3>
                                    <p
                                        className="mt-1 text-xs font-medium uppercase tracking-wide"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    >
                                        {type.placeType || type.type || "Custom"}
                                    </p>
                                </div>

                                {type.description ? (
                                    <p
                                        className="text-xs leading-relaxed line-clamp-2"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        {type.description}
                                    </p>
                                ) : null}
                            </div>

                            {/* Action button */}
                            <div className="px-1 pb-1 pt-2">
                                <Button
                                    variant={isSelected ? "primary" : "secondary"}
                                    size="sm"
                                    className="w-full"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onSelect?.(type.id);
                                    }}
                                >
                                    {isSelected ? "Selected" : "Select"}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h2
                    className="text-xl font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Choose Your Advertising Placement
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Select where you would like your promotion to appear. Each placement supports
                    different media specifications and audiences.
                </p>
            </div>

            {renderBody()}

            {selectionError ? (
                <p className="text-sm" style={{ color: "var(--color-error)" }}>
                    {selectionError}
                </p>
            ) : null}

            <div className="flex justify-end">
                <Button onClick={onContinue} disabled={!selectedTypeId}>
                    Continue
                </Button>
            </div>
        </div>
    );
}

export default AdvertisingTypeSelectionStep;
