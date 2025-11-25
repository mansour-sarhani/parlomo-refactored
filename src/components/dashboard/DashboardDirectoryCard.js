"use client";

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

const formatRating = (rate) => {
    if (!rate) return "—";
    const numeric = parseFloat(rate);
    if (isNaN(numeric)) {
        return rate;
    }
    return `${numeric.toFixed(1)} / 5`;
};

export const DashboardDirectoryCard = ({ directory }) => {
    if (!directory) {
        return null;
    }

    const imageUrl = buildImageUrl(directory.path, directory.image);
    const isPending =
        directory.status === "Pending" || directory.status === "PaymentPending";
    const directoryUrl = isPending ? "#" : `/directory/${directory.slug}`;

    return (
        <Link
            href={directoryUrl}
            className={`group flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] transition-all hover:shadow-md ${
                isPending ? "cursor-not-allowed opacity-70" : ""
            }`}
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-background-tertiary)]">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={directory.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-tertiary)]">
                        No image
                    </div>
                )}
                <div className="absolute left-2 top-2 flex flex-wrap gap-2">
                    {directory.isVerifiedBusiness && (
                        <Badge size="sm" variant="success">
                            Verified
                        </Badge>
                    )}
                    {directory.isSponsored && (
                        <Badge size="sm" variant="info">
                            Sponsored
                        </Badge>
                    )}
                    {isPending && (
                        <Badge size="sm" variant="warning">
                            {directory.status === "PaymentPending" ? "Payment Pending" : "Pending"}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
                <h3
                    className={`line-clamp-2 text-base font-semibold text-[var(--color-text-primary)] ${
                        !isPending ? "group-hover:text-[var(--color-primary)]" : ""
                    }`}
                >
                    {directory.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    {directory.categoryName && (
                        <span className="font-medium">{directory.categoryName}</span>
                    )}
                    {directory.city && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
                            <span>{directory.city}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                        <Clock className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
                        <span>{directory.createdAtHuman || "—"}</span>
                    </div>
                    {directory.rate && (
                        <div className="flex items-center gap-1 text-[var(--color-text-primary)]">
                            <Star className="h-3.5 w-3.5 fill-[var(--color-primary)] text-[var(--color-primary)]" />
                            <span className="font-medium">{formatRating(directory.rate)}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

