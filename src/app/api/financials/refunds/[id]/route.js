import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { updateRefundRequest, getRefundRequest } from '@/lib/ticketing-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

export async function PATCH(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await request.json();
        const { status, adminNotes } = body;

        // Validate id format
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { error: 'Invalid refund request ID format' },
                { status: 400 }
            );
        }

        const existingRequest = await getRefundRequest(id);
        if (!existingRequest) {
            return NextResponse.json(
                { error: 'Refund request not found' },
                { status: 404 }
            );
        }

        const updates = {};
        if (status) updates.status = status;
        if (adminNotes) updates.adminNotes = adminNotes;

        const updatedRequest = await updateRefundRequest(id, updates);

        return NextResponse.json({
            success: true,
            refundRequest: updatedRequest,
        });
    } catch (error) {
        console.error('Error updating refund request:', error);
        return NextResponse.json(
            { error: 'Failed to update refund request' },
            { status: 500 }
        );
    }
}
