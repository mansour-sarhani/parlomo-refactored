"use client";

import Image from "next/image";
import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableCell,
    TableBody,
} from "@/components/tables";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";

const baseAssetUrl = process.env.NEXT_PUBLIC_URL_KEY || "";

const buildImageUrl = (listing) => {
    if (!listing) {
        return null;
    }

    const firstImage =
        (Array.isArray(listing.image) && listing.image.length > 0 && listing.image[0]) ||
        listing.image ||
        (Array.isArray(listing.images) && listing.images.length > 0 && listing.images[0]) ||
        listing.logo ||
        null;

    if (!firstImage) {
        return null;
    }

    if (typeof firstImage === "string" && firstImage.startsWith("http")) {
        return firstImage;
    }

    const path = listing.path ? `${listing.path.replace(/\/+$/, "")}/` : "";
    return `${baseAssetUrl}${path}${firstImage}`;
};

const StatusBadge = ({ status }) => {
    if (!status) {
        return (
            <Badge variant="secondary" size="sm">
                Unknown
            </Badge>
        );
    }

    const normalized = String(status).toLowerCase();
    let variant = "secondary";

    if (normalized.includes("active")) {
        variant = "success";
    } else if (normalized.includes("pending")) {
        variant = "warning";
    } else if (normalized.includes("suspend") || normalized.includes("reject")) {
        variant = "danger";
    }

    return (
        <Badge variant={variant} size="sm">
            {status}
        </Badge>
    );
};

const VerifiedBadge = ({ listing }) => {
    if (!listing?.isVerifiedBusiness) {
        return null;
    }
    return (
        <Badge variant="success" size="sm">
            Verified
        </Badge>
    );
};

const SponsoredBadge = ({ listing }) => {
    if (!listing?.isSponsored) {
        return null;
    }

    return (
        <Badge variant="primary" size="sm">
            Sponsored until {listing.validDate || "—"}
        </Badge>
    );
};

export function BusinessListingTable({
    listings,
    onView,
    onEdit,
    onChangeOwner,
}) {
    if (!Array.isArray(listings) || listings.length === 0) {
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell width="70px">ID</TableHeaderCell>
                    <TableHeaderCell width="120px" align="center">
                        Business
                    </TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Owner</TableHeaderCell>
                    <TableHeaderCell>Badges</TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                    <TableHeaderCell width="140px" align="center">
                        Status
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {listings.map((listing) => {
                    const imageUrl = buildImageUrl(listing);

                    return (
                        <TableRow key={listing.id}>
                            <TableCell>
                                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                                    {listing.id}
                                </span>
                            </TableCell>
                            <TableCell align="center">
                                {imageUrl ? (
                                    <div
                                        className="relative w-16 h-16 overflow-hidden rounded-lg border mx-auto"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <Image
                                            src={imageUrl}
                                            alt={listing.title || "Business image"}
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center justify-center w-16 h-16 rounded-lg border mx-auto text-[10px] uppercase tracking-wide"
                                        style={{
                                            borderColor: "var(--color-border)",
                                            color: "var(--color-text-tertiary)",
                                            backgroundColor: "var(--color-background-elevated)",
                                        }}
                                    >
                                        No Image
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <span
                                        className="font-medium"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        {listing.title || "Untitled"}
                                    </span>
                                    <div className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                                        {listing.address || listing.location || "—"}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                    <div>{listing.user || listing.owner || "—"}</div>
                                    {listing.ownerEmail && (
                                        <div className="text-xs">{listing.ownerEmail}</div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-2">
                                    <VerifiedBadge listing={listing} />
                                    <SponsoredBadge listing={listing} />
                                </div>
                            </TableCell>
                            <TableCell>
                                <span style={{ color: "var(--color-text-secondary)" }}>
                                    {listing.categoryName || listing.category || "—"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onView?.(listing)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit?.(listing)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => onChangeOwner?.(listing)}
                                    >
                                        Change Owner
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell align="center">
                                <StatusBadge status={listing.status} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

export default BusinessListingTable;


