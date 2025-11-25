"use client";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useMemo } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";

const createValidationSchema = (requireReasonFor = [], minReasonLength = 10) =>
    Yup.object({
        status: Yup.string().required("Please choose a status"),
        reason: Yup.string().when("status", {
            is: (value) => requireReasonFor.includes(value),
            then: (schema) =>
                schema
                    .trim()
                    .min(
                        minReasonLength,
                        `Reason must be at least ${minReasonLength} characters`
                    )
                    .required("Reason is required for this status"),
            otherwise: (schema) => schema.notRequired(),
        }),
    });

export function AdminReviewDecisionModal({
    isOpen,
    title = "Review Item",
    description,
    onClose,
    onSubmit,
    statusOptions = [],
    requireReasonFor = ["Reject", "Rejected"],
    minReasonLength = 10,
    submitting = false,
    successMessage = "Status updated successfully",
    errorMessage = "Failed to update status",
    defaultStatus = "",
    reasonLabel = "Reason",
}) {
    const validationSchema = useMemo(
        () => createValidationSchema(requireReasonFor, minReasonLength),
        [requireReasonFor, minReasonLength]
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            size="md"
        >
            <Formik
                enableReinitialize
                initialValues={{
                    status: defaultStatus,
                    reason: "",
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, helpers) => {
                    try {
                        await onSubmit?.(values);
                        toast.success(successMessage);
                        helpers.resetForm();
                        onClose?.();
                    } catch (error) {
                        const message =
                            error?.message ||
                            error?.data?.message ||
                            errorMessage;
                        toast.error(message);
                        helpers.setSubmitting(false);
                    }
                }}
            >
                {({ errors, touched, isSubmitting, values }) => {
                    const isReasonRequired = requireReasonFor.includes(
                        values.status
                    );

                    return (
                        <Form className="space-y-6">
                            <div className="space-y-3">
                                <label
                                    htmlFor="status"
                                    className="block text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Status
                                </label>
                                <Field
                                    as="select"
                                    id="status"
                                    name="status"
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor:
                                            "var(--color-background)",
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    <option value="">Select status…</option>
                                    {statusOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </Field>
                                {touched.status && errors.status && (
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-error)",
                                        }}
                                    >
                                        {errors.status}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <label
                                        htmlFor="reason"
                                        className="block text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {reasonLabel}
                                    </label>
                                    {isReasonRequired && (
                                        <span
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-warning)",
                                            }}
                                        >
                                            Required when rejecting
                                        </span>
                                    )}
                                </div>
                                <Field
                                    as="textarea"
                                    id="reason"
                                    name="reason"
                                    rows={4}
                                    placeholder="Add notes for the owner (optional)"
                                    className="w-full rounded-md border px-3 py-2 text-sm leading-5"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor:
                                            "var(--color-background)",
                                        color: "var(--color-text-primary)",
                                    }}
                                />
                                {touched.reason && errors.reason && (
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-error)",
                                        }}
                                    >
                                        {errors.reason}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onClose}
                                    disabled={isSubmitting || submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={isSubmitting || submitting}
                                >
                                    Save decision
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
}

export default AdminReviewDecisionModal;

