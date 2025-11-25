"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { AdminBadgeFormFields } from "./AdminBadgeFormFields";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchAdminBadgeById,
    updateAdminBadge,
    clearCurrentBadge,
} from "@/features/adminBadges/adminBadgesSlice";

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    price: Yup.number()
        .typeError("Price must be a number")
        .min(0, "Price must be zero or greater")
        .required("Price is required"),
    badgeType: Yup.string().required("Badge type is required"),
    days: Yup.number()
        .typeError("Days must be a number")
        .integer("Days must be a whole number")
        .min(0, "Days must be zero or greater")
        .required("Days are required"),
    extraDays: Yup.number()
        .typeError("Extra days must be a number")
        .integer("Extra days must be a whole number")
        .min(0, "Extra days cannot be negative")
        .nullable()
        .transform((value, originalValue) =>
            originalValue === "" ? null : value
        ),
    description: Yup.string().required("Description is required"),
    status: Yup.string().oneOf(["Pending", "Active"]).required("Status is required"),
    image: Yup.mixed().nullable(),
});

const buildImageUrl = (badge) => {
    if (!badge?.image) return null;

    if (typeof badge.image === "string" && badge.image.startsWith("http")) {
        return badge.image;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const normalizedPath = badge.path
        ? `${badge.path.replace(/\/+$/, "")}/`
        : "";

    return `${base}${normalizedPath}${badge.image}`;
};

const normalizeNumberInput = (value) => {
    if (value === "" || value === null || value === undefined) {
        return null;
    }

    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? value : numericValue;
};

export function AdminBadgeEditModal({ badgeId, isOpen, onClose, onUpdated }) {
    const dispatch = useAppDispatch();
    const { currentBadge, fetchingSingle, updating } = useAppSelector(
        (state) => state.adminBadges
    );
    const [isImagePreviewOpen, setImagePreviewOpen] = useState(false);

    useEffect(() => {
        if (isOpen && badgeId) {
            dispatch(fetchAdminBadgeById(badgeId));
        }

        return () => {
            dispatch(clearCurrentBadge());
            setImagePreviewOpen(false);
        };
    }, [dispatch, isOpen, badgeId]);

    const imageUrl = useMemo(
        () => buildImageUrl(currentBadge),
        [currentBadge]
    );

    const handleSubmit = useCallback(
        async (values, formikHelpers) => {
            if (!currentBadge) {
                return;
            }

            const changes = {};

            const trimmedTitle = values.title.trim();
            if (trimmedTitle && trimmedTitle !== (currentBadge.title || "")) {
                changes.title = trimmedTitle;
            }

            const priceValue = normalizeNumberInput(values.price);
            if (
                priceValue !== null &&
                priceValue !== normalizeNumberInput(currentBadge.price)
            ) {
                changes.price = priceValue;
            }

            if (
                values.badgeType &&
                values.badgeType !== (currentBadge.badgeType || "")
            ) {
                changes.badgeType = values.badgeType;
            }

            const daysValue = normalizeNumberInput(values.days);
            if (
                daysValue !== null &&
                daysValue !== normalizeNumberInput(currentBadge.days)
            ) {
                changes.days = daysValue;
            }

            const extraDaysValue = normalizeNumberInput(values.extraDays);
            if (
                extraDaysValue !== normalizeNumberInput(currentBadge.extraDays)
            ) {
                changes.extraDays = extraDaysValue ?? 0;
            }

            const trimmedDescription = values.description.trim();
            if (
                trimmedDescription &&
                trimmedDescription !== (currentBadge.description || "")
            ) {
                changes.description = trimmedDescription;
            }

            if (
                values.status &&
                values.status !== (currentBadge.status || "")
            ) {
                changes.status = values.status;
            }

            if (values.image instanceof File || values.image instanceof Blob) {
                changes.image = values.image;
            }

            if (Object.keys(changes).length === 0) {
                toast.info("No changes detected");
                return;
            }

            try {
                await dispatch(
                    updateAdminBadge({
                        id: badgeId,
                        changes,
                    })
                ).unwrap();

                toast.success("Badge package updated successfully");
                formikHelpers.resetForm({
                    values: {
                        ...values,
                        image: null,
                    },
                });
                onUpdated?.();
                onClose?.();
            } catch (error) {
                toast.error(error || "Failed to update badge package");
            }
        },
        [badgeId, currentBadge, dispatch, onClose, onUpdated]
    );

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Edit Badge Package"
                size="lg"
            >
                {fetchingSingle ? (
                    <div
                        className="py-12 text-center text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Loading badge details...
                    </div>
                ) : currentBadge ? (
                    <Formik
                        enableReinitialize
                        initialValues={{
                            title: currentBadge.title || "",
                            price: currentBadge.price ?? "",
                            badgeType: currentBadge.badgeType || "",
                            days: currentBadge.days ?? "",
                            extraDays:
                                currentBadge.extraDays === null ||
                                currentBadge.extraDays === undefined
                                    ? ""
                                    : currentBadge.extraDays,
                            description: currentBadge.description || "",
                            status: currentBadge.status || "Pending",
                            image: null,
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-6">
                                <AdminBadgeFormFields
                                    showStatus
                                    helperText="Uploading a new image replaces the existing one."
                                />

                                {imageUrl && (
                                    <div className="rounded-lg border p-4 flex items-center gap-4">
                                        <div
                                            className="relative w-24 h-24 rounded-lg overflow-hidden border"
                                            style={{
                                                borderColor: "var(--color-border)",
                                            }}
                                        >
                                            <Image
                                                src={imageUrl}
                                                alt={
                                                    currentBadge.title ||
                                                    "Badge image"
                                                }
                                                fill
                                                sizes="96px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span
                                                className="text-sm font-medium"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Current image
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setImagePreviewOpen(true)
                                                }
                                            >
                                                View full size
                                            </Button>
                                        </div>
                                    </div>
                                )}

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
                                        Update
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                ) : (
                    <div
                        className="py-12 text-center text-sm"
                        style={{ color: "var(--color-error)" }}
                    >
                        Unable to load badge package
                    </div>
                )}
            </Modal>

            {isImagePreviewOpen && imageUrl && (
                <Modal
                    isOpen={isImagePreviewOpen}
                    onClose={() => setImagePreviewOpen(false)}
                    title={currentBadge?.title || "Badge image"}
                    size="lg"
                >
                    <div className="relative w-full h-[400px]">
                        <Image
                            src={imageUrl}
                            alt={currentBadge?.title || "Badge image"}
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

export default AdminBadgeEditModal;


