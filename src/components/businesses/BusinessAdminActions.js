"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { updateBusinessListing } from "@/features/businesses/businessListingsSlice";

const STATUS_OPTIONS = [
    { value: "Pending", label: "Pending review" },
    { value: "Wait", label: "On hold" },
    { value: "Active", label: "Active" },
    { value: "Reject", label: "Rejected" },
];

const normalizeStatus = (value) => {
    if (!value) return "Pending";
    return STATUS_OPTIONS.find((option) => option.value.toLowerCase() === String(value).toLowerCase())?.value || value;
};

export function BusinessAdminActions({ business, onUpdated }) {
    const dispatch = useAppDispatch();
    const updating = useAppSelector((state) => state.businessListings.updating);

    const [status, setStatus] = useState(normalizeStatus(business?.status));
    const [reason, setReason] = useState("");

    useEffect(() => {
        setStatus(normalizeStatus(business?.status));
    }, [business?.status]);

    const showReason = useMemo(() => status === "Reject", [status]);

    const hasChanges = useMemo(() => {
        if (!business?.status) {
            return true;
        }
        if (normalizeStatus(business?.status) !== status) {
            return true;
        }
        if (status === "Reject" && reason.trim().length > 0) {
            return true;
        }
        return false;
    }, [business?.status, status, reason]);

    const handleSave = async () => {
        if (!business?.id) {
            toast.error("Business identifier missing");
            return;
        }

        const payload = {
            status,
        };

        if (status === "Reject" && reason.trim().length > 0) {
            payload.reason = reason.trim();
        }

        try {
            await dispatch(
                updateBusinessListing({
                    id: business.id,
                    changes: payload,
                })
            ).unwrap();
            toast.success("Listing updated");
            setReason("");
            onUpdated?.();
        } catch (error) {
            toast.error(error || "Failed to update listing");
        }
    };

    return (
        <Card className="space-y-4">
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Moderation actions
                </h2>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Update the current status of this business listing. Choose “Rejected” to hide it from the directory.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                    Listing status
                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm"
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-background)",
                            color: "var(--color-text-primary)",
                        }}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="flex flex-col justify-end text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    <span>Current value: {business?.status || "Pending"}</span>
                    <span>Last updated: {business?.updatedAtHuman || business?.updated_at_human || "Unknown"}</span>
                </div>
            </div>

            {showReason && (
                <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        Rejection reason (optional)
                    </label>
                    <textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        rows={3}
                        placeholder="Explain why this listing is being rejected."
                        className="w-full rounded-lg border px-4 py-2 text-sm"
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-background)",
                            color: "var(--color-text-primary)",
                        }}
                    />
                </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <Button
                    type="button"
                    onClick={handleSave}
                    disabled={!hasChanges}
                    loading={updating}
                >
                    Save changes
                </Button>
            </div>
        </Card>
    );
}

export default BusinessAdminActions;


