"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import {
    InputField,
    TextareaField,
    DatePickerField,
    CheckboxField,
    FileUploadField,
    SelectField,
} from "@/components/forms";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { updateAdminAdvertisingOrder } from "@/features/advertising/adminAdvertisingOrdersSlice";

const STATUS_OPTIONS = [
    { value: "Pending", label: "Pending" },
    { value: "Active", label: "Active" },
    { value: "End", label: "Ended" },
];

const buildMediaUrl = (order) => {
    if (!order?.file && !order?.image) {
        return null;
    }

    const media = order.file || order.image;

    if (typeof media === "string" && media.startsWith("http")) {
        return media;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const normalizedPath = order.path ? `${order.path.replace(/\/+$/, "")}/` : "";

    return `${base}${normalizedPath}${media}`;
};

const toDateInputValue = (value) => {
    if (!value) {
        return "";
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().split("T")[0];
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split("T")[0];
    }

    // Attempt to parse dd-MM-yyyy
    if (typeof value === "string") {
        const parts = value.split("-");
        if (parts.length === 3) {
            const [first, second, third] = parts;
            // Assume dd-MM-yyyy
            const day = parseInt(first, 10);
            const month = parseInt(second, 10);
            const year = parseInt(third, 10);
            if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
                const legacy = new Date(year, month - 1, day);
                if (!Number.isNaN(legacy.getTime())) {
                    return legacy.toISOString().split("T")[0];
                }
            }
        }
    }

    return "";
};

const toLegacyDateFormat = (value) => {
    if (!value) {
        return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};

const createValidationSchema = (isVideoPlacement) =>
    Yup.object({
        link: Yup.string().url("Must be a valid URL").nullable(),
        title: isVideoPlacement
            ? Yup.string().required("Title is required for video placements")
            : Yup.string().nullable(),
        description: isVideoPlacement
            ? Yup.string().required("Description is required for video placements")
            : Yup.string().nullable(),
        startDate: Yup.string().required("Start date is required"),
        endDate: Yup.string().required("End date is required"),
        status: Yup.string().required("Status is required"),
        socialMedia: Yup.boolean(),
        file: Yup.mixed().nullable(),
    });

export function AdminAdvertisingOrderEditModal({ isOpen, orderData, onClose, onUpdated }) {
    const dispatch = useAppDispatch();
    const { updating } = useAppSelector((state) => state.adminAdvertisingOrders);

    const placement = (orderData?.placeType || "").toLowerCase();
    const isVideoPlacement = placement === "video";

    const validationSchema = useMemo(
        () => createValidationSchema(isVideoPlacement),
        [isVideoPlacement]
    );

    const initialValues = {
        link: orderData?.link || orderData?.url || "",
        title: orderData?.title || "",
        description: orderData?.description || "",
        startDate: toDateInputValue(orderData?.startDate || orderData?.start_date),
        endDate: toDateInputValue(orderData?.endDate || orderData?.end_date),
        socialMedia:
            orderData?.socialMedia === 1 ||
            orderData?.socialMedia === "1" ||
            orderData?.socialMedia === true ||
            orderData?.social_media === true,
        status: orderData?.status || "Pending",
        file: null,
    };

    const handleSubmit = async (values, formikHelpers) => {
        if (!orderData?.id) {
            return;
        }

        try {
            await dispatch(
                updateAdminAdvertisingOrder({
                    id: orderData.id,
                    changes: {
                        link: values.link,
                        title: values.title || undefined,
                        description: values.description || undefined,
                        startDate: toLegacyDateFormat(values.startDate),
                        endDate: toLegacyDateFormat(values.endDate),
                        socialMedia: values.socialMedia ? "1" : "0",
                        status: values.status,
                        file: values.file || undefined,
                    },
                })
            ).unwrap();

            toast.success("Advertising order updated successfully");
            formikHelpers.resetForm({ values: { ...values, file: null } });
            onUpdated?.();
            onClose?.();
        } catch (error) {
            toast.error(error || "Failed to update advertising order");
        }
    };

    const previewUrl = buildMediaUrl(orderData);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Advertising Order"
            size="xl"
        >
            {previewUrl ? (
                <div className="flex justify-center mb-6">
                    {isVideoPlacement ? (
                        <div
                            className="relative w-64 h-36 rounded-xl overflow-hidden border"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <video
                                src={previewUrl}
                                className="w-full h-full object-cover"
                                controls
                            />
                        </div>
                    ) : (
                        <div
                            className="relative w-64 h-36 rounded-xl overflow-hidden border"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <Image
                                src={previewUrl}
                                alt={orderData?.packageName || "Advertising media"}
                                fill
                                sizes="256px"
                                className="object-cover"
                            />
                        </div>
                    )}
                </div>
            ) : null}

            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, isSubmitting }) => (
                    <Form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                name="link"
                                label="Destination URL"
                                placeholder="https://example.com"
                                className="md:col-span-2"
                            />

                            {isVideoPlacement && (
                                <>
                                    <InputField
                                        name="title"
                                        label="Video Title"
                                        placeholder="Enter video title"
                                        required
                                    />
                                    <TextareaField
                                        name="description"
                                        label="Video Description"
                                        placeholder="Describe this video advertisement"
                                        rows={4}
                                        required
                                        className="md:col-span-2"
                                    />
                                </>
                            )}

                            <DatePickerField
                                name="startDate"
                                label="Start Date"
                                required
                            />
                            <DatePickerField
                                name="endDate"
                                label="End Date"
                                required
                            />

                            <SelectField
                                name="status"
                                label="Status"
                                options={STATUS_OPTIONS}
                                placeholder="Select status"
                                required
                            />

                            <CheckboxField
                                name="socialMedia"
                                label="Include social media promotion"
                                className="md:col-span-2"
                            />
                        </div>

                        <FileUploadField
                            name="file"
                            label={isVideoPlacement ? "Replace Video" : "Replace Banner"}
                            helperText={
                                isVideoPlacement
                                    ? "Upload a new MP4, MOV, or WEBM file"
                                    : "Upload a new banner image (JPG, PNG, WEBP)"
                            }
                            required={false}
                            accept={
                                isVideoPlacement
                                    ? { "video/*": [".mp4", ".mov", ".webm"] }
                                    : { "image/*": [".jpg", ".jpeg", ".png", ".webp"] }
                            }
                        />

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={updating || isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" loading={updating || isSubmitting}>
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default AdminAdvertisingOrderEditModal;
