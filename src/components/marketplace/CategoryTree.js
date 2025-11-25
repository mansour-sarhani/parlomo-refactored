import { ChevronRight, Folder, Layers } from "lucide-react";

const INDENT = 16;

export default function CategoryTree({
    nodes = [],
    activeId,
    onSelect,
    onLoadChildren,
}) {
    const renderNode = (node, depth = 0) => {
        const isActive = activeId === node.id;
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;

        return (
            <div key={node.id} className="space-y-1">
                <button
                    type="button"
                    onClick={() => {
                        onSelect?.(node);
                        if (!hasChildren) {
                            onLoadChildren?.(node.id);
                        }
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        isActive
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-transparent hover:border-neutral-200"
                    }`}
                    style={{ paddingLeft: depth * INDENT + 12 }}
                >
                    <span className="flex items-center gap-2 text-neutral-500">
                        {hasChildren ? <Folder size={16} /> : <Layers size={16} />}
                        {node.title}
                    </span>
                    <span className="ml-auto flex items-center gap-2 text-xs text-neutral-400">
                        {node.classifiedAdAttributes?.length || 0} attrs
                        {node.children?.length ? (
                            <>
                                <ChevronRight size={14} /> {node.children.length}
                            </>
                        ) : null}
                    </span>
                </button>

                {hasChildren && (
                    <div className="space-y-1">
                        {node.children.map((child) => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return <div className="space-y-1">{nodes.map((node) => renderNode(node))}</div>;
}

