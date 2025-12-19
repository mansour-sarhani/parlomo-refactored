'use client';

import {
    FileText,
    Check,
    X,
    DollarSign,
    Mail,
    AlertCircle
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

const actionIcons = {
    created: FileText,
    approved: Check,
    rejected: X,
    processed: DollarSign,
    stripe_initiated: DollarSign,
    stripe_completed: Check,
    stripe_failed: AlertCircle,
    email_sent: Mail
};

const actionLabels = {
    created: 'Request Created',
    approved: 'Request Approved',
    rejected: 'Request Rejected',
    processed: 'Refund Processed',
    stripe_initiated: 'Stripe Refund Initiated',
    stripe_completed: 'Stripe Refund Completed',
    stripe_failed: 'Stripe Refund Failed',
    email_sent: 'Email Notification Sent'
};

/**
 * RefundTimeline Component
 *
 * Displays audit log as a vertical timeline
 *
 * @param {Object} props
 * @param {Array} props.auditLogs - Array of audit log entries
 */
export const RefundTimeline = ({ auditLogs = [] }) => {
    if (!auditLogs || auditLogs.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 text-sm">
                No activity recorded yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {auditLogs.map((log, index) => {
                const Icon = actionIcons[log.action] || FileText;
                const isLast = index === auditLogs.length - 1;
                const isFailed = log.action === 'rejected' || log.action === 'stripe_failed';

                return (
                    <div key={log.id} className="flex gap-3">
                        {/* Icon & Line */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isFailed
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-blue-100 text-blue-600'
                                }`}
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
                                    {log.metadata.admin_notes && (
                                        <p className="text-gray-700">
                                            <span className="font-medium">Admin Notes:</span>{' '}
                                            {log.metadata.admin_notes}
                                        </p>
                                    )}
                                    {log.metadata.rejection_reason && (
                                        <p className="text-red-600">
                                            <span className="font-medium">Rejection Reason:</span>{' '}
                                            {log.metadata.rejection_reason}
                                        </p>
                                    )}
                                    {log.metadata.fine_amount && (
                                        <p className="text-gray-700">
                                            <span className="font-medium">Fine:</span> £
                                            {(log.metadata.fine_amount / 100).toFixed(2)}
                                            {log.metadata.fine_reason &&
                                                ` - ${log.metadata.fine_reason}`}
                                        </p>
                                    )}
                                    {log.metadata.event_id && (
                                        <p className="text-gray-600">
                                            Event ID: {log.metadata.event_id}
                                        </p>
                                    )}
                                    {log.metadata.affected_orders_count && (
                                        <p className="text-gray-600">
                                            Affected Orders: {log.metadata.affected_orders_count}
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
                                    <span className="px-1.5 py-0.5 rounded bg-blue-100">
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
