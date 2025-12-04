/**
 * @fileoverview PublicEventCategory Mongoose Model
 * Schema for public event categories (separate from admin event categories)
 */

import mongoose from 'mongoose';

const PublicEventCategorySchema = new mongoose.Schema(
    {
        // Category Name
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [100, 'Category name cannot exceed 100 characters'],
        },

        // URL-friendly identifier
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        // Lucide React icon name
        icon: {
            type: String,
            trim: true,
            default: 'MoreHorizontal',
        },

        // Category image URL (uploaded file path)
        image: {
            type: String,
            trim: true,
            default: null,
        },

        // Category description
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
            default: '',
        },

        // Status
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
            index: true,
        },

        // Display order
        sortOrder: {
            type: Number,
            default: 0,
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Compound index for common queries
PublicEventCategorySchema.index({ status: 1, sortOrder: 1 });

/**
 * Generate slug from name
 * @param {string} name - Category name
 * @returns {string} URL-friendly slug
 */
function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Remove consecutive hyphens
}

// Pre-save hook to generate slug
PublicEventCategorySchema.pre('save', async function () {
    // Generate slug from name if not provided or if name changed
    if (!this.slug || this.isModified('name')) {
        const baseSlug = generateSlug(this.name);
        let uniqueSlug = baseSlug;
        let counter = 1;

        // Ensure slug uniqueness
        while (true) {
            const existing = await mongoose.models.PublicEventCategory.findOne({
                slug: uniqueSlug,
                _id: { $ne: this._id },
            });
            if (!existing) break;
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
        }

        this.slug = uniqueSlug;
    }
});

// Virtual for checking if category is active
PublicEventCategorySchema.virtual('isActive').get(function () {
    return this.status === 'active';
});

// Static method to find all active categories
PublicEventCategorySchema.statics.findActive = function () {
    return this.find({ status: 'active' }).sort({ sortOrder: 1, name: 1 });
};

// Static method to find by slug
PublicEventCategorySchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug: slug.toLowerCase() });
};

// Static method to find all categories with sorting
PublicEventCategorySchema.statics.findAllSorted = function () {
    return this.find().sort({ sortOrder: 1, name: 1 });
};

// Static method to get next sort order
PublicEventCategorySchema.statics.getNextSortOrder = async function () {
    const maxCategory = await this.findOne().sort({ sortOrder: -1 });
    return maxCategory ? maxCategory.sortOrder + 1 : 0;
};

// Instance method to activate
PublicEventCategorySchema.methods.activate = function () {
    this.status = 'active';
    return this.save();
};

// Instance method to deactivate
PublicEventCategorySchema.methods.deactivate = function () {
    this.status = 'inactive';
    return this.save();
};

// Prevent model recompilation
const PublicEventCategory =
    mongoose.models.PublicEventCategory ||
    mongoose.model('PublicEventCategory', PublicEventCategorySchema);

export default PublicEventCategory;
