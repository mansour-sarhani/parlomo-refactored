/**
 * @fileoverview MongoDB Public Event Categories Database Access Layer
 * Provides CRUD operations for public event categories using MongoDB
 */

import { connectDB } from './mongodb.js';
import { PublicEventCategory } from '@/models/ticketing/index.js';
import { EVENT_CATEGORIES } from '@/types/public-events-types';

// ==================== CRUD OPERATIONS ====================

/**
 * Get all categories
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by status (active/inactive)
 * @param {string} options.search - Search term for name
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.limit - Items per page
 * @returns {Promise<Object>} Categories with pagination
 */
export async function getAllCategories(options = {}) {
    await connectDB();

    const {
        status = null,
        search = null,
        page = 1,
        limit = 20,
    } = options;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
        PublicEventCategory.find(query)
            .sort({ sortOrder: 1, name: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        PublicEventCategory.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        data: categories.map(cat => ({
            ...cat,
            id: cat._id.toString(),
        })),
        meta: {
            current_page: page,
            last_page: totalPages,
            per_page: limit,
            total,
        },
    };
}

/**
 * Get active categories only (for public use)
 * @returns {Promise<Array>} Array of active categories
 */
export async function getActiveCategories() {
    await connectDB();

    const categories = await PublicEventCategory.findActive().lean();
    return categories.map(cat => ({
        ...cat,
        id: cat._id.toString(),
    }));
}

/**
 * Get category by ID
 * @param {string} id - Category ID
 * @returns {Promise<Object|null>} Category or null
 */
export async function getCategory(id) {
    await connectDB();

    const category = await PublicEventCategory.findById(id).lean();
    if (!category) return null;

    return {
        ...category,
        id: category._id.toString(),
    };
}

/**
 * Get category by slug
 * @param {string} slug - Category slug
 * @returns {Promise<Object|null>} Category or null
 */
export async function getCategoryBySlug(slug) {
    await connectDB();

    const category = await PublicEventCategory.findBySlug(slug).lean();
    if (!category) return null;

    return {
        ...category,
        id: category._id.toString(),
    };
}

/**
 * Create new category
 * @param {Object} data - Category data
 * @returns {Promise<Object>} Created category
 */
export async function createCategory(data) {
    await connectDB();

    // Get next sort order if not provided
    if (data.sortOrder === undefined || data.sortOrder === null) {
        data.sortOrder = await PublicEventCategory.getNextSortOrder();
    }

    const category = new PublicEventCategory(data);
    await category.save();

    return {
        ...category.toObject(),
        id: category._id.toString(),
    };
}

/**
 * Update category
 * @param {string} id - Category ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated category or null
 */
export async function updateCategory(id, updates) {
    await connectDB();

    // If name is being updated, the pre-save hook will regenerate slug
    const category = await PublicEventCategory.findById(id);
    if (!category) return null;

    // Apply updates
    Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
            category[key] = updates[key];
        }
    });

    await category.save();

    return {
        ...category.toObject(),
        id: category._id.toString(),
    };
}

/**
 * Delete category
 * @param {string} id - Category ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCategory(id) {
    await connectDB();

    const result = await PublicEventCategory.findByIdAndDelete(id);
    return !!result;
}

/**
 * Toggle category status
 * @param {string} id - Category ID
 * @returns {Promise<Object|null>} Updated category or null
 */
export async function toggleCategoryStatus(id) {
    await connectDB();

    const category = await PublicEventCategory.findById(id);
    if (!category) return null;

    category.status = category.status === 'active' ? 'inactive' : 'active';
    await category.save();

    return {
        ...category.toObject(),
        id: category._id.toString(),
    };
}

// ==================== SEED OPERATIONS ====================

/**
 * Seed default categories from hardcoded list
 * @param {boolean} skipExisting - Skip if categories already exist
 * @returns {Promise<Object>} Result with created count
 */
export async function seedDefaultCategories(skipExisting = true) {
    await connectDB();

    // Check if categories already exist
    if (skipExisting) {
        const existingCount = await PublicEventCategory.countDocuments();
        if (existingCount > 0) {
            return {
                success: true,
                message: 'Categories already exist, skipping seed',
                created: 0,
                existing: existingCount,
            };
        }
    }

    // Map hardcoded categories to database format
    const categoriesToCreate = EVENT_CATEGORIES.map((cat, index) => ({
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description || '',
        status: 'active',
        sortOrder: index,
    }));

    // Insert all categories
    const created = await PublicEventCategory.insertMany(categoriesToCreate);

    return {
        success: true,
        message: `Created ${created.length} categories`,
        created: created.length,
    };
}

/**
 * Reset and reseed categories (for testing/development)
 * @returns {Promise<Object>} Result
 */
export async function resetAndSeedCategories() {
    await connectDB();

    // Delete all existing categories
    await PublicEventCategory.deleteMany({});

    // Seed fresh
    return seedDefaultCategories(false);
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get category statistics
 * @returns {Promise<Object>} Statistics
 */
export async function getCategoryStats() {
    await connectDB();

    const [total, active, inactive] = await Promise.all([
        PublicEventCategory.countDocuments(),
        PublicEventCategory.countDocuments({ status: 'active' }),
        PublicEventCategory.countDocuments({ status: 'inactive' }),
    ]);

    return {
        total,
        active,
        inactive,
    };
}

/**
 * Check if slug exists
 * @param {string} slug - Slug to check
 * @param {string} excludeId - ID to exclude from check
 * @returns {Promise<boolean>} True if exists
 */
export async function slugExists(slug, excludeId = null) {
    await connectDB();

    const query = { slug: slug.toLowerCase() };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const existing = await PublicEventCategory.findOne(query);
    return !!existing;
}

/**
 * Reorder categories
 * @param {Array} orderedIds - Array of category IDs in desired order
 * @returns {Promise<boolean>} Success status
 */
export async function reorderCategories(orderedIds) {
    await connectDB();

    const bulkOps = orderedIds.map((id, index) => ({
        updateOne: {
            filter: { _id: id },
            update: { $set: { sortOrder: index } },
        },
    }));

    await PublicEventCategory.bulkWrite(bulkOps);
    return true;
}
