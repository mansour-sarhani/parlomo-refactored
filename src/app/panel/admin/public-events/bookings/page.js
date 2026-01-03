"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FileDown, RefreshCcw, Filter, X, Eye, Search, Send } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { SkeletonTable } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { Modal } from "@/components/common/Modal";
import { Badge } from "@/components/common/Badge";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useAuth } from "@/contexts/AuthContext";
import {
    fetchAdminBookings,
    fetchBookingDetails,
    exportBookings,
    setFilters,
    clearFilters,
    setPage,
    clearCurrentBooking,
    selectBookings,
    selectCurrentBooking,
    selectMeta,
    selectFilters,
    selectLoading,
    selectDetailsLoading,
    selectError,
    selectExporting,
} from "@/features/bookings/adminBookingsSlice";
import { formatDateTime } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/refunds/CurrencyDisplay";
import ticketingService from "@/services/ticketing.service";

export default function AdminBookingsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const bookings = useAppSelector(selectBookings);
    const currentBooking = useAppSelector(selectCurrentBooking);
    const meta = useAppSelector(selectMeta);
    const filters = useAppSelector(selectFilters);
    const loading = useAppSelector(selectLoading);
    const detailsLoading = useAppSelector(selectDetailsLoading);
    const error = useAppSelector(selectError);
    const exporting = useAppSelector(selectExporting);

    const [showFilters, setShowFilters] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Resend tickets modal state
    const [resendModalOpen, setResendModalOpen] = useState(false);
    const [selectedBookingForResend, setSelectedBookingForResend] = useState(null);
    const [resendEmail, setResendEmail] = useState('');
    const [resendReason, setResendReason] = useState("Customer didn't receive original email");
    const [resendLoading, setResendLoading] = useState(false);

    // Local filter state for the form
    const [localFilters, setLocalFilters] = useState({
        status: '',
        complimentary: '',
        search: '',
        dateFrom: '',
        dateTo: '',
    });

    // Update URL with filters
    const updateUrl = useCallback(
        (params) => {
            const url = new URL(window.location.href);

            Object.entries(params).forEach(([key, value]) => {
                if (value && value !== "") {
                    url.searchParams.set(key, value);
                } else {
                    url.searchParams.delete(key);
                }
            });

            if (url.searchParams.get("page") === "1") {
                url.searchParams.delete("page");
            }

            router.push(`${url.pathname}${url.search}`, { scroll: false });
        },
        [router]
    );

    // Initialize filters from URL
    useEffect(() => {
        if (!user) return;

        const page = parseInt(searchParams.get("page") || "1", 10);
        const status = searchParams.get("status") || null;
        const complimentary = searchParams.get("complimentary") || null;
        const search = searchParams.get("search") || null;
        const dateFrom = searchParams.get("dateFrom") || null;
        const dateTo = searchParams.get("dateTo") || null;

        // Update local filters
        setLocalFilters({
            status: status || '',
            complimentary: complimentary || '',
            search: search || '',
            dateFrom: dateFrom || '',
            dateTo: dateTo || '',
        });

        // Update Redux filters and fetch data
        dispatch(setFilters({
            status,
            complimentary: complimentary === 'true' ? true : complimentary === 'false' ? false : null,
            search,
            dateFrom,
            dateTo,
            page,
        }));

        dispatch(fetchAdminBookings({
            page,
            limit: 15,
            status,
            complimentary: complimentary === 'true' ? true : complimentary === 'false' ? false : null,
            search,
            dateFrom,
            dateTo,
            sortBy: 'created_at',
            sortOrder: 'desc',
        }));
    }, [searchParams, dispatch, user]);

    const handleRefresh = useCallback(async () => {
        if (!user) return;

        setIsRefreshing(true);
        try {
            await dispatch(fetchAdminBookings(filters)).unwrap();
            toast.success("Bookings refreshed");
        } catch (error) {
            toast.error("Failed to refresh bookings");
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch, filters, user]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({
                page: newPage,
                status: localFilters.status,
                complimentary: localFilters.complimentary,
                search: localFilters.search,
                dateFrom: localFilters.dateFrom,
                dateTo: localFilters.dateTo,
            });

            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        [updateUrl, localFilters]
    );

    const handleApplyFilters = useCallback(() => {
        updateUrl({
            page: 1,
            status: localFilters.status,
            complimentary: localFilters.complimentary,
            search: localFilters.search,
            dateFrom: localFilters.dateFrom,
            dateTo: localFilters.dateTo,
        });
    }, [updateUrl, localFilters]);

    const handleClearFilters = useCallback(() => {
        setLocalFilters({
            status: '',
            complimentary: '',
            search: '',
            dateFrom: '',
            dateTo: '',
        });
        dispatch(clearFilters());
        updateUrl({ page: 1 });
    }, [dispatch, updateUrl]);

    const handleViewDetails = async (booking) => {
        setDetailsModalOpen(true);
        await dispatch(fetchBookingDetails(booking.id));
    };

    const handleCloseDetailsModal = () => {
        setDetailsModalOpen(false);
        dispatch(clearCurrentBooking());
    };

    const handleExport = async () => {
        try {
            await dispatch(exportBookings(filters)).unwrap();
            toast.success("Bookings exported successfully");
        } catch (error) {
            toast.error("Failed to export bookings");
        }
    };

    const handleOpenResendModal = (booking) => {
        setSelectedBookingForResend(booking);
        setResendEmail(''); // Start with empty, will default to customer email
        setResendReason("Customer didn't receive original email");
        setResendModalOpen(true);
    };

    const handleCloseResendModal = () => {
        setResendModalOpen(false);
        setSelectedBookingForResend(null);
        setResendEmail('');
        setResendReason("Customer didn't receive original email");
    };

    const handleResendTickets = async () => {
        if (!selectedBookingForResend) return;

        setResendLoading(true);
        try {
            const payload = {};
            // Only include email if it's different from the original
            if (resendEmail && resendEmail.trim() !== '') {
                payload.email = resendEmail.trim();
            }
            if (resendReason && resendReason.trim() !== '') {
                payload.reason = resendReason.trim();
            }

            const result = await ticketingService.resendTickets(selectedBookingForResend.id, payload);

            if (result.success) {
                toast.success(result.message || `Tickets sent successfully to ${result.data?.sent_to || 'customer'}`);
                handleCloseResendModal();
            } else {
                toast.error(result.message || 'Failed to resend tickets');
            }
        } catch (error) {
            console.error('Error resending tickets:', error);
            const errorMessage = error.message || error.data?.message || 'Failed to resend tickets. Please try again.';
            toast.error(errorMessage);
        } finally {
            setResendLoading(false);
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warning';
            case 'cancelled':
            case 'refunded':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <ContentWrapper>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        Bookings Report
                    </h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        View all bookings across all events
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        icon={<Filter size={16} />}
                    >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        icon={<FileDown size={16} />}
                        loading={exporting}
                        disabled={bookings.length === 0}
                    >
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        icon={<RefreshCcw size={16} />}
                        loading={isRefreshing}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <Card className="mb-6 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                Search
                            </label>
                            <Input
                                placeholder="Order number, customer name, email..."
                                value={localFilters.search}
                                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleApplyFilters();
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                Status
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-background-elevated)] text-[var(--color-text-primary)]"
                                value={localFilters.status}
                                onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                            >
                                <option value="">All Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                Ticket Type
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-background-elevated)] text-[var(--color-text-primary)]"
                                value={localFilters.complimentary}
                                onChange={(e) => setLocalFilters({ ...localFilters, complimentary: e.target.value })}
                            >
                                <option value="">All Tickets</option>
                                <option value="false">Paid Only</option>
                                <option value="true">Complimentary Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                Date From
                            </label>
                            <Input
                                type="date"
                                value={localFilters.dateFrom}
                                onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                Date To
                            </label>
                            <Input
                                type="date"
                                value={localFilters.dateTo}
                                onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleApplyFilters} size="sm">
                            Apply Filters
                        </Button>
                        <Button onClick={handleClearFilters} variant="outline" size="sm">
                            Clear All
                        </Button>
                    </div>
                </Card>
            )}

            {/* Error State */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">Total Bookings</p>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
                        {meta.total || 0}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">Current Page</p>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
                        {meta.current_page || 1} of {meta.last_page || 1}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">Per Page</p>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
                        {meta.per_page || 15}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">Showing</p>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
                        {bookings.length}
                    </p>
                </Card>
            </div>

            {/* Table */}
            <Card>
                {loading ? (
                    <SkeletonTable rows={5} />
                ) : bookings.length === 0 ? (
                    <EmptyState
                        icon={Search}
                        title="No bookings found"
                        description="Try adjusting your filters or search criteria"
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--color-background-secondary)] border-b border-[var(--color-border)]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Event
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Organizer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Tickets
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {bookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="hover:bg-[var(--color-hover)] transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-[var(--color-text-primary)]">
                                                {booking.order_number || booking.orderNumber}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-[var(--color-text-primary)]">
                                                {booking.customer_name || booking.customerName}
                                            </div>
                                            <div className="text-xs text-[var(--color-text-secondary)]">
                                                {booking.customer_email || booking.customerEmail}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-[var(--color-text-primary)]">
                                                {booking.event?.title || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-[var(--color-text-primary)]">
                                                {booking.event?.organizer?.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <Badge variant={getStatusBadgeVariant(booking.status)}>
                                                    {booking.status?.toUpperCase()}
                                                </Badge>
                                                {booking.is_complimentary && (
                                                    <Badge variant="info">COMPLIMENTARY</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-[var(--color-text-primary)]">
                                                {booking.ticket_count || booking.ticketCount || 0}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <CurrencyDisplay
                                                amount={booking.total}
                                                currency={booking.currency || 'GBP'}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs text-[var(--color-text-secondary)]">
                                                {formatDateTime(booking.created_at || booking.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(booking)}
                                                    icon={<Eye size={14} />}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenResendModal(booking)}
                                                    icon={<Send size={14} />}
                                                    disabled={booking.status?.toLowerCase() !== 'paid'}
                                                    title={booking.status?.toLowerCase() !== 'paid' ? 'Only paid orders can have tickets resent' : 'Resend tickets'}
                                                >
                                                    Resend
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && bookings.length > 0 && (
                    <div className="border-t border-[var(--color-border)] p-4">
                        <Pagination
                            currentPage={meta.current_page || 1}
                            totalPages={meta.last_page || 1}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </Card>

            {/* Details Modal */}
            <Modal
                isOpen={detailsModalOpen}
                onClose={handleCloseDetailsModal}
                title="Booking Details"
                maxWidth="2xl"
            >
                {detailsLoading ? (
                    <div className="p-4">Loading...</div>
                ) : currentBooking ? (
                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                                    Order Number
                                </p>
                                <p className="text-sm text-[var(--color-text-primary)] mt-1">
                                    {currentBooking.orderNumber}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                                    Status
                                </p>
                                <div className="mt-1">
                                    <Badge variant={getStatusBadgeVariant(currentBooking.status)}>
                                        {currentBooking.status?.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                                    Customer Name
                                </p>
                                <p className="text-sm text-[var(--color-text-primary)] mt-1">
                                    {currentBooking.customerName}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                                    Customer Email
                                </p>
                                <p className="text-sm text-[var(--color-text-primary)] mt-1">
                                    {currentBooking.customerEmail}
                                </p>
                            </div>
                            {currentBooking.customerPhone && (
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                                        Phone
                                    </p>
                                    <p className="text-sm text-[var(--color-text-primary)] mt-1">
                                        {currentBooking.customerPhone}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                                    Event
                                </p>
                                <p className="text-sm text-[var(--color-text-primary)] mt-1">
                                    {currentBooking.event?.title}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                                    Organizer
                                </p>
                                <p className="text-sm text-[var(--color-text-primary)] mt-1">
                                    {currentBooking.event?.organizer?.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                                    Tickets
                                </p>
                                <p className="text-sm text-[var(--color-text-primary)] mt-1">
                                    {currentBooking.ticketCount}
                                </p>
                            </div>
                        </div>

                        {currentBooking.isComplimentary && (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <p className="text-sm font-medium text-blue-900">
                                    Complimentary Tickets
                                </p>
                                {currentBooking.complimentaryReason && (
                                    <p className="text-sm text-blue-800 mt-1">
                                        Reason: {currentBooking.complimentaryReason}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="border-t border-[var(--color-border)] pt-4">
                            <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                Order Summary
                            </h3>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--color-text-secondary)]">Subtotal</span>
                                    <CurrencyDisplay
                                        amount={currentBooking.subtotal}
                                        currency={currentBooking.currency}
                                    />
                                </div>
                                {currentBooking.discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--color-text-secondary)]">Discount</span>
                                        <CurrencyDisplay
                                            amount={-currentBooking.discount}
                                            currency={currentBooking.currency}
                                        />
                                    </div>
                                )}
                                {currentBooking.fees > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--color-text-secondary)]">Fees</span>
                                        <CurrencyDisplay
                                            amount={currentBooking.fees}
                                            currency={currentBooking.currency}
                                        />
                                    </div>
                                )}
                                {currentBooking.tax > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--color-text-secondary)]">Tax</span>
                                        <CurrencyDisplay
                                            amount={currentBooking.tax}
                                            currency={currentBooking.currency}
                                        />
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold border-t border-[var(--color-border)] pt-2">
                                    <span className="text-[var(--color-text-primary)]">Total</span>
                                    <CurrencyDisplay
                                        amount={currentBooking.total}
                                        currency={currentBooking.currency}
                                    />
                                </div>
                            </div>
                        </div>

                        {currentBooking.items && currentBooking.items.length > 0 && (
                            <div className="border-t border-[var(--color-border)] pt-4">
                                <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                    Items
                                </h3>
                                <div className="space-y-2">
                                    {currentBooking.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between text-sm bg-[var(--color-background-secondary)] p-2 rounded"
                                        >
                                            <span className="text-[var(--color-text-primary)]">
                                                {item.ticket_type_name} x {item.quantity}
                                            </span>
                                            <CurrencyDisplay
                                                amount={item.total}
                                                currency={currentBooking.currency}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-text-secondary)]">
                            <p>Created: {formatDateTime(currentBooking.createdAt)}</p>
                            {currentBooking.paidAt && (
                                <p>Paid: {formatDateTime(currentBooking.paidAt)}</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-4">No details available</div>
                )}
            </Modal>

            {/* Resend Tickets Modal */}
            <Modal
                isOpen={resendModalOpen}
                onClose={handleCloseResendModal}
                title="Resend Tickets"
                maxWidth="md"
            >
                <div className="p-4 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-900">
                            <strong>Current customer:</strong> {selectedBookingForResend?.customer_name || selectedBookingForResend?.customerName}
                        </p>
                        <p className="text-sm text-blue-900">
                            <strong>Original email:</strong> {selectedBookingForResend?.customer_email || selectedBookingForResend?.customerEmail}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                            Email Address (optional)
                        </label>
                        <Input
                            type="email"
                            placeholder={selectedBookingForResend?.customer_email || selectedBookingForResend?.customerEmail || "Leave empty to use original email"}
                            value={resendEmail}
                            onChange={(e) => setResendEmail(e.target.value)}
                        />
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            Leave empty to send to the original email address
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                            Reason (optional)
                        </label>
                        <Input
                            placeholder="Reason for resending tickets"
                            value={resendReason}
                            onChange={(e) => setResendReason(e.target.value)}
                            maxLength={500}
                        />
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            This will be logged for audit purposes
                        </p>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-[var(--color-border)]">
                        <Button
                            variant="outline"
                            onClick={handleCloseResendModal}
                            disabled={resendLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleResendTickets}
                            loading={resendLoading}
                            icon={<Send size={16} />}
                        >
                            Send Tickets
                        </Button>
                    </div>
                </div>
            </Modal>
        </ContentWrapper>
    );
}
