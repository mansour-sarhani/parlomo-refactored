/**
 * API Route: Validate Promo Code
 * POST /api/ticketing/promo/validate
 * Validates a promo code and returns discount information
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getPromoCodeByCode } from '@/lib/ticketing-db';

export async function POST(request) {
    try {
        await connectDB();
        
        const body = await request.json();

        if (!body.code) {
            return NextResponse.json(
                { error: 'Promo code is required' },
                { status: 400 }
            );
        }

        const { code, cartTotal = 0, ticketTypeIds = [] } = body;

        // Get promo code
        const promo = await getPromoCodeByCode(code);

        if (!promo) {
            return NextResponse.json({
                valid: false,
                error: 'Invalid promo code',
            });
        }

        // Check if active
        if (!promo.active) {
            return NextResponse.json({
                valid: false,
                error: 'This promo code is not active',
            });
        }

        // Check validity period
        if (promo.startDate) {
            const now = new Date();
            const fromDate = new Date(promo.startDate);

            if (now < fromDate) {
                return NextResponse.json({
                    valid: false,
                    error: 'This promo code is not yet valid',
                });
            }
        }

        if (promo.endDate) {
            const now = new Date();
            const toDate = new Date(promo.endDate);

            if (now > toDate) {
                return NextResponse.json({
                    valid: false,
                    error: 'This promo code has expired',
                });
            }
        }

        // Check max uses
        if (promo.maxUses && promo.maxUses > 0 && promo.currentUses >= promo.maxUses) {
            return NextResponse.json({
                valid: false,
                error: 'This promo code has reached its maximum number of uses',
            });
        }

        // Check minimum order value
        const minOrderAmount = promo.minOrderAmount || 0;
        if (minOrderAmount > 0 && cartTotal < minOrderAmount) {
            const minAmount = (minOrderAmount / 100).toFixed(2);
            return NextResponse.json({
                valid: false,
                error: `Minimum order value of $${minAmount} required`,
                minOrderValue: minOrderAmount,
            });
        }

        // Check if promo applies to ticket types
        if (promo.applicableTicketTypes && promo.applicableTicketTypes.length > 0) {
            const hasApplicableTicket = ticketTypeIds.some(id =>
                promo.applicableTicketTypes.includes(id)
            );

            if (!hasApplicableTicket) {
                return NextResponse.json({
                    valid: false,
                    error: 'This promo code is not applicable to the selected tickets',
                });
            }
        }

        // Calculate discount
        let discount = 0;
        if (promo.discountType === 'percentage') {
            discount = Math.round(cartTotal * (promo.discountAmount / 100));
        } else if (promo.discountType === 'fixed') {
            discount = promo.discountAmount;
        }

        // Don't allow discount to exceed cart total
        discount = Math.min(discount, cartTotal);

        // Return valid promo
        return NextResponse.json({
            valid: true,
            promo: {
                id: promo.id,
                code: promo.code,
                type: promo.discountType,
                amount: promo.discountAmount,
                discount,
                description: '',
            },
            message: 'Promo code applied successfully',
        });
    } catch (error) {
        console.error('Error validating promo code:', error);
        return NextResponse.json(
            { error: 'Failed to validate promo code', details: error.message },
            { status: 500 }
        );
    }
}
