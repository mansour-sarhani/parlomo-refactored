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
    if (!status) return "warning";

    const normalized = status.toLowerCase();
    if (["active", "accept", "approved", "published"].includes(normalized)) {
        return "success";
    }

    if (["reject", "rejected", "declined"].includes(normalized)) {
        return "error";
    }

    return "warning";
};

export function AdminReviewEventsTable({ events = [], onView, onReview }) {
    return (
        <Table className="min-w-[720px]">
            <TableHeader>
                <tr>
                    <TableHeaderCell align="left" width="80px">
                        ID
                    </TableHeaderCell>
                    <TableHeaderCell align="left" width="120px">
                        Poster
                    </TableHeaderCell>
                    <TableHeaderCell align="left">Title</TableHeaderCell>
                    <TableHeaderCell align="left">Category</TableHeaderCell>
                    <TableHeaderCell align="left">City</TableHeaderCell>
                    <TableHeaderCell align="left">Owner</TableHeaderCell>
                    <TableHeaderCell align="left">Valid Until</TableHeaderCell>
                    <TableHeaderCell align="center" width="160px">
                        Status
                    </TableHeaderCell>
                    <TableHeaderCell align="right" width="200px">
                        Actions
                    </TableHeaderCell>
                </tr>
            </TableHeader>
            <TableBody>
                {events.map((event) => {
                    const image = getPrimaryImage(event);
                    return (
                        <TableRow key={event.id}>
                            <TableCell align="left">
                                <span className="font-medium">
                                    {event.id}
                                </span>
                            </TableCell>
                            <TableCell align="left">
                                {image ? (
                                    <img
                                        src={image}
                                        alt={event.title || `Event ${event.id}`}
                                        className="h-14 w-20 rounded-md object-cover"
                                    />
                                ) : (
                                    <div
                                        className="flex h-14 w-20 items-center justify-center rounded-md text-xs"
                                        style={{
                                            backgroundColor:
                                                "var(--color-background-secondary)",
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        No poster
                                    </div>
                                )}
                            </TableCell>
                            <TableCell align="left" truncate maxWidth="240px">
                                {event.title || "Untitled"}
                            </TableCell>
                            <TableCell align="left" truncate maxWidth="180px">
                                {event.categoryName ||
                                    event.category ||
                                    "—"}
                            </TableCell>
                            <TableCell align="left">
                                {event.city || event.location || "—"}
                            </TableCell>
                            <TableCell align="left" truncate maxWidth="200px">
                                {event.user?.name ||
                                    event.user ||
                                    event.owner ||
                                    "—"}
                            </TableCell>
                            <TableCell align="left">
                                {event.validDate ||
                                    event.valid_until ||
                                    formatDateTime(event.valid_to)}
                            </TableCell>
                            <TableCell align="center">
                                <Badge
                                    variant={resolveStatusVariant(event.status)}
                                    size="sm"
                                    dot
                                >
                                    {event.status || "Pending"}
                                </Badge>
                            </TableCell>
                            <TableCell align="right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={<Eye size={16} />}
                                        onClick={() => onView?.(event)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        icon={<Gavel size={16} />}
                                        onClick={() => onReview?.(event)}
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

export default AdminReviewEventsTable;

