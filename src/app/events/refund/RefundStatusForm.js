"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { RefundStatusBadge } from "@/components/refunds/RefundStatusBadge";
import { CurrencyDisplay } from "@/components/refunds/CurrencyDisplay";
import ticketingService from "@/services/ticketing.service";
import {
    Info,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    FileText,
} from "lucide-react";

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
});

const initialValues = {
    order_number: "",
    email: "",
};

const FormField = ({ label, name, type = "text", placeholder }) => (
    <Field name={name}>
        {({ field, meta }) => {
            const hasError = meta.touched && meta.error;

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
                    <input
                        {...field}
                        id={name}
                        type={type}
                        placeholder={placeholder}
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

const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const StatusIcon = ({ status }) => {
    const icons = {
        PENDING: (
            <Clock
                className="w-8 h-8"
                style={{ color: "var(--color-warning)" }}
            />
        ),
        APPROVED: (
            <CheckCircle
                className="w-8 h-8"
                style={{ color: "var(--color-info)" }}
            />
        ),
        REJECTED: (
            <XCircle
                className="w-8 h-8"
                style={{ color: "var(--color-error)" }}
            />
        ),
        PROCESSED: (
            <CheckCircle
                className="w-8 h-8"
                style={{ color: "var(--color-success)" }}
            />
        ),
    };
    return icons[status] || icons.PENDING;
};

const StatusTitle = ({ status }) => {
    const titles = {
        PENDING: "Refund Request Pending",
        APPROVED: "Refund Approved",
        REJECTED: "Refund Request Rejected",
        PROCESSED: "Refund Processed",
    };
    return titles[status] || "Refund Request";
};

const StatusDescription = ({ status }) => {
    const descriptions = {
        PENDING:
            "Your refund request is being reviewed by the event organizer. You'll be notified once a decision is made.",
        APPROVED:
            "Your refund has been approved and is awaiting processing. The refund will be processed shortly.",
        REJECTED:
            "Unfortunately, your refund request was not approved. See the reason below for more details.",
        PROCESSED:
            "Your refund has been processed. The funds should appear in your account within 5-10 business days.",
    };
    return descriptions[status] || "";
};

export default function RefundStatusForm({ onSwitchToRequest }) {
    const [formError, setFormError] = useState(null);
    const [statusData, setStatusData] = useState(null);

    if (statusData) {
        // Has refund request
        if (statusData.has_refund_request) {
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
                                    "var(--color-background-elevated)",
                            }}
                        >
                            <StatusIcon status={statusData.status} />
                        </div>
                        <h3
                            className="text-xl font-semibold mb-2"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            <StatusTitle status={statusData.status} />
                        </h3>
                        <p
                            className="text-sm mb-6"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            <StatusDescription status={statusData.status} />
                        </p>

                        <div
                            className="rounded-lg p-4 mb-6 text-left space-y-3"
                            style={{
                                backgroundColor:
                                    "var(--color-background-elevated)",
                                border: "1px solid var(--color-border)",
                            }}
                        >
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Refund ID
                                </span>
                                <span
                                    className="text-sm font-mono"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {statusData.refund_id?.slice(0, 8)}...
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Amount
                                </span>
                                <CurrencyDisplay
                                    amount={statusData.total_refund_amount}
                                    currency={statusData.currency}
                                    className="text-sm font-semibold"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Status
                                </span>
                                <RefundStatusBadge status={statusData.status} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Reason
                                </span>
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {statusData.reason}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Requested
                                </span>
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatDate(statusData.requested_at)}
                                </span>
                            </div>
                            {statusData.processed_at && (
                                <div className="flex justify-between items-center">
                                    <span
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Processed
                                    </span>
                                    <span
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {formatDate(statusData.processed_at)}
                                    </span>
                                </div>
                            )}
                            {statusData.rejection_reason && (
                                <div className="pt-3 border-t border-[var(--color-border)]">
                                    <span
                                        className="text-sm block mb-1"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Rejection Reason
                                    </span>
                                    <p
                                        className="text-sm"
                                        style={{ color: "var(--color-error)" }}
                                    >
                                        {statusData.rejection_reason}
                                    </p>
                                </div>
                            )}
                            {statusData.admin_notes && (
                                <div className="pt-3 border-t border-[var(--color-border)]">
                                    <span
                                        className="text-sm block mb-1"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Notes
                                    </span>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {statusData.admin_notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setStatusData(null)}
                        >
                            Check Another Order
                        </Button>
                    </div>
                </div>
            );
        }

        // No refund request found for this order
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
                            backgroundColor: "var(--color-background-elevated)",
                        }}
                    >
                        <FileText
                            className="w-8 h-8"
                            style={{ color: "var(--color-text-tertiary)" }}
                        />
                    </div>
                    <h3
                        className="text-xl font-semibold mb-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        No Refund Request Found
                    </h3>
                    <p
                        className="text-sm mb-2"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        There is no refund request for order{" "}
                        <span className="font-medium">
                            {statusData.order_number}
                        </span>
                        .
                    </p>
                    <p
                        className="text-sm mb-6"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Order status: <span className="capitalize">{statusData.order_status}</span>
                    </p>

                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setStatusData(null)}
                        >
                            Check Another Order
                        </Button>
                        <Button variant="primary" onClick={onSwitchToRequest}>
                            Request a Refund
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            <p
                className="text-sm mb-6"
                style={{ color: "var(--color-text-secondary)" }}
            >
                Enter your order details below to check the status of your
                refund request.
            </p>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    setFormError(null);

                    try {
                        const response =
                            await ticketingService.checkGuestRefundStatus(
                                values
                            );

                        if (response.success) {
                            setStatusData(response.data);
                        } else {
                            throw new Error(
                                response.message || "Failed to check status"
                            );
                        }
                    } catch (error) {
                        console.error("Status check error:", error);

                        const status = error?.response?.status;
                        const message =
                            error?.response?.data?.message ||
                            error?.message ||
                            "Failed to check refund status. Please try again.";

                        if (status === 404) {
                            setFormError(
                                "Order not found. Please check your order number and email address."
                            );
                        } else {
                            setFormError(message);
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
                                <p
                                    className="text-sm"
                                    style={{ color: "var(--color-error)" }}
                                >
                                    {formError}
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            fullWidth
                            loading={isSubmitting}
                        >
                            {isSubmitting
                                ? "Checking Status..."
                                : "Check Status"}
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
