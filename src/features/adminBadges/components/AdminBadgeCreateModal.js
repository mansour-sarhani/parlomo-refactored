"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { AdminBadgeFormFields } from "./AdminBadgeFormFields";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createAdminBadge } from "@/features/adminBadges/adminBadgesSlice";
import { useCallback } from "react";

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
    image: Yup.mixed().required("Image is required"),
});

export function AdminBadgeCreateModal({ isOpen, onClose, onCreated }) {
    const dispatch = useAppDispatch();
    const creating = useAppSelector((state) => state.adminBadges.creating);

    const handleSubmit = useCallback(
        async (values, formikHelpers) => {
            try {
                await dispatch(
                    createAdminBadge({
                        title: values.title,
                        price: values.price,
                        badgeType: values.badgeType,
                        days: values.days,
                        extraDays: values.extraDays,
                        description: values.description,
                        image: values.image,
                    })
                ).unwrap();

                toast.success("Badge package created successfully");
                formikHelpers.resetForm();
                onCreated?.();
                onClose?.();
            } catch (error) {
                toast.error(error || "Failed to create badge package");
            }
        },
        [dispatch, onClose, onCreated]
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Badge Package"
            size="lg"
        >
            <Formik
                initialValues={{
                    title: "",
                    price: "",
                    badgeType: "",
                    days: "",
                    extraDays: "",
                    description: "",
                    image: null,
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-6">
                        <AdminBadgeFormFields
                            requireImage
                            helperText="Upload a square image. Supported formats: JPG, PNG, WEBP."
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
                                Create
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default AdminBadgeCreateModal;


