import { Card } from "@/components/common/Card";

export default function CategorySummary({ stats }) {
    return (
        <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
                <p className="text-sm text-neutral-500">Total Categories</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
            </Card>
            <Card className="p-4">
                <p className="text-sm text-neutral-500">Root Categories</p>
                <p className="text-2xl font-semibold">{stats.root}</p>
            </Card>
            <Card className="p-4">
                <p className="text-sm text-neutral-500">Attributes Linked</p>
                <p className="text-2xl font-semibold">{stats.attributes}</p>
            </Card>
        </div>
    );
}

