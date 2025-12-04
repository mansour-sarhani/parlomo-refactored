/**
 * @fileoverview Ticket Mongoose Model
 * Schema for individual ticket instances
 */

import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema(
    {
        // References
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'Order ID is required'],
            index: true,
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PublicEvent',
            required: [true, 'Event ID is required'],
            index: true,
        },
        ticketTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TicketType',
            required: [true, 'Ticket type ID is required'],
        },

        // Ticket Identification
        code: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        qrCode: {
            type: String,
        },

        // Status
        status: {
            type: String,
            enum: ['valid', 'used', 'cancelled', 'refunded'],
            default: 'valid',
            index: true,
        },

        // Attendee Information
        attendeeName: {
            type: String,
            required: [true, 'Attendee name is required'],
            trim: true,
        },
        attendeeEmail: {
            type: String,
            required: [true, 'Attendee email is required'],
            lowercase: true,
            trim: true,
        },

        // Seated Event Information (optional)
        seatInfo: {
            section: String,
            row: String,
            seat: String,
        },

        // Usage Tracking
        usedAt: {
            type: Date,
        },
        usedBy: {
            type: String, // Scanner user ID
        },
        scanLocation: {
            type: String,
        },

        // Additional
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
// orderId, eventId, code already have index: true in schema definition
TicketSchema.index({ eventId: 1, status: 1 }); // compound index is different from single field index
TicketSchema.index({ attendeeEmail: 1 });

// Virtual for checking if ticket is valid
TicketSchema.virtual('isValid').get(function () {
    return this.status === 'valid';
});

// Virtual for checking if ticket is used
TicketSchema.virtual('isUsed').get(function () {
    return this.status === 'used';
});

// Static method to generate unique ticket code
TicketSchema.statics.generateTicketCode = async function () {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
    let code;
    let exists = true;
    
    while (exists) {
        code = '';
        for (let i = 0; i < 12; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Format: XXXX-XXXX-XXXX
        code = code.match(/.{1,4}/g).join('-');
        
        // Check if code already exists
        exists = await this.findOne({ code });
    }
    
    return code;
};

// Static method to find by order
TicketSchema.statics.findByOrder = function (orderId) {
    return this.find({ orderId }).populate('ticketTypeId');
};

// Static method to find by event
TicketSchema.statics.findByEvent = function (eventId) {
    return this.find({ eventId }).populate('ticketTypeId orderId');
};

// Static method to find valid tickets
TicketSchema.statics.findValid = function (filters = {}) {
    return this.find({ ...filters, status: 'valid' });
};

// Instance method to mark as used
TicketSchema.methods.markAsUsed = function (scannerId, location) {
    if (this.status !== 'valid') {
        throw new Error('Ticket is not valid for use');
    }
    
    this.status = 'used';
    this.usedAt = new Date();
    this.usedBy = scannerId;
    this.scanLocation = location;
    
    return this.save();
};

// Instance method to cancel ticket
TicketSchema.methods.cancel = function () {
    this.status = 'cancelled';
    return this.save();
};

// Instance method to refund ticket
TicketSchema.methods.refund = function () {
    this.status = 'refunded';
    return this.save();
};

// Pre-save middleware to set usedAt timestamp
TicketSchema.pre('save', function () {
    if (this.isModified('status') && this.status === 'used' && !this.usedAt) {
        this.usedAt = new Date();
    }
});

// Prevent model recompilation
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);

export default Ticket;
