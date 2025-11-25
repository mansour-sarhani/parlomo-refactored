"use client";

import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/common/Button";

export function ReportsHeader({
    title,
    total = 0,
    subtitle,
    onRefresh,
    isRefreshing = false,
    showReloadNotice = false,
}) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {title} ({total})
                </h1>
                {subtitle && (
                    <p
                        className="text-sm mt-1"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>
            {onRefresh && (
                <div className="flex items-center gap-3">
                    {showReloadNotice && (
                        <span
                            className="text-sm"
                            style={{ color: "var(--color-success)" }}
                        >
                            List reloaded!
                        </span>
                    )}
                    <Button
                        variant="secondary"
                        icon={<RefreshCcw size={16} />}
                        onClick={onRefresh}
                        loading={isRefreshing}
                    >
                        Refresh
                    </Button>
                </div>
            )}
        </div>
    );
}

export default ReportsHeader;

