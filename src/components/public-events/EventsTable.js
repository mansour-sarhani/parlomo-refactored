"use client";

import { Calendar, MapPin, Users, Edit, Eye, Ticket, MoreVertical } from "lucide-react";
import { Button } from "@/components/common/Button";
import { formatEventDateRange, getEventStatusColor } from "@/types/public-events-types";
import { useState } from "react";

export function EventsTable({ events, onView, onEdit, onManageTicketing }) {
    const [openMenuId, setOpenMenuId] = useState(null);

    const getStatusBadgeStyle = (status) => {
        const color = getEventStatusColor(status);
        const styles = {
            draft: {
                backgroundColor: "var(--color-surface-secondary)",
                color: "var(--color-text-secondary)",
            },
            published: {
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                color: "rgb(34, 197, 94)",
            },
            cancelled: {
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "rgb(239, 68, 68)",
            },
            completed: {
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                color: "rgb(59, 130, 246)",
            },
        };
        return styles[status] || styles.draft;
    };

    const formatCurrency = (amount, currency = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(amount / 100);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr
                        className="border-b"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Event
                        </th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Date & Location
                        </th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Status
                        </th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Type
                        </th>
                        <th
                            className="text-right py-3 px-4 text-sm font-semibold"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event) => (
                        <tr
                            key={event.id}
                            className="border-b hover:bg-opacity-50 transition-colors"
                            style={{
                                borderColor: "var(--color-border)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "var(--color-surface-secondary)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                            }}
                        >
                            {/* Event Info */}
                            <td className="py-4 px-4">
                                <div className="flex items-start gap-3">
                                    {event.coverImage ? (
                                        <img
                                            src={event.coverImage}
                                            alt={event.title}
                                            className="w-16 h-16 rounded object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div
                                            className="w-16 h-16 rounded flex items-center justify-center flex-shrink-0"
                                            style={{
                                                backgroundColor: "var(--color-surface-secondary)",
                                            }}
                                        >
                                            <Calendar
                                                className="w-6 h-6"
                                                style={{ color: "var(--color-text-tertiary)" }}
                                            />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h3
                                            className="font-semibold text-sm mb-1 truncate"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            {event.title}
                                        </h3>
                                        <p
                                            className="text-xs capitalize"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            {typeof event.category === 'object' ? event.category?.name : event.category}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            {/* Date & Location */}
                            <td className="py-4 px-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-xs">
                                        <Calendar
                                            className="w-3 h-3 flex-shrink-0"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        />
                                        <span style={{ color: "var(--color-text-secondary)" }}>
                                            {formatEventDateRange(event)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs">
                                        <MapPin
                                            className="w-3 h-3 flex-shrink-0"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        />
                                        <span
                                            className="truncate"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            {event.location?.city}, {event.location?.state}
                                        </span>
                                    </div>
                                </div>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4">
                                <span
                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize"
                                    style={getStatusBadgeStyle(event.status)}
                                >
                                    {event.status}
                                </span>
                            </td>

                            {/* Type */}
                            <td className="py-4 px-4">
                                <div className="space-y-1">
                                    <p
                                        className="text-xs capitalize"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        {event.eventType.replace("_", " ")}
                                    </p>
                                    {event.globalCapacity && (
                                        <div className="flex items-center gap-1 text-xs">
                                            <Users
                                                className="w-3 h-3"
                                                style={{ color: "var(--color-text-tertiary)" }}
                                            />
                                            <span style={{ color: "var(--color-text-tertiary)" }}>
                                                {event.globalCapacity} capacity
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4">
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onView(event)}
                                        icon={<Eye className="w-4 h-4" />}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(event)}
                                        icon={<Edit className="w-4 h-4" />}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onManageTicketing(event)}
                                        icon={<Ticket className="w-4 h-4" />}
                                    >
                                        Ticketing
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
