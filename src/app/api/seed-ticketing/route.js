/**
 * API Route: Seed Ticketing Data
 * POST /api/seed-ticketing
 * Seeds the mock ticketing database with sample data
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { seedTicketingData } from '@/lib/seed-ticketing-data';
import { resetAllData } from '@/lib/ticketing-db';
import { resetAllPublicEventsData } from '@/lib/public-events-db';

export async function POST(request) {
    try {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { error: 'Seeding is only allowed in development' },
                { status: 403 }
            );
        }

        // Connect to MongoDB
        await connectDB();

        let action = 'seed';
        try {
            const body = await request.json();
            if (body.action) action = body.action;
        } catch (e) {
            // If JSON parse fails or body is empty, default to seed
        }

        if (action === 'reset') {
            await Promise.all([
                resetAllData(),
                resetAllPublicEventsData()
            ]);
            return NextResponse.json({
                success: true,
                message: 'All ticketing and event data cleared'
            });
        }

        if (action === 'seed') {
            // seedTicketingData handles reset internally
            const result = await seedTicketingData();
            return NextResponse.json({
                success: true,
                message: 'Ticketing data seeded successfully',
                stats: result,
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json(
            { error: 'Failed to seed data', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    return NextResponse.json({
        message: 'Use POST method to seed ticketing data',
        endpoint: '/api/seed-ticketing',
    });
}
