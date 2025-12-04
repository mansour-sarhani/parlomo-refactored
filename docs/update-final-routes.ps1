# MongoDB Migration - Final Batch Update Script
# Updates remaining 5 financial routes + 1 test route

Write-Host "Updating remaining 6 routes..." -ForegroundColor Cyan

# Route 1: settlements/admin/route.js
$content1 = @"
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAllSettlementRequests } from '@/lib/ticketing-db';

export async function GET() {
    try {
        await connectDB();
        
        const requests = await getAllSettlementRequests();

        return NextResponse.json({
            success: true,
            settlementRequests: Object.values(requests),
        });
    } catch (error) {
        console.error('Error fetching all settlement requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settlement requests' },
            { status: 500 }
        );
    }
}
"@

Set-Content -Path "src/app/api/financials/settlements/admin/route.js" -Value $content1
Write-Host "✓ Updated settlements/admin/route.js" -ForegroundColor Green

# Route 2: settlements/organizer/route.js  
$content2 = @"
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSettlementRequestsByOrganizer } from '@/lib/ticketing-db';

export async function GET(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const organizerId = searchParams.get('organizerId');

        if (!organizerId) {
            return NextResponse.json(
                { error: 'organizerId query parameter is required' },
                { status: 400 }
            );
        }

        const requests = await getSettlementRequestsByOrganizer(organizerId);

        return NextResponse.json({
            success: true,
            settlementRequests: requests,
        });
    } catch (error) {
        console.error('Error fetching organizer settlement requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settlement requests' },
            { status: 500 }
        );
    }
}
"@

Set-Content -Path "src/app/api/financials/settlements/organizer/route.js" -Value $content2
Write-Host "✓ Updated settlements/organizer/route.js" -ForegroundColor Green

# Route 3: refunds/route.js
$content3 = @"
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { createRefundRequest } from '@/lib/ticketing-db';

export async function POST(request) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { organizerId, eventId, reason } = body;

        if (!organizerId || !eventId || !reason) {
            return NextResponse.json(
                { error: 'Missing required fields: organizerId, eventId, reason' },
                { status: 400 }
            );
        }

        const refundRequest = await createRefundRequest({
            organizerId,
            eventId,
            reason,
        });

        return NextResponse.json({
            success: true,
            refundRequest,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating refund request:', error);
        return NextResponse.json(
            { error: 'Failed to create refund request' },
            { status: 500 }
        );
    }
}
"@

Set-Content -Path "src/app/api/financials/refunds/route.js" -Value $content3
Write-Host "✓ Updated refunds/route.js" -ForegroundColor Green

# Route 4: refunds/[id]/route.js
$content4 = @"
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { updateRefundRequest, getRefundRequest } from '@/lib/ticketing-db';

export async function PATCH(request, { params }) {
    try {
        await connectDB();
        
        const { id } = params;
        const body = await request.json();
        const { status, adminNotes } = body;

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
"@

Set-Content -Path "src/app/api/financials/refunds/[id]/route.js" -Value $content4
Write-Host "✓ Updated refunds/[id]/route.js" -ForegroundColor Green

# Route 5: refunds/admin/route.js
$content5 = @"
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAllRefundRequests } from '@/lib/ticketing-db';

export async function GET() {
    try {
        await connectDB();
        
        const requests = await getAllRefundRequests();

        return NextResponse.json({
            success: true,
            refundRequests: Object.values(requests),
        });
    } catch (error) {
        console.error('Error fetching all refund requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch refund requests' },
            { status: 500 }
        );
    }
}
"@

Set-Content -Path "src/app/api/financials/refunds/admin/route.js" -Value $content5
Write-Host "✓ Updated refunds/admin/route.js" -ForegroundColor Green

# Route 6: refunds/organizer/route.js
$content6 = @"
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
                { error: 'organizerId query parameter is required' },
                { status: 400 }
            );
        }

        const requests = await getRefundRequestsByOrganizer(organizerId);

        return NextResponse.json({
            success: true,
            refundRequests: requests,
        });
    } catch (error) {
        console.error('Error fetching organizer refund requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch refund requests' },
            { status: 500 }
        );
    }
}
"@

Set-Content -Path "src/app/api/financials/refunds/organizer/route.js" -Value $content6
Write-Host "✓ Updated refunds/organizer/route.js" -ForegroundColor Green

Write-Host ""
Write-Host "All 6 routes updated successfully!" -ForegroundColor Green
Write-Host "MongoDB migration complete! 🎉" -ForegroundColor Cyan
