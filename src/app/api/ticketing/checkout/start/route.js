/**
 * API Route: Start Checkout Session
 * POST /api/ticketing/checkout/start
 * Validates cart, reserves inventory, applies promos, calculates totals
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import {
    getTicketType,
    reserveTickets,
    getPromoCodeByCode,
    getActiveFees,
} from '@/lib/ticketing-db';
import { isValidObjectId, extractIdString } from '@/lib/utils/objectid-helpers';
import { v4 as uuidv4 } from 'uuid';

/**
 * Calculate fees for an order
 */
function calculateFees(subtotal, fees) {
    let totalFees = 0;
    const feeBreakdown = [];

    fees.forEach(fee => {
        if (fee.payer !== 'buyer') return; // Only calculate buyer fees

        let feeAmount = 0;

        switch (fee.type) {
            case 'percent':
                feeAmount = Math.round(subtotal * (fee.amount / 100));
                break;
            case 'fixed':
            case 'per_order':
                feeAmount = fee.amount;
                break;
            case 'per_ticket':
                // Would need ticket count, skip for now
                break;
        }

        // Apply cap if exists
        if (fee.cap && feeAmount > fee.cap) {
            feeAmount = fee.cap;
        }

        if (feeAmount > 0) {
            totalFees += feeAmount;
            feeBreakdown.push({
                id: fee.id,
                name: fee.name,
                amount: feeAmount,
            });
        }
    });

    return { totalFees, feeBreakdown };
}

/**
 * Validate and apply promo code
 */
async function validatePromoCode(promoCode, cartItems, subtotal) {
    if (!promoCode) {
        return { valid: false, discount: 0, error: null };
    }

    const promo = await getPromoCodeByCode(promoCode);

    if (!promo) {
        return { valid: false, discount: 0, error: 'Invalid promo code' };
    }

    if (!promo.active) {
        return { valid: false, discount: 0, error: 'Promo code is not active' };
    }

    // Check validity period
    const now = new Date();
    const validFrom = new Date(promo.validFrom);
    const validTo = new Date(promo.validTo);

    if (now < validFrom || now > validTo) {
        return { valid: false, discount: 0, error: 'Promo code has expired' };
    }

    // Check max uses
    if (promo.maxUses > 0 && promo.currentUses >= promo.maxUses) {
        return { valid: false, discount: 0, error: 'Promo code has reached maximum uses' };
    }

    // Check minimum order value
    if (promo.minOrderValue > 0 && subtotal < promo.minOrderValue) {
        return { 
            valid: false, 
            discount: 0, 
            error: `Minimum order value of $${(promo.minOrderValue / 100).toFixed(2)} required` 
        };
    }

    // Check if promo applies to ticket types in cart
    if (promo.appliesToTicketTypeIds && promo.appliesToTicketTypeIds.length > 0) {
        const cartTicketTypeIds = cartItems.map(item => item.ticketTypeId);
        const hasApplicableTicket = cartTicketTypeIds.some(id => 
            promo.appliesToTicketTypeIds.includes(id)
        );

        if (!hasApplicableTicket) {
            return { valid: false, discount: 0, error: 'Promo code not applicable to selected tickets' };
        }
    }

    // Calculate discount
    let discount = 0;
    if (promo.type === 'percent') {
        discount = Math.round(subtotal * (promo.amount / 100));
    } else if (promo.type === 'fixed') {
        discount = promo.amount;
    }

    // Don't allow discount to exceed subtotal
    discount = Math.min(discount, subtotal);

    return { 
        valid: true, 
        discount, 
        error: null,
        promoId: promo.id,
    };
}

export async function POST(request) {
    try {
        await connectDB();
        
        const body = await request.json();

        // Validate request
        if (!body.eventId || !body.cartItems || !Array.isArray(body.cartItems)) {
            return NextResponse.json(
                { error: 'Invalid request: eventId and cartItems are required' },
                { status: 400 }
            );
        }

        if (body.cartItems.length === 0) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 }
            );
        }

        const { eventId, cartItems, promoCode } = body;

        // Validate eventId format
        if (!isValidObjectId(eventId)) {
            return NextResponse.json(
                { error: 'Invalid event ID format' },
                { status: 400 }
            );
        }

        // Validate and process cart items
        let subtotal = 0;
        const processedItems = [];
        const reservations = [];

        for (const item of cartItems) {
            const { ticketTypeId, quantity } = item;

            if (!ticketTypeId || !quantity || quantity <= 0) {
                return NextResponse.json(
                    { error: 'Invalid cart item: ticketTypeId and quantity required' },
                    { status: 400 }
                );
            }

            const ticketType = await getTicketType(ticketTypeId);

            if (!ticketType) {
                return NextResponse.json(
                    { error: `Ticket type ${ticketTypeId} not found` },
                    { status: 404 }
                );
            }

            // Verify ticket type belongs to event
            const ticketEventId = extractIdString(ticketType.eventId);
            if (ticketEventId !== eventId) {
                return NextResponse.json(
                    { error: `Ticket type ${ticketTypeId} does not belong to event ${eventId}` },
                    { status: 400 }
                );
            }

            // Check availability
            const available = ticketType.capacity - ticketType.sold - ticketType.reserved;
            if (available < quantity) {
                return NextResponse.json(
                    { 
                        error: `Not enough tickets available for ${ticketType.name}`,
                        available,
                        requested: quantity,
                    },
                    { status: 400 }
                );
            }

            // Check min/max per order
            if (quantity < ticketType.minPerOrder) {
                return NextResponse.json(
                    { error: `Minimum ${ticketType.minPerOrder} tickets required for ${ticketType.name}` },
                    { status: 400 }
                );
            }

            if (quantity > ticketType.maxPerOrder) {
                return NextResponse.json(
                    { error: `Maximum ${ticketType.maxPerOrder} tickets allowed for ${ticketType.name}` },
                    { status: 400 }
                );
            }

            // Reserve tickets
            const reserved = await reserveTickets(ticketTypeId, quantity);
            if (!reserved) {
                return NextResponse.json(
                    { error: `Failed to reserve tickets for ${ticketType.name}` },
                    { status: 500 }
                );
            }

            reservations.push({ ticketTypeId, quantity });

            // Calculate line total
            const lineTotal = ticketType.price * quantity;
            subtotal += lineTotal;

            processedItems.push({
                ticketTypeId,
                ticketTypeName: ticketType.name,
                quantity,
                unitPrice: ticketType.price,
                subtotal: lineTotal,
            });
        }

        // Apply promo code
        const promoResult = await validatePromoCode(promoCode, processedItems, subtotal);
        const discount = promoResult.valid ? promoResult.discount : 0;

        // Calculate fees
        const fees = await getActiveFees();
        const { totalFees, feeBreakdown } = calculateFees(subtotal - discount, fees);

        // Calculate total
        const total = subtotal - discount + totalFees;

        // Create checkout session
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        const session = {
            sessionId,
            eventId,
            cartItems: processedItems,
            subtotal,
            discount,
            promoCode: promoResult.valid ? promoCode : null,
            promoCodeId: promoResult.valid ? promoResult.promoId : null,
            fees: totalFees,
            feeBreakdown,
            total,
            expiresAt: expiresAt.toISOString(),
            reservations,
        };

        return NextResponse.json({
            success: true,
            session,
            message: promoResult.error || 'Checkout session created',
        });
    } catch (error) {
        console.error('Error starting checkout:', error);
        return NextResponse.json(
            { error: 'Failed to start checkout', details: error.message },
            { status: 500 }
        );
    }
}
