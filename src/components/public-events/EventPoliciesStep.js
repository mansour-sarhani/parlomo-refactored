"use client";

import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { AGE_RESTRICTIONS } from "@/types/public-events-types";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { getPublicSetting } from "@/services/settings.service";

export function EventPoliciesStep({ formData, errors, onChange, isAdmin = false, mode = "create" }) {
    // Organizers can only change fee_paid_by when event is draft; Admins can always edit
    const isFeePaidByReadOnly = !isAdmin && mode === "edit" && formData.status !== "draft";

    const [feePercentage, setFeePercentage] = useState(null);
    const [feeLoading, setFeeLoading] = useState(true);
    const [termsContent, setTermsContent] = useState("");
    const [termsLoading, setTermsLoading] = useState(true);

    // Fetch platform fee percentage and terms
    useEffect(() => {
        const fetchSettings = async () => {
            // Fetch fee percentage
            try {
                const response = await getPublicSetting("PublicEventFees");
                const value = response?.data?.value;
                if (value !== undefined && value !== null) {
                    const percentage = typeof value === 'object' ? value.percentage : parseFloat(value);
                    if (!isNaN(percentage)) {
                        setFeePercentage(percentage);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch platform fee settings:", error);
            } finally {
                setFeeLoading(false);
            }

            // Fetch terms & conditions
            try {
                const response = await getPublicSetting("PublicEventParlomoTerms");
                const value = response?.data?.value;
                if (value) {
                    setTermsContent(value);
                }
            } catch (error) {
                console.error("Failed to fetch platform terms:", error);
            } finally {
                setTermsLoading(false);
            }
        };

        fetchSettings();
    }, []);
    return (
        <div className="space-y-6">
            {/* Age Restriction */}
            <div>
                <label htmlFor="ageRestriction" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Age Restriction
                </label>
                <select
                    id="ageRestriction"
                    value={formData.ageRestriction || "all_ages"}
                    onChange={(e) => onChange("ageRestriction", e.target.value)}
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                >
                    {AGE_RESTRICTIONS.map((age) => (
                        <option key={age.value} value={age.value}>{age.label}</option>
                    ))}
                </select>
            </div>

            {/* Refund Policy */}
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Refund Policy
                </label>
                <RichTextEditor
                    value={formData.refundPolicy || ""}
                    onChange={(value) => onChange("refundPolicy", value)}
                    placeholder="Describe your refund policy (e.g., No refunds within 24 hours of the event)..."
                    error={errors.refundPolicy}
                    minHeight={150}
                />
                <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    Clearly state your refund terms and conditions for ticket purchases
                </p>
            </div>

            {/* Tax Rate */}
            <div>
                <label htmlFor="taxRate" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Tax Rate (%)
                </label>
                <input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxRate || 0}
                    onChange={(e) => onChange("taxRate", parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: errors.taxRate ? "var(--color-error)" : "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
                <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    Percentage tax to be applied to ticket prices.
                </p>
                {errors.taxRate && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.taxRate}</p>}
            </div>

            {/* Platform Fee Payment Method */}
            <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "var(--color-text-secondary)" }}>
                    Who pays the platform fee?
                </label>

                {/* Fee Percentage Info Alert */}
                {!feeLoading && feePercentage !== null && (
                    <div
                        className="flex items-start gap-3 p-3 rounded-lg mb-4"
                        style={{
                            backgroundColor: "var(--color-info-bg, #eff6ff)",
                            border: "1px solid var(--color-info-border, #bfdbfe)",
                        }}
                    >
                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--color-info, #3b82f6)" }} />
                        <div>
                            <p className="text-sm font-medium" style={{ color: "var(--color-info, #3b82f6)" }}>
                                Platform Fee: {feePercentage}%
                            </p>
                            <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                                This fee will be applied to each ticket sale. Choose below who will pay this fee.
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <input
                            id="feePaidByBuyer"
                            type="radio"
                            name="fee_paid_by"
                            checked={formData.fee_paid_by !== "organizer"}
                            onChange={() => onChange("fee_paid_by", "buyer")}
                            disabled={isFeePaidByReadOnly}
                            className="w-4 h-4"
                            style={{ accentColor: "var(--color-primary)" }}
                        />
                        <label htmlFor="feePaidByBuyer" className="text-sm" style={{ color: isFeePaidByReadOnly ? "var(--color-text-tertiary)" : "var(--color-text-primary)" }}>
                            Buyer pays (fee added to ticket price)
                        </label>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            id="feePaidByOrganizer"
                            type="radio"
                            name="fee_paid_by"
                            checked={formData.fee_paid_by === "organizer"}
                            onChange={() => onChange("fee_paid_by", "organizer")}
                            disabled={isFeePaidByReadOnly}
                            className="w-4 h-4"
                            style={{ accentColor: "var(--color-primary)" }}
                        />
                        <label htmlFor="feePaidByOrganizer" className="text-sm" style={{ color: isFeePaidByReadOnly ? "var(--color-text-tertiary)" : "var(--color-text-primary)" }}>
                            I pay (fee deducted from my earnings)
                        </label>
                    </div>
                </div>
                {isFeePaidByReadOnly && (
                    <p className="text-xs mt-2" style={{ color: "var(--color-warning, #f59e0b)" }}>
                        This setting cannot be changed after the event is published.
                    </p>
                )}
                <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    Choose who will pay the platform service fee for this event.
                </p>
            </div>

            {/* Settings Toggles */}
            <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-3">
                    <input
                        id="waitlistEnabled"
                        type="checkbox"
                        checked={formData.waitlistEnabled || false}
                        onChange={(e) => onChange("waitlistEnabled", e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="waitlistEnabled" className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        Allow waitlist when sold out
                    </label>
                </div>
            </div>

            {/* Platform Terms & Conditions */}
            <div className="pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <label className="block text-sm font-medium mb-3" style={{ color: "var(--color-text-secondary)" }}>
                    Platform Terms & Conditions
                </label>

                {termsLoading ? (
                    <div
                        className="h-48 flex items-center justify-center rounded border"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                            borderColor: "var(--color-border)"
                        }}
                    >
                        <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                            Loading terms...
                        </p>
                    </div>
                ) : termsContent ? (
                    <>
                        <div
                            className="h-48 overflow-y-auto p-4 rounded border mb-4 prose prose-sm max-w-none"
                            style={{
                                backgroundColor: "var(--color-surface-secondary)",
                                borderColor: errors.agreedToTerms ? "var(--color-error)" : "var(--color-border)",
                                color: "var(--color-text-primary)",
                            }}
                            dangerouslySetInnerHTML={{ __html: termsContent }}
                        />
                        <div className="flex items-start gap-3">
                            <input
                                id="agreedToTerms"
                                type="checkbox"
                                checked={formData.agreedToTerms || false}
                                onChange={(e) => onChange("agreedToTerms", e.target.checked)}
                                className="w-4 h-4 mt-0.5"
                                style={{ accentColor: "var(--color-primary)" }}
                            />
                            <label
                                htmlFor="agreedToTerms"
                                className="text-sm"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                I have read and agree to the Platform Terms & Conditions for creating events
                            </label>
                        </div>
                        {errors.agreedToTerms && (
                            <p className="text-sm mt-2" style={{ color: "var(--color-error)" }}>
                                {errors.agreedToTerms}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                        Terms & Conditions not available.
                    </p>
                )}
            </div>
        </div>
    );
}
