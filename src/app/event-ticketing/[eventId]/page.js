"use client";

/**
 * Event Ticketing Page
 * Public-facing page for viewing and purchasing event tickets
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTicketing } from "@/hooks/useTicketing";
import { FrontLayout } from "@/components/layout/FrontLayout";
import TicketTypeCard from "@/components/ticketing/TicketTypeCard";
import CartSummary from "@/components/ticketing/CartSummary";
import { Ticket, Calendar, MapPin, Users } from "lucide-react";

export default function EventTicketingPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId;

    const {
        ticketTypes,
        cart,
        cartCount,
        cartTotal,
        eventStats,
        loading,
        error,
        fetchEventTicketing,
    } = useTicketing();

    const [showCart, setShowCart] = useState(false);

    useEffect(() => {
        if (eventId) {
            fetchEventTicketing(eventId);
        }
    }, [eventId]);

    const handleProceedToCheckout = () => {
        if (cartCount > 0) {
            router.push("/checkout");
        }
    };

    if (loading && ticketTypes.length === 0) {
        return (
            <FrontLayout>
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading tickets...</p>
                        </div>
                    </div>
                </div>
            </FrontLayout>
        );
    }

    if (error) {
        return (
            <FrontLayout>
                <div className="container mx-auto px-4 py-12">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 font-medium">Failed to load event tickets</p>
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    </div>
                </div>
            </FrontLayout>
        );
    }

    if (ticketTypes.length === 0) {
        return (
            <FrontLayout>
                <div className="container mx-auto px-4 py-12">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <Ticket className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                        <p className="text-yellow-800 font-medium">No tickets available</p>
                        <p className="text-yellow-600 text-sm mt-2">
                            Tickets for this event are not currently on sale.
                        </p>
                    </div>
                </div>
            </FrontLayout>
        );
    }

    return (
        <FrontLayout>
            <div className="bg-gradient-to-b from-primary/5 to-white min-h-screen">
                {/* Hero Section */}
                <div className="bg-white text-gray-900 py-12 border-b border-gray-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl">
                            <div className="flex items-center gap-2 text-primary mb-3">
                                <Calendar className="w-5 h-5" />
                                <span className="text-sm font-medium">Event Tickets</span>
                            </div>
                            <h1 className="text-4xl font-bold mb-4 text-gray-900">
                                Get Your Tickets
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Select your tickets and secure your spot at this amazing event
                            </p>
                        </div>
                    </div>
                </div>

                {/* Event Stats */}
                {eventStats && (
                    <div className="container mx-auto px-4 -mt-6">
                        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 rounded-full p-3">
                                        <Ticket className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Available</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {eventStats.totalAvailable}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 rounded-full p-3">
                                        <Users className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Sold</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {eventStats.totalSold}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 rounded-full p-3">
                                        <MapPin className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Capacity</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {eventStats.totalCapacity}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl">
                        {/* Ticket Types */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Select Your Tickets
                                </h2>
                                <p className="text-gray-600">
                                    Choose from the available ticket types below
                                </p>
                            </div>

                            {ticketTypes.map((ticketType) => (
                                <TicketTypeCard key={ticketType.id} ticketType={ticketType} />
                            ))}
                        </div>

                        {/* Cart Summary - Desktop */}
                        <div className="hidden lg:block">
                            <div className="sticky top-4">
                                <CartSummary onCheckout={handleProceedToCheckout} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Cart Button */}
                {cartCount > 0 && (
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
                        <button
                            onClick={() => setShowCart(true)}
                            className="w-full bg-primary text-white py-4 rounded-lg font-semibold flex items-center justify-between px-6 hover:bg-primary-600 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <Ticket className="w-5 h-5" />
                                View Cart ({cartCount})
                            </span>
                            <span className="font-bold">${(cartTotal / 100).toFixed(2)}</span>
                        </button>
                    </div>
                )}

                {/* Mobile Cart Modal */}
                {showCart && (
                    <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
                        <div className="bg-white w-full rounded-t-2xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold">Your Cart</h3>
                                <button
                                    onClick={() => setShowCart(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-4">
                                <CartSummary onCheckout={handleProceedToCheckout} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </FrontLayout>
    );
}
