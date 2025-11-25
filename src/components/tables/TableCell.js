"use client";

/**
 * TableCell Component
 * 
 * Table cell with alignment and styling options
 * 
 * Features:
 * - Text alignment (left, center, right)
 * - Truncation support
 * - Dark mode support
 * - Consistent padding
 * 
 * @component
 * @example
 * <TableCell align="center">Content</TableCell>
 * <TableCell truncate maxWidth="200px">Long text...</TableCell>
 */

export function TableCell({ 
    children, 
    align = 'left',
    truncate = false,
    maxWidth,
    className = '',
    ...props 
}) {
    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }[align];

    const tdClassName = `
        px-6 py-4 text-sm
        ${alignClass}
        ${truncate ? 'truncate' : ''}
        ${className}
    `.trim();

    return (
        <td
            className={tdClassName}
            style={{ 
                color: 'var(--color-text-secondary)',
                maxWidth: maxWidth || 'none',
            }}
            {...props}
        >
            {children}
        </td>
    );
}

