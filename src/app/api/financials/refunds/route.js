import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { createRefundRequest } from '@/lib/ticketing-db';

export async function POST(request) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { organizerId, eventId, reason, type } = body;

        if (!organizerId || !eventId || !reason || !type) {
            return NextResponse.json(
                { error: 'Missing required fields: organizerId, eventId, reason, type' },
                { status: 400 }
            );
        }

        const refundRequest = await createRefundRequest({
            organizerId,
            eventId,
            reason,
            type,
        });

        return NextResponse.json({
            success: true,
            refundRequest,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating refund request:', error);
        return NextResponse.json(
            { error: 'Failed to create refund request' },
            { status: 500 }
        );
    }
}
