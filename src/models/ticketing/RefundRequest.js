/**
 * @fileoverview RefundRequest Mongoose Model
 * Schema for refund requests (event cancellation, bulk refunds)
 */

import mongoose from 'mongoose';

const RefundRequestSchema = new mongoose.Schema(
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

        // Refund Type
        type: {
            type: String,
            enum: ['EVENT_CANCELLATION', 'BULK_REFUND', 'SINGLE_ORDER'],
            required: [true, 'Refund type is required'],
        },

        // Affected Orders
        orderIds: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Order',
            default: [],
        },
        affectedOrdersCount: {
            type: Number,
            default: 0,
        },

        // Financial Details
        totalRefundAmount: {
            type: Number,
            required: [true, 'Total refund amount is required'],
            min: 0,
        },
        currency: {
            type: String,
            default: 'GBP',
            uppercase: true,
        },

        // Request Details
        reason: {
            type: String,
            required: [true, 'Refund reason is required'],
        },
        description: {
            type: String,
        },

        // Status
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'],
            default: 'PENDING',
            index: true,
        },

        // Timestamps
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        processedAt: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },

        // Admin Response
        adminNotes: {
            type: String,
        },
        rejectionReason: {
            type: String,
        },

        // Processing Details
        refundsProcessed: {
            type: Number,
            default: 0,
        },
        refundsFailed: {
            type: Number,
            default: 0,
        },
        processingErrors: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
// eventId already has index: true in schema definition
RefundRequestSchema.index({ organizerId: 1, status: 1 });
RefundRequestSchema.index({ status: 1, requestedAt: -1 });

// Virtual for checking if pending
RefundRequestSchema.virtual('isPending').get(function () {
    return this.status === 'PENDING';
});

// Virtual for checking if approved
RefundRequestSchema.virtual('isApproved').get(function () {
    return this.status === 'APPROVED';
});

// Virtual for checking if processed
RefundRequestSchema.virtual('isProcessed').get(function () {
    return this.status === 'PROCESSED';
});

// Pre-save middleware to set timestamps
RefundRequestSchema.pre('save', function () {
    if (this.isModified('status')) {
        if ((this.status === 'APPROVED' || this.status === 'REJECTED') && !this.processedAt) {
            this.processedAt = new Date();
        }
        if (this.status === 'PROCESSED' && !this.completedAt) {
            this.completedAt = new Date();
        }
    }
});

// Static method to find by organizer
RefundRequestSchema.statics.findByOrganizer = function (organizerId) {
    return this.find({ organizerId }).sort({ requestedAt: -1 });
};

// Static method to find pending requests
RefundRequestSchema.statics.findPending = function () {
    return this.find({ status: 'PENDING' }).sort({ requestedAt: 1 });
};

// Static method to find by event
RefundRequestSchema.statics.findByEvent = function (eventId) {
    return this.find({ eventId }).sort({ requestedAt: -1 });
};

// Instance method to approve
RefundRequestSchema.methods.approve = function (adminNotes = '') {
    this.status = 'APPROVED';
    this.adminNotes = adminNotes;
    this.processedAt = new Date();
    return this.save();
};

// Instance method to reject
RefundRequestSchema.methods.reject = function (reason) {
    this.status = 'REJECTED';
    this.rejectionReason = reason;
    this.processedAt = new Date();
    return this.save();
};

// Instance method to mark as processed
RefundRequestSchema.methods.markAsProcessed = function (successCount, failCount, errors = []) {
    this.status = 'PROCESSED';
    this.refundsProcessed = successCount;
    this.refundsFailed = failCount;
    this.processingErrors = errors;
    this.completedAt = new Date();
    return this.save();
};

// Prevent model recompilation
const RefundRequest = mongoose.models.RefundRequest || mongoose.model('RefundRequest', RefundRequestSchema);

export default RefundRequest;
