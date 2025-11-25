"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { EventDetailView } from "@/features/events";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchEventById, clearCurrentEvent } from "@/features/events/eventsSlice";

export default function EventDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { currentEvent, fetchingSingle } = useAppSelector((state) => state.events);

    useEffect(() => {
        if (id) {
            dispatch(fetchEventById(id));
        }

        return () => {
            dispatch(clearCurrentEvent());
        };
    }, [dispatch, id]);

    return (
        <ContentWrapper>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                        Event Details
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Review full information for event #{id}
                    </p>
                </div>
                <Button
                    variant="secondary"
                    icon={<ArrowLeft size={16} />}
                    onClick={() => router.push("/panel/admin/events")}
                >
                    Back to events
                </Button>
            </div>

            {fetchingSingle ? (
                <div className="space-y-6">
                    <Skeleton variant="rectangle" height="h-32" />
                    <Skeleton variant="rectangle" height="h-32" />
                    <Skeleton variant="rectangle" height="h-32" />
                </div>
            ) : currentEvent ? (
                <EventDetailView event={currentEvent} />
            ) : (
                <div className="py-16 text-center" style={{ color: "var(--color-error)" }}>
                    Unable to load event information.
                </div>
            )}
        </ContentWrapper>
    );
}

