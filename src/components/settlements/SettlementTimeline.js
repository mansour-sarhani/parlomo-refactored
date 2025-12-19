'use client';

import {
    FileText,
    Check,
    X,
    DollarSign,
    AlertCircle,
    Banknote,
    Calculator,
    CreditCard
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

const actionIcons = {
    created: FileText,
    approved: Check,
    rejected: X,
    adjusted: Calculator,
    stripe_initiated: CreditCard,
    stripe_completed: Check,
    stripe_failed: AlertCircle,
    marked_paid: Banknote
};

const actionLabels = {
    created: 'Settlement Requested',
    approved: 'Request Approved',
    rejected: 'Request Rejected',
    adjusted: 'Amount Adjusted',
    stripe_initiated: 'Stripe Payout Initiated',
    stripe_completed: 'Stripe Payout Completed',
    stripe_failed: 'Stripe Payout Failed',
    marked_paid: 'Manually Marked as Paid'
};

const actionColors = {
    created: { bg: 'bg-blue-100', text: 'text-blue-600' },
    approved: { bg: 'bg-green-100', text: 'text-green-600' },
    rejected: { bg: 'bg-red-100', text: 'text-red-600' },
    adjusted: { bg: 'bg-orange-100', text: 'text-orange-600' },
    stripe_initiated: { bg: 'bg-purple-100', text: 'text-purple-600' },
    stripe_completed: { bg: 'bg-green-100', text: 'text-green-600' },
    stripe_failed: { bg: 'bg-red-100', text: 'text-red-600' },
    marked_paid: { bg: 'bg-green-100', text: 'text-green-600' }
};

/**
 * SettlementTimeline Component
 *
 * Displays settlement audit log as a vertical timeline
 *
 * @param {Object} props
 * @param {Array} props.auditLogs - Array of audit log entries
 */
export const SettlementTimeline = ({ auditLogs = [] }) => {
    if (!auditLogs || auditLogs.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 text-sm">
                No activity recorded yet.
            </div>
        );
    }

    // Helper to format currency from cents
    const formatCurrency = (cents) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format((cents || 0) / 100);
    };

    return (
        <div className="space-y-4">
            {auditLogs.map((log, index) => {
                const Icon = actionIcons[log.action] || FileText;
                const isLast = index === auditLogs.length - 1;
                const isFailed = log.action === 'rejected' || log.action === 'stripe_failed';
                const colors = actionColors[log.action] || { bg: 'bg-gray-100', text: 'text-gray-600' };

                return (
                    <div key={log.id} className="flex gap-3">
                        {/* Icon & Line */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${colors.bg} ${colors.text}`}
                            >
                                <Icon className="w-4 h-4" />
                            </div>
                            {!isLast && (
                                <div className="w-0.5 flex-1 bg-gray-200 mt-2 min-h-[30px]" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between flex-wrap gap-2">
                                <div>
                                    <h4 className="font-medium text-sm">
                                        {actionLabels[log.action] || log.action}
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                        {log.user?.name || 'System'}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {formatDateTime(log.created_at)}
                                </span>
                            </div>

                            {/* Metadata */}
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                <div className="mt-2 text-xs bg-gray-50 rounded p-2 space-y-1">
                                    {/* Adjustment details */}
                                    {log.metadata.adjustment !== undefined && (
                                        <p className={log.metadata.adjustment < 0 ? 'text-red-600' : 'text-green-600'}>
                                            <span className="font-medium">Adjustment:</span>{' '}
                                            {log.metadata.adjustment >= 0 ? '+' : ''}
                                            {formatCurrency(log.metadata.adjustment)}
                                        </p>
                                    )}
                                    {log.metadata.reason && (
                                        <p className="text-gray-700">
                                            <span className="font-medium">Reason:</span>{' '}
                                            {log.metadata.reason}
                                        </p>
                                    )}

                                    {/* Approved amount */}
                                    {log.metadata.approved_amount && (
                                        <p className="text-gray-700">
                                            <span className="font-medium">Approved Amount:</span>{' '}
                                            {formatCurrency(log.metadata.approved_amount)}
                                        </p>
                                    )}

                                    {/* Admin notes */}
                                    {log.metadata.admin_notes && (
                                        <p className="text-gray-700">
                                            <span className="font-medium">Admin Notes:</span>{' '}
                                            {log.metadata.admin_notes}
                                        </p>
                                    )}

                                    {/* Rejection reason */}
                                    {log.metadata.rejection_reason && (
                                        <p className="text-red-600">
                                            <span className="font-medium">Rejection Reason:</span>{' '}
                                            {log.metadata.rejection_reason}
                                        </p>
                                    )}

                                    {/* Stripe payout details */}
                                    {log.metadata.stripe_payout_id && (
                                        <p className="text-gray-600 font-mono">
                                            <span className="font-medium font-sans">Payout ID:</span>{' '}
                                            {log.metadata.stripe_payout_id}
                                        </p>
                                    )}
                                    {log.metadata.payout_id && (
                                        <p className="text-gray-600">
                                            <span className="font-medium">Payout Reference:</span>{' '}
                                            {log.metadata.payout_id}
                                        </p>
                                    )}
                                    {log.metadata.amount && (
                                        <p className="text-gray-700">
                                            <span className="font-medium">Amount:</span>{' '}
                                            {formatCurrency(log.metadata.amount)}
                                        </p>
                                    )}
                                    {log.metadata.arrival_date && (
                                        <p className="text-gray-600">
                                            <span className="font-medium">Expected Arrival:</span>{' '}
                                            {new Date(log.metadata.arrival_date * 1000).toLocaleDateString('en-GB', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    )}

                                    {/* Manual payment details */}
                                    {log.metadata.transaction_reference && (
                                        <p className="text-gray-600 font-mono">
                                            <span className="font-medium font-sans">Transaction Ref:</span>{' '}
                                            {log.metadata.transaction_reference}
                                        </p>
                                    )}
                                    {log.metadata.payment_description && (
                                        <p className="text-gray-600">
                                            <span className="font-medium">Description:</span>{' '}
                                            {log.metadata.payment_description}
                                        </p>
                                    )}

                                    {/* Created settlement details */}
                                    {log.metadata.total_sales && (
                                        <p className="text-gray-600">
                                            <span className="font-medium">Total Sales:</span>{' '}
                                            {formatCurrency(log.metadata.total_sales)}
                                        </p>
                                    )}
                                    {log.metadata.processing_fees && (
                                        <p className="text-gray-600">
                                            <span className="font-medium">Processing Fees:</span>{' '}
                                            -{formatCurrency(log.metadata.processing_fees)}
                                        </p>
                                    )}
                                    {log.metadata.total_refunds && (
                                        <p className="text-gray-600">
                                            <span className="font-medium">Total Refunds:</span>{' '}
                                            -{formatCurrency(log.metadata.total_refunds)}
                                        </p>
                                    )}
                                    {log.metadata.payment_method && (
                                        <p className="text-gray-600">
                                            <span className="font-medium">Payment Method:</span>{' '}
                                            {log.metadata.payment_method.replace('_', ' ')}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Status change */}
                            {log.old_status && log.new_status && (
                                <div className="mt-1 text-xs text-gray-500">
                                    <span className="px-1.5 py-0.5 rounded bg-gray-100">
                                        {log.old_status}
                                    </span>
                                    <span className="mx-1">→</span>
                                    <span className={`px-1.5 py-0.5 rounded ${
                                        log.new_status === 'PAID' ? 'bg-green-100 text-green-700' :
                                        log.new_status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                                        log.new_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100'
                                    }`}>
                                        {log.new_status}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
