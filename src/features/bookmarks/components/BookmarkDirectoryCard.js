'use client';

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Star, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/common/Badge";

const buildImageUrl = (path, imageArray = []) => {
    if (!imageArray || imageArray.length === 0) {
        return null;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const normalizedPath = path ? `${path}${path.endsWith('/') ? '' : '/'}` : "";

    return `${base}${normalizedPath}${imageArray[0]}`;
};

const formatRating = (rate) => {
    if (rate === null || rate === undefined) {
        return "No ratings yet";
    }

    const numeric = Number(rate);
    if (Number.isNaN(numeric)) {
        return rate;
    }

    return `${numeric.toFixed(1)} / 5`;
};

export const BookmarkDirectoryCard = ({ directory, onToggle, isToggling = false }) => {
    if (!directory) {
        return null;
    }

    const imageUrl = buildImageUrl(directory.path, directory.image);
    const isPending =
        directory.status === "Pending" || directory.status === "PaymentPending";
    const directoryUrl = isPending ? "#" : `/directory/${directory.slug}`;

    return (
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)]">
            <div className="relative w-full sm:w-48 h-48 rounded-lg overflow-hidden bg-[var(--color-background-tertiary)]">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={directory.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 12rem"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-tertiary)]">
                        No image
                    </div>
                )}
                <div className="absolute left-2 top-2 flex flex-wrap gap-2">
                    {directory.isVerifiedBusiness && (
                        <Badge size="sm" variant="info">
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5" /> Verified
                            </span>
                        </Badge>
                    )}
                    {directory.isSponsored && (
                        <Badge size="sm" variant="primary">
                            <span className="flex items-center gap-1">
                                <Sparkles className="h-3.5 w-3.5" /> Sponsored
                            </span>
                        </Badge>
                    )}
                    {isPending && (
                        <Badge size="sm" variant="warning">
                            {directory.status === "PaymentPending" ? "Pending Payment" : "Pending"}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                        <Link
                            href={directoryUrl}
                            className={`text-base font-semibold text-[var(--color-text-primary)] ${
                                isPending ? 'cursor-not-allowed opacity-70' : 'hover:text-[var(--color-primary)]'
                            }`}
                        >
                            {directory.title}
                        </Link>

                        <button
                            type="button"
                            onClick={() => onToggle?.(directory.id)}
                            disabled={isToggling}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                                directory.bookmarked
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary)]'
                            } ${isToggling ? 'opacity-70 cursor-wait' : ''}`}
                            aria-label={directory.bookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
                        >
                            <Star className="h-4 w-4" fill={directory.bookmarked ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <div className="text-sm text-[var(--color-text-secondary)]">
                        <span className="font-medium text-[var(--color-text-primary)]">Category:</span>
                        {" "}
                        {directory.categoryName || "—"}
                    </div>
                </div>

                <div className="grid gap-2 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                        <span>{directory.city || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                        <span>{directory.createdAtHuman || "—"}</span>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between text-sm font-medium text-[var(--color-text-secondary)]">
                    <span>Rating: <span className="text-[var(--color-text-primary)]">{formatRating(directory.rate)}</span></span>
                    {directory.bookmarked && (
                        <span className="text-xs uppercase tracking-wide text-[var(--color-primary)]">
                            Saved
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};


