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

const buildMediaUrl = (pack) => {
    if (!pack?.image) {
        return null;
    }

    if (typeof pack.image === "string" && pack.image.startsWith("http")) {
        return pack.image;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const normalizedPath = pack.path ? `${pack.path.replace(/\/+$/, "")}/` : "";

    return `${base}${normalizedPath}${pack.image}`;
};

const formatPrice = (value) => {
    if (value === undefined || value === null || value === "") {
        return "—";
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

const DurationCell = ({ days }) => {
    if (!days && days !== 0) {
        return "—";
    }

    return `${days} days`;
};

const getPlacementInfo = (item) => {
    const candidates = [item.typeTitle, item.placeType, item.type];

    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.trim() !== "") {
            const label = candidate.trim();
            return {
                label,
                key: label.toLowerCase(),
            };
        }
    }

    if (Array.isArray(item?.placeType)) {
        const joined = item.placeType.filter(Boolean).join(", ");
        if (joined) {
            return {
                label: joined,
                key: joined.toLowerCase(),
            };
        }
    }

    if (typeof item?.placeType === "object" && item?.placeType !== null) {
        const maybeTitle = item.placeType.title || item.placeType.name;
        if (typeof maybeTitle === "string" && maybeTitle.trim() !== "") {
            const label = maybeTitle.trim();
            return {
                label,
                key: label.toLowerCase(),
            };
        }
    }

    return {
        label: "—",
        key: "",
    };
};

export function AdminAdvertisingPackagesTable({ packages, onEdit, showActions = true }) {
    if (!Array.isArray(packages) || packages.length === 0) {
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Media</TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Placement</TableHeaderCell>
                    <TableHeaderCell>Duration</TableHeaderCell>
                    <TableHeaderCell>Price</TableHeaderCell>
                    <TableHeaderCell>Social Media</TableHeaderCell>
                    {showActions && <TableHeaderCell>Actions</TableHeaderCell>}
                    <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <tbody>
                {packages.map((item) => {
                    const mediaUrl = buildMediaUrl(item);
                    const { label: placementLabel, key: placementKey } = getPlacementInfo(item);
                    const isVideo = placementKey === "video";

                    return (
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
                                    {mediaUrl ? (
                                        <div
                                            className="relative w-24 h-16 overflow-hidden rounded-lg border"
                                            style={{ borderColor: "var(--color-border)" }}
                                        >
                                            <Image
                                                src={mediaUrl}
                                                alt={item.title || "Package media"}
                                                fill
                                                sizes="96px"
                                                className="object-cover"
                                            />
                                            {isVideo && (
                                                <span
                                                    className="absolute bottom-1 right-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor: "rgba(0,0,0,0.6)",
                                                        color: "#ffffff",
                                                    }}
                                                >
                                                    VIDEO
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            className="flex items-center justify-center w-24 h-16 rounded-lg border text-xs"
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
                                    {item.title || "—"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {placementLabel}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    <DurationCell days={item.days} />
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {formatPrice(item.price)}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {formatPrice(item.socialMedia)}
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
                                <StatusBadge status={item.status} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </tbody>
        </Table>
    );
}

export default AdminAdvertisingPackagesTable;
