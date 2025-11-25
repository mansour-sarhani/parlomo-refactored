import { Card } from "@/components/common/Card";
import { formatDate } from "@/lib/utils";

export default function TypeSummary({ stats }) {
    return (
        <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
                <p className="text-sm text-neutral-500">Total Types</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
            </Card>
            <Card className="p-4">
                <p className="text-sm text-neutral-500">Active Categories</p>
                <p className="text-2xl font-semibold">{stats.activeCategories}</p>
            </Card>
            <Card className="p-4">
                <p className="text-sm text-neutral-500">Last Synced</p>
                <p className="text-2xl font-semibold">{formatDate(stats.syncedAt, "long")}</p>
            </Card>
        </div>
    );
}

