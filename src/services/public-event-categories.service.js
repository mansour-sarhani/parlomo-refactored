/**
 * Public Event Categories Service
 * Client-side service for interacting with public event categories API
 */

import { ticketingApi } from '@/lib/ticketing-axios';

const BASE_URL = '/api/public-events/categories';

/**
 * Public Event Categories Service
 */
export const publicEventCategoriesService = {
    /**
     * Get all categories with pagination
     * @param {Object} params - Query parameters
     * @param {string} params.status - Filter by status ('active', 'inactive', 'all')
     * @param {string} params.search - Search term
     * @param {number} params.page - Page number
     * @param {number} params.limit - Items per page
     * @returns {Promise<Object>} Categories with pagination
     */
    async getCategories(params = {}) {
        const query = {};

        if (params.page) query.page = params.page;
        if (params.limit) query.limit = params.limit;
        if (params.status) query.status = params.status;
        if (params.search) query.search = params.search;

        return ticketingApi.get(BASE_URL, { params: query });
    },

    /**
     * Get active categories only (for dropdowns, public use)
     * @returns {Promise<Object>} Active categories
     */
    async getActiveCategories() {
        return ticketingApi.get(BASE_URL, { params: { activeOnly: 'true' } });
    },

    /**
     * Get single category by ID
     * @param {string} id - Category ID
     * @returns {Promise<Object>} Category
     */
    async getCategory(id) {
        return ticketingApi.get(`${BASE_URL}/${id}`);
    },

    /**
     * Create new category
     * @param {Object} payload - Category data
     * @param {string} payload.name - Category name (required)
     * @param {string} payload.icon - Lucide icon name
     * @param {string} payload.description - Description
     * @param {string} payload.status - Status (active/inactive)
     * @param {number} payload.sortOrder - Display order
     * @param {File} payload.image - Image file (optional)
     * @returns {Promise<Object>} Created category
     */
    async createCategory(payload = {}) {
        const formData = new FormData();

        // Append text fields
        if (payload.name) formData.append('name', payload.name);
        if (payload.icon) formData.append('icon', payload.icon);
        if (payload.description) formData.append('description', payload.description);
        if (payload.status) formData.append('status', payload.status);
        if (payload.sortOrder !== undefined) formData.append('sortOrder', payload.sortOrder);

        // Append image if provided
        if (payload.image instanceof File) {
            formData.append('image', payload.image);
        }

        return ticketingApi.post(BASE_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Update existing category
     * @param {string} id - Category ID
     * @param {Object} payload - Updated data
     * @param {string} payload.name - Category name
     * @param {string} payload.icon - Lucide icon name
     * @param {string} payload.description - Description
     * @param {string} payload.status - Status (active/inactive)
     * @param {number} payload.sortOrder - Display order
     * @param {File} payload.image - New image file (optional)
     * @param {boolean} payload.removeImage - Set true to remove existing image
     * @returns {Promise<Object>} Updated category
     */
    async updateCategory(id, payload = {}) {
        const formData = new FormData();

        // Append text fields (only if provided)
        if (payload.name !== undefined) formData.append('name', payload.name);
        if (payload.icon !== undefined) formData.append('icon', payload.icon);
        if (payload.description !== undefined) formData.append('description', payload.description);
        if (payload.status !== undefined) formData.append('status', payload.status);
        if (payload.sortOrder !== undefined) formData.append('sortOrder', payload.sortOrder);

        // Handle image
        if (payload.removeImage) {
            formData.append('removeImage', 'true');
        } else if (payload.image instanceof File) {
            formData.append('image', payload.image);
        }

        return ticketingApi.patch(`${BASE_URL}/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Delete category
     * @param {string} id - Category ID
     * @returns {Promise<Object>} Deletion result
     */
    async deleteCategory(id) {
        return ticketingApi.delete(`${BASE_URL}/${id}`);
    },

    /**
     * Seed default categories
     * @param {boolean} reset - If true, delete all existing before seeding
     * @returns {Promise<Object>} Seed result
     */
    async seedCategories(reset = false) {
        return ticketingApi.post(`${BASE_URL}/seed`, { reset });
    },

    /**
     * Check if categories need seeding
     * @returns {Promise<Object>} Stats with needsSeed flag
     */
    async checkSeedStatus() {
        return ticketingApi.get(`${BASE_URL}/seed`);
    },
};

export default publicEventCategoriesService;
