/**
 * @fileoverview Order Mongoose Model
 * Schema for ticket purchase orders
 */

import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
    {
        // Order Identification
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        // Event & User References
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PublicEvent',
            required: [true, 'Event ID is required'],
            index: true,
        },
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            index: true,
        },

        // Order Status
        status: {
            type: String,
            enum: ['pending', 'paid', 'cancelled', 'refunded'],
            default: 'pending',
            index: true,
        },

        // Pricing
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },
        fees: {
            type: Number,
            default: 0,
            min: 0,
        },
        tax: {
            type: Number,
            default: 0,
            min: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: 'GBP',
            uppercase: true,
        },

        // Payment Information
        paymentIntentId: {
            type: String,
            index: true,
        },
        paymentMethod: {
            type: String,
        },

        // Customer Information
        customerEmail: {
            type: String,
            required: [true, 'Customer email is required'],
            lowercase: true,
            trim: true,
        },
        customerName: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
        },
        customerPhone: {
            type: String,
            trim: true,
        },

        // Promo Code
        promoCodeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PromoCode',
        },
        promoCode: {
            type: String,
        },

        // Timestamps
        paidAt: {
            type: Date,
        },
        cancelledAt: {
            type: Date,
        },
        refundedAt: {
            type: Date,
        },

        // Additional Information
        notes: {
            type: String,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ eventId: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });

// Virtual for checking if order is paid
OrderSchema.virtual('isPaid').get(function () {
    return this.status === 'paid';
});

// Virtual for checking if order is pending
OrderSchema.virtual('isPending').get(function () {
    return this.status === 'pending';
});

// Pre-save middleware to set timestamps
OrderSchema.pre('save', function () {
    // Set paidAt when status changes to paid
    if (this.isModified('status') && this.status === 'paid' && !this.paidAt) {
        this.paidAt = new Date();
    }

    // Set cancelledAt when status changes to cancelled
    if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
        this.cancelledAt = new Date();
    }

    // Set refundedAt when status changes to refunded
    if (this.isModified('status') && this.status === 'refunded' && !this.refundedAt) {
        this.refundedAt = new Date();
    }
});

// Static method to generate order number
OrderSchema.statics.generateOrderNumber = async function () {
    const year = new Date().getFullYear();
    const prefix = `ORD-${year}-`;

    // Find the highest order number for this year
    const lastOrder = await this.findOne({
        orderNumber: { $regex: `^${prefix}` }
    }).sort({ orderNumber: -1 }).select('orderNumber');

    let nextNum = 1;
    if (lastOrder && lastOrder.orderNumber) {
        // Extract the number part and increment
        const lastNum = parseInt(lastOrder.orderNumber.replace(prefix, ''), 10);
        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
        }
    }

    return `${prefix}${String(nextNum).padStart(6, '0')}`;
};

// Static method to find by user
OrderSchema.statics.findByUser = function (userId) {
    return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find by event
OrderSchema.statics.findByEvent = function (eventId) {
    return this.find({ eventId }).sort({ createdAt: -1 });
};

// Static method to find paid orders
OrderSchema.statics.findPaid = function (filters = {}) {
    return this.find({ ...filters, status: 'paid' }).sort({ paidAt: -1 });
};

// Instance method to mark as paid
OrderSchema.methods.markAsPaid = function (paymentIntentId) {
    this.status = 'paid';
    this.paymentIntentId = paymentIntentId;
    this.paidAt = new Date();
    return this.save();
};

// Instance method to cancel order
OrderSchema.methods.cancel = function () {
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    return this.save();
};

// Instance method to refund order
OrderSchema.methods.refund = function () {
    this.status = 'refunded';
    this.refundedAt = new Date();
    return this.save();
};

// Prevent model recompilation
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;
