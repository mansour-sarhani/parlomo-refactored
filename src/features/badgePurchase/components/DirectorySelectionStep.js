"use client";

import Image from "next/image";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

export function DirectorySelectionStep({
    directories,
    selectedDirectoryId,
    onSelect,
    onBack,
    onContinue,
    loading,
    error,
}) {
    const handleSelect = (directoryId) => {
        onSelect?.(directoryId);
    };

    const buildAssetUrl = (item) => {
        if (!item?.image) {
            return null;
        }

        if (typeof item.image === "string" && item.image.startsWith("http")) {
            return item.image;
        }

        const base = (process.env.NEXT_PUBLIC_URL_KEY || "").replace(/\/+$/, "");
        const path = item.path
            ? `/${String(item.path).replace(/^\/+/, "").replace(/\/+$/, "")}`
            : "";

        return `${base}${path}${path ? "/" : ""}${item.image}`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2
                    className="text-xl font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Choose a Directory
                </h2>
                <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Select which directory should receive this badge. Only
                    directories you manage appear here.
                </p>
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(4)].map((_, index) => (
                        <Card
                            key={index}
                            className="h-36 animate-pulse"
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
            ) : directories.length === 0 ? (
                <Card>
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        We couldn’t find any directories associated with your
                        account. Create a directory first, then return to assign
                        a badge.
                    </p>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {directories.map((directory) => {
                        const isSelected = selectedDirectoryId === directory.id;
        const imageUrl = buildAssetUrl(directory);

                        return (
                            <Card
                                key={directory.id}
                                className={`flex flex-col gap-3 border transition ${
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
                                            {directory.title}
                                        </h3>
                                        {directory.public_id && (
                                            <p
                                                className="text-xs uppercase tracking-wide"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                {directory.public_id}
                                            </p>
                                        )}
                                    </div>
                                    {directory.image && (
                                        <div className="relative h-16 w-16 overflow-hidden rounded-lg border">
                                            <Image
                                                src={imageUrl}
                                                alt={directory.title}
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
                                            Status
                                        </dt>
                                        <dd
                                            className="font-medium"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {directory.status || "Unknown"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Category
                                        </dt>
                                        <dd
                                            className="font-medium"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {directory.category?.title ?? "—"}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-auto flex justify-end">
                                    <Button
                                        variant={isSelected ? "primary" : "secondary"}
                                        onClick={() => handleSelect(directory.id)}
                                    >
                                        {isSelected ? "Selected" : "Select"}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <div className="flex justify-between">
                <Button variant="secondary" onClick={onBack}>
                    Back
                </Button>
                <Button onClick={onContinue} disabled={!selectedDirectoryId}>
                    Continue
                </Button>
            </div>
        </div>
    );
}

export default DirectorySelectionStep;


