'use client';

import { Badge } from '@/components/common/Badge';

/**
 * RefundTypeBadge Component
 *
 * Displays refund type in readable format
 *
 * @param {Object} props
 * @param {string} props.type - Refund type (EVENT_CANCELLATION, BULK_REFUND, SINGLE_ORDER)
 * @param {string} props.className - Additional CSS classes
 */
export const RefundTypeBadge = ({ type, className = '' }) => {
    const labels = {
        EVENT_CANCELLATION: 'Event Cancellation',
        BULK_REFUND: 'Bulk Refund',
        SINGLE_ORDER: 'Single Order'
    };

    const label = labels[type] || type;

    return (
        <Badge variant="neutral" className={className}>
            {label}
        </Badge>
    );
};
