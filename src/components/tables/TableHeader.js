"use client";

/**
 * TableHeader Component
 * 
 * Table header with sortable column support
 * 
 * Features:
 * - Sticky header option
 * - Sortable columns with visual indicators
 * - Dark mode support
 * - Proper spacing and styling
 * 
 * @component
 * @example
 * <TableHeader>
 *   <TableHeaderCell sortable sortDirection="asc" onSort={handleSort}>
 *     Name
 *   </TableHeaderCell>
 * </TableHeader>
 */

import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export function TableHeader({ 
    children, 
    sticky = false,
    className = '',
    ...props 
}) {
    const theadClassName = `
        ${sticky ? 'sticky top-0 z-10' : ''}
        ${className}
    `.trim();

    return (
        <thead 
            className={theadClassName}
            style={{ backgroundColor: 'var(--color-secondary)' }}
            {...props}
        >
            {children}
        </thead>
    );
}

/**
 * TableHeaderCell Component
 * 
 * Individual header cell with optional sorting
 */
export function TableHeaderCell({ 
    children,
    sortable = false,
    sortDirection = null, // 'asc', 'desc', or null
    onSort,
    align = 'left',
    className = '',
    width,
    ...props
}) {
    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }[align];

    const handleClick = () => {
        if (sortable && onSort) {
            onSort();
        }
    };

    const thClassName = `
        px-6 py-4 text-sm font-semibold
        ${alignClass}
        ${sortable ? 'cursor-pointer select-none hover:bg-[var(--color-hover)] transition-colors' : ''}
        ${className}
    `.trim();

    const getSortIcon = () => {
        if (!sortable) return null;
        
        if (sortDirection === 'asc') {
            return <ChevronUp size={16} className="flex-shrink-0" />;
        }
        if (sortDirection === 'desc') {
            return <ChevronDown size={16} className="flex-shrink-0" />;
        }
        return <ChevronsUpDown size={16} className="flex-shrink-0 opacity-40" />;
    };

    return (
        <th
            className={thClassName}
            onClick={handleClick}
            style={{ 
                color: 'var(--color-text-primary)',
                width: width || 'auto',
            }}
            {...props}
        >
            <div className="flex items-center gap-2 justify-between">
                <span>{children}</span>
                {sortable && getSortIcon()}
            </div>
        </th>
    );
}

