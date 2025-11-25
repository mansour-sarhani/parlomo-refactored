"use client";

import { useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    nextBusinessWizardStep,
    prevBusinessWizardStep,
    setBusinessWizardDraft,
} from "@/features/businesses/businessWizardSlice";
import { Button } from "@/components/common/Button";
import { InputField, TextareaField, FileUploadField, CheckboxField } from "@/components/forms";

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    shortDescription: Yup.string().required("Short description is required"),
    description: Yup.string().required("Description is required"),
    contactNumber: Yup.string().nullable(),
    email: Yup.string().email("Invalid email").nullable(),
    siteLink: Yup.string().url("Invalid URL").nullable(),
    socialMediaLink: Yup.string().url("Invalid URL").nullable(),
    youtubeLink: Yup.string().url("Invalid URL").nullable(),
    fullAddress: Yup.string()
        .nullable()
        .test("min-length", "Full address must be at least 10 characters", function (value) {
            if (!value || value.length === 0) return true; // Allow empty
            return value.length >= 10;
        }),
});

export default function BusinessDetailsStep() {
    const dispatch = useAppDispatch();
    const draft = useAppSelector((state) => state.businessWizard.draft);

    const initialValues = useMemo(
        () => {
            // Debug: Log draft data for this step
            console.log("[BusinessDetailsStep] Draft data:", draft);
            console.log("[BusinessDetailsStep] Logo:", draft.logo);
            console.log("[BusinessDetailsStep] Images:", draft.images);
            
            return {
                title: draft.title || "",
                shortDescription: draft.shortDescription || "",
                description: draft.description || "",
                contactNumber: draft.contactNumber || "",
                email: draft.email || "",
                siteLink: draft.siteLink || "",
                socialMediaLink: draft.socialMediaLink || "",
                youtubeLink: draft.youtubeLink || "",
                fullAddress: draft.fullAddress || "",
                showOnMap: Boolean(draft.showOnMap),
                logo: draft.logo || null, // This should be a URL string now
                images: Array.isArray(draft.images) ? draft.images : (draft.images ? [draft.images] : []), // Array of URL strings
            };
        },
        [draft]
    );

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={(values) => {
                dispatch(
                    setBusinessWizardDraft({
                        ...draft,
                        title: values.title,
                        shortDescription: values.shortDescription,
                        description: values.description,
                        contactNumber: values.contactNumber,
                        email: values.email,
                        siteLink: values.siteLink,
                        socialMediaLink: values.socialMediaLink,
                        youtubeLink: values.youtubeLink,
                        fullAddress: values.fullAddress,
                        showOnMap: values.showOnMap,
                        logo: values.logo || null,
                        images: values.images || [],
                    })
                );
                dispatch(nextBusinessWizardStep());
            }}
        >
            {({ isSubmitting, setFieldValue, values }) => (
                <Form className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <InputField
                            name="title"
                            label="Business name"
                            placeholder="Enter business title"
                            required
                        />
                        <InputField
                            name="contactNumber"
                            label="Contact number"
                            placeholder="07123 456 789"
                        />
                        <InputField
                            name="email"
                            label="Email"
                            placeholder="business@email.com"
                        />
                        <InputField
                            name="siteLink"
                            label="Website"
                            placeholder="https://example.com"
                        />
                        <InputField
                            name="socialMediaLink"
                            label="Social media link"
                            placeholder="https://instagram.com/yourbusiness"
                        />
                        <InputField
                            name="youtubeLink"
                            label="YouTube link"
                            placeholder="https://youtube.com/@yourbusiness"
                        />
                        <InputField
                            name="fullAddress"
                            label="Full address"
                            placeholder="123 Sample Street, London"
                            className="lg:col-span-2"
                        />
                    </div>

                    <TextareaField
                        name="shortDescription"
                        label="Short description"
                        rows={3}
                        required
                        placeholder="Brief overview shown in cards and search results."
                    />

                    <TextareaField
                        name="description"
                        label="Full description"
                        rows={6}
                        required
                        placeholder="Describe services, background, and key selling points."
                    />

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <FileUploadField
                            name="logo"
                            label="Business logo"
                            helperText="Square images (JPG, PNG, WEBP) look best."
                        />
                        <FileUploadField
                            name="images"
                            label="Gallery images"
                            helperText="Upload multiple images to showcase the business."
                            multiple
                        />
                    </div>

                    <CheckboxField
                        name="showOnMap"
                        label="Show this business on the public map"
                        onChange={(event) => setFieldValue("showOnMap", event.target.checked)}
                    />

                    <div className="flex items-center justify-between pt-4">
                        <Button type="button" variant="secondary" disabled>
                            Back
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            Continue
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}


