"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { useAuth } from "@/contexts/AuthContext";
import ticketingService from "@/services/ticketing.service";
import { toast } from "sonner";
import { ChevronLeft, DollarSign, RefreshCw, Plus, AlertCircle } from "lucide-react";

export default function EventFinancialsPage({ params }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [financials, setFinancials] = useState(null);
    const [settlements, setSettlements] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [requestLoading, setRequestLoading] = useState(false);
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [refundReason, setRefundReason] = useState("");
    const [settlementModalOpen, setSettlementModalOpen] = useState(false);

    useEffect(() => {
        if (!id || !user) return;

        const loadData = async () => {
            try {
                const [financialsData, settlementsData, refundsData] = await Promise.all([
                    ticketingService.getEventFinancials(id),
                    ticketingService.getSettlementRequests(user.id),
                    ticketingService.getRefundRequests(user.id)
                ]);

                setFinancials(financialsData.data || financialsData.financials);
                // Filter requests for this event
                const settlements = settlementsData.data || settlementsData.settlementRequests || [];
                const refunds = refundsData.data || refundsData.refundRequests || [];
                setSettlements(Array.isArray(settlements) ? settlements.filter(req => req.eventId === id) : []);
                setRefunds(Array.isArray(refunds) ? refunds.filter(req => req.eventId === id) : []);
            } catch (error) {
                console.error("Error loading financials:", error);
                toast.error("Failed to load financial data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, user]);

    const handleOpenSettlementModal = () => {
        setSettlementModalOpen(true);
    };

    const handleCloseSettlementModal = () => {
        setSettlementModalOpen(false);
    };

    const handleSubmitSettlement = async () => {
        const netRev = financials?.netRevenue || financials?.net_revenue || 0;

        setRequestLoading(true);
        try {
            const result = await ticketingService.createSettlementRequest({
                organizerId: user.id,
                eventId: id,
                amount: netRev
            });

            if (result.success) {
                toast.success("Settlement request submitted");
                handleCloseSettlementModal();
                // Refresh list
                const settlementsData = await ticketingService.getSettlementRequests(user.id);
                const settlementsList = settlementsData.data || settlementsData.settlementRequests || [];
                setSettlements(Array.isArray(settlementsList) ? settlementsList.filter(req => req.eventId === id) : []);
            }
        } catch (error) {
            toast.error("Failed to request settlement");
        } finally {
            setRequestLoading(false);
        }
    };

    const handleOpenRefundModal = () => {
        setRefundReason("");
        setRefundModalOpen(true);
    };

    const handleCloseRefundModal = () => {
        setRefundModalOpen(false);
        setRefundReason("");
    };

    const handleSubmitRefund = async () => {
        if (!refundReason.trim()) {
            toast.error("Please enter a reason for the refund request");
            return;
        }

        setRequestLoading(true);
        try {
            const result = await ticketingService.createRefundRequest({
                organizerId: user.id,
                eventId: id,
                reason: refundReason.trim(),
                type: 'EVENT_CANCELLATION'
            });

            if (result.success) {
                toast.success("Refund request submitted");
                handleCloseRefundModal();
                // Refresh list
                const refundsData = await ticketingService.getRefundRequests(user.id);
                const refundsList = refundsData.data || refundsData.refundRequests || [];
                setRefunds(Array.isArray(refundsList) ? refundsList.filter(req => req.eventId === id) : []);
            }
        } catch (error) {
            toast.error("Failed to request refund");
        } finally {
            setRequestLoading(false);
        }
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
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/panel/my-events/${id}`)}
                    icon={<ChevronLeft className="w-4 h-4" />}
                >
                    Back to Event
                </Button>
                <h1 className="text-2xl font-bold">Financials & Settlements</h1>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-green-50 text-green-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Gross Revenue</p>
                            <p className="text-xl font-bold">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP' }).format(financials?.totalRevenue || financials?.total_sales || 0)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-red-50 text-red-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Platform Fees</p>
                            <p className="text-xl font-bold">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP' }).format(financials?.totalFees || financials?.total_refunded || 0)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-blue-50 text-blue-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Net Revenue (Payout)</p>
                            <p className="text-xl font-bold">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP' }).format(financials?.netRevenue || financials?.net_revenue || 0)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Settlements Section */}
            <Card header={
                <div className="flex items-center justify-between">
                    <CardHeader title="Settlement Requests" />
                    <Button
                        onClick={handleOpenSettlementModal}
                        loading={requestLoading}
                        // disabled={!financials || ((financials.netRevenue || financials.net_revenue || 0) <= 0)}
                        icon={<Plus className="w-4 h-4" />}
                    >
                        Request Settlement
                    </Button>
                </div>
            }>
                {settlements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No settlement requests found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Processed At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {settlements.map((req) => (
                                    <tr key={req.id}>
                                        <td className="px-4 py-3">{new Date(req.requestedAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 font-medium">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP' }).format(req.amount)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium 
                                                ${req.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                                                  req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                                                  'bg-yellow-100 text-yellow-700'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {req.processedAt ? new Date(req.processedAt).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Refunds Section */}
            <Card header={
                <div className="flex items-center justify-between">
                    <CardHeader title="Refund Requests" />
                    <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:border-red-200"
                        onClick={handleOpenRefundModal}
                        loading={requestLoading}
                        icon={<AlertCircle className="w-4 h-4" />}
                    >
                        Request Refund / Cancellation
                    </Button>
                </div>
            }>
                {refunds.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No refund requests found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Reason</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {refunds.map((req) => (
                                    <tr key={req.id}>
                                        <td className="px-4 py-3">{new Date(req.requestedAt).toLocaleDateString()}</td>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Settlement Request Modal */}
            <Modal
                isOpen={settlementModalOpen}
                onClose={handleCloseSettlementModal}
                title="Request Settlement"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseSettlementModal} disabled={requestLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitSettlement} loading={requestLoading}>
                            Confirm Request
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        You are about to request a settlement for the following amount:
                    </p>
                    <p className="text-2xl font-bold text-center">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP' }).format(financials?.netRevenue || financials?.net_revenue || 0)}
                    </p>
                    <p className="text-sm text-gray-500">
                        Once submitted, our team will review and process your settlement request.
                    </p>
                </div>
            </Modal>

            {/* Refund Request Modal */}
            <Modal
                isOpen={refundModalOpen}
                onClose={handleCloseRefundModal}
                title="Request Refund / Cancellation"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseRefundModal} disabled={requestLoading}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleSubmitRefund} loading={requestLoading}>
                            Submit Request
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Please enter the reason for this refund request (e.g., Event Cancellation).
                    </p>
                    <textarea
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="Enter your reason here..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={4}
                        disabled={requestLoading}
                    />
                </div>
            </Modal>
        </ContentWrapper>
    );
}
