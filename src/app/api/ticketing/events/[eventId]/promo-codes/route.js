/**
 * API Route: Event Promo Codes
 * GET /api/ticketing/events/[eventId]/promo-codes - List promo codes
 * POST /api/ticketing/events/[eventId]/promo-codes - Create promo code
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import {
    getPromoCodesByEvent,
    createPromoCode,
    getPromoCodeByCode
} from '@/lib/ticketing-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

/**
 * GET /api/ticketing/events/[eventId]/promo-codes
 * Get all promo codes for an event
 */
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

        const promoCodes = await getPromoCodesByEvent(eventId);

        return NextResponse.json(promoCodes);
    } catch (error) {
        console.error('Error fetching promo codes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch promo codes' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/ticketing/events/[eventId]/promo-codes
 * Create a new promo code
 */
export async function POST(request, { params }) {
    try {
        await connectDB();

        const { eventId } = await params;
        const data = await request.json();

        // Validate eventId format
        if (!isValidObjectId(eventId)) {
            return NextResponse.json(
                { error: 'Invalid event ID format' },
                { status: 400 }
            );
        }

        // Validation
        if (!data.code || !data.discountType || !data.discountAmount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if code already exists (globally unique for simplicity, or per event)
        // For this implementation, we'll check if it exists for this event or globally if needed.
        // The mock DB getPromoCodeByCode checks globally.
        const existing = await getPromoCodeByCode(data.code);
        if (existing) {
            return NextResponse.json(
                { error: 'Promo code already exists' },
                { status: 400 }
            );
        }

        const newPromo = await createPromoCode({
            eventId,
            code: data.code.toUpperCase(),
            discountType: data.discountType, // 'percentage' or 'fixed'
            discountAmount: parseFloat(data.discountAmount),
            maxUses: data.maxUses ? parseInt(data.maxUses, 10) : null,
            startDate: data.startDate || new Date().toISOString(),
            endDate: data.endDate || null,
            minOrderAmount: data.minOrderAmount ? parseFloat(data.minOrderAmount) : 0,
            applicableTicketTypes: data.applicableTicketTypes || [], // Array of ticket type IDs, empty means all
            active: true
        });

        return NextResponse.json(newPromo, { status: 201 });
    } catch (error) {
        console.error('Error creating promo code:', error);
        return NextResponse.json(
            { error: 'Failed to create promo code' },
            { status: 500 }
        );
    }
}
