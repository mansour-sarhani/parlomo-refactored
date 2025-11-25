"use client";

import { MessageSquare, Edit } from "lucide-react";
import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
} from "@/components/tables";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";

const resolveStatusVariant = (status) => {
    if (!status) return "secondary";

    const normalized = String(status).toLowerCase();
    if (["accept", "approved", "published", "active"].includes(normalized)) {
        return "success";
    }

    if (["reject", "rejected", "declined"].includes(normalized)) {
        return "error";
    }

    return "warning";
};

export function AdminCommentsTable({ comments = [], onReply }) {
    if (!Array.isArray(comments) || comments.length === 0) {
        return null;
    }

    return (
        <Table className="min-w-[1000px]">
            <TableHeader>
                <tr>
                    <TableHeaderCell align="center" width="80px">
                        ID
                    </TableHeaderCell>
                    <TableHeaderCell align="left" width="120px">
                        User
                    </TableHeaderCell>
                    <TableHeaderCell align="left" width="250px">
                        Comment
                    </TableHeaderCell>
                    <TableHeaderCell align="left" width="100px">
                        Type
                    </TableHeaderCell>
                    <TableHeaderCell align="left" width="150px">
                        Directory
                    </TableHeaderCell>
                    <TableHeaderCell align="left" width="150px">
                        Creation Time
                    </TableHeaderCell>
                    <TableHeaderCell align="left" width="200px">
                        Actions
                    </TableHeaderCell>
                    <TableHeaderCell align="center" width="100px">
                        Status
                    </TableHeaderCell>
                </tr>
            </TableHeader>
            <TableBody>
                {comments.map((comment) => {
                    const hasReply = Array.isArray(comment.children) && comment.children.length > 0;
                    const reply = hasReply ? comment.children[0] : null;

                    return (
                        <TableRow key={comment.id}>
                            <TableCell align="center">
                                <span className="font-medium">{comment.id}</span>
                            </TableCell>
                            <TableCell align="left">
                                {comment.user || "—"}
                            </TableCell>
                            <TableCell
                                align="left"
                                style={{ whiteSpace: "normal" }}
                            >
                                <p className="m-0 text-sm">{comment.body || "—"}</p>
                            </TableCell>
                            <TableCell align="left">
                                {comment.type || "—"}
                            </TableCell>
                            <TableCell align="left">
                                {comment.typeName || "—"}
                            </TableCell>
                            <TableCell align="left">
                                {comment.createdAtHuman || comment.created_at_human || "—"}
                            </TableCell>
                            <TableCell align="left">
                                {!hasReply ? (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        icon={<Edit size={16} />}
                                        onClick={() => onReply?.(comment)}
                                    >
                                        Reply
                                    </Button>
                                ) : (
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                            Your Reply:
                                        </label>
                                        <p className="m-0 text-sm" style={{ color: "var(--color-text-primary)" }}>
                                            {reply.body || "—"}
                                        </p>
                                        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                                            {reply.createdAtHuman || reply.created_at_human || "—"}
                                        </span>
                                    </div>
                                )}
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
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

export default AdminCommentsTable;

