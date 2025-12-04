/**
 * API Route: Manage Ticket Types
 * POST /api/ticketing/events/[eventId]/ticket-types - Create new ticket type
 * PATCH /api/ticketing/events/[eventId]/ticket-types - Update ticket type
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { createTicketType, updateTicketType, getTicketType } from '@/lib/ticketing-db';
import { isValidObjectId, extractIdString } from '@/lib/utils/objectid-helpers';

/**
 * Create new ticket type
 */
export async function POST(request, { params }) {
    try {
        await connectDB();
        
        const { eventId } = await params;
        const body = await request.json();

        // Validate required fields
        const requiredFields = ['name', 'price', 'capacity'];
        const missingFields = requiredFields.filter(field => !body[field] && body[field] !== 0);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: 'Missing required fields', fields: missingFields },
                { status: 400 }
            );
        }

        // Create ticket type
        const ticketTypeData = {
            eventId,
            name: body.name,
            description: body.description || '',
            sku: body.sku || `${eventId}-${body.name.toUpperCase().replace(/\s+/g, '-')}`,
            price: parseInt(body.price, 10),
            currency: body.currency || 'USD',
            capacity: parseInt(body.capacity, 10),
            visible: body.visible !== undefined ? body.visible : true,
            minPerOrder: body.minPerOrder || 1,
            maxPerOrder: body.maxPerOrder || 10,
            refundable: body.refundable !== undefined ? body.refundable : true,
            transferAllowed: body.transferAllowed !== undefined ? body.transferAllowed : true,
            saleStartsAt: body.saleStartsAt || new Date().toISOString(),
            saleEndsAt: body.saleEndsAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            settings: body.settings || {},
        };

        const newTicketType = await createTicketType(ticketTypeData);

        return NextResponse.json({
            success: true,
            ticketType: newTicketType,
            message: 'Ticket type created successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating ticket type:', error);
        return NextResponse.json(
            { error: 'Failed to create ticket type', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * Update existing ticket type
 */
export async function PATCH(request, { params }) {
    try {
        await connectDB();
        
        const { eventId } = await params;
        const body = await request.json();

        if (!body.ticketTypeId) {
            return NextResponse.json(
                { error: 'Ticket type ID is required' },
                { status: 400 }
            );
        }

        const ticketTypeId = body.ticketTypeId;
        const existingTicketType = await getTicketType(ticketTypeId);

        if (!existingTicketType) {
            return NextResponse.json(
                { error: 'Ticket type not found' },
                { status: 404 }
            );
        }

        // Verify ticket type belongs to this event
        const ticketEventId = extractIdString(existingTicketType.eventId);
        if (ticketEventId !== eventId) {
            return NextResponse.json(
                { error: 'Ticket type does not belong to this event' },
                { status: 403 }
            );
        }

        // Prepare updates (only allow certain fields to be updated)
        const updates = {};
        const allowedUpdates = [
            'name', 'description', 'price', 'capacity', 'visible',
            'minPerOrder', 'maxPerOrder', 'refundable', 'transferAllowed',
            'saleStartsAt', 'saleEndsAt', 'settings'
        ];

        allowedUpdates.forEach(field => {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        });

        // Don't allow reducing capacity below sold + reserved
        if (updates.capacity !== undefined) {
            const minCapacity = existingTicketType.sold + existingTicketType.reserved;
            if (updates.capacity < minCapacity) {
                return NextResponse.json(
                    { 
                        error: 'Cannot reduce capacity below sold and reserved tickets',
                        minCapacity,
                        sold: existingTicketType.sold,
                        reserved: existingTicketType.reserved,
                    },
                    { status: 400 }
                );
            }
        }

        const updatedTicketType = await updateTicketType(ticketTypeId, updates);

        return NextResponse.json({
            success: true,
            ticketType: updatedTicketType,
            message: 'Ticket type updated successfully',
        });
    } catch (error) {
        console.error('Error updating ticket type:', error);
        return NextResponse.json(
            { error: 'Failed to update ticket type', details: error.message },
            { status: 500 }
        );
    }
}
