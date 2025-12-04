/**
 * API Route: Get Order Tickets
 * GET /api/ticketing/orders/[orderId]/tickets
 * Returns all tickets for an order with QR codes
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getOrder, getTicketsByOrder, getTicketType } from '@/lib/ticketing-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

export async function GET(request, { params }) {
    try {
        await connectDB();
        
        const { orderId } = await params;

        // Validate orderId format
        if (!isValidObjectId(orderId)) {
            return NextResponse.json(
                { error: 'Invalid order ID format' },
                { status: 400 }
            );
        }

        // Verify order exists
        const order = await getOrder(orderId);

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Get tickets
        const tickets = await getTicketsByOrder(orderId);

        // Enrich tickets with ticket type information
        const enrichedTickets = await Promise.all(tickets.map(async (ticket) => {
            const ticketType = await getTicketType(ticket.ticketTypeId);
            
            return {
                ...ticket,
                ticketType: ticketType ? {
                    id: ticketType.id,
                    name: ticketType.name,
                    description: ticketType.description,
                } : null,
                eventId: order.eventId,
            };
        }));

        return NextResponse.json({
            success: true,
            orderId,
            orderNumber: order.orderNumber,
            tickets: enrichedTickets,
            count: enrichedTickets.length,
        });
    } catch (error) {
        console.error('Error fetching order tickets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order tickets', details: error.message },
            { status: 500 }
        );
    }
}
