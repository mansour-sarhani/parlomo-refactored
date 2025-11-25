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

export function AdminReviewDirectoriesTable({
    directories = [],
    onView,
    onReview,
}) {
    return (
        <Table className="min-w-[720px]">
            <TableHeader>
                <tr>
                    <TableHeaderCell align="left" width="80px">
                        ID
                    </TableHeaderCell>
                    <TableHeaderCell align="left" width="96px">
                        Logo
                    </TableHeaderCell>
                    <TableHeaderCell align="left">Business</TableHeaderCell>
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
                {directories.map((directory) => {
                    const image = getPrimaryImage(directory);
                    return (
                        <TableRow key={directory.id}>
                            <TableCell align="left">
                                <span className="font-medium">
                                    {directory.id}
                                </span>
                            </TableCell>
                            <TableCell align="left">
                                {image ? (
                                    <img
                                        src={image}
                                        alt={
                                            directory.title ||
                                            `Directory ${directory.id}`
                                        }
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
                                        No logo
                                    </div>
                                )}
                            </TableCell>
                            <TableCell align="left" truncate maxWidth="240px">
                                {directory.title || directory.name || "—"}
                            </TableCell>
                            <TableCell align="left" truncate maxWidth="200px">
                                {directory.user?.name ||
                                    directory.user ||
                                    directory.owner ||
                                    "—"}
                            </TableCell>
                            <TableCell align="left" truncate maxWidth="180px">
                                {directory.categoryName ||
                                    directory.category ||
                                    directory.category_title ||
                                    "—"}
                            </TableCell>
                            <TableCell align="left">
                                {directory.createdAtHuman ||
                                    directory.created_at_human ||
                                    formatDateTime(directory.created_at)}
                            </TableCell>
                            <TableCell align="center">
                                <Badge
                                    variant={resolveStatusVariant(
                                        directory.status
                                    )}
                                    size="sm"
                                    dot
                                >
                                    {directory.status || "Pending"}
                                </Badge>
                            </TableCell>
                            <TableCell align="right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={<Eye size={16} />}
                                        onClick={() => onView?.(directory)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        icon={<Gavel size={16} />}
                                        onClick={() => onReview?.(directory)}
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

export default AdminReviewDirectoriesTable;

