/**
 * @fileoverview OrderItem Mongoose Model
 * Schema for individual line items within orders
 */

import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
    {
        // References
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'Order ID is required'],
            index: true,
        },
        ticketTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TicketType',
            required: [true, 'Ticket type ID is required'],
        },

        // Item Details
        ticketTypeName: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1'],
        },
        unitPrice: {
            type: Number,
            required: [true, 'Unit price is required'],
            min: 0,
        },
        subtotal: {
            type: Number,
            min: 0,
        },

        // Discounts (if promo code applied to specific items)
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },
        total: {
            type: Number,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
// orderId already has index: true in schema definition
OrderItemSchema.index({ ticketTypeId: 1 });

// Pre-validate middleware to calculate totals (runs before validation)
OrderItemSchema.pre('validate', function () {
    // Calculate subtotal if not provided
    if (this.subtotal === undefined || this.subtotal === null) {
        this.subtotal = this.quantity * this.unitPrice;
    }

    // Calculate total if not provided
    if (this.total === undefined || this.total === null) {
        this.total = this.subtotal - (this.discount || 0);
    }
});

// Static method to find by order
OrderItemSchema.statics.findByOrder = function (orderId) {
    return this.find({ orderId }).populate('ticketTypeId');
};

// Prevent model recompilation
const OrderItem = mongoose.models.OrderItem || mongoose.model('OrderItem', OrderItemSchema);

export default OrderItem;
