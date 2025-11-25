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

const buildImageUrl = (item) => {
    if (!item?.image) {
        return null;
    }

    if (typeof item.image === "string" && item.image.startsWith("http")) {
        return item.image;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const normalizedPath = item.path ? `${item.path.replace(/\/+$/, "")}/` : "";

    return `${base}${normalizedPath}${item.image}`;
};

const StatusIndicator = ({ status }) => {
    const isActive = status === 1 || status === "1" || status === true;

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
            {isActive ? "Active" : "Inactive"}
        </span>
    );
};

export function AdminAdvertisingTypesTable({ types, onEdit, showActions = true }) {
    if (!Array.isArray(types) || types.length === 0) {
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Image</TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Placement</TableHeaderCell>
                    {showActions && <TableHeaderCell>Actions</TableHeaderCell>}
                    <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <tbody>
                {types.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {item.id}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex justify-center">
                                {item.image ? (
                                    <div
                                        className="relative w-20 h-20 overflow-hidden rounded-lg border"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <Image
                                            src={buildImageUrl(item)}
                                            alt={item.title || "Advertising type"}
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
                            <span style={{ color: "var(--color-text-primary)" }}>
                                {item.title || "—"}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {item.placeType || "—"}
                            </span>
                        </TableCell>
                        {showActions && (
                            <TableCell>
                                <div className="flex justify-center">
                                    <EditAction onClick={() => onEdit?.(item)} disabled={!onEdit} />
                                </div>
                            </TableCell>
                        )}
                        <TableCell>
                            <StatusIndicator status={item.status} />
                        </TableCell>
                    </TableRow>
                ))}
            </tbody>
        </Table>
    );
}

export default AdminAdvertisingTypesTable;
