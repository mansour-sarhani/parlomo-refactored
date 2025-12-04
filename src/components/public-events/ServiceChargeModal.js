"use client";

import { useCallback } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { InputField, SelectField } from "@/components/forms";
import { SERVICE_CHARGE_TYPES, SERVICE_CHARGE_AMOUNT_TYPES, CURRENCIES } from "@/types/public-events-types";

const validationSchema = Yup.object({
    title: Yup.string()
        .required("Title is required")
        .max(100, "Title cannot exceed 100 characters"),
    type: Yup.string()
        .oneOf(['per_ticket', 'per_cart'], "Invalid charge type")
        .required("Type is required"),
    amountType: Yup.string()
        .oneOf(['fixed_price', 'percentage'], "Invalid amount type")
        .required("Amount type is required"),
    amount: Yup.number()
        .required("Amount is required")
        .min(0, "Amount cannot be negative")
        .when('amountType', {
            is: 'percentage',
            then: (schema) => schema.max(100, "Percentage cannot exceed 100"),
        })
        .typeError("Amount must be a number"),
});

/**
 * ServiceChargeModal Component
 * Modal for creating and editing service charges
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {function} props.onClose - Close handler
 * @param {function} props.onSave - Save handler (receives {title, type, amount})
 * @param {Object|null} props.initialValues - null for create, object for edit
 * @param {string} props.currency - Currency code for displaying symbol
 */
export function ServiceChargeModal({
    isOpen,
    onClose,
    onSave,
    initialValues = null,
    currency = "GBP",
}) {
    const isEditMode = initialValues !== null;

    // Get currency symbol
    const currencyData = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
    const currencySymbol = currencyData.symbol;

    const handleSubmit = useCallback(
        (values, formikHelpers) => {
            onSave({
                title: values.title.trim(),
                type: values.type,
                amountType: values.amountType,
                amount: parseFloat(values.amount),
            });
            formikHelpers.resetForm();
            onClose();
        },
        [onSave, onClose]
    );

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditMode ? "Edit Service Charge" : "Add Service Charge"}
            size="md"
        >
            <Formik
                initialValues={{
                    title: initialValues?.title || "",
                    type: initialValues?.type || "per_ticket",
                    amountType: initialValues?.amountType || "fixed_price",
                    amount: initialValues?.amount ?? "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting, values }) => (
                    <Form className="space-y-6">
                        <InputField
                            name="title"
                            label="Title"
                            placeholder="e.g., Booking Fee, Processing Fee"
                            required
                        />

                        <SelectField
                            name="type"
                            label="Charge Type"
                            required
                        >
                            {SERVICE_CHARGE_TYPES.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            name="amountType"
                            label="Amount Type"
                            required
                        >
                            {SERVICE_CHARGE_AMOUNT_TYPES.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <InputField
                            name="amount"
                            label={values.amountType === 'percentage' ? 'Amount (%)' : `Amount (${currencySymbol})`}
                            type="number"
                            placeholder={values.amountType === 'percentage' ? 'e.g., 10' : 'e.g., 2.50'}
                            min="0"
                            max={values.amountType === 'percentage' ? "100" : undefined}
                            step={values.amountType === 'percentage' ? '0.1' : '0.01'}
                            required
                        />

                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {values.type === 'per_cart'
                                ? "Per Cart charges are applied once per order."
                                : "Per Ticket charges are applied to each ticket in the order."}
                            {" "}
                            {values.amountType === 'percentage'
                                ? "Percentage charges are calculated based on the ticket/cart price."
                                : "Fixed price charges are a flat fee."}
                        </p>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={isSubmitting}
                            >
                                {isEditMode ? "Update" : "Add"}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default ServiceChargeModal;
