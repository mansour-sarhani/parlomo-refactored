/**
 * API Route: List All Tickets (Test/Debug)
 * GET /api/test-ticketing/tickets
 * Returns all tickets in the system for testing/debugging
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAllTickets, getTicketType, getOrder } from '@/lib/ticketing-db';

export async function GET(request) {
    try {
        await connectDB();
        
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { error: 'This endpoint is only available in development' },
                { status: 403 }
            );
        }

        const tickets = await getAllTickets();
        
        // Enrich tickets with related data
        const enrichedTickets = await Promise.all(Object.values(tickets).map(async (ticket) => {
            const ticketType = await getTicketType(ticket.ticketTypeId);
            const order = await getOrder(ticket.orderId);
            
            return {
                id: ticket.id,
                code: ticket.code,
                status: ticket.status,
                attendeeName: ticket.attendeeName,
                attendeeEmail: ticket.attendeeEmail,
                usedAt: ticket.usedAt,
                ticketType: ticketType ? {
                    id: ticketType.id,
                    name: ticketType.name,
                    eventId: ticketType.eventId,
                } : null,
                order: order ? {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    eventId: order.eventId,
                } : null,
                createdAt: ticket.createdAt,
            };
        }));

        // Sort by createdAt (newest first) since IDs are strings in MongoDB
        enrichedTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json({
            success: true,
            count: enrichedTickets.length,
            tickets: enrichedTickets,
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tickets', details: error.message },
            { status: 500 }
        );
    }
}

