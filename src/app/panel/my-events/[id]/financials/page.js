"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
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

    useEffect(() => {
        if (!id || !user) return;

        const loadData = async () => {
            try {
                const [financialsData, settlementsData, refundsData] = await Promise.all([
                    ticketingService.getEventFinancials(id),
                    ticketingService.getSettlementRequests(user.id),
                    ticketingService.getRefundRequests(user.id)
                ]);

                setFinancials(financialsData.financials);
                // Filter requests for this event
                setSettlements(settlementsData.settlementRequests.filter(req => req.eventId === id));
                setRefunds(refundsData.refundRequests.filter(req => req.eventId === id));
            } catch (error) {
                console.error("Error loading financials:", error);
                toast.error("Failed to load financial data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, user]);

    const handleRequestSettlement = async () => {
        if (!financials || financials.netRevenue <= 0) {
            toast.error("No revenue available for settlement");
            return;
        }

        if (!confirm(`Request settlement for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP' }).format(financials.netRevenue)}?`)) return;

        setRequestLoading(true);
        try {
            const result = await ticketingService.createSettlementRequest({
                organizerId: user.id,
                eventId: id,
                amount: financials.netRevenue
            });

            if (result.success) {
                toast.success("Settlement request submitted");
                // Refresh list
                const settlementsData = await ticketingService.getSettlementRequests(user.id);
                setSettlements(settlementsData.settlementRequests.filter(req => req.eventId === id));
            }
        } catch (error) {
            toast.error("Failed to request settlement");
        } finally {
            setRequestLoading(false);
        }
    };

    const handleRequestRefund = async () => {
        const reason = prompt("Please enter the reason for this refund request (e.g., Event Cancellation):");
        if (!reason) return;

        setRequestLoading(true);
        try {
            const result = await ticketingService.createRefundRequest({
                organizerId: user.id,
                eventId: id,
                reason: reason,
                type: 'EVENT_CANCELLATION' // Default for now
            });

            if (result.success) {
                toast.success("Refund request submitted");
                // Refresh list
                const refundsData = await ticketingService.getRefundRequests(user.id);
                setRefunds(refundsData.refundRequests.filter(req => req.eventId === id));
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
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP' }).format(financials?.totalRevenue || 0)}
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
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP' }).format(financials?.totalFees || 0)}
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
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP' }).format(financials?.netRevenue || 0)}
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
                        onClick={handleRequestSettlement} 
                        loading={requestLoading}
                        disabled={!financials || financials.netRevenue <= 0}
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
                        onClick={handleRequestRefund} 
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
        </ContentWrapper>
    );
}
