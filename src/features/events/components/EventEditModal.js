"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import {
    InputField,
    SelectField,
    TextareaField,
    DatePickerField,
    TimePickerField,
    CheckboxField,
    FileUploadField,
} from "@/components/forms";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchEventById,
    updateEvent,
    clearCurrentEvent,
    fetchEventCategories,
} from "@/features/events/eventsSlice";

const phoneRegExp = /^0(?:\d{9}|\d{10}|\d{12})$/;

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    category: Yup.string().required("Category is required"),
    description: Yup.string().required("Description is required"),
    contactNumber: Yup.string().matches(phoneRegExp, {
        message: "Invalid phone number",
        excludeEmptyString: true,
    }),
    email: Yup.string().email("Invalid email address"),
    siteLink: Yup.string().url("Invalid URL"),
    youtubeLink: Yup.string().url("Invalid URL"),
});

const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Pending", value: "Pending" },
    { label: "Reject", value: "Reject" },
    { label: "End", value: "End" },
];

const buildCategoryOptions = (categories = []) => {
    return categories.map((category) => ({
        label: category.title,
        value: String(category.id ?? category.value ?? ""),
    }));
};

const convertToDateInput = (value) => {
    if (!value) return "";

    if (value.includes("-")) {
        const parts = value.split("-");
        if (parts.length === 3 && parts[0].length === 2) {
            const [day, month, year] = parts;
            return `${year}-${month}-${day}`;
        }
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toISOString().split("T")[0];
};

const buildImageUrl = (event) => {
    if (!event) return null;

    if (Array.isArray(event.image) && event.image.length > 0) {
        const base = process.env.NEXT_PUBLIC_URL_KEY || "";
        const path = event.path ? `${event.path.replace(/\/+$/, "")}/` : "";
        return event.image.map((img) => `${base}${path}${img}`);
    }

    if (typeof event.image === "string" && event.image.length > 0) {
        if (event.image.startsWith("http")) {
            return [event.image];
        }

        const base = process.env.NEXT_PUBLIC_URL_KEY || "";
        const path = event.path ? `${event.path.replace(/\/+$/, "")}/` : "";
        return [`${base}${path}${event.image}`];
    }

    return [];
};

export function EventEditModal({ eventId, isOpen, onClose, onUpdated }) {
    const dispatch = useAppDispatch();
    const { currentEvent, fetchingSingle, updating, categories, categoriesLoading, categoriesLoaded } =
        useAppSelector((state) => state.events);

    const [previewImage, setPreviewImage] = useState(null);

    const imageUrls = useMemo(() => buildImageUrl(currentEvent), [currentEvent]);

    useEffect(() => {
        if (isOpen && !categoriesLoaded && !categoriesLoading) {
            dispatch(fetchEventCategories());
        }

        if (isOpen && eventId) {
            dispatch(fetchEventById(eventId));
        }

        return () => {
            dispatch(clearCurrentEvent());
            setPreviewImage(null);
        };
    }, [categoriesLoaded, categoriesLoading, dispatch, eventId, isOpen]);

    const initialValues = useMemo(() => {
        if (!currentEvent) {
            return {
                title: "",
                category: "",
                description: "",
                contactNumber: "",
                email: "",
                siteLink: "",
                youtubeLink: "",
                postcode: "",
                eventDate: "",
                eventTime: "",
                validDate: "",
                showOnMap: false,
                status: "Pending",
                newImages: null,
            };
        }

        return {
            title: currentEvent.title || "",
            category: currentEvent.categoryId ? String(currentEvent.categoryId) : "",
            description: currentEvent.description || "",
            contactNumber: currentEvent.contactNumber || "",
            email: currentEvent.email || "",
            siteLink: currentEvent.siteLink || "",
            youtubeLink: currentEvent.youtubeLink || "",
            postcode: currentEvent.postcode || "",
            eventDate: convertToDateInput(currentEvent.eventDate),
            eventTime: currentEvent.eventTime || "",
            validDate: convertToDateInput(currentEvent.validDate),
            showOnMap: Boolean(currentEvent.showMap || currentEvent.showOnMap),
            status: currentEvent.status || "Pending",
            newImages: null,
        };
    }, [currentEvent]);

    const handleSubmit = useCallback(
        async (values) => {
            if (!currentEvent) {
                return;
            }

            const changes = {};

            const compareField = (field, currentValue, newValue) => {
                if (newValue !== currentValue && !(newValue === "" && !currentValue)) {
                    changes[field] = newValue;
                }
            };

            compareField("title", currentEvent.title, values.title.trim());
            compareField("category", currentEvent.categoryId ? String(currentEvent.categoryId) : "", values.category);
            compareField("description", currentEvent.description, values.description);
            compareField("contactNumber", currentEvent.contactNumber, values.contactNumber);
            compareField("email", currentEvent.email, values.email);
            compareField("siteLink", currentEvent.siteLink, values.siteLink);
            compareField("youtubeLink", currentEvent.youtubeLink, values.youtubeLink);
            compareField("postcode", currentEvent.postcode, values.postcode);
            compareField("eventDate", convertToDateInput(currentEvent.eventDate), values.eventDate);
            compareField("eventTime", currentEvent.eventTime || "", values.eventTime || "");
            compareField("validDate", convertToDateInput(currentEvent.validDate), values.validDate);

            const currentShowMap = Boolean(currentEvent.showMap || currentEvent.showOnMap);
            if (currentShowMap !== values.showOnMap) {
                changes.showOnMap = values.showOnMap;
            }

            if (values.status && values.status !== currentEvent.status) {
                changes.status = values.status;
            }

            if (Array.isArray(values.newImages) && values.newImages.length > 0) {
                changes.newImages = values.newImages;
            }

            if (Object.keys(changes).length === 0) {
                toast.info("No changes detected");
                return;
            }

            try {
                await dispatch(
                    updateEvent({
                        id: eventId,
                        changes,
                    })
                ).unwrap();

                toast.success("Event updated successfully");
                onUpdated?.();
                onClose?.();
            } catch (error) {
                toast.error(error || "Failed to update event");
            }
        },
        [currentEvent, dispatch, eventId, onClose, onUpdated]
    );

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Edit Event"
                size="xl"
            >
                {fetchingSingle ? (
                    <div className="py-10 text-center" style={{ color: "var(--color-text-secondary)" }}>
                        Loading event details...
                    </div>
                ) : currentEvent ? (
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        name="title"
                                        label="Event Title"
                                        placeholder="Enter event title"
                                        required
                                    />

                                    <SelectField
                                        name="category"
                                        label="Event Category"
                                        placeholder="Select category"
                                        options={buildCategoryOptions(categories)}
                                        disabled={categoriesLoading}
                                        required
                                    />

                                    <InputField
                                        name="contactNumber"
                                        label="Contact Number"
                                        placeholder="07*********"
                                    />

                                    <InputField
                                        name="email"
                                        label="Email"
                                        type="email"
                                        placeholder="contact@email.com"
                                    />

                                    <InputField
                                        name="siteLink"
                                        label="Website"
                                        placeholder="https://example.com"
                                    />

                                    <InputField
                                        name="youtubeLink"
                                        label="YouTube Link"
                                        placeholder="https://youtube.com/..."
                                    />

                                    <InputField
                                        name="postcode"
                                        label="Postcode"
                                        placeholder="AB1 2CD"
                                    />

                                    <DatePickerField
                                        name="eventDate"
                                        label="Event Date"
                                        min={new Date().toISOString().split("T")[0]}
                                    />

                                    <TimePickerField
                                        name="eventTime"
                                        label="Event Time"
                                    />

                                    <DatePickerField
                                        name="validDate"
                                        label="Valid Until"
                                        min={new Date().toISOString().split("T")[0]}
                                    />

                                    <SelectField
                                        name="status"
                                        label="Status"
                                        options={statusOptions}
                                    />
                                </div>

                                <TextareaField
                                    name="description"
                                    label="Description"
                                    placeholder="Describe the event"
                                    rows={6}
                                    required
                                />

                                <CheckboxField
                                    name="showOnMap"
                                    label="Show location on map"
                                />

                                <div className="space-y-3">
                                    <p
                                        className="text-sm font-medium"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        Current Images
                                    </p>

                                    {imageUrls.length === 0 ? (
                                        <div
                                            className="flex items-center justify-center w-full rounded-lg border py-6 text-sm"
                                            style={{
                                                borderColor: "var(--color-border)",
                                                color: "var(--color-text-tertiary)",
                                                backgroundColor: "var(--color-background-elevated)",
                                            }}
                                        >
                                            No images available
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {imageUrls.map((url, index) => (
                                                <button
                                                    type="button"
                                                    key={`${url}-${index}`}
                                                    onClick={() => setPreviewImage(url)}
                                                    className="relative w-full h-32 overflow-hidden rounded-lg border"
                                                    style={{ borderColor: "var(--color-border)" }}
                                                >
                                                    <Image
                                                        src={url}
                                                        alt={currentEvent.title || "Event image"}
                                                        fill
                                                        sizes="(max-width: 768px) 50vw, 200px"
                                                        className="object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <FileUploadField
                                        name="newImages"
                                        label="Add New Images"
                                        helperText="Any new images will be appended to the event"
                                        multiple
                                        accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] }}
                                        maxSize={10 * 1024 * 1024}
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={onClose}
                                        disabled={updating || isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={updating || isSubmitting}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                ) : (
                    <div className="py-10 text-center" style={{ color: "var(--color-error)" }}>
                        Unable to load event data
                    </div>
                )}
            </Modal>

            {previewImage && (
                <Modal
                    isOpen={Boolean(previewImage)}
                    onClose={() => setPreviewImage(null)}
                    title={currentEvent?.title || "Event image"}
                    size="lg"
                >
                    <div className="relative w-full h-[400px]">
                        <Image
                            src={previewImage}
                            alt={currentEvent?.title || "Event image"}
                            fill
                            sizes="(max-width: 768px) 100vw, 800px"
                            className="object-contain"
                        />
                    </div>
                </Modal>
            )}
        </>
    );
}

export default EventEditModal;

