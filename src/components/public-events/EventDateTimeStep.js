"use client";

import { Info } from "lucide-react";

export function EventDateTimeStep({ formData, errors, onChange }) {
    // Helper function to format datetime for input (local time display)
    const formatDateTimeLocal = (isoString) => {
        if (!isoString) return "";
        // Create date object and format for datetime-local input
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Helper function to convert datetime-local input to ISO string
    const handleDateTimeChange = (value) => {
        if (!value) return null;
        // Create date from local input value
        const date = new Date(value);
        return date.toISOString();
    };

    return (
        <div className="space-y-6">
            {/* Timezone Info Alert */}
            <div
                className="flex items-start gap-3 p-4 rounded-lg"
                style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
                <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        Timezone: Europe/London (GMT/BST)
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        All event times are set in London timezone. Times will be automatically converted for attendees in different locations.
                    </p>
                </div>
            </div>

            {/* Start Date */}
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Start Date & Time *
                </label>
                <input
                    id="startDate"
                    type="datetime-local"
                    value={formatDateTimeLocal(formData.startDate)}
                    onChange={(e) => onChange("startDate", handleDateTimeChange(e.target.value))}
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: errors.startDate ? "var(--color-error)" : "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
                {errors.startDate && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.startDate}</p>}
            </div>

            {/* End Date */}
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    End Date & Time (Optional)
                </label>
                <input
                    id="endDate"
                    type="datetime-local"
                    value={formatDateTimeLocal(formData.endDate)}
                    onChange={(e) => onChange("endDate", handleDateTimeChange(e.target.value))}
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: errors.endDate ? "var(--color-error)" : "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
                {errors.endDate && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.endDate}</p>}
                <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    Leave empty for single-day events
                </p>
            </div>

            {/* Booking Deadline */}
            <div>
                <label htmlFor="bookingDeadline" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Booking Deadline (Optional)
                </label>
                <input
                    id="bookingDeadline"
                    type="datetime-local"
                    value={formatDateTimeLocal(formData.bookingDeadline)}
                    onChange={(e) => onChange("bookingDeadline", handleDateTimeChange(e.target.value))}
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: errors.bookingDeadline ? "var(--color-error)" : "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
                {errors.bookingDeadline && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.bookingDeadline}</p>}
                <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    Last date and time for ticket purchases. Must be before event start time.
                </p>
            </div>

            {/* Doors Open */}
            <div>
                <label htmlFor="doorsOpen" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Doors Open Date & Time (Optional)
                </label>
                <input
                    id="doorsOpen"
                    type="datetime-local"
                    value={formatDateTimeLocal(formData.doorsOpen)}
                    onChange={(e) => onChange("doorsOpen", handleDateTimeChange(e.target.value))}
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
                <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    When will doors open for attendees?
                </p>
            </div>
        </div>
    );
}
