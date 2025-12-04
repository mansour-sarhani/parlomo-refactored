/**
 * API Route: Public Events Collection
 * GET /api/public-events - List events with filters
 * POST /api/public-events - Create new event
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import {
    queryPublicEvents,
    createPublicEvent,
} from '@/lib/public-events-db';

/**
 * GET /api/public-events
 * List public events with optional filters
 */
export async function GET(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);

        // Extract query parameters
        const filters = {
            organizerId: searchParams.get('organizerId') || null,
            status: searchParams.get('status') || null,
            category: searchParams.get('category') || null,
            isPublic: searchParams.get('isPublic') ? searchParams.get('isPublic') === 'true' : null,
            search: searchParams.get('search') || null,
            startDateFrom: searchParams.get('startDateFrom') || null,
            startDateTo: searchParams.get('startDateTo') || null,
            page: searchParams.get('page') ? parseInt(searchParams.get('page'), 10) : 1,
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 10,
            sortBy: searchParams.get('sortBy') || 'createdAt',
            sortOrder: searchParams.get('sortOrder') || 'desc',
        };

        // Query events
        const result = await queryPublicEvents(filters);

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error('Error fetching public events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch public events', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/public-events
 * Create a new public event
 */
export async function POST(request) {
    try {
        await connectDB();
        
        const body = await request.json();

        // Validate required fields
        const requiredFields = [
            'organizerId',
            'title',
            'description',
            'category',
            'startDate',
            'timezone',
            'venueName',
            'venueAddress',
            'city',
            'state',
            'country',
            'postcode',
            'eventType',
            'currency',
            'organizerName',
            'organizerEmail',
        ];

        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    error: 'Missing required fields',
                    missingFields
                },
                { status: 400 }
            );
        }

        // Create event
        const newEvent = await createPublicEvent(body);

        return NextResponse.json({
            success: true,
            event: newEvent,
            message: 'Event created successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating public event:', error);
        return NextResponse.json(
            { error: 'Failed to create event', details: error.message },
            { status: 500 }
        );
    }
}
