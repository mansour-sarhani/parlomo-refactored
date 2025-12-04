/**
 * API Route: Single Promo Code
 * PATCH /api/ticketing/events/[eventId]/promo-codes/[codeId] - Update promo code
 * DELETE /api/ticketing/events/[eventId]/promo-codes/[codeId] - Delete promo code
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import {
    updatePromoCode,
    deletePromoCode,
    getAllPromoCodes
} from '@/lib/ticketing-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

/**
 * PATCH /api/ticketing/events/[eventId]/promo-codes/[codeId]
 * Update a promo code
 */
export async function PATCH(request, { params }) {
    try {
        await connectDB();

        const { codeId } = await params;
        const data = await request.json();

        // Validate codeId format
        if (!isValidObjectId(codeId)) {
            return NextResponse.json(
                { error: 'Invalid promo code ID format' },
                { status: 400 }
            );
        }

        // Remove immutable fields
        delete data.id;
        delete data.eventId;
        delete data.createdAt;

        const updatedPromo = await updatePromoCode(codeId, data);

        if (!updatedPromo) {
            return NextResponse.json(
                { error: 'Promo code not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedPromo);
    } catch (error) {
        console.error('Error updating promo code:', error);
        return NextResponse.json(
            { error: 'Failed to update promo code' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/ticketing/events/[eventId]/promo-codes/[codeId]
 * Delete a promo code
 */
export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const { codeId } = await params;

        // Validate codeId format
        if (!isValidObjectId(codeId)) {
            return NextResponse.json(
                { error: 'Invalid promo code ID format' },
                { status: 400 }
            );
        }

        const success = await deletePromoCode(codeId);

        if (!success) {
            return NextResponse.json(
                { error: 'Promo code not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting promo code:', error);
        return NextResponse.json(
            { error: 'Failed to delete promo code' },
            { status: 500 }
        );
    }
}
