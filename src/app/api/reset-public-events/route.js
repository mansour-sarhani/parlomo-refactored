import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { resetAllPublicEventsData } from '@/lib/public-events-db';
import { resetAllData as resetTicketingData } from '@/lib/ticketing-db';

/**
 * POST /api/reset-public-events
 * Reset/wipe all public events and ticketing data
 */
export async function POST() {
    try {
        await connectDB();
        
        // Reset public events
        await resetAllPublicEventsData();

        // Reset ticketing data
        await resetTicketingData();

        return NextResponse.json({
            success: true,
            message: 'All public events and ticketing data has been reset',
        });
    } catch (error) {
        console.error('Error resetting public events:', error);
        return NextResponse.json(
            { error: 'Failed to reset public events data', details: error.message },
            { status: 500 }
        );
    }
}
