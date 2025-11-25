"use client";

import { format } from "date-fns";
import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableCell,
} from "@/components/tables";
import { EditAction } from "@/components/tables/TableActions";

const formatDateTime = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return typeof value === "string" && value.trim() !== ""
            ? value
            : "—";
    }

    try {
        return format(date, "dd/MM/yyyy HH:mm");
    } catch (error) {
        return date.toLocaleString();
    }
};

const formatAmount = (item) => {
    const value = item?.price ?? item?.amount;
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const discountType = (item?.discountType || "").trim().toLowerCase();

    if (discountType === "percentage") {
        const numeric = Number(value);
        if (!Number.isNaN(numeric)) {
            return `${numeric}%`;
        }

        return `${value}%`;
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return value;
    }

    try {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
            minimumFractionDigits: 2,
        }).format(numeric);
    } catch (error) {
        return numeric.toFixed(2);
    }
};

const formatType = (item) => {
    const normalized = (item?.discountType || "").trim().toLowerCase();

    if (normalized === "price") {
        return "Fixed amount";
    }

    if (normalized === "percentage") {
        return "Percentage";
    }

    return item?.discountType || "—";
};

const formatModel = (item) => {
    const model =
        typeof item?.model === "string" ? item.model.trim() : item?.model;

    if (!model) {
        return "All";
    }

    return model;
};

const StatusBadge = ({ status }) => {
    const normalized = (status || "").trim().toLowerCase();
    const isActive = normalized === "active";

    const background = isActive
        ? "var(--color-success-surface)"
        : "var(--color-neutral-surface)";

    const foreground = isActive
        ? "var(--color-success-foreground)"
        : "var(--color-text-secondary)";

    return (
        <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
            style={{
                backgroundColor: background,
                color: foreground,
            }}
        >
            <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                    backgroundColor: isActive
                        ? "var(--color-success-foreground)"
                        : "var(--color-text-tertiary)",
                }}
            />
            {status || "Inactive"}
        </span>
    );
};

export function AdminPromotionCodesTable({
    promotionCodes,
    onEdit,
    showActions = true,
}) {
    if (!Array.isArray(promotionCodes) || promotionCodes.length === 0) {
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Code</TableHeaderCell>
                    <TableHeaderCell>Applies To</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Valid From</TableHeaderCell>
                    <TableHeaderCell>Valid To</TableHeaderCell>
                    <TableHeaderCell>Usage Limit</TableHeaderCell>
                    <TableHeaderCell>Used</TableHeaderCell>
                    <TableHeaderCell>Created</TableHeaderCell>
                    {showActions && <TableHeaderCell>Actions</TableHeaderCell>}
                    <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <tbody>
                {promotionCodes.map((item) => {
                    const createdLabel =
                        item.createdAtHuman ||
                        formatDateTime(item.createdAt || item.created_at);

                    return (
                        <TableRow key={item.id}>
                            <TableCell>
                                <span
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {item.id}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {item.code}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {formatModel(item)}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {formatType(item)}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatAmount(item)}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {formatDateTime(
                                        item.validFrom || item.valid_from
                                    )}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {formatDateTime(
                                        item.validTo || item.valid_to
                                    )}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {item.useTime ?? "—"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {item.used ?? 0}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {createdLabel}
                                </span>
                            </TableCell>
                            {showActions && (
                                <TableCell>
                                    <div className="flex justify-center">
                                        <EditAction
                                            onClick={() => onEdit?.(item)}
                                            disabled={!onEdit}
                                        />
                                    </div>
                                </TableCell>
                            )}
                            <TableCell>
                                <StatusBadge status={item.status} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </tbody>
        </Table>
    );
}

export default AdminPromotionCodesTable;

