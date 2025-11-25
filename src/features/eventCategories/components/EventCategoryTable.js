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

const StatusIndicator = ({ isActive }) => {
    const label = isActive ? "Active" : "Inactive";
    const color = isActive ? "var(--color-success)" : "var(--color-error)";

    return (
        <div className="flex items-center gap-2 justify-center">
            <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
            />
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {label}
            </span>
        </div>
    );
};

const buildImageUrl = (category) => {
    if (!category?.image) return null;

    if (typeof category.image === "string" && category.image.startsWith("http")) {
        return category.image;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const path = category.path ? `${category.path.replace(/\/+$/, "")}/` : "";

    return `${base}${path}${category.image}`;
};

export function EventCategoryTable({ categories, onEdit }) {
    if (!Array.isArray(categories) || categories.length === 0) {
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Image</TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Summary</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <tbody>
                {categories.map((category) => (
                    <TableRow key={category.id}>
                        <TableCell>
                            <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                                {category.id}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex justify-center">
                                {category.image ? (
                                    <div
                                        className="relative w-20 h-20 overflow-hidden rounded-lg border"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <Image
                                            src={buildImageUrl(category)}
                                            alt={category.title || "Event category"}
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
                            <span style={{ color: "var(--color-text-primary)" }}>{category.title}</span>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                <span>Total Events: {category.totalEvent ?? 0}</span>
                                <span>Active Events: {category.totalActiveEvent ?? 0}</span>
                                <span>Expired Events: {category.totalOldEvent ?? 0}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex justify-center">
                                <EditAction onClick={() => onEdit?.(category)} />
                            </div>
                        </TableCell>
                        <TableCell>
                            <StatusIndicator isActive={Boolean(category.status)} />
                        </TableCell>
                    </TableRow>
                ))}
            </tbody>
        </Table>
    );
}

export default EventCategoryTable;

