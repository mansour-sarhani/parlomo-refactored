"use client";

import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";

const buildPackageMediaUrl = (pack) => {
    if (!pack?.image) {
        return null;
    }

    if (typeof pack.image === "string" && pack.image.startsWith("http")) {
        return pack.image;
    }

    const base = (process.env.NEXT_PUBLIC_URL_KEY || "").replace(/\/+$/, "");
    const path = pack.path ? `/${String(pack.path).replace(/^\/+/, "").replace(/\/+$/, "")}` : "";

    return `${base}${path}${path ? "/" : ""}${pack.image}`;
};

const formatPrice = (value) => {
    if (value === undefined || value === null || value === "") {
        return "—";
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return value;
    }

    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        minimumFractionDigits: 2,
    }).format(numeric);
};

const formatSocialPrice = (value) => {
    if (value === undefined || value === null) {
        return "—";
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return value;
    }

    if (numeric === 0) {
        return "Free";
    }

    return formatPrice(numeric);
};

export function AdvertisingPackageSelectionStep({
    packages = [],
    loading,
    error,
    selectedPackageId,
    selectedPackage,
    includeSocialMedia,
    onSelectPackage,
    onToggleSocialMedia,
    onBack,
    onContinue,
    selectionError,
}) {
    const isVideoPlacement = (selectedPackage?.typeTitle || selectedPackage?.type || "")
        .toLowerCase()
        .includes("video");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2
                        className="text-xl font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Select an Advertising Package
                    </h2>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Compare duration, placement details, and pricing to choose the best option
                        for your campaign.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: "var(--color-text-tertiary)" }}>
                        Need help choosing?
                    </span>
                    <Button
                        variant="link"
                        size="sm"
                        onClick={() => window.open("mailto:support@parlomo.co.uk", "_blank")}
                    >
                        Contact support
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(4)].map((_, index) => (
                        <Card
                            key={index}
                            className="h-44 animate-pulse"
                            style={{ backgroundColor: "var(--color-background-elevated)" }}
                        />
                    ))}
                </div>
            ) : error ? (
                <div
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
                >
                    {error}
                </div>
            ) : !Array.isArray(packages) || packages.length === 0 ? (
                <Card>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        There are no packages configured for this placement yet. Please choose a
                        different placement or try again later.
                    </p>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {packages.map((pack) => {
                        const isSelected = String(selectedPackageId) === String(pack.id);
                        const mediaUrl = buildPackageMediaUrl(pack);
                        const isVideo = (pack.typeTitle || pack.type || "")
                            .toLowerCase()
                            .includes("video");

                        return (
                            <Card
                                key={pack.id}
                                className={`flex h-full cursor-pointer flex-col gap-4 border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                                    isSelected ? "ring-2 ring-[var(--color-primary)]" : ""
                                }`}
                                style={{
                                    borderColor: isSelected
                                        ? "var(--color-primary)"
                                        : "var(--color-border)",
                                }}
                                role="button"
                                tabIndex={0}
                                onClick={() => onSelectPackage?.(pack.id)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        onSelectPackage?.(pack.id);
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <h3
                                            className="text-lg font-semibold"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            {pack.title}
                                        </h3>
                                        <p
                                            className="text-sm font-medium"
                                            style={{ color: "var(--color-primary)" }}
                                        >
                                            {formatPrice(pack.price)}
                                        </p>
                                    </div>
                                    {mediaUrl ? (
                                        <div
                                            className="relative h-16 w-20 overflow-hidden rounded-lg border"
                                            style={{ borderColor: "var(--color-border)" }}
                                        >
                                            <img
                                                src={mediaUrl}
                                                alt={pack.title}
                                                className="h-full w-full object-cover"
                                            />
                                            {isVideo ? (
                                                <span
                                                    className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[10px] font-semibold uppercase text-white"
                                                >
                                                    Video
                                                </span>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </div>

                                <dl className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <dt style={{ color: "var(--color-text-tertiary)" }}>Placement</dt>
                                        <dd
                                            className="font-medium"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            {pack.typeTitle || pack.type || "—"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt style={{ color: "var(--color-text-tertiary)" }}>Duration</dt>
                                        <dd
                                            className="font-medium"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            {pack.days ?? 0} days
                                        </dd>
                                    </div>
                                    <div>
                                        <dt style={{ color: "var(--color-text-tertiary)" }}>Social add-on</dt>
                                        <dd
                                            className="font-medium"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            {formatSocialPrice(pack.socialMedia)}
                                        </dd>
                                    </div>
                                </dl>

                                {pack.description ? (
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        {pack.description}
                                    </p>
                                ) : null}

                                <div className="mt-auto flex justify-end">
                                    <Button
                                        variant={isSelected ? "primary" : "secondary"}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onSelectPackage?.(pack.id);
                                        }}
                                    >
                                        {isSelected ? "Selected" : "Select"}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {selectedPackage ? (
                <Card className="border bg-[var(--color-background-elevated)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3
                                className="text-sm font-semibold uppercase"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Package Summary
                            </h3>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {selectedPackage.title} · {selectedPackage.days ?? 0} days · {formatPrice(selectedPackage.price)}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <label
                                className="flex cursor-pointer items-center gap-2 text-sm"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded"
                                    checked={Boolean(includeSocialMedia)}
                                    onChange={(event) => onToggleSocialMedia?.(event.target.checked)}
                                />
                                <span>
                                    Add social media promotion ({formatSocialPrice(selectedPackage.socialMedia)})
                                </span>
                            </label>
                        </div>
                    </div>
                </Card>
            ) : null}

            {selectionError ? (
                <p className="text-sm" style={{ color: "var(--color-error)" }}>
                    {selectionError}
                </p>
            ) : null}

            <div className="flex justify-between">
                <Button variant="secondary" onClick={onBack}>
                    Back
                </Button>
                <Button onClick={onContinue} disabled={!selectedPackageId}>
                    Continue
                </Button>
            </div>
        </div>
    );
}

export default AdvertisingPackageSelectionStep;
