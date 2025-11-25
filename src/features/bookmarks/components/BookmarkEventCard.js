'use client';

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/common/Badge";

const buildImageUrl = (path, image) => {
    if (!image) {
        return null;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const normalizedPath = path ? `${path}${path.endsWith('/') ? '' : '/'}` : "";

    return `${base}${normalizedPath}${image}`;
};

export const BookmarkEventCard = ({ event, onToggle, isToggling = false }) => {
    if (!event) {
        return null;
    }

    const imageUrl = buildImageUrl(event.path, event.image);
    const eventUrl = `/event/${event.slug}`;

    return (
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)]">
            <div className="relative w-full sm:w-48 h-48 rounded-lg overflow-hidden bg-[var(--color-background-tertiary)]">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={event.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 12rem"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-tertiary)]">
                        No image
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                        <Link
                            href={eventUrl}
                            className="text-base font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                        >
                            {event.title}
                        </Link>

                        <button
                            type="button"
                            onClick={() => onToggle?.(event.id)}
                            disabled={isToggling}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                                event.bookmarked
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary)]'
                            } ${isToggling ? 'opacity-70 cursor-wait' : ''}`}
                            aria-label={event.bookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
                        >
                            <Star className="h-4 w-4" fill={event.bookmarked ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-[var(--color-text-secondary)]">
                        {event.categoryName && (
                            <Badge size="sm" variant="neutral">
                                {event.categoryName}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid gap-2 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                        <span>{event.eventDate || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                        <span>{event.eventTime || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                        <span>{event.city || "—"}</span>
                    </div>
                </div>

                {event.bookmarked && (
                    <div className="mt-auto text-xs uppercase tracking-wide text-[var(--color-primary)]">
                        Saved
                    </div>
                )}
            </div>
        </div>
    );
};


