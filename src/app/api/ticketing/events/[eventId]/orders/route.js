import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getOrdersByEvent } from '@/lib/ticketing-db';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';
import OrderItem from '@/models/ticketing/OrderItem';

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { eventId } = await params;

        // Validate eventId format
        if (!isValidObjectId(eventId)) {
            return NextResponse.json(
                { error: 'Invalid event ID format' },
                { status: 400 }
            );
        }

        // Get query parameters for filtering
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // Optional: filter by status
        const limit = parseInt(searchParams.get('limit')) || 50; // Default 50 orders
        const offset = parseInt(searchParams.get('offset')) || 0;

        // Get orders for this event
        let orders = await getOrdersByEvent(eventId);

        // Filter by status if provided
        if (status) {
            orders = orders.filter(o => o.status === status);
        }

        // Get ticket counts for each order
        const ordersWithTicketCount = await Promise.all(
            orders.map(async (order) => {
                const orderItems = await OrderItem.find({ orderId: order._id }).lean();
                const ticketCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

                return {
                    id: order.id || order._id.toString(),
                    orderNumber: order.orderNumber,
                    status: order.status,
                    customerName: order.customerName,
                    customerEmail: order.customerEmail,
                    total: order.total,
                    subtotal: order.subtotal,
                    discount: order.discount,
                    fees: order.fees,
                    currency: order.currency,
                    ticketCount,
                    promoCode: order.promoCode,
                    paidAt: order.paidAt,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt,
                };
            })
        );

        // Apply pagination
        const totalCount = ordersWithTicketCount.length;
        const paginatedOrders = ordersWithTicketCount.slice(offset, offset + limit);

        return NextResponse.json({
            success: true,
            orders: paginatedOrders,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount,
            },
        });
    } catch (error) {
        console.error('Error fetching event orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event orders', details: error.message },
            { status: 500 }
        );
    }
}
