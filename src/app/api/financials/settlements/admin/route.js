import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAllSettlementRequests } from '@/lib/ticketing-db';

export async function GET() {
    try {
        await connectDB();
        
        const requests = await getAllSettlementRequests();

        return NextResponse.json({
            success: true,
            settlementRequests: Object.values(requests),
        });
    } catch (error) {
        console.error('Error fetching all settlement requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settlement requests' },
            { status: 500 }
        );
    }
}
