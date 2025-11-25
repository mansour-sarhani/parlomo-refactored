"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
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
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createEvent, fetchEventCategories } from "@/features/events/eventsSlice";

const phoneRegExp = /^0(?:\d{9}|\d{10}|\d{12})$/;

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    category: Yup.string().required("Category is required"),
    description: Yup.string().required("Description is required"),
    images: Yup.array()
        .of(Yup.mixed())
        .min(1, "At least one image is required"),
    contactNumber: Yup.string().matches(phoneRegExp, {
        message: "Invalid phone number",
        excludeEmptyString: true,
    }),
    email: Yup.string().email("Invalid email address"),
    siteLink: Yup.string().url("Invalid URL"),
    youtubeLink: Yup.string().url("Invalid URL"),
});

const initialValues = {
    title: "",
    category: "",
    description: "",
    images: null,
    contactNumber: "",
    email: "",
    siteLink: "",
    youtubeLink: "",
    postcode: "",
    eventDate: "",
    eventTime: "",
    validDate: "",
    showOnMap: false,
};

const buildCategoryOptions = (categories = []) => {
    return categories.map((category) => ({
        label: category.title,
        value: String(category.id ?? category.value ?? ""),
    }));
};

export function EventCreateModal({ isOpen, onClose, onCreated }) {
    const dispatch = useAppDispatch();
    const { creating, categories, categoriesLoading, categoriesLoaded } = useAppSelector((state) => state.events);

    useEffect(() => {
        if (isOpen && !categoriesLoaded && !categoriesLoading) {
            dispatch(fetchEventCategories());
        }
    }, [categoriesLoaded, categoriesLoading, dispatch, isOpen]);

    const handleSubmit = async (values, formikHelpers) => {
        try {
            await dispatch(
                createEvent({
                    title: values.title,
                    category: values.category,
                    description: values.description,
                    images: values.images,
                    contactNumber: values.contactNumber,
                    email: values.email,
                    siteLink: values.siteLink,
                    youtubeLink: values.youtubeLink,
                    postcode: values.postcode,
                    eventDate: values.eventDate,
                    eventTime: values.eventTime,
                    validDate: values.validDate,
                    showOnMap: values.showOnMap,
                })
            ).unwrap();

            toast.success("Event created successfully");
            formikHelpers.resetForm();
            onCreated?.();
            onClose?.();
        } catch (error) {
            toast.error(error || "Failed to create event");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Event"
            size="xl"
        >
            <Formik
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

                        <FileUploadField
                            name="images"
                            label="Event Images"
                            helperText="Upload up to 10 images (JPG, PNG, WEBP)"
                            multiple
                            accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] }}
                            maxSize={10 * 1024 * 1024}
                            required
                        />

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={creating || isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={creating || isSubmitting}
                            >
                                Create Event
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default EventCreateModal;

