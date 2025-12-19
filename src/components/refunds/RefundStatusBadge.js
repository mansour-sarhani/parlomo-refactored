'use client';

import { Badge } from '@/components/common/Badge';

/**
 * RefundStatusBadge Component
 *
 * Displays refund request status with appropriate styling
 *
 * @param {Object} props
 * @param {string} props.status - Refund status (PENDING, APPROVED, REJECTED, PROCESSED)
 * @param {string} props.className - Additional CSS classes
 */
export const RefundStatusBadge = ({ status, className = '' }) => {
    const config = {
        PENDING: { variant: 'warning', label: 'Pending Review' },
        APPROVED: { variant: 'info', label: 'Approved' },
        REJECTED: { variant: 'danger', label: 'Rejected' },
        PROCESSED: { variant: 'success', label: 'Processed' }
    };

    const { variant, label } = config[status] || config.PENDING;

    return (
        <Badge variant={variant} dot className={className}>
            {label}
        </Badge>
    );
};
