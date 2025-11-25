"use client";

import { useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { AdminPromotionCodeFormFields } from "./AdminPromotionCodeFormFields";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { updateAdminPromotionCode } from "@/features/promotionCodes/adminPromotionCodesSlice";

const toDateTimeInputValue = (value) => {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    try {
        return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
        return "";
    }
};

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

export function AdminPromotionCodeEditModal({
    isOpen,
    promotionCode,
    onClose,
    onUpdated,
}) {
    const dispatch = useAppDispatch();
    const { updating } = useAppSelector((state) => state.adminPromotionCodes);

    const initialValues = useMemo(() => {
        if (!promotionCode) {
            return {
                code: "",
                model: "",
                discountType: "price",
                price: "",
                useTime: "",
                validFrom: "",
                validTo: "",
                status: "inactive",
            };
        }

        return {
            code: promotionCode.code || "",
            model: promotionCode.model ?? "",
            discountType:
                (promotionCode.discountType || "").trim().toLowerCase() ||
                "price",
            price: promotionCode.price ?? "",
            useTime: promotionCode.useTime ?? "",
            validFrom: toDateTimeInputValue(
                promotionCode.validFrom || promotionCode.valid_from
            ),
            validTo: toDateTimeInputValue(
                promotionCode.validTo || promotionCode.valid_to
            ),
            status:
                (promotionCode.status || "").trim().toLowerCase() || "inactive",
        };
    }, [promotionCode]);

    const handleSubmit = async (values) => {
        if (!promotionCode?.id) {
            toast.error("Unable to update promotion code");
            return;
        }

        try {
            await dispatch(
                updateAdminPromotionCode({
                    id: promotionCode.id,
                    changes: {
                        model: values.model ?? "",
                        discountType: values.discountType,
                        price: values.price,
                        useTime: values.useTime,
                        validFrom: formatDateTimePayload(values.validFrom),
                        validTo: formatDateTimePayload(values.validTo),
                        status: values.status,
                    },
                })
            ).unwrap();

            toast.success("Promotion code updated successfully");
            onUpdated?.();
            onClose?.();
        } catch (error) {
            const message =
                error?.message ||
                (typeof error === "string" ? error : null) ||
                "Failed to update promotion code";
            toast.error(message);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Promotion Code"
            size="lg"
        >
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-6">
                        <AdminPromotionCodeFormFields disableCode />

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
                                Update Code
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default AdminPromotionCodeEditModal;

