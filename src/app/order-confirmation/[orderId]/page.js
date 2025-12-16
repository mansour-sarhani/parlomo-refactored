"use client";

/**
 * Order Confirmation Page
 * Displays order success and ticket information
 * Uses guest order endpoint for post-checkout confirmation
 */

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { FrontLayout } from "@/components/layout/FrontLayout";
import { CheckCircle, Download, Calendar, Mail, Ticket, ArrowRight, MapPin, Clock } from "lucide-react";
import ticketingService from "@/services/ticketing.service";

/**
 * Get currency symbol from currency code
 */
function getCurrencySymbol(currency) {
    const symbols = {
        GBP: '£',
        USD: '$',
        EUR: '€',
    };
    return symbols[currency] || currency || '£';
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format time for display
 */
function formatTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function OrderConfirmationPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = params.orderId;
    const email = searchParams.get('email');

    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || !email) {
                setError('Missing order ID or email');
                setLoading(false);
                return;
            }

            try {
                const response = await ticketingService.getGuestOrder(orderId, email);
                if (response.success && response.data) {
                    setOrderData(response.data);
                } else {
                    setError(response.message || 'Failed to load order');
                }
            } catch (err) {
                console.error('Error fetching order:', err);
                setError(err.response?.data?.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, email]);

    const handleViewTickets = () => {
        router.push(`/my-tickets/${orderId}?email=${encodeURIComponent(email)}`);
    };

    const handleDownloadTickets = () => {
        if (orderData?.download_url) {
            window.open(orderData.download_url, '_blank');
        }
    };

    if (loading) {
        return (
            <FrontLayout>
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading order details...</p>
                        </div>
                    </div>
                </div>
            </FrontLayout>
        );
    }

    if (error || !orderData) {
        return (
            <FrontLayout>
                <div className="container mx-auto px-4 py-12">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 font-medium">{error || 'Order not found'}</p>
                    </div>
                </div>
            </FrontLayout>
        );
    }

    const { order, items, event, tickets, download_url } = orderData;
    const currency = getCurrencySymbol(order.currency);

    return (
        <FrontLayout>
            <div className="bg-gradient-to-b from-green-50 to-white min-h-screen py-12">
                <div className="container mx-auto px-4 max-w-3xl">
                    {/* Success Message */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-xl text-gray-600">
                            Your tickets have been sent to your email
                        </p>
                    </div>

                    {/* Event Info Card */}
                    {event && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
                            {event.cover_image && event.path && (
                                <div className="h-48 overflow-hidden relative">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_URL_KEY}${event.path}/${event.cover_image}`}
                                        alt={event.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>
                                <div className="space-y-3 text-gray-600">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="font-medium">{formatDate(event.start_date)}</p>
                                            <p className="text-sm">
                                                {formatTime(event.start_date)} - {formatTime(event.end_date)}
                                            </p>
                                        </div>
                                    </div>
                                    {event.doors_open && (
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-primary" />
                                            <p>Doors open at {formatTime(event.doors_open)}</p>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="font-medium">{event.venue_name}</p>
                                            <p className="text-sm">
                                                {[event.address, event.city, event.postcode, event.country]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Details Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-primary-100 text-sm mb-1">Order Number</p>
                                    <p className="text-2xl font-bold">{order.order_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-primary-100 text-sm mb-1">Total Paid</p>
                                    <p className="text-2xl font-bold">
                                        {currency}{(order.total / 100).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                            {items && items.length > 0 ? (
                                <div className="space-y-3 mb-6">
                                    {items.map((item, index) => (
                                        <div
                                            key={item.id || index}
                                            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {item.ticket_type_name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Qty: {item.quantity} × {currency}{(item.unit_price / 100).toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">
                                                    {currency}{(item.subtotal / 100).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500 mb-6">
                                    <p>{tickets?.length || 0} ticket(s) purchased</p>
                                </div>
                            )}

                            {/* Totals */}
                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">
                                        {currency}{(order.subtotal / 100).toFixed(2)}
                                    </span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount {order.promo_code && `(${order.promo_code})`}</span>
                                        <span className="font-semibold">
                                            -{currency}{(order.discount / 100).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                {order.fees > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Fees</span>
                                        <span className="font-semibold">
                                            {currency}{(order.fees / 100).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                {order.tax > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax</span>
                                        <span className="font-semibold">
                                            {currency}{(order.tax / 100).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-2 flex justify-between">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="font-bold text-xl text-primary">
                                        {currency}{(order.total / 100).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Buyer Info */}
                            <div className="border-t border-gray-200 mt-6 pt-6">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Contact Information
                                </h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>{order.customer_name}</p>
                                    <p>{order.customer_email}</p>
                                    {order.customer_phone && <p>{order.customer_phone}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tickets Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 rounded-full p-3">
                                <Ticket className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-blue-900 mb-2">Your Tickets</h3>
                                <p className="text-blue-800 text-sm mb-4">
                                    {tickets?.length || 0}{" "}
                                    {(tickets?.length || 0) === 1 ? "ticket" : "tickets"} ready to use
                                </p>

                                {/* Ticket List */}
                                {tickets && tickets.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {tickets.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className="bg-white rounded-lg p-3 border border-blue-100"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {ticket.ticket_type?.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-mono">
                                                            {ticket.code}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        ticket.status === 'valid'
                                                            ? 'bg-green-100 text-green-700'
                                                            : ticket.status === 'used'
                                                            ? 'bg-gray-100 text-gray-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                {ticket.attendee_name && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {ticket.attendee_name}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={handleViewTickets}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        View Tickets
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    {download_url && (
                                        <button
                                            onClick={handleDownloadTickets}
                                            className="bg-white text-blue-600 border border-blue-300 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download PDF
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">What&apos;s Next?</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-full p-2 mt-1">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Check Your Email</p>
                                    <p className="text-sm text-gray-600">
                                        We&apos;ve sent your tickets and order confirmation to{" "}
                                        {order.customer_email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-full p-2 mt-1">
                                    <Download className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Download Your Tickets
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Access your tickets anytime from your account or the link in
                                        your email
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-full p-2 mt-1">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Save the Date</p>
                                    <p className="text-sm text-gray-600">
                                        {event?.title} on {formatDate(event?.start_date)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
