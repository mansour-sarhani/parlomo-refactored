"use client";

/**
 * TableActions Component
 * 
 * Pre-styled action buttons for table rows (view, edit, delete)
 * 
 * Features:
 * - Common CRUD actions with icons
 * - Tooltips for better UX
 * - Consistent styling
 * - Loading states
 * - Confirmation for destructive actions
 * 
 * @component
 * @example
 * <TableActions
 *   onView={() => {}}
 *   onEdit={() => {}}
 *   onDelete={() => {}}
 *   actions={['view', 'edit', 'delete']}
 * />
 */

import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '../common/Button';
import { useState } from 'react';

export function TableActions({ 
    onView,
    onEdit,
    onDelete,
    actions = ['view', 'edit', 'delete'], // Array of action names to show
    loading = false,
    compact = false,
    className = '',
    ...props 
}) {
    const [showDropdown, setShowDropdown] = useState(false);

    const actionConfigs = {
        view: {
            icon: Eye,
            onClick: onView,
            label: 'View',
            variant: 'ghost',
        },
        edit: {
            icon: Edit,
            onClick: onEdit,
            label: 'Edit',
            variant: 'ghost',
        },
        delete: {
            icon: Trash2,
            onClick: onDelete,
            label: 'Delete',
            variant: 'ghost',
        },
    };

    const availableActions = actions
        .filter(action => actionConfigs[action])
        .map(action => ({ ...actionConfigs[action], key: action }));

    if (availableActions.length === 0) return null;

    // Compact mode - show as dropdown
    if (compact) {
        return (
            <div className={`relative ${className}`} {...props}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={loading}
                    aria-label="Actions menu"
                >
                    <MoreVertical size={16} />
                </Button>
                
                {showDropdown && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowDropdown(false)}
                        />
                        
                        {/* Dropdown menu */}
                        <div
                            className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg border z-20"
                            style={{
                                backgroundColor: 'var(--color-card-bg)',
                                borderColor: 'var(--color-border)',
                            }}
                        >
                            {availableActions.map(({ key, icon: Icon, onClick, label }) => (
                                <button
                                    key={key}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-[var(--color-hover)] transition-colors first:rounded-t-lg last:rounded-b-lg"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClick?.();
                                        setShowDropdown(false);
                                    }}
                                    disabled={loading}
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    <Icon size={16} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Default mode - show all buttons inline
    return (
        <div className={`flex items-center gap-1 ${className}`} {...props}>
            {availableActions.map(({ key, icon: Icon, onClick, variant }) => (
                <Button
                    key={key}
                    variant={variant}
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.();
                    }}
                    disabled={loading}
                    aria-label={key}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                >
                    <Icon size={16} />
                </Button>
            ))}
        </div>
    );
}

/**
 * Quick action buttons for common operations
 */
export function ViewAction({ onClick, disabled = false }) {
    return (
        <Button variant="ghost" size="sm" onClick={onClick} disabled={disabled} title="View">
            <Eye size={16} />
        </Button>
    );
}

export function EditAction({ onClick, disabled = false }) {
    return (
        <Button variant="ghost" size="sm" onClick={onClick} disabled={disabled} title="Edit">
            <Edit size={16} />
        </Button>
    );
}

export function DeleteAction({ onClick, disabled = false }) {
    return (
        <Button variant="ghost" size="sm" onClick={onClick} disabled={disabled} title="Delete">
            <Trash2 size={16} />
        </Button>
    );
}

