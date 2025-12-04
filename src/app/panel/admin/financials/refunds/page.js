"use client";

import { useEffect, useState } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/Modal";
import ticketingService from "@/services/ticketing.service";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export default function AdminRefundsPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, requestId: null, status: null });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await ticketingService.getAllRefundRequests();
            setRequests(result.refundRequests);
        } catch (error) {
            console.error("Error loading refunds:", error);
            toast.error("Failed to load refund requests");
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (id, status) => {
        setConfirmModal({ isOpen: true, requestId: id, status });
    };

    const handleConfirmAction = async () => {
        const { requestId, status } = confirmModal;

        setActionLoading(requestId);
        try {
            const result = await ticketingService.updateRefundRequest(requestId, {
                status,
                adminNotes: `Marked as ${status} by admin`
            });

            if (result.success) {
                toast.success(`Request marked as ${status}`);
                loadData();
                setConfirmModal({ isOpen: false, requestId: null, status: null });
            }
        } catch (error) {
            toast.error("Failed to update request");
        } finally {
            setActionLoading(null);
        }
    };

    const handleCloseModal = () => {
        setConfirmModal({ isOpen: false, requestId: null, status: null });
    };

    if (loading) {
        return (
            <ContentWrapper>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper className="space-y-6">
            <h1 className="text-2xl font-bold">Refund Requests</h1>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Organizer ID</th>
                                <th className="px-4 py-3">Event ID</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Reason</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map((req) => (
                                <tr key={req.id}>
                                    <td className="px-4 py-3">{new Date(req.requestedAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{req.organizerId}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{req.eventId}</td>
                                    <td className="px-4 py-3">{req.type.replace('_', ' ')}</td>
                                    <td className="px-4 py-3">{req.reason}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium 
                                            ${req.status === 'PROCESSED' || req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                                              req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                                              'bg-yellow-100 text-yellow-700'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {req.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0"
                                                    onClick={() => handleActionClick(req.id, 'APPROVED')}
                                                    loading={actionLoading === req.id}
                                                    title="Approve"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:bg-red-50 border-red-200 h-8 w-8 p-0"
                                                    onClick={() => handleActionClick(req.id, 'REJECTED')}
                                                    loading={actionLoading === req.id}
                                                    title="Reject"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        No refund requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmAction}
                title={`Confirm ${confirmModal.status === 'APPROVED' ? 'Approval' : 'Rejection'}`}
                message={`Are you sure you want to mark this refund request as ${confirmModal.status}?`}
                confirmText={confirmModal.status === 'APPROVED' ? 'Approve' : 'Reject'}
                cancelText="Cancel"
                variant={confirmModal.status === 'APPROVED' ? 'primary' : 'danger'}
                loading={actionLoading === confirmModal.requestId}
            />
        </ContentWrapper>
    );
}
