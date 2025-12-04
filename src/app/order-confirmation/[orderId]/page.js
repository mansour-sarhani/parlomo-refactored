"use client";

/**
 * Order Confirmation Page
 * Displays order success and ticket information
 */

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { FrontLayout } from "@/components/layout/FrontLayout";
import { CheckCircle, Download, Calendar, Mail, Ticket, ArrowRight } from "lucide-react";

export default function OrderConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId; // MongoDB ObjectId is a string

    const {
        currentOrder,
        currentOrderTickets,
        fetchOrderDetails,
        fetchOrderTickets,
        currentOrderLoading,
        ticketsLoading,
    } = useOrders();

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails(orderId);
            fetchOrderTickets(orderId);
        }
    }, [orderId]);

    const handleViewTickets = () => {
        router.push(`/my-tickets/${orderId}`);
    };

    if (currentOrderLoading || ticketsLoading) {
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

    if (!currentOrder) {
        return (
            <FrontLayout>
                <div className="container mx-auto px-4 py-12">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 font-medium">Order not found</p>
                    </div>
                </div>
            </FrontLayout>
        );
    }

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

                    {/* Order Details Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-primary-100 text-sm mb-1">Order Number</p>
                                    <p className="text-2xl font-bold">{currentOrder.orderNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-primary-100 text-sm mb-1">Total Paid</p>
                                    <p className="text-2xl font-bold">
                                        ${(currentOrder.total / 100).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                            <div className="space-y-3 mb-6">
                                {currentOrder.items?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {item.ticketTypeName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Quantity: {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">
                                                ${(item.subtotal / 100).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">
                                        ${(currentOrder.subtotal / 100).toFixed(2)}
                                    </span>
                                </div>
                                {currentOrder.discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount ({currentOrder.promoCode})</span>
                                        <span className="font-semibold">
                                            -${(currentOrder.discount / 100).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Fees</span>
                                    <span className="font-semibold">
                                        ${(currentOrder.fees / 100).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Buyer Info */}
                            <div className="border-t border-gray-200 mt-6 pt-6">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Contact Information
                                </h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>{currentOrder.customerName || ""}</p>
                                    <p>{currentOrder.customerEmail}</p>
                                    {currentOrder.customerPhone && (
                                        <p>{currentOrder.customerPhone}</p>
                                    )}
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
                                    {currentOrderTickets.length}{" "}
                                    {currentOrderTickets.length === 1 ? "ticket" : "tickets"} ready
                                    to use
                                </p>
                                <button
                                    onClick={handleViewTickets}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    View Tickets
                                    <ArrowRight className="w-4 h-4" />
                                </button>
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
                                        {currentOrder.customerEmail}
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
                                        Add the event to your calendar so you don&apos;t miss it
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
