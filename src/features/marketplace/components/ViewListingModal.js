"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Loader } from "@/components/common/Loader";
import { adListingsService } from "@/services/marketplace";
import { toast } from "sonner";

const buildImageUrls = (listing) => {
    if (!listing) return [];
    
    const base = (process.env.NEXT_PUBLIC_URL_KEY || process.env.NEXT_PUBLIC_ASSET_BASE_URL || "").replace(/\/+$/, "");
    const normalizedPath = listing.path ? `${listing.path.replace(/\/+$/, "")}/` : "";
    
    const images = Array.isArray(listing.image) ? listing.image : listing.image ? [listing.image] : [];
    
    return images.map((img) => {
        if (typeof img === "string" && img.startsWith("http")) {
            return img;
        }
        return `${base}${normalizedPath}${img}`;
    });
};

const StatusBadge = ({ status }) => {
    const label = status || "Pending review";
    const normalized = String(status || "").toLowerCase();

    let variant = "warning";
    if (normalized.includes("active")) {
        variant = "success";
    } else if (normalized.includes("reject") || normalized.includes("suspend")) {
        variant = "danger";
    }

    return (
        <Badge variant={variant} size="sm">
            {label}
        </Badge>
    );
};

export function ViewListingModal({ listingId, isOpen, onClose, onEdit }) {
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && listingId) {
            setLoading(true);
            setError(null);
            adListingsService
                .fetchUserListingById(listingId)
                .then((response) => {
                    setListing(response.data);
                })
                .catch((err) => {
                    setError(err?.message || "Failed to load listing details");
                    toast.error("Failed to load listing details");
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setListing(null);
            setError(null);
        }
    }, [isOpen, listingId]);

    const handleEdit = () => {
        if (listing?.id) {
            onClose();
            onEdit?.(listing);
        }
    };

    const imageUrls = listing ? buildImageUrls(listing) : [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Listing Details"
            size="xl"
            footer={
                <div className="flex items-center justify-between w-full">
                    <StatusBadge status={listing?.status} />
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose}>
                            Close
                        </Button>
                        {listing?.id && (
                            <Button onClick={handleEdit}>
                                Edit Listing
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader />
                </div>
            ) : error ? (
                <div className="py-12 text-center space-y-4">
                    <p style={{ color: "var(--color-error)" }}>{error}</p>
                    <Button onClick={onClose}>Close</Button>
                </div>
            ) : listing ? (
                <div className="space-y-6">
                    {/* Images */}
                    {imageUrls.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
                                Images
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {imageUrls.map((url, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square overflow-hidden rounded-lg border"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <Image
                                            src={url}
                                            alt={`${listing.title || "Listing"} - Image ${index + 1}`}
                                            fill
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                Title
                            </label>
                            <p className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                {listing.title || "—"}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                Listing ID
                            </label>
                            <p className="text-base" style={{ color: "var(--color-text-primary)" }}>
                                #{listing.id}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                Type
                            </label>
                            <p className="text-base" style={{ color: "var(--color-text-primary)" }}>
                                {listing.type_title || listing.type?.title || listing.classifiedAdType || "—"}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                Category
                            </label>
                            <p className="text-base" style={{ color: "var(--color-text-primary)" }}>
                                {listing.category_title || listing.category?.title || listing.categoryName || listing.category || "—"}
                            </p>
                        </div>
                        {listing.postcode && (
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                    Postcode
                                </label>
                                <p className="text-base" style={{ color: "var(--color-text-primary)" }}>
                                    {listing.postcode}
                                </p>
                            </div>
                        )}
                        {listing.price && (
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                    Price
                                </label>
                                <p className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                    £{listing.price}
                                </p>
                            </div>
                        )}
                        {listing.valid_date && (
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                    Valid Until
                                </label>
                                <p className="text-base" style={{ color: "var(--color-text-primary)" }}>
                                    {listing.valid_date}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {listing.description && (
                        <div>
                            <label className="text-xs font-medium uppercase tracking-wide mb-2 block" style={{ color: "var(--color-text-secondary)" }}>
                                Description
                            </label>
                            <div
                                className="text-base whitespace-pre-wrap rounded-lg border p-4"
                                style={{
                                    borderColor: "var(--color-border)",
                                    backgroundColor: "var(--color-background-elevated)",
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {listing.description}
                            </div>
                        </div>
                    )}

                    {/* Contact Information */}
                    {(listing.contact_number || listing.mobile || listing.email || listing.site_link || listing.website || listing.youtube_link || listing.youtube || listing.social_media_link || listing.social_media) && (
                        <div>
                            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
                                Contact Information
                            </h3>
                            <div className="grid gap-3 md:grid-cols-2">
                                {listing.contact_number || listing.mobile ? (
                                    <div>
                                        <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                            Phone
                                        </label>
                                        <p className="text-base" style={{ color: "var(--color-text-primary)" }}>
                                            {listing.contact_number || listing.mobile}
                                        </p>
                                    </div>
                                ) : null}
                                {listing.email && (
                                    <div>
                                        <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                            Email
                                        </label>
                                        <p className="text-base" style={{ color: "var(--color-text-primary)" }}>
                                            <a
                                                href={`mailto:${listing.email}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {listing.email}
                                            </a>
                                        </p>
                                    </div>
                                )}
                                {listing.site_link || listing.website ? (
                                    <div>
                                        <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                            Website
                                        </label>
                                        <p className="text-base" style={{ color: "var(--color-text-primary)" }}>
                                            <a
                                                href={listing.site_link || listing.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {listing.site_link || listing.website}
                                            </a>
                                        </p>
                                    </div>
                                ) : null}
                                {listing.youtube_link || listing.youtube ? (
                                    <div>
                                        <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                            YouTube
                                        </label>
                                        <p className="text-base" style={{ color: "var(--color-text-primary)" }}>
                                            <a
                                                href={listing.youtube_link || listing.youtube}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {listing.youtube_link || listing.youtube}
                                            </a>
                                        </p>
                                    </div>
                                ) : null}
                                {listing.social_media_link || listing.social_media ? (
                                    <div>
                                        <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                            Social Media
                                        </label>
                                        <p className="text-base" style={{ color: "var(--color-text-primary)" }}>
                                            <a
                                                href={listing.social_media_link || listing.social_media}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {listing.social_media_link || listing.social_media}
                                            </a>
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}

                    {/* Event Details */}
                    {(listing.event_date || listing.event_time) && (
                        <div>
                            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
                                Event Details
                            </h3>
                            <div className="grid gap-3 md:grid-cols-2">
                                {listing.event_date && (
                                    <div>
                                        <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                            Event Date
                                        </label>
                                        <p className="text-base" style={{ color: "var(--color-text-primary)" }}>
                                            {listing.event_date}
                                        </p>
                                    </div>
                                )}
                                {listing.event_time && (
                                    <div>
                                        <label className="text-xs font-medium uppercase tracking-wide mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                            Event Time
                                        </label>
                                        <p className="text-base" style={{ color: "var(--color-text-primary)" }}>
                                            {listing.event_time}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </Modal>
    );
}

export default ViewListingModal;

