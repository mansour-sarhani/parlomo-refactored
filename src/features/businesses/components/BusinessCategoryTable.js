"use client";

import Image from "next/image";
import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableCell,
    TableBody,
} from "@/components/tables";
import { EditAction } from "@/components/tables/TableActions";

const baseAssetUrl = process.env.NEXT_PUBLIC_URL_KEY || "";

const buildImageUrl = (category) => {
    if (!category?.image) {
        return null;
    }

    if (typeof category.image === "string" && category.image.startsWith("http")) {
        return category.image;
    }

    const path = category.path ? `${category.path.replace(/\/+$/, "")}/` : "";
    return `${baseAssetUrl}${path}${category.image}`;
};

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

const renderChildrenSummary = (children) => {
    if (!Array.isArray(children) || children.length === 0) {
        return <span style={{ color: "var(--color-text-tertiary)" }}>No sub-categories</span>;
    }

    const preview = children.slice(0, 3).map((child) => child.title || `ID ${child.id}`);
    const remaining = children.length - preview.length;

    return (
        <div className="flex flex-wrap gap-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {preview.map((title, index) => (
                <span key={`${title}-${index}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                    style={{
                        backgroundColor: "var(--color-secondary)",
                        color: "var(--color-text-secondary)",
                    }}
                >
                    {title}
                </span>
            ))}
            {remaining > 0 && (
                <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                    style={{
                        backgroundColor: "var(--color-secondary)",
                        color: "var(--color-text-secondary)",
                    }}
                >
                    +{remaining} more
                </span>
            )}
        </div>
    );
};

export function BusinessCategoryTable({ categories, onEdit }) {
    if (!Array.isArray(categories) || categories.length === 0) {
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell width="80px">ID</TableHeaderCell>
                    <TableHeaderCell width="120px" align="center">
                        Image
                    </TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Children</TableHeaderCell>
                    <TableHeaderCell width="120px" align="center">
                        Actions
                    </TableHeaderCell>
                    <TableHeaderCell width="140px" align="center">
                        Status
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {categories.map((category) => {
                    const imageUrl = buildImageUrl(category);
                    const isActive =
                        category?.status === true ||
                        category?.status === 1 ||
                        category?.status === "1";

                    return (
                        <TableRow key={category.id}>
                            <TableCell>
                                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                                    {category.id}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-center">
                                    {imageUrl ? (
                                        <div
                                            className="relative w-16 h-16 overflow-hidden rounded-lg border"
                                            style={{ borderColor: "var(--color-border)" }}
                                        >
                                            <Image
                                                src={imageUrl}
                                                alt={category.title || "Business category"}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="flex items-center justify-center w-16 h-16 rounded-lg border text-[10px] uppercase tracking-wide"
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
                                <div className="space-y-1">
                                    <span
                                        className="font-medium"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        {category.title}
                                    </span>
                                    {category?.parent_title && (
                                        <p
                                            className="text-xs"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            Parent: {category.parent_title}
                                        </p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{renderChildrenSummary(category.children)}</TableCell>
                            <TableCell align="center">
                                <div className="flex justify-center">
                                    <EditAction onClick={() => onEdit?.(category)} />
                                </div>
                            </TableCell>
                            <TableCell align="center">
                                <StatusIndicator isActive={isActive} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

export default BusinessCategoryTable;


