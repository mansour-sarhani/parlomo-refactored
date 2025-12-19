'use client';

import { Badge } from '@/components/common/Badge';

/**
 * SettlementStatusBadge Component
 *
 * Displays settlement request status with appropriate styling
 *
 * @param {Object} props
 * @param {string} props.status - Settlement status (PENDING, APPROVED, REJECTED, PAID)
 * @param {string} props.className - Additional CSS classes
 */
export const SettlementStatusBadge = ({ status, className = '' }) => {
    const config = {
        PENDING: { variant: 'warning', label: 'Pending Review' },
        APPROVED: { variant: 'info', label: 'Approved' },
        REJECTED: { variant: 'danger', label: 'Rejected' },
        PAID: { variant: 'success', label: 'Paid' }
    };

    const { variant, label } = config[status] || config.PENDING;

    return (
        <Badge variant={variant} dot className={className}>
            {label}
        </Badge>
    );
};
