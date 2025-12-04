"use client";

import dynamic from "next/dynamic";

const MapLocationPicker = dynamic(
    () => import("@/components/forms/MapLocationPicker").then((mod) => mod.MapLocationPicker),
    { ssr: false }
);

export function EventLocationStep({ formData, errors, onChange, onMultipleChange }) {
    const handleOnlineChange = (isOnline) => {
        onChange("isOnline", isOnline);
        if (isOnline) {
            onMultipleChange({
                venueName: "Online Event",
                venueAddress: "Virtual",
                city: "Online",
                state: "N/A",
                country: "Global",
                postcode: "00000",
                latitude: null,
                longitude: null,
            });
        }
    };

    const handleMapLocationChange = (lat, lng) => {
        onMultipleChange({
            latitude: lat,
            longitude: lng,
        });
    };

    return (
        <div className="space-y-6">
            {/* Online Event Toggle */}
            <div className="flex items-center gap-3">
                <input
                    id="isOnline"
                    type="checkbox"
                    checked={formData.isOnline || false}
                    onChange={(e) => handleOnlineChange(e.target.checked)}
                    className="w-4 h-4"
                />
                <label htmlFor="isOnline" className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                    This is an online/virtual event
                </label>
            </div>

            {/* Venue Name */}
            <div>
                <label htmlFor="venueName" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Venue Name *
                </label>
                <input
                    id="venueName"
                    type="text"
                    value={formData.venueName || ""}
                    onChange={(e) => onChange("venueName", e.target.value)}
                    disabled={formData.isOnline}
                    placeholder="Enter venue name"
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: errors.venueName ? "var(--color-error)" : "var(--color-border)",
                        color: "var(--color-text-primary)",
                        opacity: formData.isOnline ? 0.6 : 1,
                    }}
                />
                {errors.venueName && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.venueName}</p>}
            </div>

            {/* Address */}
            <div>
                <label htmlFor="venueAddress" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Address *
                </label>
                <input
                    id="venueAddress"
                    type="text"
                    value={formData.venueAddress || ""}
                    onChange={(e) => onChange("venueAddress", e.target.value)}
                    disabled={formData.isOnline}
                    placeholder="Street address"
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: errors.venueAddress ? "var(--color-error)" : "var(--color-border)",
                        color: "var(--color-text-primary)",
                        opacity: formData.isOnline ? 0.6 : 1,
                    }}
                />
                {errors.venueAddress && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.venueAddress}</p>}
            </div>

            {/* City, State, Country */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                        City *
                    </label>
                    <input
                        id="city"
                        type="text"
                        value={formData.city || ""}
                        onChange={(e) => onChange("city", e.target.value)}
                        disabled={formData.isOnline}
                        className="w-full px-4 py-2 rounded border"
                        style={{
                            backgroundColor: "var(--color-surface-primary)",
                            borderColor: errors.city ? "var(--color-error)" : "var(--color-border)",
                            color: "var(--color-text-primary)",
                            opacity: formData.isOnline ? 0.6 : 1,
                        }}
                    />
                    {errors.city && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.city}</p>}
                </div>

                <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                        State/Province *
                    </label>
                    <input
                        id="state"
                        type="text"
                        value={formData.state || ""}
                        onChange={(e) => onChange("state", e.target.value)}
                        disabled={formData.isOnline}
                        className="w-full px-4 py-2 rounded border"
                        style={{
                            backgroundColor: "var(--color-surface-primary)",
                            borderColor: errors.state ? "var(--color-error)" : "var(--color-border)",
                            color: "var(--color-text-primary)",
                            opacity: formData.isOnline ? 0.6 : 1,
                        }}
                    />
                    {errors.state && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.state}</p>}
                </div>

                <div>
                    <label htmlFor="country" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                        Country *
                    </label>
                    <input
                        id="country"
                        type="text"
                        value={formData.country || ""}
                        onChange={(e) => onChange("country", e.target.value)}
                        disabled={formData.isOnline}
                        className="w-full px-4 py-2 rounded border"
                        style={{
                            backgroundColor: "var(--color-surface-primary)",
                            borderColor: errors.country ? "var(--color-error)" : "var(--color-border)",
                            color: "var(--color-text-primary)",
                            opacity: formData.isOnline ? 0.6 : 1,
                        }}
                    />
                    {errors.country && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.country}</p>}
                </div>
            </div>

            {/* Postcode */}
            <div>
                <label htmlFor="postcode" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Postal Code *
                </label>
                <input
                    id="postcode"
                    type="text"
                    value={formData.postcode || ""}
                    onChange={(e) => onChange("postcode", e.target.value)}
                    disabled={formData.isOnline}
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: errors.postcode ? "var(--color-error)" : "var(--color-border)",
                        color: "var(--color-text-primary)",
                        opacity: formData.isOnline ? 0.6 : 1,
                    }}
                />
                {errors.postcode && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.postcode}</p>}
            </div>

            {/* Map Location Picker */}
            {!formData.isOnline && (
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                        Event Location on Map (Optional)
                    </label>
                    <MapLocationPicker
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        onChange={handleMapLocationChange}
                    />
                    <p className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>
                        Click on the map to pin the exact location of your event. This will help attendees find the venue easily.
                    </p>
                </div>
            )}
        </div>
    );
}
