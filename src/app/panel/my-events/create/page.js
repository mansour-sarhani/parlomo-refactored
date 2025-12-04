"use client";

import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { EventForm } from "@/components/public-events/EventForm";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) {
        return null; // Or loading state / redirect
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
                        Create New Event
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Fill in the details below to set up your event. You can save as draft and publish later.
                    </p>
                </div>
            </div>

            <EventForm mode="create" organizerId={user.id} />
        </ContentWrapper>
    );
}
