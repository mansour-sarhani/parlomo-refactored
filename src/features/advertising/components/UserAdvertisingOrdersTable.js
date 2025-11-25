"use client";

import Image from "next/image";
import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableCell,
} from "@/components/tables";

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

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
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
        foreground = "var(--color-text-tertiary)";
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

export function UserAdvertisingOrdersTable({ orders }) {
    if (!Array.isArray(orders) || orders.length === 0) {
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Media</TableHeaderCell>
                    <TableHeaderCell>Placement</TableHeaderCell>
                    <TableHeaderCell>Package</TableHeaderCell>
                    <TableHeaderCell>Created</TableHeaderCell>
                    <TableHeaderCell>End Date</TableHeaderCell>
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
                                                className="relative w-24 h-16 overflow-hidden rounded-lg border"
                                                style={{ borderColor: "var(--color-border)" }}
                                            >
                                                <video
                                                    src={mediaUrl}
                                                    className="h-full w-full object-cover"
                                                    muted
                                                    controls={false}
                                                />
                                                <span
                                                    className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[10px] font-semibold uppercase text-white"
                                                >
                                                    Video
                                                </span>
                                            </div>
                                        ) : (
                                            <div
                                                className="relative w-24 h-16 overflow-hidden rounded-lg border"
                                                style={{ borderColor: "var(--color-border)" }}
                                            >
                                                <Image
                                                    src={mediaUrl}
                                                    alt={order.packageName || "Advertising media"}
                                                    fill
                                                    sizes="96px"
                                                    className="object-cover"
                                                />
                                            </div>
                                        )
                                    ) : (
                                        <div
                                            className="flex h-16 w-24 items-center justify-center rounded-lg border text-xs"
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
                                <span
                                    className="text-sm"
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
                                    {order.packageName || "—"}
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
                                <StatusBadge status={order.status} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </tbody>
        </Table>
    );
}

export default UserAdvertisingOrdersTable;
