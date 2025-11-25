"use client";

/**
 * TableRow Component
 * 
 * Reusable table row with consistent styling and hover effects
 * 
 * Features:
 * - Hover effects
 * - Click handler support
 * - Dark mode support
 * - Border styling
 * 
 * @component
 * @example
 * <TableRow onClick={handleRowClick}>
 *   <TableCell>Data</TableCell>
 * </TableRow>
 */

export function TableRow({ 
    children, 
    onClick,
    hoverable = true,
    className = '',
    ...props 
}) {
    const isClickable = !!onClick;

    const rowClassName = `
        border-b
        ${isClickable ? 'cursor-pointer' : ''}
        transition-colors
        ${className}
    `.trim();

    return (
        <tr
            className={rowClassName}
            onClick={onClick}
            style={{ 
                borderColor: 'var(--color-border)',
            }}
            {...props}
        >
            {children}
        </tr>
    );
}

