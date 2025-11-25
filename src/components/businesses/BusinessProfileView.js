"use client";

import Image from "next/image";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { BusinessListingChangeOwnerModal } from "@/features/businesses";
import { useMemo, useState } from "react";

const baseAssetUrl = (process.env.NEXT_PUBLIC_URL_KEY || "").replace(/\/+$/, "");

const buildAssetUrl = (path, asset) => {
    if (!asset) return null;
    if (typeof asset === "string" && asset.startsWith("http")) {
        return asset;
    }
    // Normalize base URL (remove trailing slashes)
    const base = baseAssetUrl.replace(/\/+$/, "");
    
    // Normalize path (remove leading/trailing slashes, then add leading slash if path exists)
    let normalizedPath = "";
    if (path) {
        normalizedPath = `/${String(path).replace(/^\/+/, "").replace(/\/+$/, "")}`;
    }
    
    // Ensure asset doesn't start with a slash
    const normalizedAsset = String(asset).replace(/^\/+/, "");
    
    return `${base}${normalizedPath}/${normalizedAsset}`;
};

const InfoRow = ({ label, value }) => (
    <div className="flex flex-col rounded-lg border p-3" style={{ borderColor: "var(--color-border)" }}>
        <span className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
            {label}
        </span>
        <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
            {value ?? "—"}
        </span>
    </div>
);

const SectionHeading = ({ title }) => (
    <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-primary)" }}>
        {title}
    </h3>
);

export function BusinessProfileView({
    business,
    onEdit,
    onBuyBadge,
    onRefresh,
    showAdminActions = false,
}) {
    const [changeOwnerOpen, setChangeOwnerOpen] = useState(false);

    const statusBadge = useMemo(() => {
        if (!business?.status) {
            return null;
        }
        const normalized = String(business.status).toLowerCase();
        let variant = "secondary";
        if (normalized.includes("active")) {
            variant = "success";
        } else if (normalized.includes("pending") || normalized.includes("wait")) {
            variant = "warning";
        } else if (normalized.includes("reject") || normalized.includes("suspend")) {
            variant = "danger";
        }
        return (
            <Badge variant={variant} size="sm">
                {business.status}
            </Badge>
        );
    }, [business?.status]);

    const badgeChips = useMemo(() => {
        const chips = [];
        if (business?.isVerifiedBusiness) {
            chips.push(
                <Badge key="verified" variant="success" size="sm">
                    Verified business
                </Badge>
            );
        }
        if (business?.isSponsored) {
            chips.push(
                <Badge key="sponsored" variant="primary" size="sm">
                    Sponsored until {business.validDate || "—"}
                </Badge>
            );
        }
        if (chips.length === 0) {
            chips.push(
                <Badge key="none" variant="secondary" size="sm">
                    No badge selected
                </Badge>
            );
        }
        return chips;
    }, [business?.isSponsored, business?.isVerifiedBusiness, business?.validDate]);

    const galleryImages = useMemo(() => {
        if (!business) return [];
        const images = Array.isArray(business.images) ? business.images : Array.isArray(business.image) ? business.image : [];
        if (images.length > 0) {
            return images
                .map((asset) => (typeof asset === "string" || asset?.path ? asset : null))
                .filter(Boolean)
                .map((asset) =>
                    typeof asset === "string"
                        ? buildAssetUrl(business.path, asset)
                        : buildAssetUrl(asset.path, asset.image)
                )
                .filter(Boolean);
        }
        if (typeof business.image === "string") {
            return [buildAssetUrl(business.path, business.image)];
        }
        return [];
    }, [business]);

    const logoUrl = useMemo(() => buildAssetUrl(business?.path, business?.logo), [business?.path, business?.logo]);

    const certificates = useMemo(() => {
        if (!Array.isArray(business?.certificates)) return [];
        return business.certificates.map((certificate) => ({
            title: certificate.title || "Certificate",
            description: certificate.description || "",
            image: buildAssetUrl(business.certificatesPath || business.certificates_path, certificate.image),
        }));
    }, [business?.certificates, business?.certificatesPath, business?.certificates_path]);

    const businessHours = Array.isArray(business?.businessHours)
        ? business.businessHours
        : Array.isArray(business?.business_hours)
        ? business.business_hours
        : [];

    const faqs = Array.isArray(business?.faqs)
        ? business.faqs
        : Array.isArray(business?.FAQS)
        ? business.FAQS
        : [];

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                {business?.title || "Business profile"}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2">
                                {statusBadge}
                                {badgeChips}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" size="sm">
                                ID #{business?.id ?? "—"}
                            </Badge>
                            {business?.createdAtHuman && (
                                <Badge variant="secondary" size="sm">
                                    Created {business.createdAtHuman}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {showAdminActions && (
                            <Button variant="secondary" onClick={() => setChangeOwnerOpen(true)}>
                                Change owner
                            </Button>
                        )}
                        <Button variant="secondary" onClick={onBuyBadge}>
                            Buy badge
                        </Button>
                        <Button onClick={onEdit}>
                            Edit business
                        </Button>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <InfoRow label="Business ID" value={business?.id} />
                    <InfoRow label="Status" value={business?.status} />
                    <InfoRow label="Owner" value={business?.user || business?.owner} />
                    <InfoRow label="Category" value={business?.categoryName || business?.category} />
                    <InfoRow label="Sub-category" value={business?.subCategoryName || business?.sub_category} />
                    <InfoRow label="Created" value={business?.createdAtHuman || business?.created_at_human} />
                </div>
            </Card>

            <Card>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <InfoRow label="Contact number" value={business?.contactNumber || business?.contact_number} />
                    <InfoRow label="Email" value={business?.email} />
                    <InfoRow label="Website" value={business?.website || business?.siteLink} />
                    <InfoRow label="Address" value={business?.address || business?.fullAddress} />
                    <InfoRow label="Postcode" value={business?.postcode} />
                    <InfoRow label="Map visibility" value={business?.showOnMap ? "Visible" : "Hidden"} />
                </div>
            </Card>

            <Card>
                <div className="space-y-4">
                    <SectionHeading title="Short description" />
                    <p style={{ color: "var(--color-text-secondary)" }}>
                        {business?.shortDescription || "—"}
                    </p>
                    <SectionHeading title="Full description" />
                    <p style={{ color: "var(--color-text-secondary)" }}>
                        {business?.description || "—"}
                    </p>
                </div>
            </Card>

            {businessHours.length > 0 && (
                <Card>
                    <SectionHeading title="Opening hours" />
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {businessHours.map((entry) => (
                            <div
                                key={entry.day}
                                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                                style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                            >
                                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                                    {entry.day}
                                </span>
                                <span>
                                    {entry.closed || entry.isClosed === "true"
                                        ? "Closed"
                                        : `${entry.open || entry.from || "--"} – ${entry.close || entry.to || "--"}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {faqs.length > 0 && (
                <Card>
                    <SectionHeading title="Frequently asked questions" />
                    <div className="mt-3 space-y-3">
                        {faqs.map((faq, index) => (
                            <div key={`faq-${index}`} className="rounded-lg border p-3"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                                    Q: {faq.question}
                                </p>
                                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                    A: {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {(logoUrl || galleryImages.length > 0 || certificates.length > 0) && (
                <Card>
                    <div className="space-y-6">
                        {logoUrl && (
                            <div className="space-y-2">
                                <SectionHeading title="Business logo" />
                                <div className="relative h-40 w-40 overflow-hidden rounded-lg border"
                                    style={{ borderColor: "var(--color-border)" }}
                                >
                                    <Image
                                        src={logoUrl}
                                        alt={business?.title || "Business logo"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        {galleryImages.length > 0 && (
                            <div className="space-y-2">
                                <SectionHeading title="Gallery" />
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                    {galleryImages.map((src, index) => (
                                        <div
                                            key={`gallery-${index}`}
                                            className="relative h-36 overflow-hidden rounded-lg border"
                                            style={{ borderColor: "var(--color-border)" }}
                                        >
                                            <Image src={src} alt={`Gallery ${index + 1}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {certificates.length > 0 && (
                            <div className="space-y-3">
                                <SectionHeading title="Certificates" />
                                <div className="space-y-3">
                                    {certificates.map((certificate, index) => (
                                        <div
                                            key={`cert-${index}`}
                                            className="rounded-lg border p-3 space-y-2"
                                            style={{ borderColor: "var(--color-border)" }}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                                                    {certificate.title}
                                                </span>
                                                <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                                    {certificate.description || "—"}
                                                </span>
                                            </div>
                                            {certificate.image && (
                                                <div className="relative h-40 overflow-hidden rounded-lg border"
                                                    style={{ borderColor: "var(--color-border)" }}
                                                >
                                                    <Image
                                                        src={certificate.image}
                                                        alt={certificate.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {showAdminActions && (
                <BusinessListingChangeOwnerModal
                    listing={business}
                    isOpen={changeOwnerOpen}
                    onClose={() => setChangeOwnerOpen(false)}
                    onUpdated={() => {
                        setChangeOwnerOpen(false);
                        onRefresh?.();
                    }}
                />
            )}
        </div>
    );
}

export default BusinessProfileView;


