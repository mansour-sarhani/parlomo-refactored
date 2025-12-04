/**
 * API Route: Single Public Event Category
 * GET /api/public-events/categories/[id] - Get category by ID
 * PATCH /api/public-events/categories/[id] - Update category
 * DELETE /api/public-events/categories/[id] - Delete category
 */

import { NextResponse } from 'next/server';
import {
    getCategory,
    updateCategory,
    deleteCategory,
} from '@/lib/public-event-categories-db';
import {
    parseFormData,
    handleCategoryImageUpload,
    deleteUploadedFile,
} from '@/lib/upload-handler';
import { isValidObjectId } from '@/lib/utils/objectid-helpers';

/**
 * GET /api/public-events/categories/[id]
 * Get a single category by ID
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Validate id format
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { error: 'Invalid category ID format' },
                { status: 400 }
            );
        }

        const category = await getCategory(id);

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            category,
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json(
            { error: 'Failed to fetch category', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/public-events/categories/[id]
 * Update an existing category
 * Body (multipart/form-data):
 * - name: string
 * - icon: string (Lucide icon name)
 * - description: string
 * - status: 'active' | 'inactive'
 * - sortOrder: number
 * - image: File (optional new image)
 * - removeImage: 'true' to remove existing image
 */
export async function PATCH(request, { params }) {
    try {
        const { id } = await params;

        // Validate id format
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { error: 'Invalid category ID format' },
                { status: 400 }
            );
        }

        // Check if category exists
        const existing = await getCategory(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Parse multipart form data
        const { fields, files } = await parseFormData(request);

        // Build updates object (only include fields that are provided)
        const updates = {};

        if (fields.name !== undefined && fields.name.trim()) {
            updates.name = fields.name.trim();
        }
        if (fields.icon !== undefined) {
            updates.icon = fields.icon.trim() || 'MoreHorizontal';
        }
        if (fields.description !== undefined) {
            updates.description = fields.description.trim();
        }
        if (fields.status !== undefined) {
            updates.status = fields.status;
        }
        if (fields.sortOrder !== undefined) {
            updates.sortOrder = parseInt(fields.sortOrder);
        }

        // Handle image changes
        if (fields.removeImage === 'true') {
            // Remove existing image
            if (existing.image) {
                await deleteUploadedFile(existing.image);
            }
            updates.image = null;
        } else if (files.image) {
            // Upload new image (will delete old one)
            updates.image = await handleCategoryImageUpload(files.image, existing.image);
        }

        // Check if there are any updates
        if (Object.keys(updates).length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No changes to update',
                category: existing,
            });
        }

        // Update category
        const category = await updateCategory(id, updates);

        return NextResponse.json({
            success: true,
            message: 'Category updated successfully',
            category,
        });
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/public-events/categories/[id]
 * Delete a category
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        // Validate id format
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { error: 'Invalid category ID format' },
                { status: 400 }
            );
        }

        // Check if category exists
        const existing = await getCategory(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Delete associated image if exists
        if (existing.image) {
            await deleteUploadedFile(existing.image);
        }

        // Delete category
        const deleted = await deleteCategory(id);

        if (!deleted) {
            return NextResponse.json(
                { error: 'Failed to delete category' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category', details: error.message },
            { status: 500 }
        );
    }
}
