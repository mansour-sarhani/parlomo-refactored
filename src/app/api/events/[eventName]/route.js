import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getPublicEventBySlug } from '@/lib/public-events-db';

export async function GET(request, { params }) {
    try {
        await connectDB();
        
        const { eventName } = await params;

        if (!eventName) {
            return NextResponse.json(
                { error: 'Event name is required' },
                { status: 400 }
            );
        }

        const event = await getPublicEventBySlug(eventName);

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event' },
            { status: 500 }
        );
    }
}
