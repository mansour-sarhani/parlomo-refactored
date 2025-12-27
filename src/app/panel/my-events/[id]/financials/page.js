"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { useAuth } from "@/contexts/AuthContext";
import ticketingService from "@/services/ticketing.service";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, DollarSign, Plus, AlertCircle, ShoppingCart, Ticket, TrendingUp, Calendar, BarChart3, RefreshCcw, User, Users, Wallet, Percent, Receipt, Tag, Building2 } from "lucide-react";
import { RefundStatusBadge } from "@/components/refunds/RefundStatusBadge";
import { RefundTypeBadge } from "@/components/refunds/RefundTypeBadge";
import { CurrencyDisplay } from "@/components/refunds/CurrencyDisplay";
import { OrderSelectionTable } from "@/components/refunds/OrderSelectionTable";
import { SettlementStatusBadge, PaymentMethodBadge, PaymentDetailsForm, validatePaymentDetails } from "@/components/settlements";

export default function EventFinancialsPage({ params }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [financials, setFinancials] = useState(null);
    const [settlements, setSettlements] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [requestLoading, setRequestLoading] = useState(false);
    const [settlementModalOpen, setSettlementModalOpen] = useState(false);

    // Settlement payment form state
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [paymentDetails, setPaymentDetails] = useState({});
    const [paymentErrors, setPaymentErrors] = useState({});

    // Refund wizard state
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [refundStep, setRefundStep] = useState(1);
    const [refundType, setRefundType] = useState('EVENT_CANCELLATION');
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [refundFormData, setRefundFormData] = useState({
        reason: '',
        description: '',
        finePercentage: 0,
        fineReason: ''
    });
    const [applyFine, setApplyFine] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [selectedRefundOrders, setSelectedRefundOrders] = useState(null);
    const [ordersModalOpen, setOrdersModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!id || !user) return;

        const loadData = async () => {
            try {
                const [financialsData, settlementsData, refundsData] = await Promise.all([
                    ticketingService.getEventFinancials(id),
                    ticketingService.getSettlementRequests(),
                    ticketingService.getRefundRequests(user.id)
                ]);

                setFinancials(financialsData.data || financialsData.financials);
                const settlements = settlementsData.data || settlementsData.settlementRequests || [];
                const refunds = refundsData.data || refundsData.refundRequests || [];
                setSettlements(Array.isArray(settlements) ? settlements.filter(req => req.event_id === id) : []);
                setRefunds(Array.isArray(refunds) ? refunds.filter(req => req.event_id === id) : []);
            } catch (error) {
                console.error("Error loading financials:", error);
                toast.error("Failed to load financial data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, user]);

    // Settlement handlers
    const handleOpenSettlementModal = () => {
        // Reset form state
        setPaymentMethod('bank_transfer');
        setPaymentDetails({});
        setPaymentErrors({});
        setSettlementModalOpen(true);
    };

    const handleCloseSettlementModal = () => {
        setSettlementModalOpen(false);
        setPaymentMethod('bank_transfer');
        setPaymentDetails({});
        setPaymentErrors({});
    };

    const handleSubmitSettlement = async () => {
        // Validate payment details
        const errors = validatePaymentDetails(paymentMethod, paymentDetails);
        if (Object.keys(errors).length > 0) {
            setPaymentErrors(errors);
            return;
        }

        setRequestLoading(true);
        try {
            const result = await ticketingService.createSettlementRequest({
                event_id: id,
                payment_method: paymentMethod,
                payment_details: paymentDetails
            });

            if (result.success) {
                toast.success("Settlement request submitted successfully");
                handleCloseSettlementModal();
                // Refresh settlements list
                const settlementsData = await ticketingService.getSettlementRequests();
                const settlementsList = settlementsData.data || settlementsData.settlementRequests || [];
                setSettlements(Array.isArray(settlementsList) ? settlementsList.filter(req => req.event_id === id) : []);
            } else {
                // Handle API returning success: false with a message
                toast.error(result.message || "Failed to request settlement");
            }
        } catch (error) {
            // Handle network/server errors
            const errorMessage = error.response?.data?.message || error.message || "Failed to request settlement";
            toast.error(errorMessage);
        } finally {
            setRequestLoading(false);
        }
    };

    // Refund wizard handlers
    const handleOpenRefundModal = async () => {
        setRefundStep(1);
        setRefundType('EVENT_CANCELLATION');
        setSelectedOrders([]);
        setRefundFormData({ reason: '', description: '' });
        setFormErrors({});
        setRefundModalOpen(true);

        // Load orders for the event
        setOrdersLoading(true);
        try {
            const ordersData = await ticketingService.getEventOrders(id, { status: 'paid' });
            setOrders(ordersData.orders || ordersData.data || []);
        } catch (error) {
            console.error("Error loading orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleCloseRefundModal = () => {
        setRefundModalOpen(false);
        setRefundStep(1);
        setSelectedOrders([]);
        setFormErrors({});
        setApplyFine(false);
        setRefundFormData({
            reason: '',
            description: '',
            finePercentage: 0,
            fineReason: ''
        });
    };

    const handleViewOrders = (refund) => {
        setSelectedRefundOrders(refund);
        setOrdersModalOpen(true);
    };

    const handleCloseOrdersModal = () => {
        setOrdersModalOpen(false);
        setSelectedRefundOrders(null);
    };

    const handleNextStep = () => {
        // Validate current step before proceeding
        if (refundStep === 2 && (refundType === 'BULK_REFUND' || refundType === 'SINGLE_ORDER')) {
            if (selectedOrders.length === 0) {
                setFormErrors({ orders: 'Please select at least one order' });
                return;
            }
            if (refundType === 'SINGLE_ORDER' && selectedOrders.length > 1) {
                setFormErrors({ orders: 'Please select only one order for single order refund' });
                return;
            }
        }

        if (refundStep === 3) {
            const errors = {};
            if (!refundFormData.reason || refundFormData.reason.trim().length < 10) {
                errors.reason = 'Reason must be at least 10 characters';
            }
            if (refundFormData.description && refundFormData.description.length > 500) {
                errors.description = 'Description must not exceed 500 characters';
            }

            // Validate fine fields if applying fine
            if (applyFine) {
                if (!refundFormData.finePercentage || refundFormData.finePercentage <= 0 || refundFormData.finePercentage > 100) {
                    errors.finePercentage = 'Fine percentage must be between 0 and 100';
                }
                if (!refundFormData.fineReason || refundFormData.fineReason.trim().length === 0) {
                    errors.fineReason = 'Fine reason is required when applying a fine';
                }
            }

            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                return;
            }
        }

        setFormErrors({});
        setRefundStep(refundStep + 1);
    };

    const handlePrevStep = () => {
        setRefundStep(refundStep - 1);
        setFormErrors({});
    };

    const calculateRefundTotal = useMemo(() => {
        if (refundType === 'EVENT_CANCELLATION') {
            return orders.reduce((sum, order) => sum + (order.total || 0), 0);
        }
        return orders
            .filter(o => selectedOrders.includes(o.id))
            .reduce((sum, o) => sum + (o.total || 0), 0);
    }, [refundType, orders, selectedOrders]);

    const getAffectedOrdersCount = () => {
        if (refundType === 'EVENT_CANCELLATION') {
            return orders.length;
        }
        return selectedOrders.length;
    };

    const handleSubmitRefund = async () => {
        setRequestLoading(true);
        try {
            const orderIds = refundType === 'EVENT_CANCELLATION'
                ? orders.map(o => o.id)
                : selectedOrders;

            const requestData = {
                eventId: id,
                type: refundType,
                reason: refundFormData.reason.trim(),
                description: refundFormData.description?.trim(),
                orderIds: orderIds
            };

            // Add fine fields if applying fine
            if (applyFine && refundFormData.finePercentage > 0) {
                requestData.finePercentage = refundFormData.finePercentage;
                requestData.fineReason = refundFormData.fineReason.trim();
            }

            const result = await ticketingService.createRefundRequest(requestData);

            if (result.success) {
                toast.success('Refund request submitted successfully!', {
                    description: `Request ID: ${result.data?.id || 'N/A'}`,
                    duration: 5000
                });
                handleCloseRefundModal();

                // Refresh refund list
                const refundsData = await ticketingService.getRefundRequests(user.id);
                const refundsList = refundsData.data || refundsData.refundRequests || [];
                setRefunds(Array.isArray(refundsList) ? refundsList.filter(req => req.event_id === id) : []);
            }
        } catch (error) {
            console.error("Error submitting refund:", error);
            const errorMessage = error.message || error.response?.data?.message || "Failed to request refund";
            toast.error(errorMessage);
        } finally {
            setRequestLoading(false);
        }
    };

    // Render refund wizard step
    const renderRefundStep = () => {
        switch (refundStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Select the type of refund you want to request:
                        </p>

                        <div className="space-y-3">
                            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                refundType === 'EVENT_CANCELLATION'
                                    ? 'border-primary bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="refundType"
                                    value="EVENT_CANCELLATION"
                                    checked={refundType === 'EVENT_CANCELLATION'}
                                    onChange={(e) => setRefundType(e.target.value)}
                                    className="mt-1 mr-3"
                                />
                                <div>
                                    <div className="font-medium">Event Cancellation</div>
                                    <div className="text-sm text-gray-600">
                                        Refund all tickets for this event
                                    </div>
                                </div>
                            </label>

                            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                refundType === 'BULK_REFUND'
                                    ? 'border-primary bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="refundType"
                                    value="BULK_REFUND"
                                    checked={refundType === 'BULK_REFUND'}
                                    onChange={(e) => setRefundType(e.target.value)}
                                    className="mt-1 mr-3"
                                />
                                <div>
                                    <div className="font-medium">Bulk Refund</div>
                                    <div className="text-sm text-gray-600">
                                        Select multiple orders to refund
                                    </div>
                                </div>
                            </label>

                            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                refundType === 'SINGLE_ORDER'
                                    ? 'border-primary bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="refundType"
                                    value="SINGLE_ORDER"
                                    checked={refundType === 'SINGLE_ORDER'}
                                    onChange={(e) => setRefundType(e.target.value)}
                                    className="mt-1 mr-3"
                                />
                                <div>
                                    <div className="font-medium">Single Order</div>
                                    <div className="text-sm text-gray-600">
                                        Refund one specific order
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                );

            case 2:
                if (refundType === 'EVENT_CANCELLATION') {
                    // Skip to step 3 for event cancellation
                    return null;
                }
                return (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-4">
                                {refundType === 'SINGLE_ORDER'
                                    ? 'Select the order you want to refund:'
                                    : 'Select the orders you want to refund:'}
                            </p>
                            <OrderSelectionTable
                                orders={orders}
                                selectedOrders={selectedOrders}
                                onSelectionChange={setSelectedOrders}
                                selectionMode={refundType === 'SINGLE_ORDER' ? 'single' : 'multiple'}
                                loading={ordersLoading}
                            />
                        </div>
                        {formErrors.orders && (
                            <p className="text-sm text-red-600">{formErrors.orders}</p>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Refund Reason <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                value={refundFormData.reason}
                                onChange={(e) => setRefundFormData({ ...refundFormData, reason: e.target.value })}
                                placeholder="e.g., Event cancelled due to unforeseen circumstances"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                                    formErrors.reason ? 'border-red-300' : 'border-gray-300'
                                }`}
                                rows={3}
                                maxLength={500}
                            />
                            <div className="flex justify-between mt-1">
                                {formErrors.reason && (
                                    <p className="text-sm text-red-600">{formErrors.reason}</p>
                                )}
                                <p className="text-xs text-gray-500 ml-auto">
                                    {refundFormData.reason.length} / 500 (min 10 characters)
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Additional Description (Optional)
                            </label>
                            <textarea
                                value={refundFormData.description}
                                onChange={(e) => setRefundFormData({ ...refundFormData, description: e.target.value })}
                                placeholder="Add any additional context or details..."
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                                    formErrors.description ? 'border-red-300' : 'border-gray-300'
                                }`}
                                rows={3}
                                maxLength={500}
                            />
                            <div className="flex justify-between mt-1">
                                {formErrors.description && (
                                    <p className="text-sm text-red-600">{formErrors.description}</p>
                                )}
                                <p className="text-xs text-gray-500 ml-auto">
                                    {refundFormData.description.length} / 500
                                </p>
                            </div>
                        </div>

                        {/* Fine/Cancellation Fee Section */}
                        <div className="pt-4 border-t border-gray-200">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={applyFine}
                                    onChange={(e) => setApplyFine(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium">Apply cancellation fee / fine</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1 ml-6">
                                Apply a percentage deduction from the refund amount as per your event terms and conditions
                            </p>
                        </div>

                        {applyFine && (
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Fine Percentage (0-100%) <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={refundFormData.finePercentage}
                                        onChange={(e) => setRefundFormData({ ...refundFormData, finePercentage: parseFloat(e.target.value) || 0 })}
                                        placeholder="e.g., 20"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                            formErrors.finePercentage ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    />
                                    {formErrors.finePercentage && (
                                        <p className="text-sm text-red-600 mt-1">{formErrors.finePercentage}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Reason for Fine <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={refundFormData.fineReason}
                                        onChange={(e) => setRefundFormData({ ...refundFormData, fineReason: e.target.value })}
                                        placeholder="e.g., 20% late cancellation fee as per event terms"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                            formErrors.fineReason ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        maxLength={500}
                                    />
                                    {formErrors.fineReason && (
                                        <p className="text-sm text-red-600 mt-1">{formErrors.fineReason}</p>
                                    )}
                                </div>

                                {/* Fine Preview */}
                                {refundFormData.finePercentage > 0 && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm font-medium text-blue-900">Preview:</p>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Fine: {refundFormData.finePercentage}%
                                        </p>
                                        <p className="text-sm text-blue-700">
                                            Customer will receive: {(100 - refundFormData.finePercentage).toFixed(2)}% of order total
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">
                            Please review your refund request before submitting:
                        </p>

                        <Card className="bg-gray-50">
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Refund Type:</span>
                                    <div className="mt-1">
                                        <RefundTypeBadge type={refundType} />
                                    </div>
                                </div>

                                <div>
                                    <span className="text-gray-600">Affected Orders:</span>
                                    <p className="font-semibold text-lg">{getAffectedOrdersCount()} orders</p>
                                </div>

                                <div>
                                    <span className="text-gray-600">Total Refund Amount:</span>
                                    <p className="font-bold text-2xl text-primary">
                                        <CurrencyDisplay amount={calculateRefundTotal} currency="GBP" />
                                    </p>
                                </div>

                                <div className="pt-3 border-t">
                                    <span className="text-gray-600 font-medium">Reason:</span>
                                    <p className="text-gray-800 mt-1">{refundFormData.reason}</p>
                                </div>

                                {refundFormData.description && (
                                    <div>
                                        <span className="text-gray-600 font-medium">Description:</span>
                                        <p className="text-gray-800 mt-1">{refundFormData.description}</p>
                                    </div>
                                )}

                                {/* Fine Information */}
                                {applyFine && refundFormData.finePercentage > 0 && (
                                    <div className="pt-3 border-t bg-orange-50 -mx-4 px-4 py-3 rounded">
                                        <span className="text-orange-900 font-medium">Cancellation Fee:</span>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <p className="text-orange-800">
                                                <span className="font-medium">Fine Percentage:</span> {refundFormData.finePercentage}%
                                            </p>
                                            <p className="text-orange-800">
                                                <span className="font-medium">Reason:</span> {refundFormData.fineReason}
                                            </p>
                                            <p className="text-orange-900 font-semibold mt-2">
                                                Customer will receive: {(100 - refundFormData.finePercentage).toFixed(2)}% of order total
                                            </p>
                                            <p className="text-orange-900 font-semibold">
                                                Estimated Net Refund: <CurrencyDisplay
                                                    amount={Math.round(calculateRefundTotal * (100 - refundFormData.finePercentage) / 100)}
                                                    currency="GBP"
                                                />
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                                Once submitted, your refund request will be reviewed by our admin team.
                                You will be notified of the decision.
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const getModalTitle = () => {
        const titles = {
            1: 'Select Refund Type',
            2: 'Select Orders',
            3: 'Provide Reason',
            4: 'Review & Submit'
        };
        return titles[refundStep] || 'Request Refund';
    };

    // Skip step 2 for EVENT_CANCELLATION
    const shouldSkipStep2 = refundType === 'EVENT_CANCELLATION' && refundStep === 1;

    if (loading) {
        return (
            <ContentWrapper>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </ContentWrapper>
        );
    }

    // Helper function to format currency (API returns cents)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format((amount || 0) / 100);
    };

    // Tab configuration
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'settlements', label: 'Settlements', icon: DollarSign, count: settlements.length },
        { id: 'refunds', label: 'Refunds', icon: RefreshCcw, count: refunds.length },
    ];

    return (
        <ContentWrapper className="space-y-6">
            {/* Header */}
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

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    isActive
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                        isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Hero Card - Your Earnings */}
                    <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-green-100 text-green-600">
                                    <Wallet className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-700">Your Earnings (Available for Settlement)</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {formatCurrency(financials?.organizer_payout)}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        After platform fees • Request settlement from the Settlements tab
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setActiveTab('settlements')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Request Settlement
                            </Button>
                        </div>
                    </Card>

                    {/* Sales & Order Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gross Ticket Sales</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {formatCurrency(financials?.gross_ticket_sales)}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-50 text-green-600">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Sales (inc. fees)</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatCurrency(financials?.total_sales)}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                                    <ShoppingCart className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Orders</p>
                                    <p className="text-xl font-bold text-purple-600">
                                        {financials?.total_orders || 0}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                    <Ticket className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tickets Sold</p>
                                    <p className="text-xl font-bold text-indigo-600">
                                        {financials?.total_tickets_sold || 0}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-50 text-green-600">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Your Payout</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatCurrency(financials?.organizer_payout)}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-50 text-red-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Platform Fees ({financials?.parlomo_fee_percentage || 0}%)</p>
                                    <p className="text-xl font-bold text-red-600">
                                        {formatCurrency(financials?.parlomo_fees)}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Discounts Used</p>
                                    <p className="text-xl font-bold text-amber-600">
                                        {formatCurrency(financials?.total_discounts)}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                                    <RefreshCcw className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Refunded</p>
                                    <p className="text-xl font-bold text-orange-600">
                                        {formatCurrency(financials?.total_refunded)}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sales Breakdown Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales by Ticket Type */}
                        <Card>
                            <CardHeader title="Sales by Ticket Type" />
                            <div className="p-4">
                                {financials?.by_ticket_type && financials.by_ticket_type.length > 0 ? (
                                    <div className="space-y-4">
                                        {financials.by_ticket_type.map((ticket, index) => {
                                            const maxRevenue = Math.max(...financials.by_ticket_type.map(t => t.revenue));
                                            const percentage = maxRevenue > 0 ? (ticket.revenue / maxRevenue) * 100 : 0;
                                            return (
                                                <div key={ticket.ticket_type_id || index} className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-medium text-gray-700">{ticket.name}</span>
                                                        <div className="flex items-center gap-4 text-gray-600">
                                                            <span>{ticket.sold} sold</span>
                                                            <span className="font-semibold text-gray-900">
                                                                {formatCurrency(ticket.revenue)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No ticket sales data available.
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Sales by Date */}
                        <Card>
                            <CardHeader title="Sales by Date" />
                            <div className="p-4">
                                {financials?.by_date && financials.by_date.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                                                    <th className="text-center py-2 text-gray-500 font-medium">Orders</th>
                                                    <th className="text-right py-2 text-gray-500 font-medium">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {financials.by_date.map((day, index) => (
                                                    <tr key={day.date || index} className="hover:bg-gray-50">
                                                        <td className="py-3">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                                <span className="font-medium text-gray-700">
                                                                    {new Date(day.date).toLocaleDateString('en-GB', {
                                                                        weekday: 'short',
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-center">
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                                                {day.orders} orders
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-right font-semibold text-green-600">
                                                            {formatCurrency(day.revenue)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="border-t-2 border-gray-200 bg-gray-50">
                                                    <td className="py-3 font-semibold text-gray-700">Total</td>
                                                    <td className="py-3 text-center font-semibold text-gray-700">
                                                        {financials.by_date.reduce((sum, day) => sum + day.orders, 0)} orders
                                                    </td>
                                                    <td className="py-3 text-right font-bold text-green-600">
                                                        {formatCurrency(financials.by_date.reduce((sum, day) => sum + day.revenue, 0))}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No sales data by date available.
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Settlements Tab */}
            {activeTab === 'settlements' && (
                <Card header={
                    <div className="flex items-center justify-between">
                        <CardHeader title="Settlement Requests" />
                        <Button
                            onClick={handleOpenSettlementModal}
                            loading={requestLoading}
                            icon={<Plus className="w-4 h-4" />}
                        >
                            Request Settlement
                        </Button>
                    </div>
                }>
                    {settlements.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-1">No settlement requests</p>
                            <p className="text-sm">Request a settlement to withdraw your earnings.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Adjustment</th>
                                        <th className="px-4 py-3">Final Amount</th>
                                        <th className="px-4 py-3">Payment Method</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {settlements.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                {new Date(req.requested_at || req.requestedAt).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <CurrencyDisplay amount={req.amount} currency={req.currency || 'GBP'} />
                                            </td>
                                            <td className="px-4 py-3">
                                                {req.admin_adjustment && req.admin_adjustment !== 0 ? (
                                                    <span className={req.admin_adjustment > 0 ? 'text-green-600' : 'text-red-600'}>
                                                        {req.admin_adjustment > 0 ? '+' : ''}
                                                        <CurrencyDisplay amount={req.admin_adjustment} currency={req.currency || 'GBP'} />
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-semibold">
                                                <CurrencyDisplay
                                                    amount={req.final_amount || req.amount}
                                                    currency={req.currency || 'GBP'}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <PaymentMethodBadge method={req.payment_method || 'bank_transfer'} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <SettlementStatusBadge status={req.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    {req.status === 'REJECTED' && req.rejection_reason && (
                                                        <span className="text-xs text-red-600" title={req.rejection_reason}>
                                                            {req.rejection_reason.length > 30
                                                                ? req.rejection_reason.substring(0, 30) + '...'
                                                                : req.rejection_reason}
                                                        </span>
                                                    )}
                                                    {req.status === 'APPROVED' && req.adjustment_reason && (
                                                        <span className="text-xs text-orange-600" title={req.adjustment_reason}>
                                                            Adj: {req.adjustment_reason.length > 25
                                                                ? req.adjustment_reason.substring(0, 25) + '...'
                                                                : req.adjustment_reason}
                                                        </span>
                                                    )}
                                                    {req.status === 'PAID' && req.paid_at && (
                                                        <span className="text-xs text-green-600">
                                                            Paid: {new Date(req.paid_at).toLocaleDateString('en-GB')}
                                                        </span>
                                                    )}
                                                    {req.stripe_payouts?.length > 0 && (
                                                        <span className="text-xs text-purple-600">
                                                            {req.stripe_payouts[0].status === 'paid' ? 'Payout completed' :
                                                             req.stripe_payouts[0].status === 'in_transit' ? 'Payout in transit' :
                                                             req.stripe_payouts[0].status === 'pending' ? 'Payout pending' :
                                                             req.stripe_payouts[0].status}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}

            {/* Refunds Tab */}
            {activeTab === 'refunds' && (
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
                        <div className="text-center py-12 text-gray-500">
                            <RefreshCcw className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-1">No refund requests</p>
                            <p className="text-sm">All refund requests for this event will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Requester</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Orders</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3 text-right">Net Refund</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {refunds.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{new Date(req.requestedAt || req.requested_at || req.created_at).toLocaleDateString()}</td>
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
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                            <Users className="w-3 h-3" />
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <RefundTypeBadge type={req.type} />
                                            </td>
                                            <td className="px-4 py-3">{req.affected_orders_count || 'N/A'}</td>
                                            <td className="px-4 py-3 font-medium">
                                                <CurrencyDisplay
                                                    amount={req.total_refund_amount}
                                                    currency={req.currency || 'GBP'}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {req.fine_percentage && parseFloat(req.fine_percentage) > 0 ? (
                                                    <div>
                                                        <div className="text-green-600">
                                                            <CurrencyDisplay
                                                                amount={req.net_refund_amount}
                                                                currency={req.currency || 'GBP'}
                                                            />
                                                        </div>
                                                        <div className="text-xs text-orange-600">-{req.fine_percentage}% fee</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-600">
                                                        <CurrencyDisplay
                                                            amount={req.total_refund_amount}
                                                            currency={req.currency || 'GBP'}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <RefundStatusBadge status={req.status} />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleViewOrders(req)}
                                                    disabled={!req.orders || req.orders.length === 0}
                                                >
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}

            {/* Settlement Request Modal */}
            <Modal
                isOpen={settlementModalOpen}
                onClose={handleCloseSettlementModal}
                title="Request Settlement"
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseSettlementModal} disabled={requestLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitSettlement} loading={requestLoading}>
                            Submit Request
                        </Button>
                    </>
                }
            >
                <div className="space-y-6">
                    {/* Financial Summary Card */}
                    <Card className="bg-blue-50 border-blue-200">
                        <div className="p-4">
                            <h3 className="font-semibold text-blue-900 mb-3">Settlement Amount</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Total Sales (inc. fees):</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(financials?.total_sales)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Platform Fee ({financials?.parlomo_fee_percentage || 0}%):</span>
                                    <span className="font-medium text-red-600">-{formatCurrency(financials?.parlomo_fees)}</span>
                                </div>
                                {(financials?.total_refunded > 0) && (
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-600">Total Refunds:</span>
                                        <span className="font-medium text-red-600">-{formatCurrency(financials?.total_refunded)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-3 mt-2 border-t border-blue-200">
                                    <span className="text-blue-900 font-semibold">Your Settlement:</span>
                                    <span className="text-2xl font-bold text-green-600">{formatCurrency(financials?.organizer_payout)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Payment Method Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Select Payment Method</label>
                        <div className="space-y-2">
                            {[
                                { value: 'bank_transfer', label: 'Bank Transfer', desc: 'Receive payment directly to your bank account' },
                                { value: 'stripe', label: 'Stripe', desc: 'Receive payment via Stripe (1-3 business days)' }
                            ].map((method) => (
                                <label
                                    key={method.value}
                                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                        paymentMethod === method.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.value}
                                        checked={paymentMethod === method.value}
                                        onChange={(e) => {
                                            const newMethod = e.target.value;
                                            setPaymentMethod(newMethod);
                                            // Set default country for Stripe
                                            if (newMethod === 'stripe') {
                                                setPaymentDetails({ country: 'GB' });
                                            } else {
                                                setPaymentDetails({});
                                            }
                                            setPaymentErrors({});
                                        }}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{method.label}</span>
                                            <PaymentMethodBadge method={method.value} />
                                        </div>
                                        <p className="text-sm text-gray-600 mt-0.5">{method.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Payment Details Form */}
                    <div className="border-t pt-4">
                        <PaymentDetailsForm
                            paymentMethod={paymentMethod}
                            paymentDetails={paymentDetails}
                            onChange={setPaymentDetails}
                            errors={paymentErrors}
                        />
                    </div>

                    {/* Info Notice */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            Once submitted, your settlement request will be reviewed by our admin team.
                            You will be notified when it is approved and payment is processed.
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Multi-Step Refund Request Modal */}
            <Modal
                isOpen={refundModalOpen}
                onClose={handleCloseRefundModal}
                title={getModalTitle()}
                size={refundStep === 2 ? "xl" : "md"}
                footer={
                    <div className="flex items-center justify-between w-full">
                        <div className="text-sm text-gray-500">
                            Step {refundStep} of 4
                        </div>
                        <div className="flex gap-2">
                            {refundStep > 1 && (
                                <Button
                                    variant="secondary"
                                    onClick={handlePrevStep}
                                    disabled={requestLoading}
                                    icon={<ChevronLeft className="w-4 h-4" />}
                                >
                                    Back
                                </Button>
                            )}
                            {refundStep < 4 ? (
                                <Button
                                    onClick={() => shouldSkipStep2 ? setRefundStep(3) : handleNextStep()}
                                    icon={<ChevronRight className="w-4 h-4" />}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    variant="danger"
                                    onClick={handleSubmitRefund}
                                    loading={requestLoading}
                                >
                                    Submit Request
                                </Button>
                            )}
                        </div>
                    </div>
                }
            >
                {renderRefundStep()}
            </Modal>

            {/* Orders Details Modal */}
            {selectedRefundOrders && selectedRefundOrders.orders && (
                <Modal
                    isOpen={ordersModalOpen}
                    onClose={handleCloseOrdersModal}
                    title="Refund Request Details"
                    size="xl"
                >
                    <div className="space-y-4">
                        {/* Requester Info Card */}
                        <Card className="bg-gray-50">
                            <div className="p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-700">Requester Information</h3>
                                    {selectedRefundOrders.is_guest_request ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                            <User className="w-3 h-3" />
                                            Guest Request
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            <Users className="w-3 h-3" />
                                            Your Request
                                        </span>
                                    )}
                                </div>
                                {selectedRefundOrders.is_guest_request && (
                                    <div className="mt-3 text-sm space-y-1">
                                        <p><span className="text-gray-600">Customer Name:</span> <span className="font-medium">{selectedRefundOrders.customer_name}</span></p>
                                        <p><span className="text-gray-600">Customer Email:</span> <span className="font-medium">{selectedRefundOrders.customer_email}</span></p>
                                    </div>
                                )}
                                <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                                    <p><span className="text-gray-600">Reason:</span> <span className="font-medium">{selectedRefundOrders.reason}</span></p>
                                    {selectedRefundOrders.description && (
                                        <p className="mt-1"><span className="text-gray-600">Description:</span> <span className="font-medium">{selectedRefundOrders.description}</span></p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Order Details */}
                        <h4 className="font-semibold text-gray-700">Affected Orders ({selectedRefundOrders.affected_orders_count})</h4>
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
