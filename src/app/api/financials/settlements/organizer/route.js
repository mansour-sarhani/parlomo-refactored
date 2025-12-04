import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSettlementRequestsByOrganizer } from '@/lib/ticketing-db';

export async function GET(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const organizerId = searchParams.get('organizerId');

        if (!organizerId) {
            return NextResponse.json(
                { error: 'Missing organizerId query parameter' },
                { status: 400 }
            );
        }

        const requests = await getSettlementRequestsByOrganizer(organizerId);

        return NextResponse.json({
            success: true,
            settlementRequests: requests,
        });
    } catch (error) {
        console.error('Error fetching settlement requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settlement requests' },
            { status: 500 }
        );
    }
}
