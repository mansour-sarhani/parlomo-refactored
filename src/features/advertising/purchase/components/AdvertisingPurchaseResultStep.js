import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

export function AdvertisingPurchaseResultStep({
    needsPayment,
    result,
    onStartOver,
    onViewOrders,
}) {
    return (
        <Card className="space-y-6">
            <div className="space-y-2 text-center">
                <h2
                    className="text-2xl font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {needsPayment ? "Almost done!" : "Advertising booked"}
                </h2>
                <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {needsPayment
                        ? "We created your advertising order. Complete payment to activate the campaign."
                        : "Your advertising order has been submitted for review. We will notify you when it goes live."}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border bg-[var(--color-background-elevated)]">
                    <p
                        className="text-xs uppercase tracking-wide"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Order reference
                    </p>
                    <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {result?.reference || result?.orderReference || "Pending"}
                    </p>
                    {result?.packageName ? (
                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {result.packageName}
                        </p>
                    ) : null}
                </Card>

                <Card className="border bg-[var(--color-background-elevated)]">
                    <p
                        className="text-xs uppercase tracking-wide"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Campaign status
                    </p>
                    <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {needsPayment ? "Awaiting payment" : "In review"}
                    </p>
                    {result?.statusMessage ? (
                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {result.statusMessage}
                        </p>
                    ) : null}
                </Card>
            </div>

            {needsPayment && result?.paymentUrl ? (
                <Button
                    asChild
                    variant="primary"
                    className="w-full"
                >
                    <a href={result.paymentUrl} target="_blank" rel="noreferrer">
                        Proceed to payment
                    </a>
                </Button>
            ) : null}

            <div className="flex flex-col gap-3 md:flex-row md:justify-end">
                <Button variant="secondary" onClick={onStartOver}>
                    Book another placement
                </Button>
                <Button onClick={onViewOrders}>View my orders</Button>
            </div>
        </Card>
    );
}

export default AdvertisingPurchaseResultStep;
