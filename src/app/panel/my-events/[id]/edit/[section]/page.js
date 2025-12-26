"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch } from "@/lib/hooks";
import { usePermissions } from "@/hooks/usePermissions";
import { isAdminUser } from "@/utils/permissions";
import { fetchEventById, updateEvent, normalizeEventData } from "@/features/public-events/publicEventsSlice";
import { EventSectionEdit } from "@/components/public-events/EventSectionEdit";

const SECTIONS = {
    details: { title: "Event Details", step: 1 },
    datetime: { title: "Date & Time", step: 2 },
    location: { title: "Location", step: 3 },
    organizer: { title: "Organizer Info", step: 4 },
    ticketing: { title: "Ticketing Settings", step: 5 },
    media: { title: "Media", step: 6 },
    policies: { title: "Policies & Settings", step: 7 },
    "admin-settings": { title: "Admin Settings", step: 8, adminOnly: true },
};

export default function EditSectionPage({ params }) {
    const { id, section } = use(params);
    const { user } = useAuth();
    const { role } = usePermissions();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const sectionConfig = SECTIONS[section];
    const userIsAdmin = isAdminUser(role);

    useEffect(() => {
        if (!id) return;

        const loadEvent = async () => {
            try {
                const result = await dispatch(fetchEventById(id)).unwrap();
                const eventData = result.data || result.event;
                setEvent(normalizeEventData(eventData));
            } catch (err) {
                setError(err.error || "Failed to load event");
                toast.error("Failed to load event details");
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [id, dispatch]);

    const handleSave = async (updatedData) => {
        setSaving(true);
        try {
            await dispatch(updateEvent({ id, updates: updatedData })).unwrap();
            toast.success(`${sectionConfig?.title || "Section"} updated successfully`);
            router.push(`/panel/my-events/${id}`);
        } catch (err) {
            toast.error(err.error || err.message || "Failed to update event");
        } finally {
            setSaving(false);
        }
    };

    if (!sectionConfig) {
        return (
            <ContentWrapper>
                <div className="text-center py-12">
                    <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-error)" }}>
                        Invalid Section
                    </h2>
                    <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>
                        The requested section does not exist.
                    </p>
                    <Button onClick={() => router.push(`/panel/my-events/${id}`)}>
                        Back to Event
                    </Button>
                </div>
            </ContentWrapper>
        );
    }

    if (loading) {
        return (
            <ContentWrapper>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </ContentWrapper>
        );
    }

    if (error || !event) {
        return (
            <ContentWrapper>
                <div className="text-center py-12">
                    <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-error)" }}>
                        Error Loading Event
                    </h2>
                    <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>
                        {error || "Event not found"}
                    </p>
                    <Button onClick={() => router.push("/panel/my-events")}>
                        Back to My Events
                    </Button>
                </div>
            </ContentWrapper>
        );
    }

    // Check access permissions
    // Admin-only sections require admin role
    if (sectionConfig?.adminOnly && !userIsAdmin) {
        return (
            <ContentWrapper>
                <div className="text-center py-12">
                    <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-error)" }}>
                        Access Denied
                    </h2>
                    <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>
                        This section is only accessible to administrators.
                    </p>
                    <Button onClick={() => router.push(`/panel/my-events/${id}`)}>
                        Back to Event
                    </Button>
                </div>
            </ContentWrapper>
        );
    }

    // Check ownership for non-admin sections (admins can access all events)
    if (!userIsAdmin && user && event.organizerId !== user.id) {
        return (
            <ContentWrapper>
                <div className="text-center py-12">
                    <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-error)" }}>
                        Access Denied
                    </h2>
                    <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>
                        You do not have permission to edit this event.
                    </p>
                    <Button onClick={() => router.push("/panel/my-events")}>
                        Back to My Events
                    </Button>
                </div>
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/panel/my-events/${id}`)}
                    icon={<ChevronLeft className="w-4 h-4" />}
                >
                    Back to Event
                </Button>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                        Edit {sectionConfig.title}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        {event.title}
                    </p>
                </div>
            </div>

            {/* Section Edit Form */}
            <Card>
                <EventSectionEdit
                    section={section}
                    event={event}
                    onSave={handleSave}
                    saving={saving}
                    onCancel={() => router.push(`/panel/my-events/${id}`)}
                />
            </Card>
        </ContentWrapper>
    );
}
