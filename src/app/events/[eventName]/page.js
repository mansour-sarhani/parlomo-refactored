"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FrontLayout } from "@/components/layout/FrontLayout";
import { formatEventDateRange, getEventStatusColor } from "@/types/public-events-types";
import { Button } from "@/components/common/Button";
import { MapDisplay } from "@/components/common/map/LazyMapDisplay";
import { Calendar, MapPin, Clock, Globe, Share2, Ticket, Mail, PlayCircle, DoorOpen, CalendarClock, Users, Check, Navigation, Phone, Facebook, Instagram, MessageCircle } from "lucide-react";
import { useTicketing } from "@/hooks/useTicketing";
import TicketTypeCard from "@/components/ticketing/TicketTypeCard";
import CartSummary from "@/components/ticketing/CartSummary";
import publicEventsService from "@/services/public-events.service";
import { normalizeEventData } from "@/features/public-events/publicEventsSlice";

export default function PublicEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventName = params.eventName;

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMobileCart, setShowMobileCart] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const {
        ticketTypes,
        cart,
        cartCount,
        cartTotal,
        setTicketTypes,
        startCheckout,
        currentEventId,
        promoCode,
        loading: checkoutLoading,
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

            // Use service to fetch from external API by slug
            const response = await publicEventsService.getEventBySlug(eventName);

            // Normalize the API response (snake_case to camelCase)
            const eventData = response.data || response.event;
            const normalizedEvent = normalizeEventData(eventData);
            setEvent(normalizedEvent);

            // Normalize and store ticket_types in Redux for cart functionality
            if (eventData.ticket_types && Array.isArray(eventData.ticket_types)) {
                const normalizedTicketTypes = eventData.ticket_types.map(tt => ({
                    id: tt.id,
                    eventId: tt.event_id,
                    name: tt.name,
                    description: tt.description,
                    price: tt.price,
                    priceFormatted: tt.price_formatted,
                    currency: tt.currency,
                    capacity: tt.capacity,
                    sold: tt.sold,
                    reserved: tt.reserved,
                    available: tt.available,
                    isSoldOut: tt.is_sold_out,
                    minPerOrder: tt.min_per_order,
                    maxPerOrder: tt.max_per_order,
                    salesStart: tt.sales_start,
                    salesEnd: tt.sales_end,
                    isOnSale: tt.is_on_sale,
                    active: tt.active,
                    visible: tt.visible,
                    refundable: tt.refundable,
                    transferAllowed: tt.transfer_allowed,
                    seatSection: tt.seat_section,
                    seatRow: tt.seat_row,
                    seatNumbers: tt.seat_numbers,
                    displayOrder: tt.display_order,
                }));
                setTicketTypes(
                    eventData.id,
                    normalizedTicketTypes,
                    eventData.stats,
                    eventData.service_charges || [],
                    eventData.tax_rate || 0
                );
            }
        } catch (err) {
            console.error("Error fetching event:", err);
            setError(err.message || "Event not found");
        } finally {
            setLoading(false);
        }
    };

    const handleProceedToCheckout = async () => {
        if (cartCount > 0 && currentEventId) {
            try {
                // Build cart items for the API
                const cartItems = cart.map(item => ({
                    ticketTypeId: item.ticketTypeId,
                    quantity: item.quantity,
                }));

                // Start checkout session
                const result = await startCheckout(currentEventId, cartItems, promoCode);

                // Navigate to checkout if session was created successfully
                if (result.payload?.data || result.payload?.session) {
                    router.push("/checkout");
                } else if (result.error) {
                    console.error("Failed to start checkout:", result.error);
                    alert(result.payload?.message || "Failed to start checkout. Please try again.");
                }
            } catch (err) {
                console.error("Checkout error:", err);
                alert("Failed to start checkout. Please try again.");
            }
        }
    };

    const handleShareEvent = async () => {
        const shareUrl = window.location.href;
        const shareData = {
            title: event?.title || 'Check out this event',
            text: `${event?.title} - ${formatEventDateRange(event)}`,
            url: shareUrl,
        };

        // Try Web Share API first (works on mobile and some desktop browsers)
        if (navigator.share && navigator.canShare?.(shareData)) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                // User cancelled or share failed, fall back to copy
                if (err.name === 'AbortError') return;
            }
        }

        // Fall back to copying link to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    const getDirectionsUrl = () => {
        const lat = event?.location?.coordinates?.lat;
        const lng = event?.location?.coordinates?.lng;

        // Use coordinates if available
        if (lat && lng) {
            return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        }

        // Fall back to address
        const addressParts = [
            event?.location?.address,
            event?.location?.city,
            event?.location?.state,
            event?.location?.postcode,
            event?.location?.country
        ].filter(Boolean);

        if (addressParts.length > 0) {
            return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressParts.join(', '))}`;
        }

        return null;
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
                            {/* 1. About Section */}
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

                            {/* 2. Video Section */}
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

                            {/* 3. Tickets Section */}
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

                            {/* 4. Refund Policy */}
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

                            {/* 5. Gallery Section */}
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
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="sticky top-24 space-y-6">
                                {/* Cart Summary - Now at Top */}
                                <CartSummary
                                    onCheckout={handleProceedToCheckout}
                                    serviceCharges={event?.serviceCharges || []}
                                    taxRate={event?.taxRate || 0}
                                    checkoutLoading={checkoutLoading}
                                />

                                {/* Event Quick Info */}
                                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-3">Event Details</h3>
                                    <div className="space-y-3 text-sm text-gray-600">
                                        {/* Start Date & Time */}
                                        <div className="flex items-start justify-between py-2 border-b border-gray-50">
                                            <span className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-green-600" />
                                                Starts
                                            </span>
                                            <div className="text-right">
                                                <div className="font-medium text-gray-900">
                                                    {new Date(event.startDate).toLocaleDateString([], {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-gray-500">
                                                    {new Date(event.startDate).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* End Date & Time */}
                                        {event.endDate && (
                                            <div className="flex items-start justify-between py-2 border-b border-gray-50">
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-red-600" />
                                                    Ends
                                                </span>
                                                <div className="text-right">
                                                    <div className="font-medium text-gray-900">
                                                        {new Date(event.endDate).toLocaleDateString([], {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {new Date(event.endDate).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Doors Open */}
                                        {event.doorsOpen && (
                                            <div className="flex items-start justify-between py-2 border-b border-gray-50">
                                                <span className="flex items-center gap-2">
                                                    <DoorOpen className="w-4 h-4 text-blue-600" />
                                                    Doors Open
                                                </span>
                                                <div className="text-right">
                                                    <div className="font-medium text-gray-900">
                                                        {new Date(event.doorsOpen).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Booking Deadline */}
                                        {event.bookingDeadline && (
                                            <div className="flex items-start justify-between py-2 border-b border-gray-50">
                                                <span className="flex items-center gap-2">
                                                    <CalendarClock className="w-4 h-4 text-orange-600" />
                                                    Book By
                                                </span>
                                                <div className="text-right">
                                                    <div className="font-medium text-gray-900">
                                                        {new Date(event.bookingDeadline).toLocaleDateString([], {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {new Date(event.bookingDeadline).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Age Restriction */}
                                        {event.ageRestriction && event.ageRestriction !== 'all_ages' && (
                                            <div className="flex items-center justify-between py-2">
                                                <span className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-purple-600" />
                                                    Age Restriction
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    {event.ageRestriction}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={handleShareEvent}
                                            icon={linkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                                        >
                                            {linkCopied ? 'Link Copied!' : 'Share Event'}
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
                                    {getDirectionsUrl() && (
                                        <a
                                            href={getDirectionsUrl()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                        >
                                            <Navigation className="w-4 h-4" />
                                            Get Directions
                                        </a>
                                    )}
                                </div>

                                {/* Organizer Card - Only show if showOrganizerInfo is true */}
                                {event.showOrganizerInfo && (
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <h3 className="font-bold text-gray-900 mb-4">Organizer</h3>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl">
                                                {event.organizer?.name?.charAt(0) || "O"}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {event.organizer?.name}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Contact Options */}
                                        <div className="space-y-2">
                                            {event.organizer?.email && (
                                                <a
                                                    href={`mailto:${event.organizer.email}`}
                                                    className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                    <span className="text-sm">{event.organizer.email}</span>
                                                </a>
                                            )}
                                            {event.organizer?.phone && (
                                                <a
                                                    href={`tel:${event.organizer.phone}`}
                                                    className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                    <span className="text-sm">{event.organizer.phone}</span>
                                                </a>
                                            )}
                                            {event.organizer?.whatsApp && (
                                                <a
                                                    href={`https://wa.me/${event.organizer.whatsApp.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    <span className="text-sm">WhatsApp</span>
                                                </a>
                                            )}
                                            {event.organizer?.website && (
                                                <a
                                                    href={event.organizer.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                    <span className="text-sm">Website</span>
                                                </a>
                                            )}
                                            {event.organizer?.facebook && (
                                                <a
                                                    href={event.organizer.facebook}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                >
                                                    <Facebook className="w-4 h-4" />
                                                    <span className="text-sm">Facebook</span>
                                                </a>
                                            )}
                                            {event.organizer?.instagram && (
                                                <a
                                                    href={event.organizer.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                                                >
                                                    <Instagram className="w-4 h-4" />
                                                    <span className="text-sm">Instagram</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
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
                                    <CartSummary
                                        onCheckout={handleProceedToCheckout}
                                        serviceCharges={event?.serviceCharges || []}
                                        taxRate={event?.taxRate || 0}
                                        checkoutLoading={checkoutLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </FrontLayout>
    );
}
