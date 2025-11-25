"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { FileUploadField } from "@/components/forms/FileUploadField";
import AttributeFields from "@/components/marketplace/wizard/AttributeFields";
import {
    nextStep,
    prevStep,
    setWizardDraft,
} from "@/features/marketplace/adWizardSlice";
import { fetchAttributesForCategory } from "@/features/marketplace/adAttributesSlice";

const phoneRegExp = /^0(?:\d{9}|\d{10}|\d{12})$/;

const schema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    contactNumber: Yup.string().nullable().matches(phoneRegExp, {
        message: "Invalid phone number",
        excludeEmptyString: true,
    }),
    email: Yup.string().nullable().email("Invalid email"),
    siteLink: Yup.string().nullable().url("Invalid URL"),
    youtubeLink: Yup.string().nullable().url("Invalid URL"),
    socialMediaLink: Yup.string().nullable().url("Invalid URL"),
});

export default function DetailsStep() {
    const dispatch = useDispatch();
    const { draft } = useSelector((state) => state.marketplaceAdWizard);
    const {
        categoryAttributes,
        categoryAttributesPrice,
        fetchingCategoryAttributes,
    } = useSelector((state) => state.marketplaceAdAttributes);

    const initialValues = useMemo(
        () => ({
            title: draft.detailsForm?.title || "",
            description: draft.detailsForm?.description || "",
            contactNumber: draft.detailsForm?.contactNumber || "",
            email: draft.detailsForm?.email || "",
            siteLink: draft.detailsForm?.siteLink || "",
            youtubeLink: draft.detailsForm?.youtubeLink || "",
            socialMediaLink: draft.detailsForm?.socialMediaLink || "",
            eventDate: draft.detailsForm?.eventDate || "",
            eventTime: draft.detailsForm?.eventTime || "",
            price: draft.detailsForm?.price || "",
            images: draft.detailsForm?.images || null,
            attributes: draft.detailsForm?.attributes || {},
        }),
        [draft.detailsForm]
    );

    useEffect(() => {
        if (draft.categoryId) {
            dispatch(fetchAttributesForCategory(draft.categoryId));
        }
    }, [dispatch, draft.categoryId]);

    const handleBack = () => {
        dispatch(prevStep());
    };

    const handleSubmit = (values) => {
        const attributePayload = Object.entries(values.attributes || {}).reduce(
            (acc, [key, value]) => ({
                ...acc,
                [`attribute[${key}]`]: value,
            }),
            {}
        );

        const images = Array.isArray(values.images)
            ? values.images
            : values.images
            ? [values.images]
            : [];

        const payload = {
            title: values.title,
            description: values.description,
            type: draft.typeId,
            category: draft.categoryId,
            cat_parent_id: draft.catParentId ?? null,
            postcode: draft.postcode,
            contactNumber: values.contactNumber,
            email: values.email,
            siteLink: values.siteLink,
            youtubeLink: values.youtubeLink,
            socialMediaLink: values.socialMediaLink,
            eventDate: values.eventDate || null,
            eventTime: values.eventTime || null,
            price: values.price || null,
            image: images,
            ...attributePayload,
        };

        dispatch(
            setWizardDraft({
                detailsForm: values,
                images,
                listingPayload: payload,
            })
        );
        dispatch(nextStep());
    };

    const renderPriceNotice = () => {
        if (!draft.showPrice) {
            return (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                    Price is hidden for this category. You can still store a value for internal use.
                </div>
            );
        }

        if (categoryAttributesPrice === 0) {
            return (
                <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    This listing is free to publish.
                </div>
            );
        }

        if (categoryAttributesPrice) {
            return (
                <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    Invoice price: £{categoryAttributesPrice}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Listing Details
                    </h2>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Provide the main information that will appear on the public listing.
                    </p>
                </div>

                <Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
                    {({ values, errors, touched }) => (
                        <Form className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <InputField name="title" label="Title" placeholder="e.g. Spacious 2-bed flat" required />
                                <InputField
                                    name="contactNumber"
                                    label="Contact phone"
                                    placeholder="07*********"
                                />
                                <InputField name="email" label="Email" placeholder="john@example.com" />
                                <InputField name="siteLink" label="Website" placeholder="https://example.com" />
                                <InputField name="youtubeLink" label="YouTube" placeholder="https://youtube.com" />
                                <InputField
                                    name="socialMediaLink"
                                    label="Social media"
                                    placeholder="https://instagram.com/username"
                                />
                            </div>

                            <div>
                                <label
                                    className="block text-sm font-medium"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Description
                                    <span className="ml-1" style={{ color: "var(--color-error)" }}>
                                        *
                                    </span>
                                </label>
                                <Field
                                    as="textarea"
                                    name="description"
                                    rows={5}
                                    className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 ${
                                        touched.description && errors.description
                                            ? "border-red-400 ring-2 ring-red-200"
                                            : ""
                                    }`}
                                    style={{
                                        borderColor:
                                            touched.description && errors.description
                                                ? "var(--color-error)"
                                                : "var(--color-border)",
                                        backgroundColor: "var(--color-background)",
                                        color: "var(--color-text-primary)",
                                    }}
                                />
                                {touched.description && errors.description ? (
                                    <p className="mt-1 text-xs" style={{ color: "var(--color-error)" }}>
                                        {errors.description}
                                    </p>
                                ) : null}
                            </div>

                            {draft.typeId === "1" && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <InputField name="eventDate" label="Event date" type="date" />
                                    <InputField name="eventTime" label="Event time" type="time" />
                                </div>
                            )}

                            <AttributeFields attributes={categoryAttributes} errors={errors} touched={touched} />

                            <FileUploadField
                                name="images"
                                label="Images"
                                multiple
                                helperText="Upload up to 10 images"
                                required
                            />

                            {draft.showPrice ? (
                                <InputField
                                    name="price"
                                    label="Price"
                                    type="number"
                                    placeholder="Enter the listing price"
                                />
                            ) : null}

                            {renderPriceNotice()}

                            <div className="flex justify-between">
                                <Button variant="outline" type="button" onClick={handleBack}>
                                    Back
                                </Button>
                                <Button type="submit" disabled={fetchingCategoryAttributes}>
                                    Continue
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

