"use client";

import { Settings } from "lucide-react";

export function EventAdminSettingsStep({ formData, errors, onChange }) {
    return (
        <div className="space-y-6">
            {/* Admin Settings Header */}
            <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: "var(--color-surface-secondary)" }}
                >
                    <Settings className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Admin Settings
                    </h3>
                    <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                        Configure administrative options for this event
                    </p>
                </div>
            </div>

            {/* Financial Settings */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Financial Settings
                </h4>

                {/* Parlomo Fee Percentage */}
                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <label
                        htmlFor="parlomoFeePercentage"
                        className="block font-medium mb-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Platform Fee Percentage
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            id="parlomoFeePercentage"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.parlomoFeePercentage ?? 0}
                            onChange={(e) => onChange("parlomoFeePercentage", parseFloat(e.target.value) || 0)}
                            className="w-24 px-4 py-2 rounded-l border text-sm"
                            style={{
                                backgroundColor: "var(--color-surface-primary)",
                                borderColor: "var(--color-border)",
                                color: "var(--color-text-primary)",
                            }}
                            placeholder="0"
                        />
                        <span
                            className="px-3 py-2 rounded-r border border-l-0 text-sm font-medium"
                            style={{
                                backgroundColor: "var(--color-surface-tertiary)",
                                borderColor: "var(--color-border)",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            %
                        </span>
                    </div>
                    <p className="text-sm mt-2" style={{ color: "var(--color-text-tertiary)" }}>
                        Platform fee percentage applied to ticket sales (e.g., 10 = 10%)
                    </p>
                </div>

                {/* Fee Paid By Override */}
                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <label
                        className="block font-medium mb-3"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Who Pays the Platform Fee?
                    </label>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <input
                                id="feePaidByBuyerAdmin"
                                type="radio"
                                name="fee_paid_by_admin"
                                checked={formData.fee_paid_by !== "organizer"}
                                onChange={() => onChange("fee_paid_by", "buyer")}
                                className="w-4 h-4"
                                style={{ accentColor: "var(--color-primary)" }}
                            />
                            <label
                                htmlFor="feePaidByBuyerAdmin"
                                className="text-sm cursor-pointer"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Buyer pays (fee added to ticket price)
                            </label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                id="feePaidByOrganizerAdmin"
                                type="radio"
                                name="fee_paid_by_admin"
                                checked={formData.fee_paid_by === "organizer"}
                                onChange={() => onChange("fee_paid_by", "organizer")}
                                className="w-4 h-4"
                                style={{ accentColor: "var(--color-primary)" }}
                            />
                            <label
                                htmlFor="feePaidByOrganizerAdmin"
                                className="text-sm cursor-pointer"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Organizer pays (fee deducted from earnings)
                            </label>
                        </div>
                    </div>
                    <p className="text-sm mt-2" style={{ color: "var(--color-text-tertiary)" }}>
                        Admin override: This setting can be changed at any time regardless of event status
                    </p>
                </div>

            </div>

            {/* Display Settings */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Display Settings
                </h4>

                {/* Show Organizer Info Toggle */}
                <div
                    className="flex items-center justify-between p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div className="flex-1">
                        <label
                            htmlFor="showOrganizerInfo"
                            className="block font-medium cursor-pointer"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Show Organizer Info on Event Page
                        </label>
                        <p className="text-sm mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                            When enabled, organizer contact information will be displayed on the public event page on the website
                        </p>
                    </div>
                    <div className="ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                id="showOrganizerInfo"
                                type="checkbox"
                                checked={formData.showOrganizerInfo || false}
                                onChange={(e) => onChange("showOrganizerInfo", e.target.checked)}
                                className="sr-only peer"
                            />
                            <div
                                className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all"
                                style={{
                                    backgroundColor: formData.showOrganizerInfo
                                        ? "var(--color-primary)"
                                        : "var(--color-border)",
                                }}
                            >
                                <div
                                    className="absolute top-[2px] h-5 w-5 rounded-full transition-all"
                                    style={{
                                        backgroundColor: "white",
                                        left: formData.showOrganizerInfo ? "calc(100% - 22px)" : "2px",
                                    }}
                                />
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Info Note */}
            <div
                className="p-4 rounded-lg border"
                style={{
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    borderColor: "rgba(59, 130, 246, 0.3)",
                }}
            >
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    <strong>Note:</strong> These settings are only accessible to system administrators
                    and will affect how the event is displayed on the public website.
                </p>
            </div>
        </div>
    );
}
