

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getPublicEventBySlug } from '@/lib/public-events-db';

export async function GET(request, { params }) {
    try {
        await connectDB();
        
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { error: 'Slug is required' },
                { status: 400 }
            );
        }

        const event = await getPublicEventBySlug(slug);

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            event,
        });
    } catch (error) {
        console.error('Error fetching event by slug:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event', details: error.message },
            { status: 500 }
        );
    }
}
