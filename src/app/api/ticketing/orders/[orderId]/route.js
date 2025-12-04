/**
 * API Route: Get Order Details
 * GET /api/ticketing/orders/[orderId]
 * Returns complete order information
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getOrder, getOrderItemsByOrder } from '@/lib/ticketing-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

export async function GET(request, { params }) {
    try {
        await connectDB();
        
        const { orderId } = await params;

        // Validate orderId format
        if (!isValidObjectId(orderId)) {
            return NextResponse.json(
                { error: 'Invalid order ID format' },
                { status: 400 }
            );
        }

        // Get order
        const order = await getOrder(orderId);

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Get order items
        const orderItems = await getOrderItemsByOrder(orderId);

        // Format response
        const orderDetails = {
            ...order,
            items: orderItems,
            totalItems: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        };

        return NextResponse.json({
            success: true,
            order: orderDetails,
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order details', details: error.message },
            { status: 500 }
        );
    }
}
