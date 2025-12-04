import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getOrdersByEvent, getSettlementRequestsByOrganizer } from '@/lib/ticketing-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

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

        // Get orders for this event
        const orders = await getOrdersByEvent(eventId);
        
        // Calculate financials
        // Only count PAID orders
        const paidOrders = orders.filter(o => o.status === 'paid');

        const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalCents || 0), 0) / 100;
        const totalFees = paidOrders.reduce((sum, o) => sum + (o.feesCents || 0), 0) / 100;
        const netRevenue = totalRevenue - totalFees;

        // Get settlements for this event
        // We need organizerId, but we don't have it easily here without fetching event or passing it.
        // However, we can just return the calculated stats and let the client fetch settlements separately 
        // or we can try to find settlements if we knew the organizer.
        // For now, let's just return the sales stats. The client can fetch settlements using the organizer ID it has.

        return NextResponse.json({
            success: true,
            financials: {
                totalRevenue,
                totalFees,
                netRevenue,
                orderCount: paidOrders.length,
            }
        });
    } catch (error) {
        console.error('Error fetching event financials:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event financials', details: error.message },
            { status: 500 }
        );
    }
}
