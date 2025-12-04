/**
 * API Route: Seed Public Event Categories
 * POST /api/public-events/categories/seed - Seed default categories
 */

import { NextResponse } from 'next/server';
import {
    seedDefaultCategories,
    resetAndSeedCategories,
    getCategoryStats,
} from '@/lib/public-event-categories-db';

/**
 * POST /api/public-events/categories/seed
 * Seed default categories from hardcoded list
 * Body (JSON):
 * - reset: boolean - If true, delete all existing categories first
 */
export async function POST(request) {
    try {
        let body = {};
        try {
            body = await request.json();
        } catch {
            // No body provided, use defaults
        }

        const { reset = false } = body;

        let result;
        if (reset) {
            // Delete all and reseed
            result = await resetAndSeedCategories();
        } else {
            // Seed only if no categories exist
            result = await seedDefaultCategories(true);
        }

        // Get current stats
        const stats = await getCategoryStats();

        return NextResponse.json({
            success: true,
            ...result,
            stats,
        });
    } catch (error) {
        console.error('Error seeding categories:', error);
        return NextResponse.json(
            { error: 'Failed to seed categories', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/public-events/categories/seed
 * Get current category stats (useful for checking if seed is needed)
 */
export async function GET() {
    try {
        const stats = await getCategoryStats();

        return NextResponse.json({
            success: true,
            stats,
            needsSeed: stats.total === 0,
        });
    } catch (error) {
        console.error('Error getting category stats:', error);
        return NextResponse.json(
            { error: 'Failed to get stats', details: error.message },
            { status: 500 }
        );
    }
}
