"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/common/Badge";

const buildImageUrl = (path, imageArray = []) => {
    if (!imageArray || imageArray.length === 0) {
        return null;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const normalizedPath = path ? `${path}${path.endsWith('/') ? '' : '/'}` : "";

    return `${base}${normalizedPath}${imageArray[0]}`;
};

export const DashboardAdCard = ({ ad }) => {
    if (!ad) {
        return null;
    }

    const imageUrl = buildImageUrl(ad.path, ad.image);
    const isPending = ad.status === "Wait";
    const adUrl = isPending ? "#" : `/ad/${ad.slug}`;

    return (
        <Link
            href={adUrl}
            className={`group flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] transition-all hover:shadow-md ${
                isPending ? "cursor-not-allowed opacity-70" : ""
            }`}
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-background-tertiary)]">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={ad.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105"
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

            <div className="flex flex-1 flex-col gap-2 p-4">
                <h3
                    className={`line-clamp-2 text-base font-semibold text-[var(--color-text-primary)] ${
                        !isPending ? "group-hover:text-[var(--color-primary)]" : ""
                    }`}
                >
                    {ad.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    {ad.classifiedAdType && (
                        <span className="font-medium">{ad.classifiedAdType}</span>
                    )}
                    {ad.categoryName && <span>· {ad.categoryName}</span>}
                    {ad.city && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
                            <span>{ad.city}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                        <Clock className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
                        <span>{ad.createdAtHuman || "—"}</span>
                    </div>
                    <div className="font-semibold text-[var(--color-primary)]">
                        {ad.price === "0.00" ? ad.quoteText || "Get a quote" : `£${ad.price}`}
                    </div>
                </div>
            </div>
        </Link>
    );
};

