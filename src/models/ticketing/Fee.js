/**
 * @fileoverview Fee Mongoose Model
 * Schema for platform and service fees
 */

import mongoose from 'mongoose';

const FeeSchema = new mongoose.Schema(
    {
        // Fee Information
        name: {
            type: String,
            required: [true, 'Fee name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },

        // Fee Type
        type: {
            type: String,
            enum: ['platform', 'service', 'payment', 'tax'],
            required: [true, 'Fee type is required'],
        },

        // Fee Calculation
        calculationType: {
            type: String,
            enum: ['percentage', 'fixed', 'per_ticket'],
            required: [true, 'Calculation type is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Fee amount is required'],
            min: 0,
        },

        // Applicability
        appliesTo: {
            type: String,
            enum: ['subtotal', 'total', 'ticket'],
            default: 'subtotal',
        },

        // Status
        active: {
            type: Boolean,
            default: true,
            index: true,
        },

        // Display
        displayToCustomer: {
            type: Boolean,
            default: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
FeeSchema.index({ type: 1, active: 1 });

// Static method to find active fees
FeeSchema.statics.findActive = function () {
    return this.find({ active: true }).sort({ displayOrder: 1 });
};

// Static method to calculate fees for an order
FeeSchema.statics.calculateOrderFees = async function (subtotal, ticketCount = 0) {
    const fees = await this.findActive();
    let totalFees = 0;
    const feeBreakdown = [];

    for (const fee of fees) {
        let feeAmount = 0;

        switch (fee.calculationType) {
            case 'percentage':
                feeAmount = (subtotal * fee.amount) / 100;
                break;
            case 'fixed':
                feeAmount = fee.amount;
                break;
            case 'per_ticket':
                feeAmount = fee.amount * ticketCount;
                break;
        }

        totalFees += feeAmount;
        feeBreakdown.push({
            name: fee.name,
            type: fee.type,
            amount: feeAmount,
        });
    }

    return {
        totalFees,
        breakdown: feeBreakdown,
    };
};

// Instance method to calculate fee for specific amount
FeeSchema.methods.calculate = function (baseAmount, ticketCount = 0) {
    switch (this.calculationType) {
        case 'percentage':
            return (baseAmount * this.amount) / 100;
        case 'fixed':
            return this.amount;
        case 'per_ticket':
            return this.amount * ticketCount;
        default:
            return 0;
    }
};

// Prevent model recompilation
const Fee = mongoose.models.Fee || mongoose.model('Fee', FeeSchema);

export default Fee;
