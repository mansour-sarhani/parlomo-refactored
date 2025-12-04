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
import { Ticket, BarChart3, Users, Tag, ChevronLeft } from "lucide-react";

export default function EventTicketingManagementPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id;
    const [activeTab, setActiveTab] = useState("tickets");

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
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === "tickets" && <TicketTypeManager eventId={eventId} />}
                    {activeTab === "sales" && <SalesDashboard eventId={eventId} />}
                    {activeTab === "attendees" && <AttendeeList eventId={eventId} />}
                    {activeTab === "promocodes" && <PromoCodeManager eventId={eventId} />}
                </div>
            </div>
        </div>
    );
}
