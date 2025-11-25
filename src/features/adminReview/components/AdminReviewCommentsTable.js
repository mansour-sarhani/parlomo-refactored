"use client";

import { MessageSquareOff } from "lucide-react";
import { Table } from "@/components/tables/Table";
import { TableHeader, TableHeaderCell } from "@/components/tables/TableHeader";
import { TableBody } from "@/components/tables/Table";
import { TableRow } from "@/components/tables/TableRow";
import { TableCell } from "@/components/tables/TableCell";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { formatDateTime } from "../utils";

const resolveStatusVariant = (status) => {
    if (!status) return "warning";

    const normalized = status.toLowerCase();
    if (["accept", "approved", "published", "active"].includes(normalized)) {
        return "success";
    }

    if (["reject", "rejected", "declined"].includes(normalized)) {
        return "error";
    }

    return "warning";
};

export function AdminReviewCommentsTable({ comments = [], onReview }) {
    return (
        <Table className="min-w-[680px]">
            <TableHeader>
                <tr>
                    <TableHeaderCell align="left" width="80px">
                        ID
                    </TableHeaderCell>
                    <TableHeaderCell align="left">Author</TableHeaderCell>
                    <TableHeaderCell align="left">Comment</TableHeaderCell>
                    <TableHeaderCell align="left" width="160px">
                        Type
                    </TableHeaderCell>
                    <TableHeaderCell align="left" width="160px">
                        Submitted
                    </TableHeaderCell>
                    <TableHeaderCell align="center" width="140px">
                        Status
                    </TableHeaderCell>
                    <TableHeaderCell align="right" width="160px">
                        Actions
                    </TableHeaderCell>
                </tr>
            </TableHeader>
            <TableBody>
                {comments.map((comment) => (
                    <TableRow key={comment.id}>
                        <TableCell align="left">
                            <span className="font-medium">{comment.id}</span>
                        </TableCell>
                        <TableCell align="left">
                            {comment.user?.name ||
                                comment.user ||
                                comment.author ||
                                "—"}
                        </TableCell>
                        <TableCell
                            align="left"
                            className="max-w-[360px]"
                            style={{ whiteSpace: "normal" }}
                        >
                            {comment.body || comment.comment || "—"}
                        </TableCell>
                        <TableCell align="left">
                            {comment.typeName ||
                                comment.type ||
                                comment.context ||
                                "—"}
                        </TableCell>
                        <TableCell align="left">
                            {comment.createdAtHuman ||
                                comment.created_at_human ||
                                formatDateTime(comment.created_at)}
                        </TableCell>
                        <TableCell align="center">
                            <Badge
                                variant={resolveStatusVariant(comment.status)}
                                size="sm"
                                dot
                            >
                                {comment.status || "Pending"}
                            </Badge>
                        </TableCell>
                        <TableCell align="right">
                            <Button
                                variant="primary"
                                size="sm"
                                icon={<MessageSquareOff size={16} />}
                                onClick={() => onReview?.(comment)}
                            >
                                Moderate
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default AdminReviewCommentsTable;

