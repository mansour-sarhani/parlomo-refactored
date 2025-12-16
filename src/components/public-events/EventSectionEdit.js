"use client";

import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { DEFAULT_EVENT_VALUES } from "@/types/public-events-types";

// Step components
import { EventDetailsStep } from "./EventDetailsStep";
import { EventDateTimeStep } from "./EventDateTimeStep";
import { EventLocationStep } from "./EventLocationStep";
import { EventOrganizerStep } from "./EventOrganizerStep";
import { EventTicketingStep } from "./EventTicketingStep";
import { EventMediaStep } from "./EventMediaStep";
import { EventPoliciesStep } from "./EventPoliciesStep";

const SECTION_COMPONENTS = {
    details: EventDetailsStep,
    datetime: EventDateTimeStep,
    location: EventLocationStep,
    organizer: EventOrganizerStep,
    ticketing: EventTicketingStep,
    media: EventMediaStep,
    policies: EventPoliciesStep,
};

const SECTION_VALIDATORS = {
    details: (data) => {
        const errors = {};
        if (!data.title?.trim()) errors.title = "Event title is required";
        if (!data.description?.trim()) errors.description = "Event description is required";
        if (!data.category_id && !data.categoryId) errors.category_id = "Event category is required";
        return errors;
    },
    datetime: (data) => {
        const errors = {};
        if (!data.startDate) errors.startDate = "Start date is required";
        if (!data.timezone) errors.timezone = "Timezone is required";
        if (data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
            errors.endDate = "End date must be after start date";
        }
        return errors;
    },
    location: (data) => {
        const errors = {};
        if (!data.venueName?.trim()) errors.venueName = "Venue name is required";
        if (!data.venueAddress?.trim()) errors.venueAddress = "Venue address is required";
        if (!data.city?.trim()) errors.city = "City is required";
        if (!data.state?.trim()) errors.state = "State/Province is required";
        if (!data.country?.trim()) errors.country = "Country is required";
        if (!data.postcode?.trim()) errors.postcode = "Postal code is required";
        return errors;
    },
    organizer: (data) => {
        const errors = {};
        if (!data.organizerName?.trim()) errors.organizerName = "Organizer name is required";
        if (!data.organizerEmail?.trim()) {
            errors.organizerEmail = "Organizer email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.organizerEmail)) {
            errors.organizerEmail = "Invalid email format";
        }
        return errors;
    },
    ticketing: (data) => {
        const errors = {};
        if (!data.eventType) errors.eventType = "Event type is required";
        if (!data.currency) errors.currency = "Currency is required";
        if (data.globalCapacity !== null && data.globalCapacity < 0) {
            errors.globalCapacity = "Capacity cannot be negative";
        }
        return errors;
    },
    media: () => ({}), // Optional, no required fields
    policies: (data) => {
        const errors = {};
        if (data.taxRate < 0 || data.taxRate > 100) {
            errors.taxRate = "Tax rate must be between 0 and 100";
        }
        return errors;
    },
};

export function EventSectionEdit({ section, event, onSave, saving, onCancel }) {
    // Normalize event data for form
    const normalizeForForm = (data) => {
        if (!data) return { ...DEFAULT_EVENT_VALUES };

        // Handle category - could be in category_id, categoryId, or category object
        let categoryId = data.category_id || data.categoryId;
        if (typeof categoryId === 'object') {
            categoryId = categoryId?.id;
        }
        if (!categoryId && data.category && typeof data.category === 'object') {
            categoryId = data.category.id;
        }

        return {
            ...DEFAULT_EVENT_VALUES,
            ...data,
            category_id: categoryId,
            // Flatten venue
            venueName: data.venue?.name || data.venueName || '',
            // Flatten location
            venueAddress: data.location?.address || data.venueAddress || '',
            city: data.location?.city || data.city || '',
            state: data.location?.state || data.state || '',
            country: data.location?.country || data.country || '',
            postcode: data.location?.postcode || data.postcode || '',
            latitude: data.location?.coordinates?.lat || data.latitude || null,
            longitude: data.location?.coordinates?.lng || data.longitude || null,
            // Flatten organizer
            organizerName: data.organizer?.name || data.organizerName || '',
            organizerEmail: data.organizer?.email || data.organizerEmail || '',
            organizerPhone: data.organizer?.phone || data.organizerPhone || '',
            organizerWebsite: data.organizer?.website || data.organizerWebsite || '',
            organizerFacebook: data.organizer?.facebook || data.organizerFacebook || '',
            organizerInstagram: data.organizer?.instagram || data.organizerInstagram || '',
            organizerWhatsApp: data.organizer?.whatsapp || data.organizerWhatsApp || '',
        };
    };

    const [formData, setFormData] = useState(() => normalizeForForm(event));
    const [errors, setErrors] = useState({});

    // Update form data when event changes
    useEffect(() => {
        if (event) {
            setFormData(normalizeForForm(event));
        }
    }, [event]);

    const SectionComponent = SECTION_COMPONENTS[section];
    const validateSection = SECTION_VALIDATORS[section];

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleMultipleFieldsChange = (fields) => {
        setFormData((prev) => ({
            ...prev,
            ...fields,
        }));
    };

    const handleSubmit = () => {
        // Validate section
        const validationErrors = validateSection ? validateSection(formData) : {};
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Pass the updated data to parent
        onSave(formData);
    };

    if (!SectionComponent) {
        return (
            <div className="text-center py-8">
                <p style={{ color: "var(--color-text-secondary)" }}>
                    Unknown section: {section}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SectionComponent
                formData={formData}
                errors={errors}
                onChange={handleFieldChange}
                onMultipleChange={handleMultipleFieldsChange}
            />

            {/* Action Buttons */}
            <div
                className="flex items-center justify-end gap-3 pt-6 border-t"
                style={{ borderColor: "var(--color-border)" }}
            >
                <Button
                    variant="secondary"
                    onClick={onCancel}
                    icon={<X className="w-4 h-4" />}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    loading={saving}
                    icon={<Save className="w-4 h-4" />}
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
