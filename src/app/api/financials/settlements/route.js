import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { createSettlementRequest } from '@/lib/ticketing-db';

export async function POST(request) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { organizerId, eventId, amount } = body;

        if (!organizerId || !eventId || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields: organizerId, eventId, amount' },
                { status: 400 }
            );
        }

        const settlementRequest = await createSettlementRequest({
            organizerId,
            eventId,
            amount,
        });

        return NextResponse.json({
            success: true,
            settlementRequest,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating settlement request:', error);
        return NextResponse.json(
            { error: 'Failed to create settlement request' },
            { status: 500 }
        );
    }
}
