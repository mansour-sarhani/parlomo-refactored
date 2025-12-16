"use client";

import { AGE_RESTRICTIONS } from "@/types/public-events-types";
import { RichTextEditor } from "@/components/forms/RichTextEditor";

export function EventPoliciesStep({ formData, errors, onChange }) {
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
        </div>
    );
}
