"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

const formatPrice = (value) => {
    if (value === undefined || value === null) {
        return "—";
    }

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
        return value;
    }

    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    }).format(numericValue);
};

const SummaryItem = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
        <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
            {value}
        </span>
    </div>
);

export function PurchaseSummaryStep({
    badge,
    directory,
    result,
    submitting,
    error,
    onBack,
    onSubmit,
    onReset,
}) {
    if (result) {
        const needPayment = Boolean(result.needToPay);
        const paymentUrl =
            result.paymentUrl || result.payment_url || result.url || null;

        return (
            <Card className="space-y-6 text-center">
                <div className="flex justify-center">
                    <div
                        className="rounded-full p-3"
                        style={{ backgroundColor: "var(--color-success-surface)" }}
                    >
                        <CheckCircle2
                            size={48}
                            style={{ color: "var(--color-success)" }}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2
                        className="text-2xl font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Badge Assigned Successfully
                    </h2>
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {needPayment
                            ? "This badge requires an additional payment. Proceed to the payments section to complete the transaction."
                            : "Your badge is now active on the selected directory."}
                    </p>
                </div>

                <div className="space-y-3 text-left">
                    <SummaryItem label="Badge" value={badge?.title ?? "—"} />
                    <SummaryItem label="Directory" value={directory?.title ?? "—"} />
                    <SummaryItem
                        label="Amount"
                        value={formatPrice(result.amount ?? badge?.price)}
                    />
                </div>

                <div className="flex justify-center gap-3">
                    {needPayment && paymentUrl && (
                        <Button asChild>
                            <a href={paymentUrl}>Go to Payment</a>
                        </Button>
                    )}
                    <Button variant="secondary" onClick={onReset}>
                        Purchase Another Badge
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="space-y-6">
            <div>
                <h2
                    className="text-xl font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Review and Confirm
                </h2>
                <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Confirm the badge package and directory. Once assigned, the badge
                    will activate immediately and charge your saved payment method, if
                    applicable.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <h3
                        className="text-sm font-semibold uppercase tracking-wide"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Badge Package
                    </h3>
                    <div className="mt-2 space-y-2 text-sm">
                        <SummaryItem label="Name" value={badge?.title ?? "—"} />
                        <SummaryItem
                            label="Type"
                            value={badge?.badgeType ?? "—"}
                        />
                        <SummaryItem
                            label="Duration"
                            value={`${badge?.days ?? 0} days + ${badge?.extraDays ?? 0} extra`}
                        />
                        <SummaryItem
                            label="Price"
                            value={formatPrice(badge?.price)}
                        />
                    </div>
                </div>
                <div>
                    <h3
                        className="text-sm font-semibold uppercase tracking-wide"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Directory
                    </h3>
                    <div className="mt-2 space-y-2 text-sm">
                        <SummaryItem label="Title" value={directory?.title ?? "—"} />
                        <SummaryItem
                            label="Public ID"
                            value={directory?.public_id ?? "—"}
                        />
                        <SummaryItem
                            label="Category"
                            value={directory?.category?.title ?? "—"}
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{
                        borderColor: "var(--color-error)",
                        color: "var(--color-error)",
                    }}
                >
                    {error}
                </div>
            )}

            <div className="flex justify-between">
                <Button variant="secondary" onClick={onBack} disabled={submitting}>
                    Back
                </Button>
                <Button onClick={onSubmit} loading={submitting}>
                    Confirm Purchase
                </Button>
            </div>
        </Card>
    );
}

export default PurchaseSummaryStep;


