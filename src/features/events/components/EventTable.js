"use client";

import Image from "next/image";
import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableCell,
} from "@/components/tables";
import { TableActions } from "@/components/tables/TableActions";

const buildImageUrl = (event) => {
    const base = process.env.NEXT_PUBLIC_URL_KEY || "";

    if (Array.isArray(event.image) && event.image.length > 0) {
        const first = event.image[0];
        const path = event.path ? `${event.path.replace(/\/+$/, "")}/` : "";
        return `${base}${path}${first}`;
    }

    if (typeof event.image === "string" && event.image.length > 0) {
        if (event.image.startsWith("http")) {
            return event.image;
        }
        const path = event.path ? `${event.path.replace(/\/+$/, "")}/` : "";
        return `${base}${path}${event.image}`;
    }

    if (Array.isArray(event.images) && event.images.length > 0) {
        return event.images[0];
    }

    return null;
};

const StatusPill = ({ status }) => {
    if (!status) {
        return <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>-</span>;
    }

    const normalized = String(status).toLowerCase();

    const palette = {
        active: {
            background: "var(--color-success)",
            color: "#ffffff",
        },
        pending: {
            background: "var(--color-warning, var(--color-secondary))",
            color: "var(--color-text-primary)",
        },
        reject: {
            background: "var(--color-error)",
            color: "#ffffff",
        },
        end: {
            background: "var(--color-text-tertiary)",
            color: "#ffffff",
        },
    };

    const colors =
        palette[normalized] ||
        {
            background: "var(--color-secondary)",
            color: "var(--color-text-primary)",
        };

    return (
        <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
                backgroundColor: colors.background,
                color: colors.color,
            }}
        >
            {status}
        </span>
    );
};

export function EventTable({ events, onEdit, onView }) {
    if (!Array.isArray(events) || events.length === 0) {
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Image</TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>City</TableHeaderCell>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Valid Date</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <tbody>
                {events.map((event) => {
                    const preview = buildImageUrl(event);

                    return (
                        <TableRow key={event.id}>
                            <TableCell>
                                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                                    {event.id}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-center">
                                    {preview ? (
                                        <div
                                            className="relative w-20 h-20 overflow-hidden rounded-lg border"
                                            style={{ borderColor: "var(--color-border)" }}
                                        >
                                            <Image
                                                src={preview}
                                                alt={event.title || "Event"}
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
                                <span style={{ color: "var(--color-text-primary)" }}>{event.title}</span>
                                {event.summary && (
                                    <p
                                        className="text-xs mt-1"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        {event.summary}
                                    </p>
                                )}
                            </TableCell>
                            <TableCell>
                                <span style={{ color: "var(--color-text-secondary)" }}>
                                    {event.categoryName || "-"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span style={{ color: "var(--color-text-secondary)" }}>{event.city || "-"}</span>
                            </TableCell>
                            <TableCell>
                                <span style={{ color: "var(--color-text-secondary)" }}>{event.user || "-"}</span>
                            </TableCell>
                            <TableCell>
                                <span style={{ color: "var(--color-text-secondary)" }}>
                                    {event.validDate || "-"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <TableActions
                                    actions={["view", "edit"]}
                                    onView={() => onView?.(event)}
                                    onEdit={() => onEdit?.(event)}
                                />
                            </TableCell>
                            <TableCell>
                                <StatusPill status={event.status} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </tbody>
        </Table>
    );
}

export default EventTable;

