'use client';

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Star } from "lucide-react";
import { Badge } from "@/components/common/Badge";

const buildImageUrl = (path, imageArray = []) => {
    if (!imageArray || imageArray.length === 0) {
        return null;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const normalizedPath = path ? `${path}${path.endsWith('/') ? '' : '/'}` : "";

    return `${base}${normalizedPath}${imageArray[0]}`;
};

export const BookmarkAdCard = ({ ad, onToggle, isToggling = false }) => {
    if (!ad) {
        return null;
    }

    const imageUrl = buildImageUrl(ad.path, ad.image);
    const isPending = ad.status === "Wait";
    const adUrl = isPending ? "#" : `/ad/${ad.slug}`;

    return (
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)]">
            <div className="relative w-full sm:w-48 h-48 rounded-lg overflow-hidden bg-[var(--color-background-tertiary)]">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={ad.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 12rem"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-tertiary)]">
                        No image
                    </div>
                )}
                {isPending && (
                    <div className="absolute left-2 top-2">
                        <Badge size="sm" variant="warning">
                            Pending
                        </Badge>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                        <Link
                            href={adUrl}
                            className={`text-base font-semibold text-[var(--color-text-primary)] ${
                                isPending ? 'cursor-not-allowed opacity-70' : 'hover:text-[var(--color-primary)]'
                            }`}
                        >
                            {ad.title}
                        </Link>

                        <button
                            type="button"
                            onClick={() => onToggle?.(ad.id)}
                            disabled={isToggling}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                                ad.bookmarked
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary)]'
                            } ${isToggling ? 'opacity-70 cursor-wait' : ''}`}
                            aria-label={ad.bookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
                        >
                            <Star className="h-4 w-4" fill={ad.bookmarked ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <div className="text-sm text-[var(--color-text-secondary)]">
                        <span className="font-medium text-[var(--color-text-primary)]">{ad.classifiedAdType}</span>
                        {ad.categoryName && <span> · {ad.categoryName}</span>}
                    </div>
                </div>

            <div className="grid gap-2 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                        <span>{ad.city || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                        <span>{ad.createdAtHuman || "—"}</span>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between text-sm font-medium">
                    <span className="text-[var(--color-primary)]">
                        {ad.price === "0.00" ? ad.quoteText || "Get a quote" : `£${ad.price}`}
                    </span>
                    {ad.bookmarked && (
                        <span className="text-xs uppercase tracking-wide text-[var(--color-primary)]">
                            Saved
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};


