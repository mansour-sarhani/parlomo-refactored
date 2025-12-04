import { NextResponse } from 'next/server';
import { connectDB, getConnectionStatus, isConnected } from '@/lib/mongodb';

/**
 * Test MongoDB Connection
 * GET /api/test-mongodb
 */
export async function GET() {
    try {
        // Attempt to connect
        await connectDB();

        // Get connection details
        const status = getConnectionStatus();
        const connected = isConnected();

        return NextResponse.json({
            success: true,
            message: 'MongoDB connection successful',
            status,
            connected,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('MongoDB connection test failed:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'MongoDB connection failed',
                error: error.message,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
