"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { Badge, StatusBadge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";

const buildImageUrls = (event) => {
    if (!event) return [];

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const path = event.path ? `${event.path.replace(/\/+$/, "")}/` : "";

    if (Array.isArray(event.image) && event.image.length > 0) {
        return event.image.map((img) =>
            img.startsWith("http") ? img : `${base}${path}${img}`
        );
    }

    if (typeof event.image === "string" && event.image.length > 0) {
        return [event.image.startsWith("http") ? event.image : `${base}${path}${event.image}`];
    }

    return [];
};

const formatLink = (value) => {
    if (!value) return null;
    return value.startsWith("http") ? value : `https://${value}`;
};

const InfoChip = ({ label, value }) => (
    <div className="space-y-1">
        <span className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
            {label}
        </span>
        <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>
            {value || "-"}
        </p>
    </div>
);

export function EventDetailView({ event }) {
    const [previewImage, setPreviewImage] = useState(null);

    const images = useMemo(() => buildImageUrls(event), [event]);
    const primaryImage = images[0];
    const secondaryImages = images.slice(1);

    if (!event) {
        return null;
    }

    const links = [
        { label: "Website", value: event.siteLink },
        { label: "Social", value: event.socialMediaLink },
        { label: "YouTube", value: event.youtubeLink },
    ];

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden">
                <div className="relative h-64 w-full md:h-80">
                    {primaryImage ? (
                        <Image
                            src={primaryImage}
                            alt={event.title || "Event cover"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 850px"
                        />
                    ) : (
                        <div
                            className="flex h-full w-full items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, var(--color-secondary), var(--color-background))",
                                color: "var(--color-text-tertiary)",
                            }}
                        >
                            No cover image
                        </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(0,0,0,0.6)] to-transparent p-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <StatusBadge status={event.status || "unknown"} />
                            {event.categoryName && (
                                <Badge>{event.categoryName}</Badge>
                            )}
                            {event.showMap && (
                                <Badge variant="outline">Shown on map</Badge>
                            )}
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">
                            {event.title || "Untitled event"}
                        </h2>
                    </div>
                </div>

                    {secondaryImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] bg-[var(--color-background)] p-4 md:grid-cols-4">
                        {secondaryImages.slice(0, 4).map((url, index) => (
                            <button
                                key={`${url}-${index}`}
                                type="button"
                                onClick={() => setPreviewImage(url)}
                                className="relative h-20 overflow-hidden rounded-lg"
                                style={{ border: "1px solid var(--color-border)" }}
                            >
                                <Image
                                    src={url}
                                    alt={event.title || "Event gallery image"}
                                    fill
                                    sizes="140px"
                                    className="object-cover"
                                />
                            </button>
                        ))}
                        {secondaryImages.length > 4 && (
                            <div className="flex items-center justify-center rounded-lg border text-xs"
                                style={{
                                    borderColor: "var(--color-border)",
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                +{secondaryImages.length - 4} more
                            </div>
                        )}
                    </div>
                )}
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
                <Card className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <InfoChip label="Event ID" value={event.id} />
                        <InfoChip label="Created" value={event.createdAtHuman} />
                        <InfoChip label="Event Date" value={event.eventDate} />
                        <InfoChip label="Valid Until" value={event.validDate} />
                        <InfoChip label="Event Time" value={event.eventTime} />
                        <InfoChip label="City" value={event.city} />
                        <InfoChip label="Country" value={event.country} />
                        <InfoChip label="Postcode" value={event.postcode} />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            Description
                        </h3>
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            {event.description || "No description provided."}
                        </p>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="space-y-4">
                        <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            Contact & Links
                        </h3>
                        <div className="space-y-3">
                            <InfoChip label="Contact Number" value={event.contactNumber} />
                            <InfoChip label="Email" value={event.email} />

                            {links.map(({ label, value }) => {
                                const href = formatLink(value);
                                if (!href) return null;

                                return (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm font-medium"
                                        style={{ color: "var(--color-primary)" }}
                                    >
                                        <ExternalLink size={16} />
                                        {label}
                                    </a>
                                );
                            })}
                        </div>
                    </Card>

                    <Card className="space-y-4">
                        <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            Organizer
                        </h3>
                        <div className="flex flex-col gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            <span><strong>Owner:</strong> {event.user || "Unknown"}</span>
                            <span><strong>Status:</strong> {event.status || "Unknown"}</span>
                            <span><strong>Visibility:</strong> {event.showMap ? "Displayed on map" : "Hidden from map"}</span>
                        </div>
                    </Card>

                    {event.postcode && (
                        <Card className="space-y-3">
                            <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                Location
                            </h3>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                {event.address || `${event.postcode} ${event.city || ""}`}
                            </p>
                            {event.showMap && (
                                <Button
                                    variant="secondary"
                                    icon={<ExternalLink size={16} />}
                                    onClick={() => {
                                        if (typeof window === "undefined") return;
                                        const query = encodeURIComponent(`${event.postcode} ${event.city || ""}`);
                                        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
                                    }}
                                >
                                    View on map
                                </Button>
                            )}
                        </Card>
                    )}
                </div>
            </div>

            <Card className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Gallery
                    </h3>
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {images.length} image{images.length === 1 ? "" : "s"}
                    </span>
                </div>

                {images.length === 0 ? (
                    <div
                        className="flex items-center justify-center w-full rounded-lg border py-8 text-sm"
                        style={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-tertiary)",
                            backgroundColor: "var(--color-background-elevated)",
                        }}
                    >
                        No images available
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((url, index) => (
                            <button
                                type="button"
                                key={`${url}-${index}`}
                                onClick={() => setPreviewImage(url)}
                                className="relative w-full overflow-hidden rounded-lg"
                                style={{
                                    border: "1px solid var(--color-border)",
                                    paddingBottom: "60%",
                                }}
                            >
                                <Image
                                    src={url}
                                    alt={event.title || "Event image"}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 300px"
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </Card>

            {previewImage && (
                <Modal
                    isOpen={Boolean(previewImage)}
                    onClose={() => setPreviewImage(null)}
                    title={event.title || "Event image"}
                    size="lg"
                >
                    <div className="relative w-full h-[400px]">
                        <Image
                            src={previewImage}
                            alt={event.title || "Event image"}
                            fill
                            sizes="(max-width: 768px) 100vw, 800px"
                            className="object-contain"
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default EventDetailView;

