import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getRefundRequestsByOrganizer } from '@/lib/ticketing-db';

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

        const requests = await getRefundRequestsByOrganizer(organizerId);

        return NextResponse.json({
            success: true,
            refundRequests: requests,
        });
    } catch (error) {
        console.error('Error fetching refund requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch refund requests' },
            { status: 500 }
        );
    }
}
