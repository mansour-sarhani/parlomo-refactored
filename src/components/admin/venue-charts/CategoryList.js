'use client';

/**
 * CategoryList Component
 * Displays seating categories with color swatches
 * Supports both read-only and editable modes
 */

import { Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';

/**
 * CategoryList component
 * @param {Object} props
 * @param {Array<{key: string, label: string, color: string}>} props.categories - Categories to display
 * @param {Object<string, number>} [props.capacities] - Category capacities (optional, for display)
 * @param {boolean} [props.readOnly=true] - Whether the list is read-only or editable
 * @param {function(string): void} [props.onRemove] - Callback when removing a category (editable mode)
 * @param {string} [props.className] - Additional CSS classes
 */
export default function CategoryList({
    categories = [],
    capacities = {},
    readOnly = true,
    onRemove,
    className = '',
}) {
    if (!categories || categories.length === 0) {
        return (
            <div className={`text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
                <Tag className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No categories defined</p>
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {categories.map((category, index) => (
                <div
                    key={category.key || index}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                    {/* Color Swatch */}
                    <div
                        className="w-8 h-8 rounded-md border-2 border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: category.color || '#CCCCCC' }}
                        title={category.color || 'No color'}
                    />

                    {/* Category Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                            <p className="font-medium text-gray-900 truncate">
                                {category.label || 'Unnamed Category'}
                            </p>
                            {category.key && (
                                <span className="text-xs text-gray-500 font-mono">
                                    ({category.key})
                                </span>
                            )}
                        </div>
                        {capacities && capacities[category.key] !== undefined && (
                            <p className="text-sm text-gray-600 mt-0.5">
                                Capacity: {capacities[category.key].toLocaleString()} seats
                            </p>
                        )}
                    </div>

                    {/* Remove Button (Editable Mode) */}
                    {!readOnly && onRemove && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(category.key || index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            icon={<Trash2 className="w-4 h-4" />}
                        >
                            Remove
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
}
