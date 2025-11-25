"use client";

import { Modal } from "@/components/common/Modal";
import { Badge } from "@/components/common/Badge";

export function AdminReviewDetailModal({
    isOpen,
    onClose,
    title = "Item details",
    subtitle,
    metadata = [],
    tags = [],
    content,
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={subtitle}
            size="lg"
        >
            <div className="space-y-6">
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Badge key={tag} size="sm">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {metadata.map((item) => (
                        <div key={item.label} className="space-y-1">
                            <dt
                                className="text-xs uppercase tracking-wide"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {item.label}
                            </dt>
                            <dd
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {item.value ?? "—"}
                            </dd>
                        </div>
                    ))}
                </dl>

                {content}
            </div>
        </Modal>
    );
}

export default AdminReviewDetailModal;

