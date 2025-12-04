/**
 * API Route: Event Statistics
 * GET /api/public-events/[id]/stats - Get event statistics
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getPublicEvent, getEventStats } from '@/lib/public-events-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

/**
 * GET /api/public-events/[id]/stats
 * Get event statistics including ticket sales and revenue
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

        // Check if event exists
        const event = await getPublicEvent(id);
        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        // Get statistics
        const stats = await getEventStats(id);

        if (!stats) {
            return NextResponse.json(
                { error: 'Failed to fetch event statistics' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error('Error fetching event stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event statistics', details: error.message },
            { status: 500 }
        );
    }
}
