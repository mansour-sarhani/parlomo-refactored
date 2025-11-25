"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Sparkles, Check, X, Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchBusinessBadgePackages,
    clearBadgeErrors,
} from "@/features/businesses/businessBadgesSlice";
import {
    nextBusinessWizardStep,
    prevBusinessWizardStep,
    setBusinessWizardDraft,
} from "@/features/businesses/businessWizardSlice";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";

const formatPrice = (value) => {
    if (value === undefined || value === null) {
        return "Free";
    }
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
        return value;
    }
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericValue);
};

const buildAssetUrl = (badge) => {
    if (!badge?.image) {
        return null;
    }
    if (typeof badge.image === "string" && badge.image.startsWith("http")) {
        return badge.image;
    }
    const base = (process.env.NEXT_PUBLIC_URL_KEY || "").replace(/\/+$/, "");
    const path = badge.path ? `/${String(badge.path).replace(/^\/+/, "").replace(/\/+$/, "")}` : "";
    return `${base}${path}${path ? "/" : ""}${badge.image}`;
};

const BadgeCard = ({ badge, selected, onSelect, badgeType = "verify" }) => {
    const imageUrl = buildAssetUrl(badge);
    const isVerify = badgeType === "verify";
    const Icon = isVerify ? ShieldCheck : Sparkles;

    return (
        <Card
            className={`group relative overflow-hidden transition-all duration-300 ${
                selected
                    ? "ring-2 ring-[var(--color-primary)] shadow-lg scale-[1.02]"
                    : "hover:shadow-md hover:scale-[1.01]"
            }`}
            style={{
                borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                backgroundColor: selected ? "var(--color-background-elevated)" : "var(--color-card-bg)",
            }}
        >
            {/* Selected indicator */}
            {selected && (
                <div
                    className="absolute right-0 top-0 z-10 flex items-center gap-1.5 rounded-bl-lg px-3 py-1.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: "var(--color-primary)" }}
                >
                    <Check className="h-3.5 w-3.5" />
                    Selected
                </div>
            )}

            <div className="flex flex-col gap-4">
                {/* Header with icon and title */}
                <div className="flex items-start gap-4">
                    {/* Badge image or icon placeholder */}
                    <div className="flex-shrink-0">
                        {imageUrl ? (
                            <div
                                className="relative h-20 w-20 overflow-hidden rounded-xl border-2"
                                style={{
                                    borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageUrl}
                                    alt={badge.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div
                                className="flex h-20 w-20 items-center justify-center rounded-xl border-2"
                                style={{
                                    borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                                    backgroundColor: selected
                                        ? "var(--color-primary-light)"
                                        : "var(--color-background-elevated)",
                                }}
                            >
                                <Icon
                                    className={`h-10 w-10`}
                                    style={{
                                        color: selected ? "var(--color-primary)" : "var(--color-text-tertiary)",
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Title and price */}
                    <div className="flex-1 min-w-0">
                        <h3
                            className="text-lg font-bold leading-tight"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {badge.title}
                        </h3>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span
                                className="text-2xl font-bold"
                                style={{ color: "var(--color-primary)" }}
                            >
                                {formatPrice(badge.price)}
                            </span>
                            {badge.days && (
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    for {badge.days} {badge.days === 1 ? "day" : "days"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features/Benefits */}
                <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background-elevated)" }}>
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-6 w-6 items-center justify-center rounded-full"
                            style={{ backgroundColor: "var(--color-primary-light)" }}
                        >
                            <Icon className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} />
                        </div>
                        <div>
                            <div
                                className="text-xs font-medium"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Type
                            </div>
                            <div
                                className="font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {badge.badgeType || "—"}
                            </div>
                        </div>
                    </div>
                    {badge.days && (
                        <div className="flex items-center gap-2">
                            <div
                                className="flex h-6 w-6 items-center justify-center rounded-full"
                                style={{ backgroundColor: "var(--color-primary-light)" }}
                            >
                                <span className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>
                                    {badge.days}
                                </span>
                            </div>
                            <div>
                                <div
                                    className="text-xs font-medium"
                                    style={{ color: "var(--color-text-tertiary)" }}
                                >
                                    Duration
                                </div>
                                <div
                                    className="font-semibold"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {badge.days} {badge.days === 1 ? "day" : "days"}
                                </div>
                            </div>
                        </div>
                    )}
                    {badge.extraDays > 0 && (
                        <div className="flex items-center gap-2 col-span-2">
                            <div
                                className="flex h-6 w-6 items-center justify-center rounded-full"
                                style={{ backgroundColor: "var(--color-success-light)" }}
                            >
                                <span className="text-xs font-bold" style={{ color: "var(--color-success)" }}>
                                    +
                                </span>
                            </div>
                            <div>
                                <div
                                    className="text-xs font-medium"
                                    style={{ color: "var(--color-text-tertiary)" }}
                                >
                                    Bonus
                                </div>
                                <div
                                    className="font-semibold"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {badge.extraDays} extra {badge.extraDays === 1 ? "day" : "days"}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Description */}
                {badge.description && (
                    <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {badge.description.length > 150
                            ? `${badge.description.slice(0, 150)}…`
                            : badge.description}
                    </p>
                )}

                {/* Call to Action Button */}
                <div className="pt-2">
                    <Button
                        variant={selected ? "primary" : "outline"}
                        fullWidth
                        onClick={onSelect}
                        className="font-semibold"
                    >
                        {selected ? (
                            <>
                                <Check className="h-4 w-4" />
                                Selected
                            </>
                        ) : (
                            <>
                                Select This Badge
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default function BusinessBadgeStep() {
    const dispatch = useAppDispatch();
    const { packagesByType, loading, purchaseError } = useAppSelector((state) => state.businessBadges);
    const draft = useAppSelector((state) => state.businessWizard.draft);

    const [verifySelection, setVerifySelection] = useState(draft.verifyBadgeId || "");
    const [sponsorSelection, setSponsorSelection] = useState(draft.sponsorBadgeId || draft.sponsoredBadgeId || "");

    useEffect(() => {
        dispatch(fetchBusinessBadgePackages("Verify"));
        dispatch(fetchBusinessBadgePackages("Sponsore"));

        return () => {
            dispatch(clearBadgeErrors());
        };
    }, [dispatch]);

    const verifyPackages = useMemo(
        () => packagesByType.Verify || [],
        [packagesByType.Verify]
    );

    const sponsorPackages = useMemo(
        () => packagesByType.Sponsore || packagesByType.Sponsor || [],
        [packagesByType.Sponsore, packagesByType.Sponsor]
    );

    const handleSubmit = () => {
        dispatch(
            setBusinessWizardDraft({
                verifyBadgeId: verifySelection || "",
                sponsorBadgeId: sponsorSelection || "",
            })
        );
        dispatch(nextBusinessWizardStep());
    };

    const hasSelection = verifySelection || sponsorSelection;

    return (
        <div className="space-y-8">
            {/* Badge Sections Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Verification Badge Section */}
                <Card className="space-y-6">
                <div className="flex items-start gap-4">
                    <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: "var(--color-primary-light)" }}
                    >
                        <ShieldCheck className="h-6 w-6" style={{ color: "var(--color-primary)" }} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h2
                                className="text-xl font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Verification Badge
                            </h2>
                            <Badge variant="neutral" size="sm">
                                Optional
                            </Badge>
                        </div>
                        <p
                            className="mt-2 mb-6 text-sm leading-relaxed"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Build trust and credibility with a verified badge. Verified businesses appear
                            prominently in search results and gain customer confidence.
                        </p>
                    </div>
                </div>

                {loading && verifyPackages.length === 0 ? (
                    <div className="space-y-4">
                        {[...Array(2)].map((_, index) => (
                            <Card
                                key={index}
                                className="h-64 w-full animate-pulse"
                                style={{ backgroundColor: "var(--color-background-elevated)" }}
                            />
                        ))}
                    </div>
                ) : verifyPackages.length === 0 ? (
                    <div
                        className="flex items-center gap-3 rounded-lg border px-4 py-3"
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-background-elevated)",
                        }}
                    >
                        <Info className="h-5 w-5" style={{ color: "var(--color-text-tertiary)" }} />
                        <p
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            No verification badge packages are currently available. You can skip this step and
                            add a badge later.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {verifyPackages.map((badge) => (
                            <BadgeCard
                                key={`verify-${badge.id}`}
                                badge={badge}
                                badgeType="verify"
                                selected={String(verifySelection) === String(badge.id)}
                                onSelect={() => {
                                    setVerifySelection((current) =>
                                        String(current) === String(badge.id) ? "" : badge.id
                                    );
                                }}
                            />
                        ))}
                    </div>
                )}
                </Card>

                {/* Sponsored Badge Section */}
                <Card className="space-y-6">
                <div className="flex items-start gap-4">
                    <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: "var(--color-primary-light)" }}
                    >
                        <Sparkles className="h-6 w-6" style={{ color: "var(--color-primary)" }} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h2
                                className="text-xl font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Sponsored Badge
                            </h2>
                            <Badge variant="neutral" size="sm">
                                Optional
                            </Badge>
                        </div>
                        <p
                            className="mt-2 mb-6 text-sm leading-relaxed"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Get featured placement and increased visibility. Sponsored businesses stay
                            prominently displayed for the duration of your chosen package.
                        </p>
                    </div>
                </div>

                {loading && sponsorPackages.length === 0 ? (
                    <div className="space-y-4">
                        {[...Array(2)].map((_, index) => (
                            <Card
                                key={index}
                                className="h-64 w-full animate-pulse"
                                style={{ backgroundColor: "var(--color-background-elevated)" }}
                            />
                        ))}
                    </div>
                ) : sponsorPackages.length === 0 ? (
                    <div
                        className="flex items-center gap-3 rounded-lg border px-4 py-3"
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-background-elevated)",
                        }}
                    >
                        <Info className="h-5 w-5" style={{ color: "var(--color-text-tertiary)" }} />
                        <p
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            No sponsored badge packages are currently available. You can skip this step and
                            add a badge later.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sponsorPackages.map((badge) => (
                            <BadgeCard
                                key={`sponsor-${badge.id}`}
                                badge={badge}
                                badgeType="sponsor"
                                selected={String(sponsorSelection) === String(badge.id)}
                                onSelect={() => {
                                    setSponsorSelection((current) =>
                                        String(current) === String(badge.id) ? "" : badge.id
                                    );
                                }}
                            />
                        ))}
                    </div>
                )}
                </Card>
            </div>

            {/* Error Message */}
            {purchaseError && (
                <div
                    className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
                    style={{
                        borderColor: "var(--color-error)",
                        backgroundColor: "var(--color-error-surface)",
                        color: "var(--color-error)",
                    }}
                >
                    <X className="h-5 w-5" />
                    {purchaseError}
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <Button variant="secondary" onClick={() => dispatch(prevBusinessWizardStep())}>
                    Back
                </Button>
                <div className="flex items-center gap-3">
                    {!hasSelection && (
                        <span
                            className="text-sm"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            You can skip badges and add them later
                        </span>
                    )}
                    <Button onClick={handleSubmit} variant="primary">
                        {hasSelection ? "Continue with Selected Badges" : "Skip Badges & Continue"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
