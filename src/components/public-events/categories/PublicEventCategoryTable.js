"use client";

import Image from "next/image";
import * as LucideIcons from "lucide-react";
import { Table, TableHeader, TableHeaderCell, TableRow, TableCell } from "@/components/tables";
import { EditAction, DeleteAction } from "@/components/tables/TableActions";

const StatusToggle = ({ isActive, onChange, disabled }) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(!isActive)}
            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
            style={{
                backgroundColor: isActive ? "var(--color-success)" : "var(--color-border)",
                focusRingColor: "var(--color-primary)",
            }}
        >
            <span
                className={`
                    inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                    ${isActive ? "translate-x-6" : "translate-x-1"}
                `}
            />
        </button>
    );
};

const CategoryIcon = ({ iconName }) => {
    // Get the icon component from Lucide
    const IconComponent = LucideIcons[iconName] || LucideIcons.MoreHorizontal;

    return (
        <div
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ backgroundColor: "var(--color-background-elevated)" }}
        >
            <IconComponent className="w-5 h-5" style={{ color: "var(--color-text-secondary)" }} />
        </div>
    );
};

export function PublicEventCategoryTable({ categories, onEdit, onDelete, onStatusChange, updatingId }) {
    if (!Array.isArray(categories) || categories.length === 0) {
        return (
            <div className="py-10 text-center" style={{ color: "var(--color-text-secondary)" }}>
                No categories found. Click &quot;Add Category&quot; to create one or &quot;Seed
                Categories&quot; to add defaults.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>Icon</TableHeaderCell>
                    <TableHeaderCell>Image</TableHeaderCell>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Slug</TableHeaderCell>
                    <TableHeaderCell>Description</TableHeaderCell>
                    <TableHeaderCell>Order</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <tbody>
                {categories.map((category) => (
                    <TableRow key={category.id || category._id}>
                        <TableCell>
                            <div className="flex justify-center">
                                <CategoryIcon iconName={category.icon} />
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex justify-center">
                                {category.image ? (
                                    <div
                                        className="relative w-16 h-16 overflow-hidden rounded-lg border"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <Image
                                            src={category.image}
                                            alt={category.name || "Category image"}
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center justify-center w-16 h-16 rounded-lg border text-xs"
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
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {category.name}
                            </span>
                        </TableCell>
                        <TableCell>
                            <code
                                className="text-sm px-2 py-1 rounded"
                                style={{
                                    backgroundColor: "var(--color-background-elevated)",
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {category.slug}
                            </code>
                        </TableCell>
                        <TableCell>
                            <span
                                className="text-sm line-clamp-2"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {category.description || "-"}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {category.sortOrder ?? 0}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex justify-center">
                                <StatusToggle
                                    isActive={category.status === "active"}
                                    onChange={(newStatus) => onStatusChange?.(category, newStatus ? "active" : "inactive")}
                                    disabled={updatingId === (category.id || category._id)}
                                />
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex justify-center gap-2">
                                <EditAction onClick={() => onEdit?.(category)} />
                                <DeleteAction onClick={() => onDelete?.(category)} />
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </tbody>
        </Table>
    );
}

export default PublicEventCategoryTable;
