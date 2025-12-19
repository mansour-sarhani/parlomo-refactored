"use client";

import { useEffect, useState, useMemo } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import ticketingService from "@/services/ticketing.service";
import { toast } from "sonner";
import { Check, X, DollarSign, Eye, FileText, User, Users } from "lucide-react";
import { RefundStatusBadge } from "@/components/refunds/RefundStatusBadge";
import { RefundTypeBadge } from "@/components/refunds/RefundTypeBadge";
import { CurrencyDisplay } from "@/components/refunds/CurrencyDisplay";
import { RefundTimeline } from "@/components/refunds/RefundTimeline";
import { FeeCalculationDisplay } from "@/components/refunds/FeeCalculationDisplay";
import { formatDateTime } from "@/lib/utils";
import { parseCurrencyToCents } from "@/lib/utils/currency";

export default function AdminRefundsPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        status: "ALL",
        requesterType: "ALL", // ALL, GUEST, ORGANIZER
        searchTerm: "",
    });

    // Selected refund for details modal
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLogsLoading, setAuditLogsLoading] = useState(false);

    // Action modals
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'process'

    // Action form states
    const [adminNotes, setAdminNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [processType, setProcessType] = useState("full"); // 'full' or 'partial'
    const [fineAmount, setFineAmount] = useState("");
    const [fineReason, setFineReason] = useState("");
    const [formErrors, setFormErrors] = useState({});

    // Orders modal state
    const [selectedRefundOrders, setSelectedRefundOrders] = useState(null);
    const [ordersModalOpen, setOrdersModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await ticketingService.getAllRefundRequests();
            setRequests(result.refundRequests || result.data || []);
        } catch (error) {
            console.error("Error loading refunds:", error);
            toast.error("Failed to load refund requests");
        } finally {
            setLoading(false);
        }
    };

    // Filter requests based on status, requester type, and search term
    const filteredRequests = useMemo(() => {
        let filtered = requests;

        // Filter by status
        if (filters.status !== "ALL") {
            filtered = filtered.filter((req) => req.status === filters.status);
        }

        // Filter by requester type
        if (filters.requesterType !== "ALL") {
            filtered = filtered.filter((req) => {
                if (filters.requesterType === "GUEST") {
                    return req.is_guest_request === true;
                } else if (filters.requesterType === "ORGANIZER") {
                    return req.is_guest_request === false;
                }
                return true;
            });
        }

        // Filter by search term
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(
                (req) =>
                    req.organizer?.user_profile?.name?.toLowerCase().includes(term) ||
                    req.customer_name?.toLowerCase().includes(term) ||
                    req.customer_email?.toLowerCase().includes(term) ||
                    req.event?.title?.toLowerCase().includes(term) ||
                    req.event_title?.toLowerCase().includes(term) ||
                    req.id?.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [requests, filters]);

    // Count by status
    const statusCounts = useMemo(() => {
        return {
            PENDING: requests.filter((r) => r.status === "PENDING").length,
            APPROVED: requests.filter((r) => r.status === "APPROVED").length,
            REJECTED: requests.filter((r) => r.status === "REJECTED").length,
            PROCESSED: requests.filter((r) => r.status === "PROCESSED").length,
            ALL: requests.length,
        };
    }, [requests]);

    const handleViewDetails = async (refund) => {
        setSelectedRefund(refund);
        setDetailsModalOpen(true);

        // Load audit logs
        setAuditLogsLoading(true);
        try {
            const logs = await ticketingService.getRefundAuditLogs(refund.id);
            setAuditLogs(logs.data || logs.auditLogs || []);
        } catch (error) {
            console.error("Error loading audit logs:", error);
        } finally {
            setAuditLogsLoading(false);
        }
    };

    const handleCloseDetailsModal = () => {
        setDetailsModalOpen(false);
        setSelectedRefund(null);
        setAuditLogs([]);
    };

    const handleViewOrders = (refund) => {
        setSelectedRefundOrders(refund);
        setOrdersModalOpen(true);
    };

    const handleCloseOrdersModal = () => {
        setOrdersModalOpen(false);
        setSelectedRefundOrders(null);
    };

    const handleOpenActionModal = (type) => {
        setActionType(type);
        setActionModalOpen(true);
        setAdminNotes("");
        setRejectionReason("");
        setProcessType("full");
        setFineAmount("");
        setFineReason("");
        setFormErrors({});
    };

    const handleCloseActionModal = () => {
        setActionModalOpen(false);
        setActionType(null);
        setFormErrors({});
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            const result = await ticketingService.approveRefundRequest(selectedRefund.id, {
                admin_notes: adminNotes.trim(),
            });

            if (result.success) {
                toast.success("Refund request approved");
                handleCloseActionModal();
                handleCloseDetailsModal();
                loadData();
            }
        } catch (error) {
            console.error("Error approving refund:", error);
            toast.error(
                error.message || error.response?.data?.message || "Failed to approve request"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        // Validate
        if (!rejectionReason || rejectionReason.trim().length < 10) {
            setFormErrors({ rejectionReason: "Rejection reason must be at least 10 characters" });
            return;
        }

        setActionLoading(true);
        try {
            const result = await ticketingService.rejectRefundRequest(selectedRefund.id, {
                rejection_reason: rejectionReason.trim(),
                admin_notes: adminNotes.trim(),
            });

            if (result.success) {
                toast.success("Refund request rejected");
                handleCloseActionModal();
                handleCloseDetailsModal();
                loadData();
            }
        } catch (error) {
            console.error("Error rejecting refund:", error);
            toast.error(
                error.message || error.response?.data?.message || "Failed to reject request"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleProcessRefund = async () => {
        // Validate partial refund fields
        if (processType === "partial") {
            const errors = {};

            if (!fineAmount || parseFloat(fineAmount) <= 0) {
                errors.fineAmount = "Fine amount must be greater than 0";
            }

            const fineInCents = parseCurrencyToCents(fineAmount);
            if (fineInCents >= selectedRefund.total_refund_amount) {
                errors.fineAmount = "Fine amount must be less than total refund amount";
            }

            if (!fineReason || fineReason.trim().length < 10) {
                errors.fineReason = "Fine reason must be at least 10 characters";
            }

            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                return;
            }
        }

        setActionLoading(true);
        try {
            const data =
                processType === "partial"
                    ? {
                          fine_amount: parseCurrencyToCents(fineAmount),
                          fine_reason: fineReason.trim(),
                      }
                    : {};

            const result = await ticketingService.processRefund(selectedRefund.id, data);

            if (result.success) {
                const message =
                    processType === "partial"
                        ? `Refund processing initiated with £${fineAmount} fine deducted`
                        : "Refund processing initiated";
                toast.success(message, {
                    description: `${result.data?.refunds_processed || 0} refunds queued, ${result.data?.refunds_failed || 0} failed`,
                    duration: 6000,
                });
                handleCloseActionModal();
                handleCloseDetailsModal();
                loadData();
            }
        } catch (error) {
            console.error("Error processing refund:", error);
            toast.error(
                error.message || error.response?.data?.message || "Failed to process refund"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const calculateNetRefund = () => {
        if (!selectedRefund) return 0;

        const original = selectedRefund.total_refund_amount;
        if (processType === "partial" && fineAmount) {
            return original - parseCurrencyToCents(fineAmount);
        }
        return original;
    };

    const renderActionButtons = (request) => {
        if (request.status === "PENDING") {
            return (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                            setSelectedRefund(request);
                            handleOpenActionModal("approve");
                        }}
                        title="Approve"
                    >
                        <Check className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 border-red-200"
                        onClick={() => {
                            setSelectedRefund(request);
                            handleOpenActionModal("reject");
                        }}
                        title="Reject"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            );
        }

        if (request.status === "APPROVED") {
            return (
                <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                        setSelectedRefund(request);
                        handleOpenActionModal("process");
                    }}
                    title="Process Refund"
                >
                    <DollarSign className="w-4 h-4" />
                </Button>
            );
        }

        return null;
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
            <h1 className="text-2xl font-bold">Refund Requests Management</h1>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Status Filter Tabs */}
                    <div className="flex gap-2 flex-wrap">
                        {["ALL", "PENDING", "APPROVED", "REJECTED", "PROCESSED"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilters((prev) => ({ ...prev, status }))}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filters.status === status
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {status}
                                {statusCounts[status] > 0 && (
                                    <span
                                        className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                            filters.status === status
                                                ? "bg-white text-blue-600"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                    >
                                        {statusCounts[status]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Requester Type Filter & Search */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            value={filters.requesterType}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, requesterType: e.target.value }))
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="ALL">All Requesters</option>
                            <option value="GUEST">Guest Requests</option>
                            <option value="ORGANIZER">Organizer Requests</option>
                        </select>
                        <Input
                            type="text"
                            placeholder="Search by name, email, event, or ID..."
                            value={filters.searchTerm}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
                            }
                            className="w-full md:w-80"
                        />
                    </div>
                </div>
            </Card>

            {/* Refunds Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                            <tr>
                                <th className="px-4 py-3">Request Date</th>
                                <th className="px-4 py-3">Requester</th>
                                <th className="px-4 py-3">Event</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Orders</th>
                                <th className="px-4 py-3 text-right">Total Amount</th>
                                <th className="px-4 py-3 text-right">Net Refund</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-600">
                                        {new Date(
                                            req.requestedAt || req.requested_at || req.created_at
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-start gap-2">
                                            {req.is_guest_request ? (
                                                <>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                        <User className="w-3 h-3" />
                                                        Guest
                                                    </span>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {req.customer_name || "Unknown"}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {req.customer_email}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                        <Users className="w-3 h-3" />
                                                        Organizer
                                                    </span>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {req.organizer?.user_profile?.name ||
                                                                "Unknown"}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {req.organizer?.user_profile?.email}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-medium">
                                                {req.event_title ||
                                                    req.event?.title ||
                                                    req.event_id}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {req.event?.venue_name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <RefundTypeBadge type={req.type} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <RefundStatusBadge status={req.status} />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {req.affected_orders_count || "N/A"}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        <CurrencyDisplay
                                            amount={req.total_refund_amount}
                                            currency={req.currency || "GBP"}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {req.has_fine ? (
                                            <div>
                                                <div className="text-green-600">
                                                    £{req.net_refund_display}
                                                </div>
                                                <div className="text-xs text-orange-600">
                                                    -{req.fine_percentage}% fee
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-600">
                                                £{req.total_refund_display}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleViewDetails(req)}
                                                title="View Refund Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleViewOrders(req)}
                                                disabled={!req.orders || req.orders.length === 0}
                                                title="View Order Details"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                            {renderActionButtons(req)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                        No refund requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Refund Details Modal */}
            {selectedRefund && (
                <Modal
                    isOpen={detailsModalOpen}
                    onClose={handleCloseDetailsModal}
                    title="Refund Request Details"
                    size="xl"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Request Information */}
                            <Card>
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Request Information</h3>
                                        <RefundStatusBadge status={selectedRefund.status} />
                                    </div>
                                    <div className="text-sm space-y-2">
                                        <div>
                                            <span className="text-gray-600">Request ID:</span>
                                            <span className="ml-2 font-mono text-xs">
                                                {selectedRefund.id}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Requested:</span>
                                            <span className="ml-2">
                                                {formatDateTime(
                                                    selectedRefund.requestedAt ||
                                                        selectedRefund.requested_at
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Requester Information */}
                            <Card>
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Requester Information</h3>
                                        {selectedRefund.is_guest_request ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                <User className="w-3 h-3" />
                                                Guest Request
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                <Users className="w-3 h-3" />
                                                Organizer Request
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm space-y-2">
                                        {selectedRefund.is_guest_request ? (
                                            <>
                                                <div>
                                                    <span className="text-gray-600">Customer Name:</span>
                                                    <div className="ml-2 font-medium">
                                                        {selectedRefund.customer_name || "N/A"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Customer Email:</span>
                                                    <div className="ml-2 font-medium">
                                                        {selectedRefund.customer_email}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <span className="text-gray-600">Organizer:</span>
                                                    <div className="ml-2">
                                                        <div className="font-medium">
                                                            {selectedRefund.organizer?.user_profile?.name ||
                                                                "N/A"}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {selectedRefund.organizer?.user_profile?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Event Information */}
                            <Card>
                                <div className="p-4 space-y-3">
                                    <h3 className="font-semibold">Event Information</h3>
                                    <div className="text-sm space-y-2">
                                        <div>
                                            <span className="text-gray-600">Event:</span>
                                            <div className="ml-2">
                                                <div className="font-medium">
                                                    {selectedRefund.event_title ||
                                                        selectedRefund.event?.title}
                                                </div>
                                                <div className="text-gray-500">
                                                    {selectedRefund.event?.venue_name}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Event Organizer:</span>
                                            <div className="ml-2">
                                                <div className="font-medium">
                                                    {selectedRefund.organizer?.user_profile?.name ||
                                                        "N/A"}
                                                </div>
                                                <div className="text-gray-500">
                                                    {selectedRefund.organizer?.user_profile?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Financial Summary */}
                            <Card>
                                <div className="p-4 space-y-3">
                                    <h3 className="font-semibold">Financial Summary</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-gray-600">
                                                Total Refund Amount
                                            </span>
                                            <p className="text-2xl font-bold text-primary">
                                                £
                                                {selectedRefund.total_refund_display ||
                                                    (
                                                        selectedRefund.total_refund_amount / 100
                                                    ).toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">
                                                Affected Orders
                                            </span>
                                            <p className="text-2xl font-bold">
                                                {selectedRefund.affected_orders_count}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Fine Information */}
                                    {selectedRefund.has_fine && (
                                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                            <h4 className="font-semibold text-orange-900 mb-2">
                                                Organizer Applied Cancellation Fee
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-orange-800">
                                                        Fine Percentage:
                                                    </span>
                                                    <span className="font-semibold text-orange-900">
                                                        {selectedRefund.fine_percentage}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-orange-800">
                                                        Fine Amount:
                                                    </span>
                                                    <span className="font-semibold text-orange-900">
                                                        £{selectedRefund.fine_display}
                                                    </span>
                                                </div>
                                                {selectedRefund.fine_reason && (
                                                    <div className="pt-2 border-t border-orange-300">
                                                        <span className="text-orange-800 font-medium">
                                                            Reason:
                                                        </span>
                                                        <p className="text-orange-900 mt-1">
                                                            {selectedRefund.fine_reason}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="pt-2 border-t border-orange-300 flex justify-between">
                                                    <span className="text-orange-900 font-semibold">
                                                        Net Refund to Customer:
                                                    </span>
                                                    <span className="text-lg font-bold text-green-600">
                                                        £{selectedRefund.net_refund_display}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!selectedRefund.has_fine && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-green-800">
                                                    Net Refund to Customer:
                                                </span>
                                                <span className="text-lg font-bold text-green-600">
                                                    £
                                                    {selectedRefund.net_refund_display ||
                                                        selectedRefund.total_refund_display}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {selectedRefund.fees_lost && (
                                        <div className="mt-4">
                                            <FeeCalculationDisplay
                                                feesLost={selectedRefund.fees_lost}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Reason & Description */}
                            <Card>
                                <div className="p-4 space-y-3">
                                    <h3 className="font-semibold">Reason & Description</h3>
                                    <div className="text-sm space-y-2">
                                        <div>
                                            <span className="text-gray-600 font-medium">
                                                Reason:
                                            </span>
                                            <p className="mt-1 text-gray-800">
                                                {selectedRefund.reason}
                                            </p>
                                        </div>
                                        {selectedRefund.description && (
                                            <div>
                                                <span className="text-gray-600 font-medium">
                                                    Description:
                                                </span>
                                                <p className="mt-1 text-gray-800">
                                                    {selectedRefund.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Right Column - Actions & Timeline */}
                        <div className="space-y-4">
                            {/* Actions Panel */}
                            <Card>
                                <div className="space-y-3">
                                    <h3 className="font-semibold">Actions</h3>

                                    {selectedRefund.status === "PENDING" && (
                                        <div className="space-y-2">
                                            <Button
                                                variant="success"
                                                fullWidth
                                                onClick={() => handleOpenActionModal("approve")}
                                                icon={<Check className="w-4 h-4" />}
                                            >
                                                Approve Request
                                            </Button>
                                            <Button
                                                variant="danger"
                                                fullWidth
                                                onClick={() => handleOpenActionModal("reject")}
                                                icon={<X className="w-4 h-4" />}
                                            >
                                                Reject Request
                                            </Button>
                                        </div>
                                    )}

                                    {selectedRefund.status === "APPROVED" && (
                                        <div className="space-y-3">
                                            <Button
                                                variant="primary"
                                                fullWidth
                                                onClick={() => handleOpenActionModal("process")}
                                                icon={<DollarSign className="w-4 h-4" />}
                                            >
                                                Process Refund
                                            </Button>
                                            {selectedRefund.approved_at && (
                                                <div className="text-xs text-gray-600">
                                                    <div>
                                                        Approved by:{" "}
                                                        {selectedRefund.approved_by_user?.name ||
                                                            "Admin"}
                                                    </div>
                                                    <div>
                                                        On:{" "}
                                                        {formatDateTime(selectedRefund.approved_at)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedRefund.status === "REJECTED" && (
                                        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                                            <div className="font-medium text-red-900">
                                                Rejection Details
                                            </div>
                                            <div className="mt-2 space-y-1 text-red-800">
                                                <div>
                                                    <strong>Reason:</strong>
                                                    <p>{selectedRefund.rejection_reason}</p>
                                                </div>
                                                {selectedRefund.admin_notes && (
                                                    <div>
                                                        <strong>Admin Notes:</strong>
                                                        <p>{selectedRefund.admin_notes}</p>
                                                    </div>
                                                )}
                                                <div className="text-xs text-red-600 mt-2">
                                                    Rejected by:{" "}
                                                    {selectedRefund.rejected_by_user?.name ||
                                                        "Admin"}
                                                    <br />
                                                    On: {formatDateTime(selectedRefund.rejected_at)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedRefund.status === "PROCESSED" && (
                                        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                                            <div className="font-medium text-green-900">
                                                Processing Summary
                                            </div>
                                            <div className="mt-2 space-y-1 text-green-800">
                                                <div className="flex justify-between">
                                                    <span>Refunds Queued:</span>
                                                    <strong>
                                                        {selectedRefund.refunds_processed || 0}
                                                    </strong>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Refunds Failed:</span>
                                                    <strong
                                                        className={
                                                            selectedRefund.refunds_failed > 0
                                                                ? "text-red-600"
                                                                : ""
                                                        }
                                                    >
                                                        {selectedRefund.refunds_failed || 0}
                                                    </strong>
                                                </div>
                                                {selectedRefund.fine_amount > 0 && (
                                                    <>
                                                        <hr className="my-2 border-green-300" />
                                                        <div className="flex justify-between text-red-600">
                                                            <span>Fine Deducted:</span>
                                                            <strong>
                                                                <CurrencyDisplay
                                                                    amount={
                                                                        selectedRefund.fine_amount
                                                                    }
                                                                    currency={
                                                                        selectedRefund.currency
                                                                    }
                                                                />
                                                            </strong>
                                                        </div>
                                                        <p className="text-xs">
                                                            {selectedRefund.fine_reason}
                                                        </p>
                                                        <div className="flex justify-between font-semibold">
                                                            <span>Net Refunded:</span>
                                                            <CurrencyDisplay
                                                                amount={
                                                                    selectedRefund.net_refund_amount
                                                                }
                                                                currency={selectedRefund.currency}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                                <div className="text-xs text-green-600 mt-2">
                                                    Processed by:{" "}
                                                    {selectedRefund.processed_by_user?.name ||
                                                        "Admin"}
                                                    <br />
                                                    On:{" "}
                                                    {formatDateTime(selectedRefund.processed_at)}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Audit Timeline */}
                            <Card>
                                <div>
                                    <h3 className="font-semibold mb-3">Activity Timeline</h3>
                                    {auditLogsLoading ? (
                                        <div className="text-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                        </div>
                                    ) : (
                                        <RefundTimeline auditLogs={auditLogs} />
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Approve Modal */}
            {selectedRefund && (
                <Modal
                    isOpen={actionModalOpen && actionType === "approve"}
                    onClose={handleCloseActionModal}
                    title="Approve Refund Request"
                    size="md"
                    footer={
                        <>
                            <Button
                                variant="secondary"
                                onClick={handleCloseActionModal}
                                disabled={actionLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleApprove}
                                loading={actionLoading}
                            >
                                Approve Request
                            </Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            You are about to approve this refund request for{" "}
                            <strong>{selectedRefund.affected_orders_count} orders</strong> totaling{" "}
                            <strong>
                                <CurrencyDisplay
                                    amount={selectedRefund.total_refund_amount}
                                    currency={selectedRefund.currency}
                                />
                            </strong>
                            .
                        </p>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Admin Notes (Optional)
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add any notes for internal record..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                                After approval, you will need to process the refund to initiate
                                payments.
                            </p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Reject Modal */}
            {selectedRefund && (
                <Modal
                    isOpen={actionModalOpen && actionType === "reject"}
                    onClose={handleCloseActionModal}
                    title="Reject Refund Request"
                    size="md"
                    footer={
                        <>
                            <Button
                                variant="secondary"
                                onClick={handleCloseActionModal}
                                disabled={actionLoading}
                            >
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleReject} loading={actionLoading}>
                                Reject Request
                            </Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Please provide a reason for rejecting this refund request. This will be
                            visible to the organizer.
                        </p>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-red-700">
                                Rejection Reason (Required) *
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => {
                                    setRejectionReason(e.target.value);
                                    setFormErrors({});
                                }}
                                placeholder="e.g., Event already took place. Refund deadline passed."
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${
                                    formErrors.rejectionReason
                                        ? "border-red-300"
                                        : "border-gray-300"
                                }`}
                                rows={3}
                            />
                            {formErrors.rejectionReason && (
                                <p className="text-sm text-red-600 mt-1">
                                    {formErrors.rejectionReason}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Internal Admin Notes (Optional)
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Internal notes (not visible to organizer)..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                rows={2}
                            />
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-800">
                                <strong>Warning:</strong> This action will notify the organizer and
                                cannot be undone.
                            </p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Process Refund Modal */}
            {selectedRefund && (
                <Modal
                    isOpen={actionModalOpen && actionType === "process"}
                    onClose={handleCloseActionModal}
                    title="Process Refund"
                    size="lg"
                    footer={
                        <>
                            <Button
                                variant="secondary"
                                onClick={handleCloseActionModal}
                                disabled={actionLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleProcessRefund}
                                loading={actionLoading}
                            >
                                Process Refund
                            </Button>
                        </>
                    }
                >
                    <div className="space-y-6">
                        {/* Refund Type Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-3">Refund Type</label>
                            <div className="space-y-2">
                                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="processType"
                                        value="full"
                                        checked={processType === "full"}
                                        onChange={() => {
                                            setProcessType("full");
                                            setFineAmount("");
                                            setFineReason("");
                                            setFormErrors({});
                                        }}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <div className="font-medium">Full Refund</div>
                                        <div className="text-sm text-gray-600">
                                            Refund the entire amount to all customers
                                        </div>
                                    </div>
                                </label>

                                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="processType"
                                        value="partial"
                                        checked={processType === "partial"}
                                        onChange={() => setProcessType("partial")}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <div className="font-medium">
                                            Partial Refund (with deduction)
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Apply a fine/deduction before processing refunds
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Fine Details (if partial) */}
                        {processType === "partial" && (
                            <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Fine Amount ({selectedRefund.currency || "GBP"}) *
                                    </label>
                                    <Input
                                        type="number"
                                        value={fineAmount}
                                        onChange={(e) => {
                                            setFineAmount(e.target.value);
                                            setFormErrors({});
                                        }}
                                        placeholder="50.00"
                                        step="0.01"
                                        min="0"
                                        error={formErrors.fineAmount}
                                    />
                                    <p className="text-xs text-gray-600 mt-1">
                                        Enter amount in {selectedRefund.currency || "GBP"} (e.g.,
                                        50.00 for £50)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Fine Reason (Required) *
                                    </label>
                                    <textarea
                                        value={fineReason}
                                        onChange={(e) => {
                                            setFineReason(e.target.value);
                                            setFormErrors({});
                                        }}
                                        placeholder="e.g., Late cancellation fee (less than 48 hours notice)"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                                            formErrors.fineReason
                                                ? "border-red-300"
                                                : "border-gray-300"
                                        }`}
                                        rows={2}
                                    />
                                    {formErrors.fineReason && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {formErrors.fineReason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Preview Section */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Refund Preview</h4>
                            <div className="space-y-2 text-sm font-mono">
                                <div className="flex justify-between">
                                    <span>Original Amount:</span>
                                    <strong>
                                        <CurrencyDisplay
                                            amount={selectedRefund.total_refund_amount}
                                            currency={selectedRefund.currency}
                                        />
                                    </strong>
                                </div>

                                {processType === "partial" && fineAmount && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Fine/Deduction:</span>
                                        <strong>
                                            -
                                            <CurrencyDisplay
                                                amount={parseCurrencyToCents(fineAmount)}
                                                currency={selectedRefund.currency}
                                            />
                                        </strong>
                                    </div>
                                )}

                                <hr className="border-gray-300" />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>Net Refund:</span>
                                    <span className="text-green-600">
                                        <CurrencyDisplay
                                            amount={calculateNetRefund()}
                                            currency={selectedRefund.currency}
                                        />
                                    </span>
                                </div>

                                <div className="flex justify-between text-gray-600 mt-3">
                                    <span>Affected Orders:</span>
                                    <strong>{selectedRefund.affected_orders_count}</strong>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Avg per Order:</span>
                                    <strong>
                                        <CurrencyDisplay
                                            amount={Math.floor(
                                                calculateNetRefund() /
                                                    selectedRefund.affected_orders_count
                                            )}
                                            currency={selectedRefund.currency}
                                        />
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-sm text-orange-800">
                                <strong>Warning:</strong> This will initiate refunds for{" "}
                                {selectedRefund.affected_orders_count} orders. Customers will
                                receive email notifications. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Orders Details Modal */}
            {selectedRefundOrders && selectedRefundOrders.orders && (
                <Modal
                    isOpen={ordersModalOpen}
                    onClose={handleCloseOrdersModal}
                    title="Order Details"
                    size="xl"
                >
                    <div className="space-y-4">
                        {selectedRefundOrders.orders.map((order, index) => (
                            <Card key={order.id} className="border-l-4 border-l-blue-500">
                                <div className="p-4 space-y-4">
                                    {/* Order Header */}
                                    <div className="flex items-center justify-between border-b pb-3">
                                        <div>
                                            <h3 className="font-semibold text-lg">{order.order_number}</h3>
                                            <p className="text-sm text-gray-500">
                                                Created: {new Date(order.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {order.status?.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Customer Information */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
                                            <div className="space-y-1 text-sm">
                                                <p><span className="text-gray-600">Name:</span> <span className="font-medium">{order.customer_name}</span></p>
                                                <p><span className="text-gray-600">Email:</span> <span className="font-medium">{order.customer_email}</span></p>
                                                {order.customer_phone && (
                                                    <p><span className="text-gray-600">Phone:</span> <span className="font-medium">{order.customer_phone}</span></p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payment Information */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Information</h4>
                                            <div className="space-y-1 text-sm">
                                                <p><span className="text-gray-600">Method:</span> <span className="font-medium">Card</span></p>
                                                {order.paid_at && (
                                                    <p><span className="text-gray-600">Paid At:</span> <span className="font-medium">{new Date(order.paid_at).toLocaleString()}</span></p>
                                                )}
                                                <p><span className="text-gray-600">Payment ID:</span> <span className="font-mono text-xs">{order.payment_intent_id}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
                                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left">Ticket Type</th>
                                                        <th className="px-3 py-2 text-center">Quantity</th>
                                                        <th className="px-3 py-2 text-right">Unit Price</th>
                                                        <th className="px-3 py-2 text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {order.items && order.items.map((item) => (
                                                        <tr key={item.id}>
                                                            <td className="px-3 py-2">{item.ticket_type_name}</td>
                                                            <td className="px-3 py-2 text-center">{item.quantity}</td>
                                                            <td className="px-3 py-2 text-right">£{item.unit_price_display}</td>
                                                            <td className="px-3 py-2 text-right font-medium">£{item.total_display}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Order Summary</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span className="font-medium">
                                                    <CurrencyDisplay amount={order.subtotal} currency={order.currency} />
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Fees:</span>
                                                <span className="font-medium">
                                                    <CurrencyDisplay amount={order.fees} currency={order.currency} />
                                                </span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-blue-200">
                                                <span className="font-semibold text-gray-800">Total Paid:</span>
                                                <span className="font-bold text-lg">£{order.total_display}</span>
                                            </div>

                                            {order.fine_amount > 0 && (
                                                <>
                                                    <div className="flex justify-between text-orange-600 pt-2 border-t border-orange-200">
                                                        <span>Fine Deduction:</span>
                                                        <span className="font-semibold">-£{order.fine_display}</span>
                                                    </div>
                                                    <div className="flex justify-between text-green-600 pt-2 border-t border-green-200">
                                                        <span className="font-semibold">Net Refund:</span>
                                                        <span className="font-bold text-lg">£{order.net_refund_display}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Individual Tickets */}
                                    {order.tickets && order.tickets.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                                Individual Tickets ({order.tickets_count || order.tickets.length})
                                            </h4>
                                            <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-3">
                                                <div className="space-y-2">
                                                    {order.tickets.map((ticket, idx) => (
                                                        <div key={ticket.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                                                    #{idx + 1}
                                                                </span>
                                                                <div>
                                                                    <p className="text-sm font-medium">{ticket.attendee_name}</p>
                                                                    <p className="text-xs text-gray-500">{ticket.attendee_email}</p>
                                                                </div>
                                                            </div>
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                ticket.status === 'valid' ? 'bg-green-100 text-green-700' :
                                                                ticket.status === 'used' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {ticket.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </Modal>
            )}
        </ContentWrapper>
    );
}
