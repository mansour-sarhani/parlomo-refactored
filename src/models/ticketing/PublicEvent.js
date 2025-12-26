/**
 * @fileoverview PublicEvent Mongoose Model
 * Schema for organizer-created public ticketed events
 */

import mongoose from 'mongoose';

const PublicEventSchema = new mongoose.Schema(
    {
        // Basic Information
        title: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            required: [true, 'Event description is required'],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PublicEventCategory',
            required: [true, 'Event category is required'],
            index: true,
        },

        // Organizer Information
        // organizerId is optional at creation - backend populates from auth user if not provided
        organizerId: {
            type: String,
            required: false,
            index: true,
        },
        organizer: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: String,
            website: String,
            facebook: String,
            instagram: String,
            whatsapp: String,
        },

        // Status & Type
        status: {
            type: String,
            enum: ['draft', 'published', 'cancelled', 'completed'],
            default: 'draft',
            index: true,
        },
        eventType: {
            type: String,
            enum: ['general_admission', 'seated'],
            default: 'general_admission',
            required: true,
        },

        // Date & Time
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
            index: true,
        },
        endDate: {
            type: Date,
        },
        doorsOpen: {
            type: Date,
        },
        timezone: {
            type: String,
            default: 'UTC',
        },

        // Location & Venue
        venue: {
            name: { type: String, required: true },
            capacity: Number,
        },
        location: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: String,
            country: { type: String, required: true },
            postcode: String,
            coordinates: {
                lat: Number,
                lng: Number,
            },
        },

        // Ticketing Configuration
        globalCapacity: {
            type: Number,
            min: [1, 'Capacity must be at least 1'],
        },
        currency: {
            type: String,
            default: 'GBP',
            uppercase: true,
        },
        waitlistEnabled: {
            type: Boolean,
            default: false,
        },

        // Media
        coverImage: {
            type: String,
        },
        galleryImages: {
            type: [String],
            default: [],
        },
        videoUrl: {
            type: String,
        },

        // Policies & Settings
        ageRestriction: {
            type: Number,
            min: 0,
            max: 100,
        },
        refundPolicy: {
            type: String,
        },
        termsAndConditions: {
            type: String,
        },

        // Tax & Fees
        taxRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        platformFeePercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        // Service Charges (organizer-defined fees)
        serviceCharges: {
            type: [{
                title: {
                    type: String,
                    required: [true, 'Service charge title is required'],
                    trim: true,
                    maxlength: [100, 'Title cannot exceed 100 characters'],
                },
                type: {
                    type: String,
                    enum: ['per_ticket', 'per_cart'],
                    required: [true, 'Service charge type is required'],
                    default: 'per_ticket',
                },
                amountType: {
                    type: String,
                    enum: ['fixed_price', 'percentage'],
                    required: [true, 'Service charge amount type is required'],
                    default: 'fixed_price',
                },
                amount: {
                    type: Number,
                    required: [true, 'Service charge amount is required'],
                    min: [0, 'Amount cannot be negative'],
                },
            }],
            default: [],
        },

        // Additional
        tags: {
            type: [String],
            default: [],
        },
        featured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for performance
PublicEventSchema.index({ organizerId: 1, status: 1 });
PublicEventSchema.index({ category: 1, status: 1 });
PublicEventSchema.index({ startDate: 1, status: 1 });

// Virtual for checking if event is upcoming
PublicEventSchema.virtual('isUpcoming').get(function () {
    return this.startDate > new Date();
});

// Virtual for checking if event is past
PublicEventSchema.virtual('isPast').get(function () {
    return this.endDate ? this.endDate < new Date() : this.startDate < new Date();
});

// Virtual for checking if event is live
PublicEventSchema.virtual('isLive').get(function () {
    const now = new Date();
    if (this.endDate) {
        return this.startDate <= now && this.endDate >= now;
    }
    return false;
});

// Pre-save middleware to generate slug if not provided
PublicEventSchema.pre('save', function () {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
});

// Static method to find published events
PublicEventSchema.statics.findPublished = function () {
    return this.find({ status: 'published' });
};

// Static method to find by organizer
PublicEventSchema.statics.findByOrganizer = function (organizerId) {
    return this.find({ organizerId });
};

// Instance method to publish event
PublicEventSchema.methods.publish = function () {
    this.status = 'published';
    return this.save();
};

// Instance method to cancel event
PublicEventSchema.methods.cancel = function () {
    this.status = 'cancelled';
    return this.save();
};

// Prevent model recompilation in Next.js hot reload
const PublicEvent = mongoose.models.PublicEvent || mongoose.model('PublicEvent', PublicEventSchema);

export default PublicEvent;
