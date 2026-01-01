"use client";

/**
 * Event Ticketing Management Page (Organizer)
 * Manage ticket types, view sales, and track attendees
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import TicketTypeManager from "@/components/ticketing/organizer/TicketTypeManager";
import SalesDashboard from "@/components/ticketing/organizer/SalesDashboard";
import AttendeeList from "@/components/ticketing/organizer/AttendeeList";
import PromoCodeManager from "@/components/ticketing/organizer/PromoCodeManager";
import SeatBlockingManager from "@/components/ticketing/SeatBlockingManager";
import publicEventsService from "@/services/public-events.service";
import { Ticket, BarChart3, Users, Tag, ChevronLeft, Lock } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function EventTicketingManagementPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id;
    const [activeTab, setActiveTab] = useState("tickets");
    const [event, setEvent] = useState(null);
    const [loadingEvent, setLoadingEvent] = useState(true);

    // Fetch event data to check if it's seated
    useEffect(() => {
        if (eventId) {
            fetchEventData();
        }
    }, [eventId]);

    const fetchEventData = async () => {
        try {
            setLoadingEvent(true);
            const response = await publicEventsService.getEventById(eventId);
            if (response.success) {
                setEvent(response.data);
            }
        } catch (err) {
            console.error('Error fetching event:', err);
        } finally {
            setLoadingEvent(false);
        }
    };

    // Check if event is seated
    const isSeatedEvent = event?.eventType === 'seated' || event?.event_type === 'seated';

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/panel/my-events/${eventId}`)}
                        icon={<ChevronLeft className="w-4 h-4" />}
                    >
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Ticketing Management</h1>
                </div>
                <p className="text-gray-600 ml-[72px]">
                    Manage tickets, view sales analytics, and track attendees
                </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex gap-1 p-2 overflow-x-auto">
                        <Button
                            onClick={() => setActiveTab("tickets")}
                            variant={activeTab === "tickets" ? "primary" : "ghost"}
                            className="gap-2 whitespace-nowrap"
                        >
                            <Ticket className="w-5 h-5" />
                            Ticket Types
                        </Button>
                        <Button
                            onClick={() => setActiveTab("sales")}
                            variant={activeTab === "sales" ? "primary" : "ghost"}
                            className="gap-2 whitespace-nowrap"
                        >
                            <BarChart3 className="w-5 h-5" />
                            Sales Analytics
                        </Button>
                        <Button
                            onClick={() => setActiveTab("attendees")}
                            variant={activeTab === "attendees" ? "primary" : "ghost"}
                            className="gap-2 whitespace-nowrap"
                        >
                            <Users className="w-5 h-5" />
                            Attendees
                        </Button>
                        <Button
                            onClick={() => setActiveTab("promocodes")}
                            variant={activeTab === "promocodes" ? "primary" : "ghost"}
                            className="gap-2 whitespace-nowrap"
                        >
                            <Tag className="w-5 h-5" />
                            Promo Codes
                        </Button>
                        {isSeatedEvent && (
                            <Button
                                onClick={() => setActiveTab("blocked-seats")}
                                variant={activeTab === "blocked-seats" ? "primary" : "ghost"}
                                className="gap-2 whitespace-nowrap"
                            >
                                <Lock className="w-5 h-5" />
                                Blocked Seats
                            </Button>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {loadingEvent ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        <>
                            {activeTab === "tickets" && <TicketTypeManager eventId={eventId} />}
                            {activeTab === "sales" && <SalesDashboard eventId={eventId} />}
                            {activeTab === "attendees" && <AttendeeList eventId={eventId} />}
                            {activeTab === "promocodes" && <PromoCodeManager eventId={eventId} />}
                            {activeTab === "blocked-seats" && isSeatedEvent && (
                                <SeatBlockingManager eventId={eventId} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
