import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAllRefundRequests } from '@/lib/ticketing-db';

export async function GET() {
    try {
        await connectDB();
        
        const requests = await getAllRefundRequests();

        return NextResponse.json({
            success: true,
            refundRequests: Object.values(requests),
        });
    } catch (error) {
        console.error('Error fetching all refund requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch refund requests' },
            { status: 500 }
        );
    }
}
