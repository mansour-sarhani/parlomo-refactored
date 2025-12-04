"use client";

import { Facebook, Instagram, MessageCircle } from "lucide-react";

export function EventOrganizerStep({ formData, errors, onChange }) {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg mb-6" style={{ backgroundColor: "var(--color-surface-secondary)" }}>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    This information will be displayed on the event page so attendees can contact you if needed.
                </p>
            </div>

            {/* Organizer Name */}
            <div>
                <label htmlFor="organizerName" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Organizer Name *
                </label>
                <input
                    id="organizerName"
                    type="text"
                    value={formData.organizerName || ""}
                    onChange={(e) => onChange("organizerName", e.target.value)}
                    placeholder="e.g., Acme Events Inc."
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: errors.organizerName ? "var(--color-error)" : "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
                {errors.organizerName && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.organizerName}</p>}
            </div>

            {/* Organizer Email */}
            <div>
                <label htmlFor="organizerEmail" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Organizer Email *
                </label>
                <input
                    id="organizerEmail"
                    type="email"
                    value={formData.organizerEmail || ""}
                    onChange={(e) => onChange("organizerEmail", e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: errors.organizerEmail ? "var(--color-error)" : "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
                {errors.organizerEmail && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.organizerEmail}</p>}
            </div>

            {/* Organizer Phone */}
            <div>
                <label htmlFor="organizerPhone" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Organizer Phone (Optional)
                </label>
                <input
                    id="organizerPhone"
                    type="tel"
                    value={formData.organizerPhone || ""}
                    onChange={(e) => onChange("organizerPhone", e.target.value)}
                    placeholder="+44 7XXX XXXXXX"
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
            </div>

            {/* Organizer Website */}
            <div>
                <label htmlFor="organizerWebsite" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Website (Optional)
                </label>
                <input
                    id="organizerWebsite"
                    type="url"
                    value={formData.organizerWebsite || ""}
                    onChange={(e) => onChange("organizerWebsite", e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
            </div>

            {/* Social Media Section */}
            <div className="pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <h4 className="text-sm font-medium mb-4" style={{ color: "var(--color-text-primary)" }}>
                    Social Media (Optional)
                </h4>

                {/* Facebook */}
                <div className="mb-4">
                    <label htmlFor="organizerFacebook" className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                        <Facebook className="w-4 h-4" />
                        Facebook Page
                    </label>
                    <input
                        id="organizerFacebook"
                        type="url"
                        value={formData.organizerFacebook || ""}
                        onChange={(e) => onChange("organizerFacebook", e.target.value)}
                        placeholder="https://facebook.com/yourpage"
                        className="w-full px-4 py-2 rounded border"
                        style={{
                            backgroundColor: "var(--color-surface-primary)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                        }}
                    />
                </div>

                {/* Instagram */}
                <div className="mb-4">
                    <label htmlFor="organizerInstagram" className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                        <Instagram className="w-4 h-4" />
                        Instagram
                    </label>
                    <input
                        id="organizerInstagram"
                        type="text"
                        value={formData.organizerInstagram || ""}
                        onChange={(e) => onChange("organizerInstagram", e.target.value)}
                        placeholder="@yourusername or https://instagram.com/you"
                        className="w-full px-4 py-2 rounded border"
                        style={{
                            backgroundColor: "var(--color-surface-primary)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                        }}
                    />
                </div>

                {/* WhatsApp */}
                <div>
                    <label htmlFor="organizerWhatsApp" className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp Number
                    </label>
                    <input
                        id="organizerWhatsApp"
                        type="tel"
                        value={formData.organizerWhatsApp || ""}
                        onChange={(e) => onChange("organizerWhatsApp", e.target.value)}
                        placeholder="+44 7XXX XXXXXX"
                        className="w-full px-4 py-2 rounded border"
                        style={{
                            backgroundColor: "var(--color-surface-primary)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                        }}
                    />
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                        Include country code (e.g., +44 for UK)
                    </p>
                </div>
            </div>
        </div>
    );
}
