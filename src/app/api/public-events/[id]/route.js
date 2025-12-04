/**
 * API Route: Single Public Event
 * GET /api/public-events/[id] - Get event by ID
 * PATCH /api/public-events/[id] - Update event
 * DELETE /api/public-events/[id] - Delete event
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import {
    getPublicEvent,
    updatePublicEvent,
    deletePublicEvent,
} from '@/lib/public-events-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

/**
 * GET /api/public-events/[id]
 * Get single event by ID
 */
export async function GET(request, { params }) {
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

        const event = await getPublicEvent(id);

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            event,
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/public-events/[id]
 * Update event
 */
export async function PATCH(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await request.json();

        // Validate id format
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { error: 'Invalid event ID format' },
                { status: 400 }
            );
        }

        // Check if event exists
        const existingEvent = await getPublicEvent(id);
        if (!existingEvent) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        // Update event
        const updatedEvent = await updatePublicEvent(id, body);

        if (!updatedEvent) {
            return NextResponse.json(
                { error: 'Failed to update event' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            event: updatedEvent,
            message: 'Event updated successfully',
        });
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json(
            { error: 'Failed to update event', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/public-events/[id]
 * Delete event (soft delete - sets status to cancelled)
 */
export async function DELETE(request, { params }) {
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

        const success = await deletePublicEvent(id);

        if (!success) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Event deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json(
            { error: 'Failed to delete event', details: error.message },
            { status: 500 }
        );
    }
}
