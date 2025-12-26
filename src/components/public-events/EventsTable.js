"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Calendar,
    MapPin,
    Users,
    Edit,
    Eye,
    Ticket,
    ChevronDown,
    FileText,
    Clock,
    MapPinned,
    User,
    CreditCard,
    Image,
    Shield,
    DollarSign,
    Settings,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { isAdminUser } from "@/utils/permissions";
import { Button } from "@/components/common/Button";
import { formatEventDateRange, getEventStatusColor } from "@/types/public-events-types";
import { useState } from "react";

const EDIT_SECTIONS = [
    { id: "details", label: "Event Details", icon: FileText },
    { id: "datetime", label: "Date & Time", icon: Clock },
    { id: "location", label: "Location", icon: MapPinned },
    { id: "organizer", label: "Organizer Info", icon: User },
    { id: "ticketing", label: "Ticketing Settings", icon: CreditCard },
    { id: "media", label: "Media", icon: Image },
    { id: "policies", label: "Policies & Settings", icon: Shield },
];

const ADMIN_SECTIONS = [
    { id: "admin-settings", label: "Admin Settings", icon: Settings },
];

export function EventsTable({ events, onView, onManageTicketing, onManageFinancials }) {
    const router = useRouter();
    const { role } = usePermissions();
    const [openEditMenuId, setOpenEditMenuId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const menuRef = useRef(null);
    const buttonRefs = useRef({});

    // Combine edit sections with admin sections if user is admin
    const allSections = isAdminUser(role)
        ? [...EDIT_SECTIONS, ...ADMIN_SECTIONS]
        : EDIT_SECTIONS;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                // Check if clicking on a button
                const isButtonClick = Object.values(buttonRefs.current).some(
                    (ref) => ref && ref.contains(event.target)
                );
                if (!isButtonClick) {
                    setOpenEditMenuId(null);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close menu on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (openEditMenuId) {
                setOpenEditMenuId(null);
            }
        };

        window.addEventListener("scroll", handleScroll, true);
        return () => window.removeEventListener("scroll", handleScroll, true);
    }, [openEditMenuId]);

    const handleToggleMenu = (eventId) => {
        if (openEditMenuId === eventId) {
            setOpenEditMenuId(null);
        } else {
            const button = buttonRefs.current[eventId];
            if (button) {
                const rect = button.getBoundingClientRect();
                setMenuPosition({
                    top: rect.bottom + 4,
                    left: rect.right - 224, // 224px = w-56 (14rem)
                });
            }
            setOpenEditMenuId(eventId);
        }
    };

    const handleEditSection = (eventId, sectionId) => {
        setOpenEditMenuId(null);
        router.push(`/panel/my-events/${eventId}/edit/${sectionId}`);
    };

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
                                        {(event.eventType || event.event_type || 'N/A').replace("_", " ")}
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

                                    {/* Edit Dropdown */}
                                    <div className="relative">
                                        <div ref={(el) => (buttonRefs.current[event.id] = el)}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleMenu(event.id)}
                                                icon={<Edit className="w-4 h-4" />}
                                            >
                                                Edit
                                                <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${openEditMenuId === event.id ? 'rotate-180' : ''}`} />
                                            </Button>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onManageTicketing(event)}
                                        icon={<Ticket className="w-4 h-4" />}
                                    >
                                        Ticketing
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onManageFinancials(event)}
                                        icon={<DollarSign className="w-4 h-4" />}
                                    >
                                        Financials
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Fixed position dropdown menu - rendered outside table for proper z-index */}
            {openEditMenuId && (
                <div
                    ref={menuRef}
                    className="fixed w-56 rounded-lg shadow-xl border z-[9999]"
                    style={{
                        top: menuPosition.top,
                        left: menuPosition.left,
                        backgroundColor: "var(--color-surface-primary, #ffffff)",
                        borderColor: "var(--color-border)",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <div
                        className="py-1 rounded-lg"
                        style={{ backgroundColor: "var(--color-surface-primary, #ffffff)" }}
                    >
                        {allSections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => handleEditSection(openEditMenuId, section.id)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                                    style={{
                                        color: "var(--color-text-primary, #1f2937)",
                                        backgroundColor: "var(--color-surface-primary, #ffffff)",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "var(--color-surface-secondary, #f3f4f6)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "var(--color-surface-primary, #ffffff)";
                                    }}
                                >
                                    <Icon className="w-4 h-4" style={{ color: "var(--color-text-tertiary, #6b7280)" }} />
                                    {section.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
