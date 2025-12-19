"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { RefundStatusBadge } from "@/components/refunds/RefundStatusBadge";
import { CurrencyDisplay } from "@/components/refunds/CurrencyDisplay";
import ticketingService from "@/services/ticketing.service";
import { Info, CheckCircle, AlertCircle } from "lucide-react";

const REFUND_REASON_OPTIONS = [
    { value: "", label: "Select a reason...", disabled: true },
    { value: "event_cancelled", label: "Event was cancelled" },
    { value: "cannot_attend", label: "I can no longer attend" },
    { value: "duplicate_purchase", label: "Duplicate purchase" },
    { value: "other", label: "Other reason" },
];

const validationSchema = Yup.object().shape({
    order_number: Yup.string()
        .required("Order number is required")
        .matches(
            /^ORD-\d{4}-\d+$/,
            "Invalid order number format (e.g., ORD-2025-123456)"
        ),
    email: Yup.string()
        .email("Please enter a valid email address")
        .required("Email is required"),
    reason: Yup.string()
        .required("Please select a reason")
        .oneOf(
            ["event_cancelled", "cannot_attend", "duplicate_purchase", "other"],
            "Please select a valid reason"
        ),
    description: Yup.string().max(
        1000,
        "Description must be 1000 characters or less"
    ),
});

const initialValues = {
    order_number: "",
    email: "",
    reason: "",
    description: "",
};

const FormField = ({
    label,
    name,
    type = "text",
    placeholder,
    as,
    rows,
    children,
}) => (
    <Field name={name}>
        {({ field, meta }) => {
            const hasError = meta.touched && meta.error;

            if (as === "select") {
                return (
                    <div className="space-y-2">
                        {label && (
                            <label
                                htmlFor={name}
                                className="block text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {label}
                            </label>
                        )}
                        <select
                            {...field}
                            id={name}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none cursor-pointer"
                            style={{
                                backgroundColor:
                                    "var(--color-background-elevated)",
                                border: `1px solid ${hasError ? "var(--color-error)" : "var(--color-border)"}`,
                                color: "var(--color-text-primary)",
                            }}
                        >
                            {children}
                        </select>
                        {hasError && (
                            <p
                                className="flex items-center gap-1 text-xs"
                                style={{ color: "var(--color-error)" }}
                            >
                                <Info size={14} />
                                {meta.error}
                            </p>
                        )}
                    </div>
                );
            }

            const InputComponent = as === "textarea" ? "textarea" : "input";

            return (
                <div className="space-y-2">
                    {label && (
                        <label
                            htmlFor={name}
                            className="block text-sm font-medium"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {label}
                        </label>
                    )}
                    <InputComponent
                        {...field}
                        id={name}
                        type={type}
                        placeholder={placeholder}
                        rows={rows}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{
                            backgroundColor: "var(--color-background-elevated)",
                            border: `1px solid ${hasError ? "var(--color-error)" : "var(--color-border)"}`,
                            color: "var(--color-text-primary)",
                        }}
                    />
                    {hasError && (
                        <p
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "var(--color-error)" }}
                        >
                            <Info size={14} />
                            {meta.error}
                        </p>
                    )}
                </div>
            );
        }}
    </Field>
);

export default function RefundRequestForm({ onSwitchToStatus }) {
    const [formError, setFormError] = useState(null);
    const [successData, setSuccessData] = useState(null);

    if (successData) {
        return (
            <div className="p-6 md:p-8">
                <div
                    className="rounded-xl p-8 text-center"
                    style={{
                        backgroundColor: "var(--color-background)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                        style={{
                            backgroundColor:
                                "var(--color-success-light, #dcfce7)",
                        }}
                    >
                        <CheckCircle
                            className="w-8 h-8"
                            style={{ color: "var(--color-success)" }}
                        />
                    </div>
                    <h3
                        className="text-xl font-semibold mb-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Refund Request Submitted
                    </h3>
                    <p
                        className="text-sm mb-6"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Your refund request has been submitted successfully. The
                        event organizer will review your request and you'll be
                        notified of the outcome.
                    </p>

                    <div
                        className="rounded-lg p-4 mb-6 text-left space-y-3"
                        style={{
                            backgroundColor: "var(--color-background-elevated)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Refund ID
                            </span>
                            <span
                                className="text-sm font-mono"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {successData.refund_id?.slice(0, 8)}...
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Order
                            </span>
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {successData.order_number}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Amount
                            </span>
                            <CurrencyDisplay
                                amount={successData.amount}
                                currency={successData.currency}
                                className="text-sm font-semibold"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Status
                            </span>
                            <RefundStatusBadge status={successData.status} />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setSuccessData(null)}
                        >
                            Submit Another Request
                        </Button>
                        <Button variant="primary" onClick={onSwitchToStatus}>
                            Check Status
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                    setFormError(null);

                    try {
                        const response =
                            await ticketingService.submitGuestRefundRequest(
                                values
                            );

                        if (response.success) {
                            toast.success(
                                response.message ||
                                    "Refund request submitted successfully"
                            );
                            setSuccessData(response.data);
                            resetForm();
                        } else {
                            throw new Error(
                                response.message || "Failed to submit request"
                            );
                        }
                    } catch (error) {
                        console.error("Refund request error:", error);

                        const status = error?.response?.status;
                        const message =
                            error?.response?.data?.message ||
                            error?.message ||
                            "Failed to submit refund request. Please try again.";

                        // Handle specific error cases
                        if (status === 409) {
                            setFormError({
                                type: "duplicate",
                                message:
                                    "A refund request already exists for this order. You can check its status in the 'Check Status' tab.",
                            });
                        } else if (status === 404) {
                            setFormError({
                                type: "not_found",
                                message:
                                    "Order not found. Please check your order number and email address.",
                            });
                        } else if (status === 400) {
                            setFormError({
                                type: "already_refunded",
                                message:
                                    "This order has already been refunded.",
                            });
                        } else if (status === 403) {
                            setFormError({
                                type: "deadline_passed",
                                message:
                                    "The refund deadline has passed. Refunds can only be requested within 1 day after the event ends.",
                            });
                        } else {
                            setFormError({
                                type: "error",
                                message,
                            });
                        }

                        toast.error(message);
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-5">
                        <FormField
                            name="order_number"
                            label="Order Number"
                            placeholder="ORD-2025-123456"
                        />

                        <FormField
                            name="email"
                            label="Email Address"
                            type="email"
                            placeholder="The email used during purchase"
                        />

                        <FormField name="reason" label="Reason" as="select">
                            {REFUND_REASON_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </FormField>

                        <FormField
                            name="description"
                            label="Additional Details (Optional)"
                            as="textarea"
                            rows={4}
                            placeholder="Please provide any additional information about your refund request..."
                        />

                        {formError && (
                            <div
                                className="rounded-lg p-4 flex items-start gap-3"
                                style={{
                                    backgroundColor: "var(--color-error-light)",
                                    border: "1px solid var(--color-error)",
                                }}
                            >
                                <AlertCircle
                                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                                    style={{ color: "var(--color-error)" }}
                                />
                                <div>
                                    <p
                                        className="text-sm"
                                        style={{ color: "var(--color-error)" }}
                                    >
                                        {formError.message}
                                    </p>
                                    {formError.type === "duplicate" && (
                                        <button
                                            type="button"
                                            onClick={onSwitchToStatus}
                                            className="text-sm font-medium mt-2 underline hover:no-underline"
                                            style={{
                                                color: "var(--color-primary)",
                                            }}
                                        >
                                            Check Status Instead
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            fullWidth
                            loading={isSubmitting}
                        >
                            {isSubmitting
                                ? "Submitting Request..."
                                : "Submit Refund Request"}
                        </Button>

                        <p
                            className="text-xs text-center"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            By submitting this request, you confirm that the
                            information provided is accurate.
                        </p>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
