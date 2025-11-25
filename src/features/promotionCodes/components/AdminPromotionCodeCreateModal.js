"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { AdminPromotionCodeFormFields } from "./AdminPromotionCodeFormFields";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createAdminPromotionCode } from "@/features/promotionCodes/adminPromotionCodesSlice";

const formatDateTimePayload = (value) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    try {
        return format(date, "dd-MM-yyyy HH:mm");
    } catch (error) {
        return null;
    }
};

const validationSchema = Yup.object().shape({
    code: Yup.string().trim().required("Promotion code is required"),
    model: Yup.string().nullable(),
    discountType: Yup.string()
        .oneOf(["price", "percentage"], "Select a valid discount type")
        .required("Discount type is required"),
    price: Yup.number()
        .typeError("Discount value must be a number")
        .min(0, "Value cannot be negative")
        .required("Discount value is required"),
    useTime: Yup.number()
        .typeError("Usage limit must be a number")
        .integer("Usage limit must be an integer")
        .min(1, "Usage limit must be at least 1")
        .required("Usage limit is required"),
    validFrom: Yup.string().nullable(),
    validTo: Yup.string()
        .nullable()
        .test(
            "is-after-start",
            "End date must be after start date",
            function (value) {
                const { validFrom } = this.parent;
                if (!value || !validFrom) {
                    return true;
                }

                const start = new Date(validFrom);
                const end = new Date(value);

                if (
                    Number.isNaN(start.getTime()) ||
                    Number.isNaN(end.getTime())
                ) {
                    return true;
                }

                return end >= start;
            }
        ),
    status: Yup.string()
        .oneOf(["active", "inactive"], "Select a valid status")
        .required("Status is required"),
});

const initialValues = {
    code: "",
    model: "",
    discountType: "price",
    price: "",
    useTime: "",
    validFrom: "",
    validTo: "",
    status: "active",
};

export function AdminPromotionCodeCreateModal({
    isOpen,
    onClose,
    onCreated,
}) {
    const dispatch = useAppDispatch();
    const { creating } = useAppSelector((state) => state.adminPromotionCodes);

    const handleSubmit = async (values, formikHelpers) => {
        try {
            await dispatch(
                createAdminPromotionCode({
                    code: values.code.trim(),
                    model: values.model ?? "",
                    discountType: values.discountType,
                    price: values.price,
                    useTime: values.useTime,
                    validFrom: formatDateTimePayload(values.validFrom),
                    validTo: formatDateTimePayload(values.validTo),
                    status: values.status,
                })
            ).unwrap();

            toast.success("Promotion code created successfully");

            formikHelpers.resetForm();
            onCreated?.();
            onClose?.();
        } catch (error) {
            const message =
                error?.message ||
                (typeof error === "string" ? error : null) ||
                "Failed to create promotion code";

            toast.error(message);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Promotion Code"
            size="lg"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-6">
                        <AdminPromotionCodeFormFields />

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
                                Create Code
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default AdminPromotionCodeCreateModal;

