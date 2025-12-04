/**
 * API Route: Get Event Attendees
 * GET /api/ticketing/events/[eventId]/attendees
 *
 * Returns a flat list of attendees for a given event, derived from
 * orders and tickets in the mock ticketing database.
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import {
    getOrdersByEvent,
    getTicketsByOrder,
    getTicketType,
} from '@/lib/ticketing-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { eventId } = await params;

        // Validate eventId format
        if (!isValidObjectId(eventId)) {
            return NextResponse.json(
                { error: 'Invalid event ID format' },
                { status: 400 }
            );
        }

        // Get all orders for this event
        const orders = await getOrdersByEvent(eventId);

        // Build attendee list from tickets on those orders
        const attendees = [];

        for (const order of orders) {
            const tickets = await getTicketsByOrder(order.id);

            for (const ticket of tickets) {
                const ticketType = await getTicketType(ticket.ticketTypeId);

                attendees.push({
                    id: ticket.id,
                    name: ticket.attendeeName,
                    email: ticket.attendeeEmail,
                    ticketType: ticketType ? ticketType.name : 'General Admission',
                    ticketCode: ticket.code,
                    orderNumber: order.orderNumber,
                    checkedIn: ticket.status === 'used',
                    checkedInAt: ticket.usedAt,
                });
            }
        }

        return NextResponse.json({
            success: true,
            eventId,
            attendees,
        });
    } catch (error) {
        console.error('Error fetching event attendees:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event attendees', details: error.message },
            { status: 500 }
        );
    }
}


