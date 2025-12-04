/**
 * API Route: Unpublish Event
 * POST /api/public-events/[id]/unpublish - Unpublish an event
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getPublicEvent, unpublishEvent } from '@/lib/public-events-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

/**
 * POST /api/public-events/[id]/unpublish
 * Unpublish an event (change status from published to draft)
 */
export async function POST(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        // Validate id format
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { error: 'Invalid event ID format' },
                { status: 400 }
            );
        }

        // Check if event exists
        const event = await getPublicEvent(id);
        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        // Check if event is published
        if (event.status !== 'published') {
            return NextResponse.json(
                { error: 'Event is not published' },
                { status: 400 }
            );
        }

        // Unpublish event
        const unpublishedEvent = await unpublishEvent(id);

        if (!unpublishedEvent) {
            return NextResponse.json(
                { error: 'Failed to unpublish event' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            event: unpublishedEvent,
            message: 'Event unpublished successfully',
        });
    } catch (error) {
        console.error('Error unpublishing event:', error);
        return NextResponse.json(
            { error: 'Failed to unpublish event', details: error.message },
            { status: 500 }
        );
    }
}
