"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FrontLayout } from "@/components/layout/FrontLayout";
import { formatEventDateRange, getEventStatusColor } from "@/types/public-events-types";
import { Button } from "@/components/common/Button";
import { MapDisplay } from "@/components/common/map/LazyMapDisplay";
import { Calendar, MapPin, Clock, Globe, Share2, Ticket, Mail, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useTicketing } from "@/hooks/useTicketing";
import TicketTypeCard from "@/components/ticketing/TicketTypeCard";
import CartSummary from "@/components/ticketing/CartSummary";

export default function PublicEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventName = params.eventName;

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMobileCart, setShowMobileCart] = useState(false);

    const {
        ticketTypes,
        cart,
        cartCount,
        cartTotal,
        loading: ticketsLoading,
        fetchEventTicketing,
    } = useTicketing();

    // Fetch event data
    useEffect(() => {
        if (eventName) {
            fetchEventData();
        }
    }, [eventName]);

    const fetchEventData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/events/${eventName}`);

            if (!response.ok) {
                throw new Error("Event not found");
            }

            const data = await response.json();
            setEvent(data);

            // Fetch ticketing data for this event
            if (data && data.id) {
                fetchEventTicketing(data.id);
            }
        } catch (err) {
            console.error("Error fetching event:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProceedToCheckout = () => {
        if (cartCount > 0) {
            router.push("/checkout");
        }
    };

    if (loading) {
        return (
            <FrontLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading event...</p>
                    </div>
                </div>
            </FrontLayout>
        );
    }

    if (error || !event) {
        return (
            <FrontLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
                        <p className="text-gray-600 mb-4">
                            The event you are looking for does not exist.
                        </p>
                        <Button onClick={() => router.push("/")}>Go Home</Button>
                    </div>
                </div>
            </FrontLayout>
        );
    }

    return (
        <FrontLayout>
            <div className="bg-gray-50 min-h-screen pb-12">
                {/* Hero Section */}
                <div className="relative h-[300px] md:h-[400px] w-full bg-gray-900 overflow-hidden">
                    {event.coverImage ? (
                        <img
                            src={event.coverImage}
                            alt={event.title}
                            className="w-full h-full object-cover opacity-60"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary-900 to-primary-700 opacity-90" />
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white container mx-auto">
                        <div className="max-w-4xl">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="inline-block px-3 py-1 bg-primary-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                                    {event.category?.name || event.category}
                                </span>
                                {event.status && event.status !== "published" && (
                                    <span
                                        className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                                        style={{
                                            backgroundColor: getEventStatusColor(event.status),
                                            color: "white",
                                        }}
                                    >
                                        {event.status.replace("_", " ")}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-4">{event.title}</h1>
                            <div className="flex flex-wrap gap-4 md:gap-8 text-sm md:text-base text-gray-100">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    <span>{formatEventDateRange(event)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    <span>
                                        {event.venue?.name}, {event.location?.city}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* About Section */}
                            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                    About This Event
                                </h2>
                                <div
                                    className="ql-editor text-gray-600"
                                    style={{ padding: 0 }}
                                    dangerouslySetInnerHTML={{ __html: event.description }}
                                />

                                {event.tags && event.tags.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                            Tags
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {event.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Gallery Section */}
                            {event.galleryImages && event.galleryImages.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                        Gallery
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {event.galleryImages.map((img, index) => (
                                            <div
                                                key={index}
                                                className="aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Gallery image ${index + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Video Section */}
                            {event.videoUrl && (
                                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                        Event Video
                                    </h2>
                                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                        {(() => {
                                            const getEmbedUrl = (url) => {
                                                if (!url) return null;
                                                const regExp =
                                                    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&?]*).*/;
                                                const match = url.match(regExp);
                                                return match && match[2].length === 11
                                                    ? `https://www.youtube.com/embed/${match[2]}`
                                                    : null;
                                            };
                                            const embedUrl = getEmbedUrl(event.videoUrl);

                                            if (embedUrl) {
                                                return (
                                                    <iframe
                                                        src={embedUrl}
                                                        title="Event Video"
                                                        className="w-full h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                );
                                            }

                                            return (
                                                <div className="flex items-center justify-center h-full">
                                                    <a
                                                        href={event.videoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary-600 hover:underline flex items-center gap-2 font-medium"
                                                    >
                                                        <PlayCircle className="w-8 h-8" />
                                                        Watch Video on External Site
                                                    </a>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Tickets Section - Moved from Sidebar */}
                            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900">Tickets</h2>

                                {/* Check if event is bookable */}
                                {["cancelled", "postponed", "archived", "completed"].includes(
                                    event.status
                                ) ? (
                                    <div className="text-center py-8">
                                        <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-lg font-medium text-gray-900 mb-2">
                                            {event.status === "cancelled" && "Event Cancelled"}
                                            {event.status === "postponed" && "Event Postponed"}
                                            {event.status === "archived" && "Event Archived"}
                                            {event.status === "completed" && "Event Completed"}
                                        </p>
                                        <p className="text-gray-500">
                                            {event.status === "cancelled" &&
                                                "This event has been cancelled. Tickets are no longer available."}
                                            {event.status === "postponed" &&
                                                "This event has been postponed. Check back for updates."}
                                            {event.status === "archived" &&
                                                "This event has been archived."}
                                            {event.status === "completed" &&
                                                "This event has already taken place."}
                                        </p>
                                    </div>
                                ) : event.status === "sold_out" ? (
                                    <div className="text-center py-8">
                                        <Ticket className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                                        <p className="text-lg font-medium text-gray-900 mb-2">
                                            Sold Out
                                        </p>
                                        <p className="text-gray-500">
                                            All tickets for this event have been sold.
                                        </p>
                                    </div>
                                ) : ticketsLoading && ticketTypes.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading tickets...</p>
                                    </div>
                                ) : ticketTypes.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-lg font-medium text-gray-900 mb-2">
                                            No Tickets Available
                                        </p>
                                        <p className="text-gray-500">
                                            Check back later for ticket availability
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {ticketTypes.map((ticketType) => (
                                            <TicketTypeCard
                                                key={ticketType.id}
                                                ticketType={ticketType}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Refund Policy */}
                            {event.refundPolicy && (
                                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                        Refund Policy
                                    </h2>
                                    <div
                                        className="ql-editor text-gray-600"
                                        style={{ padding: 0 }}
                                        dangerouslySetInnerHTML={{ __html: event.refundPolicy }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="sticky top-24 space-y-6">
                                {/* Cart Summary - Now at Top */}
                                <CartSummary onCheckout={handleProceedToCheckout} />

                                {/* Event Quick Info */}
                                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                    <div className="space-y-3 text-sm text-gray-600">
                                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                            <span className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Date
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(event.startDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                            <span className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Time
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(event.startDate).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        {event.ageRestriction > 0 && (
                                            <div className="flex items-center justify-between py-2">
                                                <span className="flex items-center gap-2">
                                                    <Ticket className="w-4 h-4" />
                                                    Age
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    {event.ageRestriction}+
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            icon={<Share2 className="w-4 h-4" />}
                                        >
                                            Share Event
                                        </Button>
                                    </div>
                                </div>

                                {/* Location - Moved from Main Content */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-lg font-bold mb-4 text-gray-900">
                                        Location
                                    </h3>
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                {event.venue?.name}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {event.location?.address}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {event.location?.city}, {event.location?.state} {event.location?.postcode}
                                            </p>
                                            <p className="text-sm text-gray-600">{event.location?.country}</p>
                                        </div>
                                    </div>
                                    <MapDisplay
                                        latitude={event.location?.coordinates?.lat}
                                        longitude={event.location?.coordinates?.lng}
                                        zoom={15}
                                        className="w-full h-48 rounded-lg"
                                    />
                                </div>

                                {/* Organizer Card */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Organizer</h3>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl">
                                            {event.organizer?.name?.charAt(0) || "O"}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {event.organizer?.name}
                                            </p>
                                            <Link
                                                href={`/organizer/${event.organizerId}`}
                                                className="text-sm text-primary-600 hover:underline"
                                            >
                                                View Profile
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        {event.organizer?.email && (
                                            <a
                                                href={`mailto:${event.organizer.email}`}
                                                className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
                                            >
                                                <Mail className="w-4 h-4" />
                                                Contact Organizer
                                            </a>
                                        )}
                                        {event.organizer?.website && (
                                            <a
                                                href={event.organizer.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
                                            >
                                                <Globe className="w-4 h-4" />
                                                Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Cart Button */}
                    {cartCount > 0 && (
                        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
                            <button
                                onClick={() => setShowMobileCart(true)}
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
                    {showMobileCart && (
                        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
                            <div className="bg-white w-full rounded-t-2xl max-h-[90vh] overflow-y-auto">
                                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                                    <h3 className="text-lg font-bold">Your Cart</h3>
                                    <button
                                        onClick={() => setShowMobileCart(false)}
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
            </div>
        </FrontLayout>
    );
}
