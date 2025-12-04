"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Save, Check } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useAppDispatch } from "@/lib/hooks";
import { createEvent, updateEvent } from "@/features/public-events/publicEventsSlice";
import { DEFAULT_EVENT_VALUES } from "@/types/public-events-types";

// Step components
import { EventDetailsStep } from "./EventDetailsStep";
import { EventDateTimeStep } from "./EventDateTimeStep";
import { EventLocationStep } from "./EventLocationStep";
import { EventOrganizerStep } from "./EventOrganizerStep";
import { EventTicketingStep } from "./EventTicketingStep";
import { EventMediaStep } from "./EventMediaStep";
import { EventPoliciesStep } from "./EventPoliciesStep";

const STEPS = [
    { id: 1, title: "Event Details", component: EventDetailsStep },
    { id: 2, title: "Date & Time", component: EventDateTimeStep },
    { id: 3, title: "Location", component: EventLocationStep },
    { id: 4, title: "Organizer Info", component: EventOrganizerStep },
    { id: 5, title: "Ticketing Settings", component: EventTicketingStep },
    { id: 6, title: "Media", component: EventMediaStep },
    { id: 7, title: "Policies & Settings", component: EventPoliciesStep },
];

export function EventForm({ initialData = null, mode = "create", organizerId }) {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(1);

    // Normalize initial data - convert nested MongoDB structure to flat form fields
    const normalizeInitialData = (data) => {
        if (!data) return null;
        return {
            ...data,
            // If category is a populated object, extract the slug
            category: typeof data.category === 'object' ? data.category?.slug : data.category,
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

    const [formData, setFormData] = useState(
        normalizeInitialData(initialData) || {
            ...DEFAULT_EVENT_VALUES,
            organizerId,
            organizerName: "",
            organizerEmail: "",
        }
    );
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Update organizerId in formData when prop changes (e.g. after auth fetch)
    useEffect(() => {
        if (organizerId) {
            setFormData(prev => ({
                ...prev,
                organizerId
            }));
        }
    }, [organizerId]);

    const CurrentStepComponent = STEPS[currentStep - 1].component;

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

    const validateStep = (step) => {
        const stepErrors = {};

        switch (step) {
            case 1: // Event Details
                if (!formData.title?.trim()) {
                    stepErrors.title = "Event title is required";
                }
                if (!formData.description?.trim()) {
                    stepErrors.description = "Event description is required";
                }
                if (!formData.category) {
                    stepErrors.category = "Event category is required";
                }
                break;

            case 2: // Date & Time
                if (!formData.startDate) {
                    stepErrors.startDate = "Start date is required";
                }
                if (!formData.timezone) {
                    stepErrors.timezone = "Timezone is required";
                }
                if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
                    stepErrors.endDate = "End date must be after start date";
                }
                if (formData.bookingDeadline && new Date(formData.bookingDeadline) >= new Date(formData.startDate)) {
                    stepErrors.bookingDeadline = "Booking deadline must be before event start";
                }
                break;

            case 3: // Location
                if (!formData.venueName?.trim()) {
                    stepErrors.venueName = "Venue name is required";
                }
                if (!formData.venueAddress?.trim()) {
                    stepErrors.venueAddress = "Venue address is required";
                }
                if (!formData.city?.trim()) {
                    stepErrors.city = "City is required";
                }
                if (!formData.state?.trim()) {
                    stepErrors.state = "State/Province is required";
                }
                if (!formData.country?.trim()) {
                    stepErrors.country = "Country is required";
                }
                if (!formData.postcode?.trim()) {
                    stepErrors.postcode = "Postal code is required";
                }
                break;

            case 4: // Organizer Info
                if (!formData.organizerName?.trim()) {
                    stepErrors.organizerName = "Organizer name is required";
                }
                if (!formData.organizerEmail?.trim()) {
                    stepErrors.organizerEmail = "Organizer email is required";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.organizerEmail)) {
                    stepErrors.organizerEmail = "Invalid email format";
                }
                break;

            case 5: // Ticketing Settings
                if (!formData.eventType) {
                    stepErrors.eventType = "Event type is required";
                }
                if (!formData.currency) {
                    stepErrors.currency = "Currency is required";
                }
                if (formData.globalCapacity !== null && formData.globalCapacity < 0) {
                    stepErrors.globalCapacity = "Capacity cannot be negative";
                }
                // Validate service charges array
                if (formData.serviceCharges?.length > 0) {
                    formData.serviceCharges.forEach((charge, index) => {
                        if (!charge.title?.trim()) {
                            stepErrors[`serviceCharge_${index}`] = `Service charge #${index + 1} requires a title`;
                        }
                        if (!['per_ticket', 'per_cart'].includes(charge.type)) {
                            stepErrors[`serviceCharge_${index}`] = `Service charge #${index + 1} has invalid type`;
                        }
                        if (!['fixed_price', 'percentage'].includes(charge.amountType)) {
                            stepErrors[`serviceCharge_${index}`] = `Service charge #${index + 1} has invalid amount type`;
                        }
                        if (typeof charge.amount !== 'number' || charge.amount < 0) {
                            stepErrors[`serviceCharge_${index}`] = `Service charge #${index + 1} requires a valid amount`;
                        }
                        if (charge.amountType === 'percentage' && charge.amount > 100) {
                            stepErrors[`serviceCharge_${index}`] = `Service charge #${index + 1} percentage cannot exceed 100%`;
                        }
                    });
                }
                break;

            case 6: // Media (optional)
                // No required fields
                break;

            case 7: // Policies (optional)
                if (formData.taxRate < 0 || formData.taxRate > 100) {
                    stepErrors.taxRate = "Tax rate must be between 0 and 100";
                }
                break;
        }

        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < STEPS.length) {
                setCurrentStep(currentStep + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        } else {
            toast.error("Please fix the errors before continuing");
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            const eventData = {
                ...formData,
                organizerId: formData.organizerId || organizerId, // Ensure organizerId is always present
                status: "draft",
                isPublic: false,
            };

            let result;
            if (mode === "edit" && initialData?.id) {
                result = await dispatch(
                    updateEvent({ id: initialData.id, updates: eventData })
                ).unwrap();
                toast.success("Draft saved successfully");
            } else {
                result = await dispatch(createEvent(eventData)).unwrap();
                toast.success("Draft created successfully");
            }

            router.push(`/panel/my-events/${result.event.id}/edit`);
        } catch (error) {
            toast.error(error.error || "Failed to save draft");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        // Validate all steps
        let allValid = true;
        for (let step = 1; step <= STEPS.length; step++) {
            if (!validateStep(step)) {
                allValid = false;
                setCurrentStep(step);
                toast.error(`Please complete step ${step}: ${STEPS[step - 1].title}`);
                return;
            }
        }

        if (!allValid) return;

        setIsSaving(true);
        try {
            const eventData = {
                ...formData,
                organizerId: formData.organizerId || organizerId, // Ensure organizerId is always present
                status: "published",
                isPublic: true,
            };

            let result;
            if (mode === "edit" && initialData?.id) {
                result = await dispatch(
                    updateEvent({ id: initialData.id, updates: eventData })
                ).unwrap();
                toast.success("Event updated and published successfully");
            } else {
                result = await dispatch(createEvent(eventData)).unwrap();
                toast.success("Event created and published successfully");
            }

            router.push(`/panel/my-events/${result.event.id}`);
        } catch (error) {
            toast.error(error.error || "Failed to publish event");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Progress Steps */}
            <Card>
                <div className="flex items-center justify-between overflow-x-auto pb-2">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center flex-shrink-0">
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${currentStep === step.id
                                        ? "bg-primary text-white"
                                        : currentStep > step.id
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-200 text-gray-600"
                                        }`}
                                    style={
                                        currentStep === step.id
                                            ? {
                                                backgroundColor: "var(--color-primary)",
                                                color: "white",
                                            }
                                            : currentStep > step.id
                                                ? {
                                                    backgroundColor: "rgb(34, 197, 94)",
                                                    color: "white",
                                                }
                                                : {
                                                    backgroundColor: "var(--color-surface-secondary)",
                                                    color: "var(--color-text-tertiary)",
                                                }
                                    }
                                >
                                    {currentStep > step.id ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        step.id
                                    )}
                                </button>
                                <span
                                    className="text-xs mt-2 text-center whitespace-nowrap"
                                    style={{
                                        color:
                                            currentStep === step.id
                                                ? "var(--color-text-primary)"
                                                : "var(--color-text-tertiary)",
                                    }}
                                >
                                    {step.title}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className="w-12 h-0.5 mx-2"
                                    style={{
                                        backgroundColor:
                                            currentStep > step.id
                                                ? "rgb(34, 197, 94)"
                                                : "var(--color-border)",
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Current Step Content */}
            <Card>
                <div className="mb-6">
                    <h2
                        className="text-xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {STEPS[currentStep - 1].title}
                    </h2>
                </div>

                <CurrentStepComponent
                    formData={formData}
                    errors={errors}
                    onChange={handleFieldChange}
                    onMultipleChange={handleMultipleFieldsChange}
                />
            </Card>

            {/* Navigation Buttons */}
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        {currentStep > 1 && (
                            <Button
                                variant="secondary"
                                onClick={handleBack}
                                icon={<ChevronLeft className="w-4 h-4" />}
                            >
                                Back
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleSaveDraft}
                            loading={isSaving}
                            icon={<Save className="w-4 h-4" />}
                        >
                            Save Draft
                        </Button>

                        {currentStep < STEPS.length ? (
                            <Button
                                onClick={handleNext}
                                icon={<ChevronRight className="w-4 h-4" />}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={handlePublish}
                                loading={isSaving}
                                icon={<Check className="w-4 h-4" />}
                            >
                                {mode === "edit" ? "Update & Publish" : "Create & Publish"}
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
