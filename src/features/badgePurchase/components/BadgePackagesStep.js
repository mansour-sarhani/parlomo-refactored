"use client";

import Image from "next/image";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

const formatPrice = (value) => {
    if (value === undefined || value === null) {
        return "—";
    }

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
        return value;
    }

    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    }).format(numericValue);
};

const buildAssetUrl = (item) => {
    if (!item?.image) {
        return null;
    }

    if (typeof item.image === "string" && item.image.startsWith("http")) {
        return item.image;
    }

    const base = (process.env.NEXT_PUBLIC_URL_KEY || "").replace(/\/+$/, "");
    const path = item.path ? `/${String(item.path).replace(/^\/+/, "").replace(/\/+$/, "")}` : "";

    return `${base}${path}${path ? "/" : ""}${item.image}`;
};

export function BadgePackagesStep({
    badges,
    selectedBadgeId,
    onSelect,
    onContinue,
    loading,
    error,
}) {
    const handleSelect = (badgeId) => {
        onSelect?.(badgeId);
    };

    const isContinueDisabled =
        !selectedBadgeId || (Array.isArray(badges) && badges.length === 0);

    return (
        <div className="space-y-6">
            <div>
                <h2
                    className="text-xl font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Choose a Badge Package
                </h2>
                <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Select the badge that best fits your business goals. You can
                    review the pricing and duration before assigning it to a
                    directory.
                </p>
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(4)].map((_, index) => (
                        <Card
                            key={index}
                            className="h-40 animate-pulse"
                            style={{
                                backgroundColor: "var(--color-background-elevated)",
                            }}
                        />
                    ))}
                </div>
            ) : error ? (
                <div
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{
                        borderColor: "var(--color-error)",
                        color: "var(--color-error)",
                    }}
                >
                    {error}
                </div>
            ) : badges.length === 0 ? (
                <Card>
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        No badge packages are currently available. Please check
                        back soon or contact support for assistance.
                    </p>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {badges.map((badge) => {
                        const isSelected = selectedBadgeId === badge.id;
                        const imageUrl = buildAssetUrl(badge);

                        return (
                            <Card
                                key={badge.id}
                                className={`flex flex-col gap-4 border transition ${
                                    isSelected
                                        ? "ring-2 ring-[var(--color-primary)]"
                                        : ""
                                }`}
                                style={{
                                    borderColor: isSelected
                                        ? "var(--color-primary)"
                                        : "var(--color-border)",
                                }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3
                                            className="text-lg font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {badge.title}
                                        </h3>
                                        <p
                                            className="text-sm font-medium"
                                            style={{
                                                color: "var(--color-primary)",
                                            }}
                                        >
                                            {formatPrice(badge.price)}
                                        </p>
                                    </div>
                                    {badge.image && (
                                        <div className="relative h-16 w-16 overflow-hidden rounded-lg border">
                                            <Image
                                                src={imageUrl}
                                                alt={badge.title}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                </div>

                                <dl className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <dt
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Type
                                        </dt>
                                        <dd
                                            className="font-medium"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {badge.badgeType || "—"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Duration
                                        </dt>
                                        <dd
                                            className="font-medium"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {badge.days ?? 0} days
                                        </dd>
                                    </div>
                                    <div>
                                        <dt
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Extra Days
                                        </dt>
                                        <dd
                                            className="font-medium"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {badge.extraDays ?? 0}
                                        </dd>
                                    </div>
                                </dl>

                                {badge.description && (
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {badge.description}
                                    </p>
                                )}

                                <div className="mt-auto flex justify-end">
                                    <Button
                                        variant={isSelected ? "primary" : "secondary"}
                                        onClick={() => handleSelect(badge.id)}
                                    >
                                        {isSelected ? "Selected" : "Select"}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <div className="flex justify-end">
                <Button onClick={onContinue} disabled={isContinueDisabled}>
                    Continue
                </Button>
            </div>
        </div>
    );
}

export default BadgePackagesStep;


