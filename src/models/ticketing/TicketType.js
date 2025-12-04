/**
 * @fileoverview TicketType Mongoose Model
 * Schema for ticket types/tiers within events
 */

import mongoose from 'mongoose';

const TicketTypeSchema = new mongoose.Schema(
    {
        // Event Reference
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PublicEvent',
            required: [true, 'Event ID is required'],
            index: true,
        },

        // Basic Information
        name: {
            type: String,
            required: [true, 'Ticket type name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
        },

        // Pricing
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        currency: {
            type: String,
            default: 'GBP',
            uppercase: true,
        },

        // Capacity & Availability
        capacity: {
            type: Number,
            required: [true, 'Capacity is required'],
            min: [1, 'Capacity must be at least 1'],
        },
        sold: {
            type: Number,
            default: 0,
            min: 0,
        },
        reserved: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Purchase Limits
        minPerOrder: {
            type: Number,
            default: 1,
            min: 1,
        },
        maxPerOrder: {
            type: Number,
            default: 10,
            min: 1,
        },

        // Sales Period
        salesStart: {
            type: Date,
        },
        salesEnd: {
            type: Date,
        },

        // Status
        active: {
            type: Boolean,
            default: true,
        },
        visible: {
            type: Boolean,
            default: true,
        },
        refundable: {
            type: Boolean,
            default: true,
        },
        transferAllowed: {
            type: Boolean,
            default: true,
        },

        // Seated Event Fields (optional)
        seatSection: {
            type: String,
        },
        seatRow: {
            type: String,
        },
        seatNumbers: {
            type: [String],
        },

        // Display Order
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
TicketTypeSchema.index({ eventId: 1, active: 1 });
TicketTypeSchema.index({ eventId: 1, displayOrder: 1 });

// Virtual for available tickets
TicketTypeSchema.virtual('available').get(function () {
    return this.capacity - this.sold - this.reserved;
});

// Virtual for sold out status
TicketTypeSchema.virtual('isSoldOut').get(function () {
    return this.available <= 0;
});

// Virtual for on sale status
TicketTypeSchema.virtual('isOnSale').get(function () {
    const now = new Date();
    
    if (!this.active) return false;
    if (this.isSoldOut) return false;
    
    if (this.salesStart && now < this.salesStart) return false;
    if (this.salesEnd && now > this.salesEnd) return false;
    
    return true;
});

// Static method to find by event
TicketTypeSchema.statics.findByEvent = function (eventId) {
    return this.find({ eventId, active: true }).sort({ displayOrder: 1 });
};

// Static method to find available tickets
TicketTypeSchema.statics.findAvailable = function (eventId) {
    return this.find({
        eventId,
        active: true,
        $expr: { $gt: [{ $subtract: ['$capacity', { $add: ['$sold', '$reserved'] }] }, 0] },
    }).sort({ displayOrder: 1 });
};

// Instance method to reserve tickets
TicketTypeSchema.methods.reserve = async function (quantity) {
    if (this.available < quantity) {
        throw new Error('Not enough tickets available');
    }
    
    this.reserved += quantity;
    return this.save();
};

// Instance method to release reserved tickets
TicketTypeSchema.methods.release = async function (quantity) {
    this.reserved = Math.max(0, this.reserved - quantity);
    return this.save();
};

// Instance method to mark tickets as sold
TicketTypeSchema.methods.markSold = async function (quantity) {
    if (this.available < quantity) {
        throw new Error('Not enough tickets available');
    }
    
    this.sold += quantity;
    this.reserved = Math.max(0, this.reserved - quantity);
    return this.save();
};

// Validation: sold + reserved cannot exceed capacity
TicketTypeSchema.pre('save', function () {
    if (this.sold + this.reserved > this.capacity) {
        throw new Error('Sold and reserved tickets cannot exceed capacity');
    }
});

// Prevent model recompilation
const TicketType = mongoose.models.TicketType || mongoose.model('TicketType', TicketTypeSchema);

export default TicketType;
