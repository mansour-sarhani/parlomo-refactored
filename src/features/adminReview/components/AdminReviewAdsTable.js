"use client";

import { Eye, Gavel } from "lucide-react";
import { Table } from "@/components/tables/Table";
import { TableHeader, TableHeaderCell } from "@/components/tables/TableHeader";
import { TableBody } from "@/components/tables/Table";
import { TableRow } from "@/components/tables/TableRow";
import { TableCell } from "@/components/tables/TableCell";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { getPrimaryImage, formatDateTime } from "../utils";

const resolveStatusVariant = (status) => {
    if (!status) return "neutral";

    const normalized = status.toLowerCase();
    if (["active", "accept", "approved", "published"].includes(normalized)) {
        return "success";
    }

    if (["reject", "rejected", "declined"].includes(normalized)) {
        return "error";
    }

    return "warning";
};

export function AdminReviewAdsTable({ ads = [], onView, onReview }) {
    return (
        <Table className="min-w-[720px]">
            <TableHeader>
                <tr>
                    <TableHeaderCell align="left" width="80px">
                        ID
                    </TableHeaderCell>
                    <TableHeaderCell align="left" width="96px">
                        Preview
                    </TableHeaderCell>
                    <TableHeaderCell align="left">Title</TableHeaderCell>
                    <TableHeaderCell align="left">Owner</TableHeaderCell>
                    <TableHeaderCell align="left">Category</TableHeaderCell>
                    <TableHeaderCell align="left">Created</TableHeaderCell>
                    <TableHeaderCell align="center" width="160px">
                        Status
                    </TableHeaderCell>
                    <TableHeaderCell align="right" width="200px">
                        Actions
                    </TableHeaderCell>
                </tr>
            </TableHeader>
            <TableBody>
                {ads.map((ad) => {
                    const image = getPrimaryImage(ad);
                    return (
                        <TableRow key={ad.id}>
                            <TableCell align="left">
                                <span className="font-medium">{ad.id}</span>
                            </TableCell>
                            <TableCell align="left">
                                {image ? (
                                    <img
                                        src={image}
                                        alt={ad.title || `Ad ${ad.id}`}
                                        className="h-12 w-16 rounded-md object-cover"
                                    />
                                ) : (
                                    <div
                                        className="flex h-12 w-16 items-center justify-center rounded-md text-xs"
                                        style={{
                                            backgroundColor:
                                                "var(--color-background-secondary)",
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        No image
                                    </div>
                                )}
                            </TableCell>
                            <TableCell align="left" truncate maxWidth="240px">
                                {ad.title || "Untitled"}
                            </TableCell>
                            <TableCell align="left" truncate maxWidth="200px">
                                {ad.user?.name ||
                                    ad.user ||
                                    ad.owner ||
                                    "—"}
                            </TableCell>
                            <TableCell align="left" truncate maxWidth="180px">
                                {ad.categoryName ||
                                    ad.category ||
                                    ad.category_title ||
                                    "—"}
                            </TableCell>
                            <TableCell align="left">
                                {ad.createdAtHuman ||
                                    ad.created_at_human ||
                                    formatDateTime(ad.created_at)}
                            </TableCell>
                            <TableCell align="center">
                                <Badge
                                    variant={resolveStatusVariant(ad.status)}
                                    size="sm"
                                    dot
                                >
                                    {ad.status || "Pending"}
                                </Badge>
                            </TableCell>
                            <TableCell align="right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={<Eye size={16} />}
                                        onClick={() => onView?.(ad)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        icon={<Gavel size={16} />}
                                        onClick={() => onReview?.(ad)}
                                    >
                                        Decide
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

export default AdminReviewAdsTable;

