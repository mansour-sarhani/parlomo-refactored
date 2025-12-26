import { api } from '@/lib/axios';

/**
 * User Service - API calls for user management
 */
export const userService = {
    /**
     * Get list of users hitting the legacy admin endpoint.
     * Matches Laravel pagination contract: { data, links, meta }
     *
     * @param {Object} params - Query parameters
     * @param {number} [params.page]
     * @param {number} [params.limit]
     * @param {string} [params.name]
     * @param {string} [params.username]
     * @param {string} [params.publicName]
     * @returns {Promise<Object>} Response payload
     */
    getUsers: async (params = {}) => {
        const query = {};

        if (params.page) {
            query.page = params.page;
        }

        if (params.limit) {
            query.per_page = params.limit;
        }

        if (params.name) {
            query.name = params.name;
        }

        if (params.username) {
            query.username = params.username;
        }

        if (params.publicName) {
            query.publicName = params.publicName;
        }

        return await api.get('/api/user/admin', { params: query });
    },

    /**
     * Get list of organizers for event creation (admin only)
     * @returns {Promise<Object>} Response payload with organizers list
     */
    getOrganizers: async () => {
        return await api.get('/api/user/admin/organizer');
    },

    /**
     * Update user profile via legacy admin endpoint
     * Mirrors legacy behaviour using multipart/form-data with _method PATCH
     */
    updateAdminUserProfile: async (id, payload = {}) => {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                return;
            }

            if (value instanceof File || value instanceof Blob) {
                formData.append(key, value);
                return;
            }

            if (Array.isArray(value)) {
                value.forEach((item) => {
                    if (item !== undefined && item !== null) {
                        formData.append(`${key}[]`, item);
                    }
                });
                return;
            }

            formData.append(key, value);
        });

        if (!formData.has("_method")) {
            formData.append("_method", "PATCH");
        }

        return await api.post(`/api/user/admin/profile/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    /**
     * Fetch user permissions for admin management
     */
    getUserPermissions: async (id) => {
        return await api.get(`/api/user/user-permission/${id}`);
    },

    /**
     * Update user permissions via legacy endpoint
     */
    updateUserPermissions: async (id, permissionIds = []) => {
        return await api.post(`/api/user/user-permission/${id}`, {
            data: permissionIds,
            _method: "PATCH",
        });
    },
};

