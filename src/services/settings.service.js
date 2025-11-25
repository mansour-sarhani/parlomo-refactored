/**
 * Settings Service
 * Handles all settings-related API calls for user profile, preferences, and account management
 */

import { api } from '@/lib/axios';

/**
 * Get current user profile (legacy `/api/user` endpoint)
 * @returns {Promise<Object>} User profile data
 */
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/api/user');
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update user profile using legacy `/api/user/profile`
 * Accepts partial payload; fields omitted (undefined/null) are not sent.
 * Supports multipart uploads for avatar updates.
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (profileData = {}) => {
    try {
        const formData = new FormData();

        Object.entries(profileData).forEach(([key, value]) => {
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

        if (!formData.has('_method')) {
            formData.append('_method', 'PATCH');
        }

        const response = await api.post('/api/user/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Change user password via legacy `/api/user/change-password`
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.oldPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} Success message
 */
export const changePassword = async (passwordData) => {
    try {
        const response = await api.post('/api/user/change-password', passwordData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const checkPublicIdAvailability = async (publicId) => {
    try {
        const response = await api.post('/api/user/validatePublicId', { publicId });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default {
    getCurrentUser,
    updateProfile,
    changePassword,
    checkPublicIdAvailability,
};

