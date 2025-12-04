/**
 * API Route: Get Event Ticketing Information
 * GET /api/ticketing/events/[eventId]
 * Returns event details with available ticket types, pricing, and availability
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getTicketTypesByEvent } from '@/lib/ticketing-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { eventId } = await params;

        // Validate eventId is a valid ObjectId
        if (!isValidObjectId(eventId)) {
            return NextResponse.json(
                { error: 'Invalid event ID format' },
                { status: 400 }
            );
        }

        // Get ticket types for this event
        const ticketTypes = await getTicketTypesByEvent(eventId);

        // Calculate availability for each ticket type
        const ticketTypesWithAvailability = ticketTypes.map(tt => ({
            ...tt,
            available: tt.capacity - tt.sold - tt.reserved,
            soldOut: (tt.capacity - tt.sold - tt.reserved) <= 0,
        }));

        // Filter to only visible ticket types for public
        const visibleTicketTypes = ticketTypesWithAvailability.filter(tt => tt.visible);

        // Calculate event-level stats
        const totalCapacity = ticketTypes.reduce((sum, tt) => sum + tt.capacity, 0);
        const totalSold = ticketTypes.reduce((sum, tt) => sum + tt.sold, 0);
        const totalAvailable = ticketTypes.reduce((sum, tt) => sum + (tt.capacity - tt.sold - tt.reserved), 0);

        return NextResponse.json({
            success: true,
            eventId,
            ticketTypes: visibleTicketTypes,
            stats: {
                totalCapacity,
                totalSold,
                totalAvailable,
                soldOut: totalAvailable <= 0,
            },
        });
    } catch (error) {
        console.error('Error fetching event ticketing:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event ticketing information', details: error.message },
            { status: 500 }
        );
    }
}
