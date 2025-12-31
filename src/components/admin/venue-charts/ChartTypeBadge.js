'use client';

/**
 * ChartTypeBadge Component
 * Displays a badge indicating chart type (Admin or Organizer)
 */

import { Shield, User } from 'lucide-react';

/**
 * ChartTypeBadge component
 * @param {Object} props
 * @param {string} props.chartType - Chart type ('admin' or 'organizer')
 * @param {string} [props.className] - Additional CSS classes
 */
export default function ChartTypeBadge({ chartType, className = '' }) {
    const isAdmin = chartType === 'admin';

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isAdmin
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
            } ${className}`}
        >
            {isAdmin ? (
                <>
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                </>
            ) : (
                <>
                    <User className="w-3.5 h-3.5" />
                    Organizer
                </>
            )}
        </span>
    );
}
