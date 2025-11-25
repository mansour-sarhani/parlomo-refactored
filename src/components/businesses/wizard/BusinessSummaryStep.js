"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    nextBusinessWizardStep,
    prevBusinessWizardStep,
    clearBusinessWizardErrors,
    createBusinessWizardListing,
    updateBusinessWizardListing,
} from "@/features/businesses/businessWizardSlice";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { buildBusinessPayload } from "./payload";

const InfoRow = ({ label, value }) => (
    <div className="flex flex-col gap-1 rounded-lg border p-3" style={{ borderColor: "var(--color-border)" }}>
        <span className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
            {label}
        </span>
        <span style={{ color: "var(--color-text-primary)" }}>{value || "—"}</span>
    </div>
);

export default function BusinessSummaryStep() {
    const dispatch = useAppDispatch();
    const { draft, listingId, isEditing, loading } = useAppSelector((state) => state.businessWizard);

    const handleSubmit = async () => {
        if (!draft.title || !draft.categoryId) {
            dispatch(clearBusinessWizardErrors());
            return;
        }

        const payload = buildBusinessPayload(draft);

        try {
            if (isEditing && listingId) {
                await dispatch(
                    updateBusinessWizardListing({
                        id: listingId,
                        changes: payload,
                    })
                ).unwrap();
            } else {
                await dispatch(createBusinessWizardListing(payload)).unwrap();
            }
            dispatch(nextBusinessWizardStep());
        } catch (error) {
            // handled by slice state
        }
    };

    const badgeSummary = [];
    if (draft?.verifyBadgeId) {
        badgeSummary.push(
            <Badge key="verify" variant="success" size="sm">
                Verification badge #{draft.verifyBadgeId}
            </Badge>
        );
    }
    if (draft?.sponsorBadgeId || draft?.sponsoredBadgeId) {
        badgeSummary.push(
            <Badge key="sponsor" variant="primary" size="sm">
                Sponsored badge #{draft.sponsorBadgeId || draft.sponsoredBadgeId}
            </Badge>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Review your information
                    </h2>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <InfoRow label="Title" value={draft.title} />
                        <InfoRow label="Category" value={draft.categoryName || draft.categoryId} />
                        <InfoRow label="Sub-category" value={draft.subCategoryName || draft.subCategoryId} />
                        <InfoRow label="Contact number" value={draft.contactNumber} />
                        <InfoRow label="Verification mobile" value={draft.verifyMobile} />
                        <InfoRow label="Email" value={draft.email} />
                        <InfoRow label="Website" value={draft.siteLink} />
                        <InfoRow label="Social media" value={draft.socialMediaLink} />
                        <InfoRow label="YouTube" value={draft.youtubeLink} />
                        <InfoRow label="Address" value={draft.fullAddress} />
                        <InfoRow label="Postcode" value={draft.postcode} />
                        <InfoRow label="Location" value={draft.location} />
                        <InfoRow label="Tags" value={draft.tags} />
                        <InfoRow label="Show on map" value={draft.showOnMap ? "Yes" : "No"} />
                        <InfoRow label="Open 24/7" value={draft.is24h ? "Yes" : "No"} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            Short description
                        </h3>
                        <p style={{ color: "var(--color-text-secondary)" }}>{draft.shortDescription || "—"}</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            Full description
                        </h3>
                        <p style={{ color: "var(--color-text-secondary)" }}>{draft.description || "—"}</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            Badges
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {badgeSummary.length > 0 ? badgeSummary : (
                                <span style={{ color: "var(--color-text-tertiary)" }}>No badge selected yet</span>
                            )}
                        </div>
                    </div>
                    {Array.isArray(draft.businessHours) && draft.businessHours.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                Opening hours
                            </h3>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {draft.businessHours.map((entry) => (
                                    <div
                                        key={entry.day}
                                        className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                                        style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                                    >
                                        <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                                            {entry.day}
                                        </span>
                                        <span>
                                            {entry.closed ? "Closed" : `${entry.open || entry.from || "--"} to ${entry.close || entry.to || "--"}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {Array.isArray(draft.faqs) && draft.faqs.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                FAQs
                            </h3>
                            <div className="space-y-2">
                                {draft.faqs.map((faq, index) => (
                                    <div key={`faq-${index}`} className="rounded-lg border p-3 space-y-1"
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
                        </div>
                    )}
                </div>
            </Card>

            <div className="flex items-center justify-between pt-2">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => dispatch(prevBusinessWizardStep())}
                    disabled={loading}
                >
                    Back
                </Button>
                <Button type="button" onClick={handleSubmit} loading={loading}>
                    {isEditing ? "Update Business" : "Submit Business"}
                </Button>
            </div>
        </div>
    );
}


