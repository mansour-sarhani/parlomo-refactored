"use client";

import Image from "next/image";
import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableCell,
} from "@/components/tables";
import { EditAction } from "@/components/tables/TableActions";

const buildImageUrl = (badge) => {
    if (!badge?.image) return null;

    if (typeof badge.image === "string" && badge.image.startsWith("http")) {
        return badge.image;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const normalizedPath = badge.path
        ? `${badge.path.replace(/\/+$/, "")}/`
        : "";

    return `${base}${normalizedPath}${badge.image}`;
};

const formatPrice = (value) => {
    if (value === undefined || value === null) {
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
    const isActive = normalized === "active";

    return (
        <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            style={{
                backgroundColor: isActive
                    ? "var(--color-success-surface)"
                    : "var(--color-warning-surface)",
                color: isActive
                    ? "var(--color-success-foreground)"
                    : "var(--color-warning)",
            }}
        >
            {status || "Pending"}
        </span>
    );
};

export function AdminBadgeTable({ badges, onEdit, showActions = true }) {
    if (!Array.isArray(badges) || badges.length === 0) {
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Image</TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Duration</TableHeaderCell>
                    <TableHeaderCell>Price</TableHeaderCell>
                    {showActions && <TableHeaderCell>Actions</TableHeaderCell>}
                    <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <tbody>
                {badges.map((badge) => (
                    <TableRow key={badge.id}>
                        <TableCell>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {badge.id}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex justify-center">
                                {badge.image ? (
                                    <div
                                        className="relative w-20 h-20 overflow-hidden rounded-lg border"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <Image
                                            src={buildImageUrl(badge)}
                                            alt={badge.title || "Badge image"}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center justify-center w-20 h-20 rounded-lg border text-xs"
                                        style={{
                                            borderColor: "var(--color-border)",
                                            color: "var(--color-text-tertiary)",
                                            backgroundColor: "var(--color-background-elevated)",
                                        }}
                                    >
                                        No Image
                                    </div>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    {badge.title}
                                </span>
                                {badge.description && (
                                    <span
                                        className="text-xs mt-1 line-clamp-2"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        {badge.description}
                                    </span>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {badge.badgeType || "—"}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div
                                className="flex flex-col text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                <span>{badge.days ?? 0} days</span>
                                <span>+ {badge.extraDays ?? 0} extra</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {formatPrice(badge.price)}
                            </span>
                        </TableCell>
                        {showActions && (
                            <TableCell>
                                <div className="flex justify-center">
                                    <EditAction
                                        onClick={() => onEdit?.(badge)}
                                        disabled={!onEdit}
                                    />
                                </div>
                            </TableCell>
                        )}
                        <TableCell>
                            <StatusPill status={badge.status} />
                        </TableCell>
                    </TableRow>
                ))}
            </tbody>
        </Table>
    );
}

export default AdminBadgeTable;


