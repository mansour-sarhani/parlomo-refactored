/**
 * @fileoverview PromoCode Mongoose Model
 * Schema for promotional discount codes
 */

import mongoose from 'mongoose';

const PromoCodeSchema = new mongoose.Schema(
    {
        // Event Reference
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PublicEvent',
            required: [true, 'Event ID is required'],
            index: true,
        },

        // Code Information
        code: {
            type: String,
            required: [true, 'Promo code is required'],
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },

        // Discount Configuration
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: [true, 'Discount type is required'],
        },
        discountAmount: {
            type: Number,
            required: [true, 'Discount amount is required'],
            min: [0, 'Discount amount cannot be negative'],
        },

        // Validity Period
        validFrom: {
            type: Date,
        },
        validUntil: {
            type: Date,
        },

        // Usage Limits
        maxUses: {
            type: Number,
            min: 0,
        },
        maxUsesPerUser: {
            type: Number,
            default: 1,
            min: 1,
        },
        currentUses: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Applicable Ticket Types
        applicableTicketTypes: {
            type: [mongoose.Schema.Types.ObjectId],
            default: [], // Empty array means applies to all ticket types
        },

        // Minimum Purchase Requirements
        minTickets: {
            type: Number,
            min: 0,
        },
        minPurchaseAmount: {
            type: Number,
            min: 0,
        },

        // Status
        active: {
            type: Boolean,
            default: true,
            index: true,
        },

        // Description
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
// eventId and code already have index: true in schema definition
PromoCodeSchema.index({ eventId: 1, active: 1 }); // compound index is different from single field index

// Virtual for checking if promo code is valid
PromoCodeSchema.virtual('isValid').get(function () {
    const now = new Date();
    
    // Check if active
    if (!this.active) return false;
    
    // Check validity period
    if (this.validFrom && now < this.validFrom) return false;
    if (this.validUntil && now > this.validUntil) return false;
    
    // Check usage limits
    if (this.maxUses && this.currentUses >= this.maxUses) return false;
    
    return true;
});

// Virtual for remaining uses
PromoCodeSchema.virtual('remainingUses').get(function () {
    if (!this.maxUses) return Infinity;
    return Math.max(0, this.maxUses - this.currentUses);
});

// Static method to find by event
PromoCodeSchema.statics.findByEvent = function (eventId) {
    return this.find({ eventId, active: true });
};

// Static method to find valid promo codes
PromoCodeSchema.statics.findValid = function (eventId) {
    const now = new Date();
    return this.find({
        eventId,
        active: true,
        $or: [
            { validFrom: { $exists: false } },
            { validFrom: { $lte: now } },
        ],
        $or: [
            { validUntil: { $exists: false } },
            { validUntil: { $gte: now } },
        ],
    });
};

// Static method to find by code
PromoCodeSchema.statics.findByCode = function (code) {
    return this.findOne({ code: code.toUpperCase(), active: true });
};

// Instance method to validate promo code
// Using suppressWarning to avoid conflict with mongoose's internal validate method
PromoCodeSchema.methods.validatePromoCode = function (ticketTypeIds = [], ticketCount = 0, purchaseAmount = 0) {
    const now = new Date();
    
    // Check if active
    if (!this.active) {
        return { valid: false, reason: 'Promo code is not active' };
    }
    
    // Check validity period
    if (this.validFrom && now < this.validFrom) {
        return { valid: false, reason: 'Promo code is not yet valid' };
    }
    if (this.validUntil && now > this.validUntil) {
        return { valid: false, reason: 'Promo code has expired' };
    }
    
    // Check usage limits
    if (this.maxUses && this.currentUses >= this.maxUses) {
        return { valid: false, reason: 'Promo code has reached maximum uses' };
    }
    
    // Check applicable ticket types
    if (this.applicableTicketTypes.length > 0) {
        const hasApplicableTicket = ticketTypeIds.some(id =>
            this.applicableTicketTypes.some(applicable => applicable.toString() === id.toString())
        );
        if (!hasApplicableTicket) {
            return { valid: false, reason: 'Promo code is not applicable to selected tickets' };
        }
    }
    
    // Check minimum requirements
    if (this.minTickets && ticketCount < this.minTickets) {
        return { valid: false, reason: `Minimum ${this.minTickets} tickets required` };
    }
    if (this.minPurchaseAmount && purchaseAmount < this.minPurchaseAmount) {
        return { valid: false, reason: `Minimum purchase amount of ${this.minPurchaseAmount} required` };
    }
    
    return { valid: true };
};

// Instance method to calculate discount
PromoCodeSchema.methods.calculateDiscount = function (amount) {
    if (this.discountType === 'percentage') {
        return (amount * this.discountAmount) / 100;
    } else {
        return Math.min(this.discountAmount, amount); // Don't exceed total amount
    }
};

// Instance method to increment usage
PromoCodeSchema.methods.incrementUse = async function () {
    this.currentUses += 1;
    return this.save();
};

// Instance method to deactivate
PromoCodeSchema.methods.deactivate = function () {
    this.active = false;
    return this.save();
};

// Validation: Ensure discount percentage doesn't exceed 100%
PromoCodeSchema.pre('save', function () {
    if (this.discountType === 'percentage' && this.discountAmount > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
    }
});

// Prevent model recompilation
const PromoCode = mongoose.models.PromoCode || mongoose.model('PromoCode', PromoCodeSchema);

export default PromoCode;
