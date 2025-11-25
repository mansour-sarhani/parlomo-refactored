"use client";

/**
 * Table Component
 * 
 * Base table component with responsive wrapper and consistent styling
 * 
 * Features:
 * - Responsive horizontal scrolling on mobile
 * - Dark mode support via CSS variables
 * - Consistent border and spacing
 * - Optional striped rows
 * - Optional hover effects
 * 
 * @component
 * @example
 * <Table>
 *   <TableHeader>...</TableHeader>
 *   <tbody>
 *     <TableRow>...</TableRow>
 *   </tbody>
 * </Table>
 */

export function Table({ 
    children, 
    striped = false, 
    hoverable = true,
    className = '',
    ...props 
}) {
    return (
        <div 
            className="overflow-x-auto rounded-lg border"
            style={{ borderColor: 'var(--color-border)' }}
        >
            <table 
                className={`w-full border-collapse ${className}`}
                {...props}
            >
                {children}
            </table>
        </div>
    );
}

/**
 * TableBody Component
 * 
 * Wrapper for table body with optional striped and hover effects
 */
export function TableBody({ 
    children, 
    striped = false, 
    hoverable = true,
    className = '',
    ...props 
}) {
    const tbodyClassName = `
        ${striped ? '[&>tr:nth-child(even)]:bg-[var(--color-secondary)]' : ''}
        ${hoverable ? '[&>tr:hover]:bg-[var(--color-hover)]' : ''}
        ${className}
    `.trim();

    return (
        <tbody className={tbodyClassName} {...props}>
            {children}
        </tbody>
    );
}

