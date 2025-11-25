"use client";

import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableCell,
    TableBody,
} from "@/components/tables";

const formatCurrency = (value) => {
    if (value === undefined || value === null || value === "") {
        return "—";
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
        return value;
    }

    try {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
            minimumFractionDigits: 2,
        }).format(numericValue);
    } catch (error) {
        return numericValue.toFixed(2);
    }
};

const StatusPill = ({ status }) => {
    const normalized = (status || "").toLowerCase();

    let backgroundColor = "var(--color-background-tertiary)";
    let color = "var(--color-text-secondary)";

    if (normalized === "paid" || normalized === "completed") {
        backgroundColor = "var(--color-success-surface)";
        color = "var(--color-success-foreground)";
    } else if (normalized === "pending") {
        backgroundColor = "var(--color-warning-surface)";
        color = "var(--color-warning)";
    } else if (normalized === "cancelled" || normalized === "failed") {
        backgroundColor = "var(--color-error-surface)";
        color = "var(--color-error)";
    }

    return (
        <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            style={{
                backgroundColor,
                color,
            }}
        >
            {status || "—"}
        </span>
    );
};

export function ReportsTable({ reports }) {
    if (!Array.isArray(reports) || reports.length === 0) {
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Username</TableHeaderCell>
                    <TableHeaderCell>Price</TableHeaderCell>
                    <TableHeaderCell>Discount Price</TableHeaderCell>
                    <TableHeaderCell>Discount Code</TableHeaderCell>
                    <TableHeaderCell>Creation Time</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reports.map((report) => (
                    <TableRow key={report.invoiceId || report.id}>
                        <TableCell>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {report.invoiceId ?? report.id ?? "—"}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span style={{ color: "var(--color-text-secondary)" }}>
                                {report.type || "—"}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    {report.user || report.name || "—"}
                                </span>
                                {report.email && (
                                    <span
                                        className="text-xs mt-1"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        {report.email}
                                    </span>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <span style={{ color: "var(--color-text-secondary)" }}>
                                {report.username || "—"}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {formatCurrency(report.price)}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span style={{ color: "var(--color-text-primary)" }}>
                                {report.discountPrice
                                    ? formatCurrency(report.discountPrice)
                                    : "—"}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span style={{ color: "var(--color-text-secondary)" }}>
                                {report.discountCode || "—"}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span style={{ color: "var(--color-text-secondary)" }}>
                                {report.createdAtHuman ||
                                    report.created_at ||
                                    report.createdAt ||
                                    "—"}
                            </span>
                        </TableCell>
                        <TableCell>
                            <StatusPill status={report.status} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default ReportsTable;

