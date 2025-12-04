/**
 * API Route: Public Event Categories
 * GET /api/public-events/categories - Get all event categories
 * POST /api/public-events/categories - Create new category
 */

import { NextResponse } from 'next/server';
import {
    getAllCategories,
    getActiveCategories,
    createCategory,
} from '@/lib/public-event-categories-db';
import { parseFormData, handleCategoryImageUpload } from '@/lib/upload-handler';

/**
 * GET /api/public-events/categories
 * Get all available event categories
 * Query params:
 * - status: 'active' | 'inactive' | 'all' (default: 'all')
 * - search: search term
 * - page: page number (default: 1)
 * - limit: items per page (default: 20)
 * - activeOnly: 'true' to get only active categories (shortcut)
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const activeOnly = searchParams.get('activeOnly') === 'true';

        // Shortcut for getting active categories only
        if (activeOnly) {
            const categories = await getActiveCategories();
            return NextResponse.json({
                success: true,
                categories,
            });
        }

        // Full query with pagination
        const result = await getAllCategories({
            status: status !== 'all' ? status : null,
            search,
            page,
            limit,
        });

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/public-events/categories
 * Create a new event category
 * Body (multipart/form-data):
 * - name: string (required)
 * - icon: string (Lucide icon name)
 * - description: string
 * - status: 'active' | 'inactive'
 * - sortOrder: number
 * - image: File (optional image upload)
 */
export async function POST(request) {
    try {
        // Parse multipart form data
        const { fields, files } = await parseFormData(request);

        // Validate required fields
        if (!fields.name || !fields.name.trim()) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        // Handle image upload if provided
        let imageUrl = null;
        if (files.image) {
            imageUrl = await handleCategoryImageUpload(files.image);
        }

        // Prepare category data
        const categoryData = {
            name: fields.name.trim(),
            icon: fields.icon?.trim() || 'MoreHorizontal',
            description: fields.description?.trim() || '',
            status: fields.status || 'active',
            sortOrder: fields.sortOrder ? parseInt(fields.sortOrder) : undefined,
            image: imageUrl,
        };

        // Create category
        const category = await createCategory(categoryData);

        return NextResponse.json({
            success: true,
            message: 'Category created successfully',
            category,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category', details: error.message },
            { status: 500 }
        );
    }
}
