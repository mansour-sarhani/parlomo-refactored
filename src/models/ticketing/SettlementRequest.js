/**
 * @fileoverview SettlementRequest Mongoose Model
 * Schema for organizer payout requests
 */

import mongoose from 'mongoose';

const SettlementRequestSchema = new mongoose.Schema(
    {
        // Organizer & Event
        organizerId: {
            type: String,
            required: [true, 'Organizer ID is required'],
            index: true,
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PublicEvent',
            required: [true, 'Event ID is required'],
            index: true,
        },
        eventTitle: {
            type: String,
            required: true,
        },

        // Financial Details
        amount: {
            type: Number,
            required: [true, 'Settlement amount is required'],
            min: [0, 'Amount cannot be negative'],
        },
        currency: {
            type: String,
            default: 'GBP',
            uppercase: true,
        },

        // Breakdown
        totalSales: {
            type: Number,
            required: true,
            min: 0,
        },
        platformFees: {
            type: Number,
            default: 0,
            min: 0,
        },
        processingFees: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Status
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'],
            default: 'PENDING',
            index: true,
        },

        // Payment Details
        paymentMethod: {
            type: String,
            enum: ['bank_transfer', 'paypal', 'stripe'],
        },
        paymentDetails: {
            type: mongoose.Schema.Types.Mixed, // Bank account, PayPal email, etc.
        },

        // Timestamps
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        processedAt: {
            type: Date,
        },
        paidAt: {
            type: Date,
        },

        // Admin Notes
        adminNotes: {
            type: String,
        },
        rejectionReason: {
            type: String,
        },

        // Reference
        transactionReference: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
// eventId already has index: true in schema definition
SettlementRequestSchema.index({ organizerId: 1, status: 1 });
SettlementRequestSchema.index({ status: 1, requestedAt: -1 });

// Virtual for checking if pending
SettlementRequestSchema.virtual('isPending').get(function () {
    return this.status === 'PENDING';
});

// Virtual for checking if approved
SettlementRequestSchema.virtual('isApproved').get(function () {
    return this.status === 'APPROVED';
});

// Virtual for checking if paid
SettlementRequestSchema.virtual('isPaid').get(function () {
    return this.status === 'PAID';
});

// Pre-save middleware to set timestamps
SettlementRequestSchema.pre('save', function () {
    if (this.isModified('status')) {
        if ((this.status === 'APPROVED' || this.status === 'REJECTED') && !this.processedAt) {
            this.processedAt = new Date();
        }
        if (this.status === 'PAID' && !this.paidAt) {
            this.paidAt = new Date();
        }
    }
});

// Static method to find by organizer
SettlementRequestSchema.statics.findByOrganizer = function (organizerId) {
    return this.find({ organizerId }).sort({ requestedAt: -1 });
};

// Static method to find pending requests
SettlementRequestSchema.statics.findPending = function () {
    return this.find({ status: 'PENDING' }).sort({ requestedAt: 1 });
};

// Instance method to approve
SettlementRequestSchema.methods.approve = function (adminNotes = '') {
    this.status = 'APPROVED';
    this.adminNotes = adminNotes;
    this.processedAt = new Date();
    return this.save();
};

// Instance method to reject
SettlementRequestSchema.methods.reject = function (reason) {
    this.status = 'REJECTED';
    this.rejectionReason = reason;
    this.processedAt = new Date();
    return this.save();
};

// Instance method to mark as paid
SettlementRequestSchema.methods.markAsPaid = function (transactionReference) {
    this.status = 'PAID';
    this.transactionReference = transactionReference;
    this.paidAt = new Date();
    return this.save();
};

// Prevent model recompilation
const SettlementRequest = mongoose.models.SettlementRequest || mongoose.model('SettlementRequest', SettlementRequestSchema);

export default SettlementRequest;
