/**
 * API Route: Publish Event
 * POST /api/public-events/[id]/publish - Publish a draft event
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getPublicEvent, publishEvent } from '@/lib/public-events-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

/**
 * POST /api/public-events/[id]/publish
 * Publish an event (change status from draft to published)
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

        // Check if event is already published
        if (event.status === 'published') {
            return NextResponse.json(
                { error: 'Event is already published' },
                { status: 400 }
            );
        }

        // Publish event
        const publishedEvent = await publishEvent(id);

        if (!publishedEvent) {
            return NextResponse.json(
                { error: 'Failed to publish event' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            event: publishedEvent,
            message: 'Event published successfully',
        });
    } catch (error) {
        console.error('Error publishing event:', error);
        return NextResponse.json(
            { error: 'Failed to publish event', details: error.message },
            { status: 500 }
        );
    }
}
