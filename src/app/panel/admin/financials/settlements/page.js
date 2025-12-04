"use client";

import { useEffect, useState } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import ticketingService from "@/services/ticketing.service";
import { toast } from "sonner";
import { Check, X, DollarSign } from "lucide-react";

export default function AdminSettlementsPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await ticketingService.getAllSettlementRequests();
            setRequests(result.settlementRequests);
        } catch (error) {
            console.error("Error loading settlements:", error);
            toast.error("Failed to load settlement requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        if (!confirm(`Are you sure you want to mark this request as ${status}?`)) return;

        setActionLoading(id);
        try {
            const result = await ticketingService.updateSettlementRequest(id, {
                status,
                adminNotes: `Marked as ${status} by admin`
            });

            if (result.success) {
                toast.success(`Request marked as ${status}`);
                loadData();
            }
        } catch (error) {
            toast.error("Failed to update request");
        } finally {
            setActionLoading(null);
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
            <h1 className="text-2xl font-bold">Settlement Requests</h1>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Organizer ID</th>
                                <th className="px-4 py-3">Event ID</th>
                                <th className="px-4 py-3">Amount</th>
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
                                        {req.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0"
                                                    onClick={() => handleAction(req.id, 'PAID')}
                                                    loading={actionLoading === req.id}
                                                    title="Mark as Paid"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:bg-red-50 border-red-200 h-8 w-8 p-0"
                                                    onClick={() => handleAction(req.id, 'REJECTED')}
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
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        No settlement requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </ContentWrapper>
    );
}
