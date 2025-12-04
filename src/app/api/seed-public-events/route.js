/**
 * API Route: Seed Public Events Data
 * POST /api/seed-public-events - Populate database with sample events
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { seedPublicEvents, getSeedSummary } from '@/lib/seed-public-events-data';

/**
 * POST /api/seed-public-events
 * Seed the database with sample public events
 */
export async function POST() {
    try {
        await connectDB();
        
        // Seed the data
        const events = await seedPublicEvents();

        // Get summary
        const summary = await getSeedSummary();

        return NextResponse.json({
            success: true,
            message: 'Public events data seeded successfully',
            summary,
            eventsCreated: events.length,
        });
    } catch (error) {
        console.error('Error seeding public events:', error);
        return NextResponse.json(
            { error: 'Failed to seed public events data', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/seed-public-events
 * Get current seed data summary
 */
export async function GET() {
    try {
        await connectDB();
        
        const summary = await getSeedSummary();

        return NextResponse.json({
            success: true,
            summary,
        });
    } catch (error) {
        console.error('Error getting seed summary:', error);
        return NextResponse.json(
            { error: 'Failed to get seed summary', details: error.message },
            { status: 500 }
        );
    }
}
