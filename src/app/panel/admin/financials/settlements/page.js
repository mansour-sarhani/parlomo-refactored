"use client";

import { useEffect, useState, useMemo } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import ticketingService from "@/services/ticketing.service";
import { toast } from "sonner";
import {
    Check,
    X,
    DollarSign,
    Eye,
    CreditCard,
    Banknote,
    ChevronLeft,
    ChevronRight,
    RefreshCcw,
} from "lucide-react";
import {
    SettlementStatusBadge,
    PaymentMethodBadge,
    SettlementTimeline,
} from "@/components/settlements";
import { CurrencyDisplay } from "@/components/refunds/CurrencyDisplay";
import { formatDateTime } from "@/lib/utils";
import { parseCurrencyToCents } from "@/lib/utils/currency";

export default function AdminSettlementsPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filter state
    const [filters, setFilters] = useState({
        status: "ALL",
        searchTerm: "",
    });

    // Selected settlement for details modal
    const [selectedSettlement, setSelectedSettlement] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLogsLoading, setAuditLogsLoading] = useState(false);

    // Action modals
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'pay_stripe', 'pay_manual'

    // Action form states
    const [adminNotes, setAdminNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [adminAdjustment, setAdminAdjustment] = useState("");
    const [adjustmentReason, setAdjustmentReason] = useState("");
    const [transactionReference, setTransactionReference] = useState("");
    const [paymentDescription, setPaymentDescription] = useState("");
    const [applyAdjustment, setApplyAdjustment] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Stripe balance state
    const [stripeBalance, setStripeBalance] = useState(null);
    const [balanceLoading, setBalanceLoading] = useState(true);

    useEffect(() => {
        loadData(currentPage, filters.status);
    }, [currentPage, filters.status]);

    // Load Stripe balance on mount
    useEffect(() => {
        loadStripeBalance();
    }, []);

    const loadStripeBalance = async () => {
        setBalanceLoading(true);
        try {
            const result = await ticketingService.getStripeBalance();
            if (result.success) {
                setStripeBalance(result.data);
            }
        } catch (error) {
            console.error("Error loading Stripe balance:", error);
        } finally {
            setBalanceLoading(false);
        }
    };

    const loadData = async (page = 1, status = null) => {
        setLoading(true);
        try {
            const result = await ticketingService.getAllSettlementRequests({
                page,
                status: status !== "ALL" ? status : null,
            });
            setRequests(result.data || result.settlementRequests || []);
            if (result.meta) {
                setTotalPages(Math.ceil(result.meta.total / (result.meta.per_page || 15)));
                setTotalItems(result.meta.total || 0);
                setCurrentPage(result.meta.current_page || page);
            }
        } catch (error) {
            console.error("Error loading settlements:", error);
            toast.error("Failed to load settlement requests");
        } finally {
            setLoading(false);
        }
    };

    // Filter requests based on search term (client-side filtering for search)
    const filteredRequests = useMemo(() => {
        if (!filters.searchTerm) return requests;

        const term = filters.searchTerm.toLowerCase();
        return requests.filter(
            (req) =>
                req.organizer?.name?.toLowerCase().includes(term) ||
                req.organizer?.email?.toLowerCase().includes(term) ||
                req.event_title?.toLowerCase().includes(term) ||
                req.public_event?.title?.toLowerCase().includes(term) ||
                req.id?.toLowerCase().includes(term)
        );
    }, [requests, filters.searchTerm]);

    // Count by status (for display purposes)
    const statusCounts = useMemo(() => {
        return {
            PENDING: requests.filter((r) => r.status === "PENDING").length,
            APPROVED: requests.filter((r) => r.status === "APPROVED").length,
            REJECTED: requests.filter((r) => r.status === "REJECTED").length,
            PAID: requests.filter((r) => r.status === "PAID").length,
            ALL: requests.length,
        };
    }, [requests]);

    const handleViewDetails = async (settlement) => {
        setSelectedSettlement(settlement);
        setDetailsModalOpen(true);

        // Load audit logs
        setAuditLogsLoading(true);
        try {
            const logs = await ticketingService.getSettlementAuditLogs(settlement.id);
            setAuditLogs(logs.data || logs.auditLogs || []);
        } catch (error) {
            console.error("Error loading audit logs:", error);
        } finally {
            setAuditLogsLoading(false);
        }
    };

    const handleCloseDetailsModal = () => {
        setDetailsModalOpen(false);
        setSelectedSettlement(null);
        setAuditLogs([]);
    };

    const handleOpenActionModal = (type) => {
        setActionType(type);
        setActionModalOpen(true);
        setAdminNotes("");
        setRejectionReason("");
        setAdminAdjustment("");
        setAdjustmentReason("");
        setTransactionReference("");
        setPaymentDescription("");
        setApplyAdjustment(false);
        setFormErrors({});
    };

    const handleCloseActionModal = () => {
        setActionModalOpen(false);
        setActionType(null);
        setFormErrors({});
    };

    const handleApprove = async () => {
        // Validate adjustment if applied
        if (applyAdjustment) {
            const errors = {};
            if (!adminAdjustment || parseFloat(adminAdjustment) === 0) {
                errors.adminAdjustment = "Please enter an adjustment amount";
            }
            if (!adjustmentReason || adjustmentReason.trim().length < 5) {
                errors.adjustmentReason = "Adjustment reason is required (min 5 characters)";
            }
            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                return;
            }
        }

        setActionLoading(true);
        try {
            const payload = {
                status: "APPROVED",
                admin_notes: adminNotes.trim() || undefined,
            };

            if (applyAdjustment && adminAdjustment) {
                payload.admin_adjustment = parseCurrencyToCents(adminAdjustment);
                payload.adjustment_reason = adjustmentReason.trim();
            }

            const result = await ticketingService.updateSettlementRequest(
                selectedSettlement.id,
                payload
            );

            if (result.success) {
                toast.success("Settlement request approved");
                handleCloseActionModal();
                handleCloseDetailsModal();
                loadData(currentPage, filters.status);
            }
        } catch (error) {
            console.error("Error approving settlement:", error);
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
            const result = await ticketingService.updateSettlementRequest(selectedSettlement.id, {
                status: "REJECTED",
                rejection_reason: rejectionReason.trim(),
                admin_notes: adminNotes.trim() || undefined,
            });

            if (result.success) {
                toast.success("Settlement request rejected");
                handleCloseActionModal();
                handleCloseDetailsModal();
                loadData(currentPage, filters.status);
            }
        } catch (error) {
            console.error("Error rejecting settlement:", error);
            toast.error(
                error.message || error.response?.data?.message || "Failed to reject request"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkAsPaid = async () => {
        // Validate manual payment fields
        if (actionType === "pay_manual") {
            if (!transactionReference || transactionReference.trim().length < 3) {
                setFormErrors({ transactionReference: "Transaction reference is required" });
                return;
            }
        }

        setActionLoading(true);
        try {
            const payload = {
                status: "PAID",
                payout_method: actionType === "pay_stripe" ? "stripe" : "manual",
            };

            if (actionType === "pay_manual") {
                payload.transaction_reference = transactionReference.trim();
                if (paymentDescription.trim()) {
                    payload.payment_description = paymentDescription.trim();
                }
            }

            const result = await ticketingService.updateSettlementRequest(
                selectedSettlement.id,
                payload
            );

            if (result.success) {
                const message =
                    actionType === "pay_stripe"
                        ? "Stripe payout initiated. Funds will arrive in 1-3 business days."
                        : "Settlement marked as paid";
                toast.success(message);
                handleCloseActionModal();
                handleCloseDetailsModal();
                loadData(currentPage, filters.status);
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            toast.error(
                error.message || error.response?.data?.message || "Failed to process payment"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const calculateFinalAmount = () => {
        if (!selectedSettlement) return 0;
        const original = selectedSettlement.amount || 0;
        if (applyAdjustment && adminAdjustment) {
            return original + parseCurrencyToCents(adminAdjustment);
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
                            setSelectedSettlement(request);
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
                            setSelectedSettlement(request);
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
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => {
                            setSelectedSettlement(request);
                            handleOpenActionModal("pay_stripe");
                        }}
                        title="Stripe Payout"
                    >
                        <CreditCard className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                            setSelectedSettlement(request);
                            handleOpenActionModal("pay_manual");
                        }}
                        title="Manual Payment"
                    >
                        <Banknote className="w-4 h-4" />
                    </Button>
                </div>
            );
        }

        return null;
    };

    // Pagination component
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-gray-600">
                    Showing page {currentPage} of {totalPages} ({totalItems} total)
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        icon={<ChevronLeft className="w-4 h-4" />}
                    >
                        Previous
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
        );
    };

    if (loading && requests.length === 0) {
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
            <h1 className="text-2xl font-bold">Settlement Requests Management</h1>

            {/* Stripe Balance Card */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <CreditCard className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-purple-900">
                                    Stripe Account Balance
                                </h3>
                                <p className="text-xs text-purple-600">
                                    Available funds for payouts
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={loadStripeBalance}
                            disabled={balanceLoading}
                        >
                            <RefreshCcw
                                className={`w-4 h-4 ${balanceLoading ? "animate-spin" : ""}`}
                            />
                        </Button>
                    </div>

                    {balanceLoading ? (
                        <div className="mt-4 flex gap-8">
                            <div className="animate-pulse bg-purple-200 h-8 w-32 rounded"></div>
                            <div className="animate-pulse bg-purple-200 h-8 w-32 rounded"></div>
                        </div>
                    ) : stripeBalance ? (
                        <div className="mt-4 flex gap-8">
                            <div>
                                <span className="text-sm text-gray-600">Available:</span>
                                <p className="text-2xl font-bold text-green-600">
                                    {stripeBalance.total_available_display}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Pending:</span>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {stripeBalance.total_pending_display}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-red-600">Failed to load balance</p>
                    )}

                    {stripeBalance && stripeBalance.total_available === 0 && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                            No available balance for Stripe payouts. Use manual payment method
                            instead.
                        </div>
                    )}
                </div>
            </Card>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Status Filter Tabs */}
                    <div className="flex gap-2 flex-wrap">
                        {["ALL", "PENDING", "APPROVED", "REJECTED", "PAID"].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setFilters((prev) => ({ ...prev, status }));
                                    setCurrentPage(1);
                                }}
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

                    {/* Search */}
                    <div className="flex gap-3">
                        <Input
                            type="text"
                            placeholder="Search by organizer, event, or ID..."
                            value={filters.searchTerm}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
                            }
                            className="w-full md:w-80"
                        />
                    </div>
                </div>
            </Card>

            {/* Settlements Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                            <tr>
                                <th className="px-4 py-3">Request Date</th>
                                <th className="px-4 py-3">Organizer</th>
                                <th className="px-4 py-3">Event</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-right">Adjustment</th>
                                <th className="px-4 py-3 text-right">Final Amount</th>
                                <th className="px-4 py-3">Payment Method</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-600">
                                        {new Date(
                                            req.requested_at || req.requestedAt || req.created_at
                                        ).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-medium">
                                                {req.organizer?.name || "Unknown"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {req.organizer?.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">
                                            {req.event_title ||
                                                req.public_event?.title ||
                                                req.event_id}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <CurrencyDisplay
                                            amount={req.amount}
                                            currency={req.currency || "GBP"}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {req.admin_adjustment && req.admin_adjustment !== 0 ? (
                                            <span
                                                className={
                                                    req.admin_adjustment > 0
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }
                                            >
                                                {req.admin_adjustment > 0 ? "+" : ""}
                                                <CurrencyDisplay
                                                    amount={req.admin_adjustment}
                                                    currency={req.currency || "GBP"}
                                                />
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold">
                                        <CurrencyDisplay
                                            amount={req.final_amount || req.amount}
                                            currency={req.currency || "GBP"}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <PaymentMethodBadge
                                            method={req.payment_method || "bank_transfer"}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <SettlementStatusBadge status={req.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleViewDetails(req)}
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {renderActionButtons(req)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                        No settlement requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {renderPagination()}
            </Card>

            {/* Settlement Details Modal */}
            {selectedSettlement && (
                <Modal
                    isOpen={detailsModalOpen}
                    onClose={handleCloseDetailsModal}
                    title="Settlement Request Details"
                    size="xl"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Settlement Information */}
                            <Card>
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Settlement Information</h3>
                                        <SettlementStatusBadge status={selectedSettlement.status} />
                                    </div>
                                    <div className="text-sm space-y-2">
                                        <div>
                                            <span className="text-gray-600">Request ID:</span>
                                            <span className="ml-2 font-mono text-xs">
                                                {selectedSettlement.id}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Requested:</span>
                                            <span className="ml-2">
                                                {formatDateTime(
                                                    selectedSettlement.requested_at ||
                                                        selectedSettlement.requestedAt
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Payment Method:</span>
                                            <span className="ml-2">
                                                <PaymentMethodBadge
                                                    method={
                                                        selectedSettlement.payment_method ||
                                                        "bank_transfer"
                                                    }
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Organizer Information */}
                            <Card>
                                <div className="p-4 space-y-3">
                                    <h3 className="font-semibold">Organizer Information</h3>
                                    <div className="text-sm space-y-2">
                                        <div>
                                            <span className="text-gray-600">Name:</span>
                                            <span className="ml-2 font-medium">
                                                {selectedSettlement.organizer?.name || "N/A"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Email:</span>
                                            <span className="ml-2">
                                                {selectedSettlement.organizer?.email}
                                            </span>
                                        </div>
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
                                            <span className="ml-2 font-medium">
                                                {selectedSettlement.event_title ||
                                                    selectedSettlement.public_event?.title}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Financial Breakdown */}
                            <Card>
                                <div className="p-4 space-y-3">
                                    <h3 className="font-semibold">Financial Breakdown</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Total Sales:</span>
                                            <p className="font-medium">
                                                <CurrencyDisplay
                                                    amount={selectedSettlement.total_sales}
                                                    currency={selectedSettlement.currency || "GBP"}
                                                />
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Processing Fees:</span>
                                            <p className="font-medium text-red-600">
                                                -
                                                <CurrencyDisplay
                                                    amount={selectedSettlement.processing_fees}
                                                    currency={selectedSettlement.currency || "GBP"}
                                                />
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Total Refunds:</span>
                                            <p className="font-medium text-red-600">
                                                -
                                                <CurrencyDisplay
                                                    amount={selectedSettlement.total_refunds}
                                                    currency={selectedSettlement.currency || "GBP"}
                                                />
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Platform Fees:</span>
                                            <p className="font-medium">
                                                <CurrencyDisplay
                                                    amount={selectedSettlement.platform_fees || 0}
                                                    currency={selectedSettlement.currency || "GBP"}
                                                />
                                            </p>
                                        </div>
                                        {/* Parlomo fee when organizer pays */}
                                        {selectedSettlement.fee_paid_by === 'organizer' && selectedSettlement.parlomo_fee > 0 && (
                                            <div>
                                                <span className="text-gray-600">Parlomo Fee ({selectedSettlement.parlomo_fee_percentage}%):</span>
                                                <p className="font-medium text-red-600">
                                                    -
                                                    <CurrencyDisplay
                                                        amount={selectedSettlement.parlomo_fee}
                                                        currency={selectedSettlement.currency || "GBP"}
                                                    />
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 font-medium">
                                                Settlement Amount:
                                            </span>
                                            <span className="text-xl font-bold text-blue-600">
                                                <CurrencyDisplay
                                                    amount={selectedSettlement.amount}
                                                    currency={selectedSettlement.currency || "GBP"}
                                                />
                                            </span>
                                        </div>
                                    </div>

                                    {/* Admin Adjustment */}
                                    {selectedSettlement.admin_adjustment &&
                                        selectedSettlement.admin_adjustment !== 0 && (
                                            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                <h4 className="font-semibold text-orange-900 mb-2">
                                                    Admin Adjustment Applied
                                                </h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-orange-800">
                                                            Adjustment:
                                                        </span>
                                                        <span
                                                            className={`font-semibold ${selectedSettlement.admin_adjustment > 0 ? "text-green-600" : "text-red-600"}`}
                                                        >
                                                            {selectedSettlement.admin_adjustment > 0
                                                                ? "+"
                                                                : ""}
                                                            <CurrencyDisplay
                                                                amount={
                                                                    selectedSettlement.admin_adjustment
                                                                }
                                                                currency={
                                                                    selectedSettlement.currency ||
                                                                    "GBP"
                                                                }
                                                            />
                                                        </span>
                                                    </div>
                                                    {selectedSettlement.adjustment_reason && (
                                                        <div className="pt-2 border-t border-orange-300">
                                                            <span className="text-orange-800 font-medium">
                                                                Reason:
                                                            </span>
                                                            <p className="text-orange-900 mt-1">
                                                                {
                                                                    selectedSettlement.adjustment_reason
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="pt-2 border-t border-orange-300 flex justify-between">
                                                        <span className="text-orange-900 font-semibold">
                                                            Final Amount:
                                                        </span>
                                                        <span className="text-lg font-bold text-green-600">
                                                            <CurrencyDisplay
                                                                amount={
                                                                    selectedSettlement.final_amount ||
                                                                    selectedSettlement.amount
                                                                }
                                                                currency={
                                                                    selectedSettlement.currency ||
                                                                    "GBP"
                                                                }
                                                            />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </Card>

                            {/* Payment Details (masked) */}
                            {selectedSettlement.payment_details && (
                                <Card>
                                    <div className="p-4 space-y-3">
                                        <h3 className="font-semibold">Payment Details</h3>
                                        <div className="text-sm space-y-2 font-mono bg-gray-50 p-3 rounded">
                                            {Object.entries(selectedSettlement.payment_details).map(
                                                ([key, value]) => (
                                                    <div key={key}>
                                                        <span className="text-gray-600 capitalize">
                                                            {key.replace("_", " ")}:
                                                        </span>
                                                        <span className="ml-2">{value}</span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Stripe Payout Info */}
                            {selectedSettlement.stripe_payouts &&
                                selectedSettlement.stripe_payouts.length > 0 && (
                                    <Card>
                                        <div className="p-4 space-y-3">
                                            <h3 className="font-semibold">Stripe Payout History</h3>
                                            <div className="space-y-2">
                                                {selectedSettlement.stripe_payouts.map(
                                                    (payout, index) => (
                                                        <div
                                                            key={payout.id || index}
                                                            className="p-3 bg-purple-50 rounded-lg text-sm"
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-mono text-xs">
                                                                    {payout.stripe_payout_id}
                                                                </span>
                                                                <span
                                                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                                                        payout.status === "paid"
                                                                            ? "bg-green-100 text-green-700"
                                                                            : payout.status ===
                                                                                "in_transit"
                                                                              ? "bg-blue-100 text-blue-700"
                                                                              : payout.status ===
                                                                                  "pending"
                                                                                ? "bg-yellow-100 text-yellow-700"
                                                                                : payout.status ===
                                                                                    "failed"
                                                                                  ? "bg-red-100 text-red-700"
                                                                                  : "bg-gray-100 text-gray-700"
                                                                    }`}
                                                                >
                                                                    {payout.status}
                                                                </span>
                                                            </div>
                                                            <div className="mt-2 flex justify-between text-gray-600">
                                                                <span>
                                                                    Amount:{" "}
                                                                    <CurrencyDisplay
                                                                        amount={payout.amount}
                                                                        currency={
                                                                            payout.currency || "GBP"
                                                                        }
                                                                    />
                                                                </span>
                                                                {payout.arrival_date && (
                                                                    <span>
                                                                        Arrival:{" "}
                                                                        {new Date(
                                                                            payout.arrival_date
                                                                        ).toLocaleDateString(
                                                                            "en-GB"
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                )}
                        </div>

                        {/* Right Column - Actions & Timeline */}
                        <div className="space-y-4">
                            {/* Actions Panel */}
                            <Card>
                                <div className="p-4 space-y-3">
                                    <h3 className="font-semibold">Actions</h3>

                                    {selectedSettlement.status === "PENDING" && (
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

                                    {selectedSettlement.status === "APPROVED" && (
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-600 mb-2">
                                                Choose payment method:
                                            </p>
                                            <Button
                                                variant="primary"
                                                fullWidth
                                                onClick={() => handleOpenActionModal("pay_stripe")}
                                                icon={<CreditCard className="w-4 h-4" />}
                                            >
                                                Stripe Payout
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                fullWidth
                                                onClick={() => handleOpenActionModal("pay_manual")}
                                                icon={<Banknote className="w-4 h-4" />}
                                            >
                                                Manual Payment
                                            </Button>
                                            {selectedSettlement.approved_at && (
                                                <div className="text-xs text-gray-600 pt-2 border-t">
                                                    <div>
                                                        Approved by:{" "}
                                                        {selectedSettlement.approved_by_user
                                                            ?.name || "Admin"}
                                                    </div>
                                                    <div>
                                                        On:{" "}
                                                        {formatDateTime(
                                                            selectedSettlement.approved_at
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedSettlement.status === "REJECTED" && (
                                        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                                            <div className="font-medium text-red-900">
                                                Rejection Details
                                            </div>
                                            <div className="mt-2 space-y-1 text-red-800">
                                                <div>
                                                    <strong>Reason:</strong>
                                                    <p>{selectedSettlement.rejection_reason}</p>
                                                </div>
                                                {selectedSettlement.admin_notes && (
                                                    <div>
                                                        <strong>Admin Notes:</strong>
                                                        <p>{selectedSettlement.admin_notes}</p>
                                                    </div>
                                                )}
                                                <div className="text-xs text-red-600 mt-2">
                                                    Rejected by:{" "}
                                                    {selectedSettlement.rejected_by_user?.name ||
                                                        "Admin"}
                                                    <br />
                                                    On:{" "}
                                                    {formatDateTime(selectedSettlement.rejected_at)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedSettlement.status === "PAID" && (
                                        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                                            <div className="font-medium text-green-900">
                                                Payment Complete
                                            </div>
                                            <div className="mt-2 space-y-1 text-green-800">
                                                <div className="flex justify-between">
                                                    <span>Final Amount:</span>
                                                    <strong>
                                                        <CurrencyDisplay
                                                            amount={
                                                                selectedSettlement.final_amount ||
                                                                selectedSettlement.amount
                                                            }
                                                            currency={
                                                                selectedSettlement.currency || "GBP"
                                                            }
                                                        />
                                                    </strong>
                                                </div>
                                                {selectedSettlement.transaction_reference && (
                                                    <div>
                                                        <strong>Reference:</strong>
                                                        <p className="font-mono text-xs">
                                                            {
                                                                selectedSettlement.transaction_reference
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                                {selectedSettlement.payment_description && (
                                                    <div>
                                                        <strong>Description:</strong>
                                                        <p>
                                                            {selectedSettlement.payment_description}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="text-xs text-green-600 mt-2">
                                                    Processed by:{" "}
                                                    {selectedSettlement.paid_by_user?.name ||
                                                        "Admin"}
                                                    <br />
                                                    On: {formatDateTime(selectedSettlement.paid_at)}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Audit Timeline */}
                            <Card>
                                <div className="p-4">
                                    <h3 className="font-semibold mb-3">Activity Timeline</h3>
                                    {auditLogsLoading ? (
                                        <div className="text-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                        </div>
                                    ) : (
                                        <SettlementTimeline auditLogs={auditLogs} />
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Approve Modal */}
            {selectedSettlement && (
                <Modal
                    isOpen={actionModalOpen && actionType === "approve"}
                    onClose={handleCloseActionModal}
                    title="Approve Settlement Request"
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
                            You are about to approve this settlement request for{" "}
                            <strong>
                                <CurrencyDisplay
                                    amount={selectedSettlement.amount}
                                    currency={selectedSettlement.currency || "GBP"}
                                />
                            </strong>
                            .
                        </p>

                        {/* Adjustment Toggle */}
                        <div className="border-t pt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={applyAdjustment}
                                    onChange={(e) => {
                                        setApplyAdjustment(e.target.checked);
                                        if (!e.target.checked) {
                                            setAdminAdjustment("");
                                            setAdjustmentReason("");
                                            setFormErrors({});
                                        }
                                    }}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium">
                                    Apply adjustment to settlement amount
                                </span>
                            </label>
                        </div>

                        {applyAdjustment && (
                            <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Adjustment Amount ({selectedSettlement.currency || "GBP"}) *
                                    </label>
                                    <Input
                                        type="number"
                                        value={adminAdjustment}
                                        onChange={(e) => {
                                            setAdminAdjustment(e.target.value);
                                            setFormErrors({});
                                        }}
                                        placeholder="-50.00"
                                        step="0.01"
                                        error={formErrors.adminAdjustment}
                                    />
                                    <p className="text-xs text-gray-600 mt-1">
                                        Use negative for deductions (e.g., -50.00), positive for
                                        additions
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Adjustment Reason (Required) *
                                    </label>
                                    <textarea
                                        value={adjustmentReason}
                                        onChange={(e) => {
                                            setAdjustmentReason(e.target.value);
                                            setFormErrors({});
                                        }}
                                        placeholder="e.g., Penalty for late cancellation notice"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                                            formErrors.adjustmentReason
                                                ? "border-red-300"
                                                : "border-gray-300"
                                        }`}
                                        rows={2}
                                    />
                                    {formErrors.adjustmentReason && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {formErrors.adjustmentReason}
                                        </p>
                                    )}
                                </div>

                                {/* Preview */}
                                {adminAdjustment && (
                                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                        <p className="text-sm font-semibold text-blue-900">
                                            Preview:
                                        </p>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>Original:</span>
                                                <CurrencyDisplay
                                                    amount={selectedSettlement.amount}
                                                    currency={selectedSettlement.currency || "GBP"}
                                                />
                                            </div>
                                            <div
                                                className={`flex justify-between ${parseFloat(adminAdjustment) >= 0 ? "text-green-600" : "text-red-600"}`}
                                            >
                                                <span>Adjustment:</span>
                                                <span>
                                                    {parseFloat(adminAdjustment) >= 0 ? "+" : ""}
                                                    <CurrencyDisplay
                                                        amount={parseCurrencyToCents(
                                                            adminAdjustment
                                                        )}
                                                        currency={
                                                            selectedSettlement.currency || "GBP"
                                                        }
                                                    />
                                                </span>
                                            </div>
                                            <div className="flex justify-between font-bold pt-2 border-t border-blue-200">
                                                <span>Final Amount:</span>
                                                <CurrencyDisplay
                                                    amount={calculateFinalAmount()}
                                                    currency={selectedSettlement.currency || "GBP"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Admin Notes (Optional)
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add any notes for internal record..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                rows={2}
                            />
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                                After approval, you will need to initiate payment (Stripe or manual)
                                to complete the settlement.
                            </p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Reject Modal */}
            {selectedSettlement && (
                <Modal
                    isOpen={actionModalOpen && actionType === "reject"}
                    onClose={handleCloseActionModal}
                    title="Reject Settlement Request"
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
                            Please provide a reason for rejecting this settlement request. This will
                            be visible to the organizer.
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
                                placeholder="e.g., Invalid bank details provided. Please resubmit with correct account information."
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
                                cannot be undone. The organizer can resubmit a new settlement
                                request.
                            </p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Mark as Paid Modal */}
            {selectedSettlement && (
                <Modal
                    isOpen={
                        actionModalOpen &&
                        (actionType === "pay_stripe" || actionType === "pay_manual")
                    }
                    onClose={handleCloseActionModal}
                    title="Process Payment"
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
                                variant="primary"
                                onClick={handleMarkAsPaid}
                                loading={actionLoading}
                            >
                                {actionType === "pay_stripe" ? "Initiate Payout" : "Mark as Paid"}
                            </Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        {/* Payment Method Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium mb-2">Payment Method</label>
                            <div className="space-y-2">
                                <label
                                    className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                        actionType === "pay_stripe"
                                            ? "border-purple-500 bg-purple-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        checked={actionType === "pay_stripe"}
                                        onChange={() => setActionType("pay_stripe")}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-purple-600" />
                                            <span className="font-medium">Stripe Payout</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                            Automated payout via Stripe. Funds arrive in 1-3
                                            business days.
                                        </p>
                                    </div>
                                </label>

                                <label
                                    className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                        actionType === "pay_manual"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        checked={actionType === "pay_manual"}
                                        onChange={() => setActionType("pay_manual")}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Banknote className="w-4 h-4 text-blue-600" />
                                            <span className="font-medium">Manual Payment</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                            Record a manual bank transfer or PayPal payment.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Manual Payment Fields */}
                        {actionType === "pay_manual" && (
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Transaction Reference (Required) *
                                    </label>
                                    <Input
                                        value={transactionReference}
                                        onChange={(e) => {
                                            setTransactionReference(e.target.value);
                                            setFormErrors({});
                                        }}
                                        placeholder="e.g., BANK_REF_123456"
                                        error={formErrors.transactionReference}
                                    />
                                    <p className="text-xs text-gray-600 mt-1">
                                        Bank transfer reference, PayPal transaction ID, etc.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Payment Description (Optional)
                                    </label>
                                    <textarea
                                        value={paymentDescription}
                                        onChange={(e) => setPaymentDescription(e.target.value)}
                                        placeholder="e.g., Paid via BACS transfer on 2025-12-18"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Stripe Balance Check */}
                        {actionType === "pay_stripe" && stripeBalance && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-purple-800">
                                        Stripe Available Balance:
                                    </span>
                                    <span className="font-semibold text-purple-900">
                                        {stripeBalance.total_available_display}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-purple-800">Settlement Amount:</span>
                                    <span className="font-semibold">
                                        <CurrencyDisplay
                                            amount={
                                                selectedSettlement.final_amount ||
                                                selectedSettlement.amount
                                            }
                                            currency={selectedSettlement.currency || "GBP"}
                                        />
                                    </span>
                                </div>
                                {(selectedSettlement.final_amount || selectedSettlement.amount) >
                                    stripeBalance.total_available && (
                                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                                        Insufficient Stripe balance! Consider using manual payment
                                        instead.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Preview */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-2">Payment Summary</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-green-800">Amount:</span>
                                    <span className="font-bold text-lg text-green-900">
                                        <CurrencyDisplay
                                            amount={
                                                selectedSettlement.final_amount ||
                                                selectedSettlement.amount
                                            }
                                            currency={selectedSettlement.currency || "GBP"}
                                        />
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-800">Recipient:</span>
                                    <span className="font-medium text-green-900">
                                        {selectedSettlement.organizer?.name || "Unknown"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-800">Method:</span>
                                    <span className="font-medium text-green-900 capitalize">
                                        {actionType === "pay_stripe"
                                            ? "Stripe Payout"
                                            : "Manual Payment"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {actionType === "pay_stripe" && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <p className="text-sm text-purple-800">
                                    <strong>Note:</strong> Settlement status will remain as
                                    &quot;Approved&quot; until the Stripe webhook confirms the
                                    payout is complete.
                                </p>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </ContentWrapper>
    );
}
