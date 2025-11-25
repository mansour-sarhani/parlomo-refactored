export const buildCategoryOptions = (categories = [], excludeIds = new Set()) => {
    const result = [];

    const traverse = (nodes, prefix = "") => {
        if (!Array.isArray(nodes) || nodes.length === 0) {
            return;
        }

        nodes.forEach((node) => {
            if (!node || excludeIds.has(node.id)) {
                return;
            }

            const title = node.title || `ID ${node.id}`;
            const label = prefix ? `${prefix} › ${title}` : title;

            result.push({
                value: String(node.id),
                label,
            });

            if (Array.isArray(node.children) && node.children.length > 0) {
                traverse(node.children, label);
            }
        });
    };

    traverse(categories);

    return result;
};

export const collectDescendantIds = (category) => {
    const ids = new Set();

    const traverse = (node) => {
        if (!node) return;
        if (node.id !== undefined && node.id !== null) {
            ids.add(node.id);
        }
        if (Array.isArray(node.children)) {
            node.children.forEach(traverse);
        }
    };

    traverse(category);

    return ids;
};


