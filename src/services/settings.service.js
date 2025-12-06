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

/**
 * Get public setting by key (About, Contact, FAQ, Policy)
 * @param {string} key - Setting key (About, Contact, FAQ, Policy)
 * @returns {Promise<Object>} Setting data with key and value (HTML content)
 */
export const getPublicSetting = async (key) => {
    try {
        const response = await api.get(`/api/setting?key=${key}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Send contact form message
 * @param {Object} data - Contact form data
 * @param {string} data.title - Message title/subject
 * @param {string} data.email - Sender's email
 * @param {string} data.message - Message content
 * @param {string} data.token - reCAPTCHA token
 * @returns {Promise<Object>} Success response
 */
export const sendContactForm = async (data) => {
    try {
        const response = await api.post('/api/contact-us', data);
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
    getPublicSetting,
    sendContactForm,
};

