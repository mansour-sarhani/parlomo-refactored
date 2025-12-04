/**
 * API Route: Cancel Event
 * POST /api/public-events/[id]/cancel - Cancel an event
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getPublicEvent, cancelEvent } from '@/lib/public-events-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

/**
 * POST /api/public-events/[id]/cancel
 * Cancel an event
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

        // Check if event is already cancelled or completed
        if (event.status === 'cancelled') {
            return NextResponse.json(
                { error: 'Event is already cancelled' },
                { status: 400 }
            );
        }

        if (event.status === 'completed') {
            return NextResponse.json(
                { error: 'Cannot cancel a completed event' },
                { status: 400 }
            );
        }

        // Cancel event
        const cancelledEvent = await cancelEvent(id);

        if (!cancelledEvent) {
            return NextResponse.json(
                { error: 'Failed to cancel event' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            event: cancelledEvent,
            message: 'Event cancelled successfully',
        });
    } catch (error) {
        console.error('Error cancelling event:', error);
        return NextResponse.json(
            { error: 'Failed to cancel event', details: error.message },
            { status: 500 }
        );
    }
}
