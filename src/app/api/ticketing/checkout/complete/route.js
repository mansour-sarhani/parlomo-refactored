/**
 * API Route: Complete Checkout
 * POST /api/ticketing/checkout/complete
 * Finalizes order after payment, generates tickets with QR codes
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import {
    createOrder,
    createOrderItem,
    createTicket,
    markTicketsSold,
    releaseTickets,
    incrementPromoUse,
    getTicketType,
} from '@/lib/ticketing-db';

/**
 * Generate unique ticket code
 */
function generateTicketCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TKT-';
    for (let i = 0; i < 9; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Generate QR payload (simplified - in production use signed JWT)
 */
function generateQRPayload(ticketId, code, eventId, ticketTypeId) {
    // In production, this should be a signed JWT with expiry
    return JSON.stringify({
        ticketId,
        code,
        eventId,
        ticketTypeId,
        timestamp: Date.now(),
    });
}

export async function POST(request) {
    let rollbackCartItems = null; // Declare outside try for rollback access

    try {
        await connectDB();

        const body = await request.json();
        rollbackCartItems = body.cartItems; // Store for rollback

        // Validate request
        const requiredFields = ['sessionId', 'eventId', 'userId', 'cartItems', 'buyerInfo', 'total'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: 'Missing required fields', fields: missingFields },
                { status: 400 }
            );
        }

        const {
            sessionId,
            eventId,
            userId,
            cartItems,
            buyerInfo,
            subtotal,
            discount = 0,
            fees = 0,
            total,
            promoCode = null,
            promoCodeId = null,
            paymentIntentId = null,
            paymentMethod = 'card',
        } = body;

        // Create order
        const order = await createOrder({
            userId,
            eventId,
            status: 'paid', // Mark as paid immediately (in production, wait for webhook)
            subtotal,
            discount,
            fees,
            total,
            currency: 'USD',
            promoCodeId,
            promoCode,
            paymentIntentId,
            paymentMethod,
            // Map buyerInfo to Order model fields
            customerName: `${buyerInfo.firstName} ${buyerInfo.lastName}`,
            customerEmail: buyerInfo.email,
            customerPhone: buyerInfo.phone || null,
            
            metadata: { sessionId, buyerInfo },
        });

        // Create order items and tickets
        const tickets = [];

        for (const item of cartItems) {
            const { ticketTypeId, quantity, unitPrice, subtotal: itemSubtotal } = item;

            const ticketType = await getTicketType(ticketTypeId);

            if (!ticketType) {
                // Rollback: release reserved tickets
                for (const ci of cartItems) {
                    await releaseTickets(ci.ticketTypeId, ci.quantity);
                }
                
                return NextResponse.json(
                    { error: `Ticket type ${ticketTypeId} not found` },
                    { status: 404 }
                );
            }

            // Create order item
            const orderItem = await createOrderItem({
                orderId: order.id,
                ticketTypeId,
                seatId: null, // Phase 2
                quantity,
                unitPrice,
                discount: 0, // Discount is applied at order level
                subtotal: itemSubtotal,
                ticketTypeName: ticketType.name,
                metadata: {},
            });

            // Generate individual tickets
            for (let i = 0; i < quantity; i++) {
                const ticketCode = generateTicketCode();
                
                const ticket = await createTicket({
                    orderId: order.id,
                    eventId,
                    orderItemId: orderItem.id,
                    ticketTypeId,
                    seatId: null,
                    code: ticketCode,
                    qrPayload: '', // Will update after getting ticket ID
                    attendeeName: `${buyerInfo.firstName} ${buyerInfo.lastName}`,
                    attendeeEmail: buyerInfo.email,
                    transferHistory: null,
                    metadata: {},
                });

                // Update QR payload with actual ticket ID
                const qrPayload = generateQRPayload(ticket.id, ticketCode, eventId, ticketTypeId);
                ticket.qrPayload = qrPayload;

                tickets.push(ticket);
            }

            // Mark tickets as sold (moves from reserved to sold)
            await markTicketsSold(ticketTypeId, quantity);
        }

        // Increment promo code usage
        if (promoCodeId) {
            await incrementPromoUse(promoCodeId);
        }

        // TODO: Send confirmation email (mock for now)
        console.log(`📧 [MOCK EMAIL] Order confirmation sent to ${buyerInfo.email}`);
        console.log(`Order #${order.orderNumber} - ${tickets.length} tickets`);

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                total: order.total,
                currency: order.currency,
            },
            ticketCount: tickets.length,
            message: 'Order completed successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Error completing checkout:', error);

        // Rollback: release reserved tickets on failure
        if (rollbackCartItems && Array.isArray(rollbackCartItems)) {
            console.log('Rolling back ticket reservations...');
            for (const item of rollbackCartItems) {
                try {
                    await releaseTickets(item.ticketTypeId, item.quantity);
                    console.log(`Released ${item.quantity} tickets for ${item.ticketTypeId}`);
                } catch (releaseError) {
                    console.error(`Failed to release tickets for ${item.ticketTypeId}:`, releaseError);
                }
            }
        }

        return NextResponse.json(
            { error: 'Failed to complete checkout', details: error.message },
            { status: 500 }
        );
    }
}
