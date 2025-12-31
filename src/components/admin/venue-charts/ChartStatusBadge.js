'use client';

/**
 * ChartStatusBadge Component
 * Displays the active/inactive status of a venue chart
 */

import { CheckCircle2, XCircle } from 'lucide-react';

/**
 * ChartStatusBadge component
 * @param {Object} props
 * @param {boolean} props.isActive - Whether the chart is active
 * @param {string} [props.className] - Additional CSS classes
 */
export default function ChartStatusBadge({ isActive, className = '' }) {
    if (isActive) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}
            >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}
        >
            <XCircle className="w-3.5 h-3.5" />
            Inactive
        </span>
    );
}
