'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Download, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { toast } from 'sonner';
import ticketingService from '@/services/ticketing.service';
import {
    fetchComplimentaryTicketDetails,
    selectSelectedComplimentaryTicket,
    selectTicketingLoading,
} from '@/features/ticketing/ticketingSlice';

export default function ComplimentaryTicketDetailsModal({ orderId, isOpen, onClose }) {
    const dispatch = useDispatch();
    const ticketDetails = useSelector(selectSelectedComplimentaryTicket);
    const loading = useSelector(selectTicketingLoading);

    useEffect(() => {
        if (isOpen && orderId) {
            dispatch(fetchComplimentaryTicketDetails(orderId));
        }
    }, [isOpen, orderId, dispatch]);

    const handleResendEmail = async () => {
        try {
            const result = await ticketingService.resendComplimentaryTicketEmail(orderId);
            toast.success(result.message || 'Email sent successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to send email');
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const blob = await ticketingService.downloadComplimentaryTicketPDF(orderId);

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tickets-${ticketDetails.order_number}.pdf`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success('PDF downloaded successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to download PDF');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    {loading || !ticketDetails ? (
                        <div className="p-12 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Complimentary Ticket Details
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Order: {ticketDetails.order_number}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Event Info */}
                            {ticketDetails.event && (
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                        {ticketDetails.event.title}
                                    </h3>
                                </div>
                            )}

                            {/* Recipient & Issuance Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                        Recipient
                                    </h4>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {ticketDetails.customer_name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {ticketDetails.customer_email}
                                    </p>
                                    {ticketDetails.customer_phone && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {ticketDetails.customer_phone}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                        Issuance Info
                                    </h4>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        <span className="font-semibold">Issued by:</span>{' '}
                                        {ticketDetails.issued_by_name || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        <span className="font-semibold">Reason:</span> {ticketDetails.reason}
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        <span className="font-semibold">Date:</span>{' '}
                                        {new Date(ticketDetails.created_at).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Notes */}
                            {ticketDetails.notes && (
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                        Notes
                                    </h4>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {ticketDetails.notes}
                                    </p>
                                </div>
                            )}

                            {/* Tickets List */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                    Tickets ({ticketDetails.ticket_count})
                                </h4>
                                <div className="space-y-3">
                                    {ticketDetails.tickets?.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            {ticket.ticket_type_name}
                                                        </span>
                                                        {ticket.seat_label && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                {ticket.seat_label}
                                                            </span>
                                                        )}
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            {ticket.status || 'Valid'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Code: <span className="font-mono">{ticket.code}</span>
                                                    </p>
                                                    {ticket.seat_display && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {ticket.seat_display}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
                                <Button variant="outline" onClick={handleResendEmail}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Resend Email
                                </Button>
                                <Button variant="outline" onClick={handleDownloadPDF}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
