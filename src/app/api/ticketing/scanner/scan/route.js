/**
 * API Route: Scan Ticket
 * POST /api/ticketing/scanner/scan
 * Validates ticket QR code and marks as used
 * Only allows organizers to scan tickets for their own events
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getTicketByCode, updateTicket, getTicketType, getOrder } from '@/lib/ticketing-db';
import { getPublicEvent } from '@/lib/public-events-db';

export async function POST(request) {
    try {
        await connectDB();
        
        const body = await request.json();

        if (!body.ticketCode && !body.qrPayload) {
            return NextResponse.json(
                { error: 'Ticket code or QR payload is required' },
                { status: 400 }
            );
        }

        let ticketCode = body.ticketCode;

        // If QR payload provided, extract ticket code
        if (body.qrPayload && !ticketCode) {
            try {
                const payload = JSON.parse(body.qrPayload);
                ticketCode = payload.code;
            } catch (e) {
                return NextResponse.json({
                    valid: false,
                    error: 'Invalid QR code format',
                });
            }
        }

        // Get ticket by code
        const ticket = await getTicketByCode(ticketCode);

        if (!ticket) {
            return NextResponse.json({
                valid: false,
                error: 'Ticket not found',
                message: 'This ticket does not exist in our system',
            });
        }

        // Get additional ticket information early for event verification
        const ticketType = await getTicketType(ticket.ticketTypeId);
        const order = await getOrder(ticket.orderId);
        const eventId = ticket.eventId || order?.eventId;
        const event = eventId ? await getPublicEvent(eventId) : null;

        // Verify organizer owns this event (if organizerId provided)
        const organizerId = body.organizerId;
        if (organizerId && event) {
            if (event.organizerId !== organizerId) {
                return NextResponse.json({
                    valid: false,
                    error: 'Unauthorized',
                    message: 'You can only scan tickets for your own events',
                });
            }
        }

        // Helper to build event info for responses
        const eventInfo = event ? {
            id: event.id,
            title: event.title,
            slug: event.slug,
        } : null;

        // Check ticket status
        if (ticket.status === 'cancelled') {
            return NextResponse.json({
                valid: false,
                error: 'Ticket cancelled',
                message: 'This ticket has been cancelled',
                ticket: {
                    code: ticket.code,
                    status: ticket.status,
                    event: eventInfo,
                },
            });
        }

        if (ticket.status === 'used') {
            return NextResponse.json({
                valid: false,
                error: 'Ticket already used',
                message: 'This ticket has already been scanned',
                ticket: {
                    code: ticket.code,
                    status: ticket.status,
                    usedAt: ticket.usedAt,
                    event: eventInfo,
                },
            });
        }

        if (ticket.status === 'transferred') {
            return NextResponse.json({
                valid: false,
                error: 'Ticket transferred',
                message: 'This ticket has been transferred to another person',
                ticket: {
                    code: ticket.code,
                    status: ticket.status,
                    event: eventInfo,
                },
            });
        }

        // Mark ticket as used
        const userId = body.organizerId || body.scannedBy || null;
        const updatedTicket = await updateTicket(ticket.id, {
            status: 'used',
            usedBy: userId,
        });

        // Return success with ticket details
        return NextResponse.json({
            valid: true,
            message: 'Ticket validated successfully',
            ticket: {
                id: updatedTicket.id,
                code: updatedTicket.code,
                status: updatedTicket.status,
                attendeeName: updatedTicket.attendeeName,
                attendeeEmail: updatedTicket.attendeeEmail,
                usedAt: updatedTicket.usedAt,
                ticketType: ticketType ? {
                    name: ticketType.name,
                    description: ticketType.description,
                } : null,
                event: eventInfo,
                order: order ? {
                    orderNumber: order.orderNumber,
                } : null,
            },
        });
    } catch (error) {
        console.error('Error scanning ticket:', error);
        return NextResponse.json(
            { error: 'Failed to scan ticket', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint to check ticket status without marking as used
 * Verifies organizer owns the event if organizerId is provided
 */
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const ticketCode = searchParams.get('code');
        const organizerId = searchParams.get('organizerId');

        if (!ticketCode) {
            return NextResponse.json(
                { error: 'Ticket code is required' },
                { status: 400 }
            );
        }

        const ticket = await getTicketByCode(ticketCode);

        if (!ticket) {
            return NextResponse.json({
                found: false,
                message: 'Ticket not found',
            });
        }

        const ticketType = await getTicketType(ticket.ticketTypeId);
        const order = await getOrder(ticket.orderId);
        const eventId = ticket.eventId || order?.eventId;
        const event = eventId ? await getPublicEvent(eventId) : null;

        // Verify organizer owns this event (if organizerId provided)
        if (organizerId && event) {
            if (event.organizerId !== organizerId) {
                return NextResponse.json({
                    found: false,
                    message: 'This ticket is not for one of your events',
                });
            }
        }

        return NextResponse.json({
            found: true,
            ticket: {
                code: ticket.code,
                status: ticket.status,
                attendeeName: ticket.attendeeName,
                usedAt: ticket.usedAt,
                ticketType: ticketType?.name,
                orderNumber: order?.orderNumber,
                event: event?.title,
            },
        });
    } catch (error) {
        console.error('Error checking ticket:', error);
        return NextResponse.json(
            { error: 'Failed to check ticket', details: error.message },
            { status: 500 }
        );
    }
}
