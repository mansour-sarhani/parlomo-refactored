"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { EventForm } from "@/components/public-events/EventForm";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch } from "@/lib/hooks";
import { fetchEventById } from "@/features/public-events/publicEventsSlice";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/common/Button";
import { toast } from "sonner";
import { use } from "react";

export default function EditEventPage({ params }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const loadEvent = async () => {
            try {
                const result = await dispatch(fetchEventById(id)).unwrap();
                setEvent(result.event);
            } catch (err) {
                setError(err.error || "Failed to load event");
                toast.error("Failed to load event details");
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [id, dispatch]);

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

    // Check ownership
    if (user && event.organizerId !== user.id) {
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
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    icon={<ChevronLeft className="w-4 h-4" />}
                >
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                        Edit Event: {event.title}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Update your event details. Changes to published events will be visible immediately.
                    </p>
                </div>
            </div>

            <EventForm
                mode="edit"
                initialData={event}
                organizerId={user.id}
            />
        </ContentWrapper>
    );
}
