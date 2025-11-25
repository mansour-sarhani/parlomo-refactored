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
import { Check, X } from "lucide-react";

const buildMediaUrl = (order) => {
    if (!order?.file && !order?.image) {
        return null;
    }

    const media = order.file || order.image;

    if (typeof media === "string" && media.startsWith("http")) {
        return media;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const normalizedPath = order.path ? `${order.path.replace(/\/+$/, "")}/` : "";

    return `${base}${normalizedPath}${media}`;
};

const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    // Attempt to parse legacy format dd-MM-yyyy
    const parts = value.split("-");
    if (parts.length === 3) {
        const [first, second, third] = parts.map((part) => parseInt(part, 10));
        if (!Number.isNaN(first) && !Number.isNaN(second) && !Number.isNaN(third)) {
            const assumedYear = third > 31 ? third : first;
            const assumedMonth = third > 31 ? second : second;
            const assumedDay = third > 31 ? first : third;
            const legacy = new Date(assumedYear, assumedMonth - 1, assumedDay);
            if (!Number.isNaN(legacy.getTime())) {
                return legacy.toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });
            }
        }
    }

    return value;
};

const StatusBadge = ({ status }) => {
    const normalized = (status || "").toLowerCase();

    let background = "var(--color-neutral-surface)";
    let foreground = "var(--color-text-secondary)";

    if (normalized === "active") {
        background = "var(--color-success-surface)";
        foreground = "var(--color-success-foreground)";
    } else if (normalized === "pending") {
        background = "var(--color-warning-surface)";
        foreground = "var(--color-warning)";
    } else if (normalized === "end" || normalized === "ended") {
        background = "var(--color-border)";
        foreground = "var(--color-text-secondary)";
    }

    return (
        <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: background, color: foreground }}
        >
            {status || "Pending"}
        </span>
    );
};

export function AdminAdvertisingOrdersTable({ orders, onEdit, showActions = true }) {
    if (!Array.isArray(orders) || orders.length === 0) {
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Media</TableHeaderCell>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Placement</TableHeaderCell>
                    <TableHeaderCell>Package</TableHeaderCell>
                    <TableHeaderCell>Created</TableHeaderCell>
                    <TableHeaderCell>End Date</TableHeaderCell>
                    <TableHeaderCell>Social Media</TableHeaderCell>
                    {showActions && <TableHeaderCell>Actions</TableHeaderCell>}
                    <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <tbody>
                {orders.map((order) => {
                    const mediaUrl = buildMediaUrl(order);
                    const isVideo = (order.placeType || "").toLowerCase() === "video";

                    return (
                        <TableRow key={order.id}>
                            <TableCell>
                                <span
                                    className="font-medium"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {order.id}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-center">
                                    {mediaUrl ? (
                                        isVideo ? (
                                            <div
                                                className="relative w-28 h-16 rounded-lg overflow-hidden border"
                                                style={{ borderColor: "var(--color-border)" }}
                                            >
                                                <video
                                                    src={mediaUrl}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    controls={false}
                                                />
                                                <span
                                                    className="absolute bottom-1 right-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor: "rgba(0,0,0,0.6)",
                                                        color: "#ffffff",
                                                    }}
                                                >
                                                    VIDEO
                                                </span>
                                            </div>
                                        ) : (
                                            <div
                                                className="relative w-28 h-16 overflow-hidden rounded-lg border"
                                                style={{ borderColor: "var(--color-border)" }}
                                            >
                                                <Image
                                                    src={mediaUrl}
                                                    alt={order.packageName || "Advertising media"}
                                                    fill
                                                    sizes="112px"
                                                    className="object-cover"
                                                />
                                            </div>
                                        )
                                    ) : (
                                        <div
                                            className="flex items-center justify-center w-28 h-16 rounded-lg border text-xs"
                                            style={{
                                                borderColor: "var(--color-border)",
                                                color: "var(--color-text-tertiary)",
                                                backgroundColor: "var(--color-background-elevated)",
                                            }}
                                        >
                                            No Media
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    {order.user || order.userName || "—"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {order.placeType || "—"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {order.packageName || order.packageTitle || "—"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {formatDate(order.createdAt || order.createdAtHuman)}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {formatDate(order.endDate)}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-center">
                                    {order.socialMedia || order.social_media ? (
                                        <Check size={16} style={{ color: "var(--color-success)" }} />
                                    ) : (
                                        <X size={16} style={{ color: "var(--color-text-tertiary)" }} />
                                    )}
                                </div>
                            </TableCell>
                            {showActions && (
                                <TableCell>
                                    <div className="flex justify-center">
                                        <EditAction onClick={() => onEdit?.(order)} disabled={!onEdit} />
                                    </div>
                                </TableCell>
                            )}
                            <TableCell>
                                <StatusBadge status={order.status} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </tbody>
        </Table>
    );
}

export default AdminAdvertisingOrdersTable;
