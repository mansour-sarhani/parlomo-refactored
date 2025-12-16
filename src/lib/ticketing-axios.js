import axios from "axios";
import { STORAGE_KEYS } from "@/constants/config";

/**
 * Ticketing API Axios Instance
 *
 * MIGRATION NOTE: This instance now connects to the main Laravel backend (api.parlomo.co.uk)
 * instead of local Next.js API routes. The local configuration is preserved below (commented out)
 * for easy revert if needed.
 */

const isDebugLoggingEnabled = process.env.NEXT_PUBLIC_ENABLE_API_DEBUG === "true";

// =============================================================================
// ORIGINAL LOCAL CONFIGURATION (commented out for revert capability)
// =============================================================================
// // Create ticketing axios instance - always points to local Next.js API routes
// const ticketingAxios = axios.create({
//     baseURL: process.env.DEV_BASE_URL || "http://localhost:3000",
//     timeout: 30000,
//     headers: {
//         "Content-Type": "application/json",
//     },
// });
// =============================================================================

// NEW: Connect to main Laravel backend API
const ticketingAxios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_URL_KEY || process.env.NEXT_PUBLIC_LIVE_URL_KEY || "https://api.parlomo.co.uk",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Request Interceptor
 * Adds authentication token and logs requests in development mode
 *
 * NOTE: Now that we're connecting to the Laravel backend, we need to include
 * the JWT token in the Authorization header (same as main axios instance)
 */
ticketingAxios.interceptors.request.use(
    (config) => {
        // Add JWT token for Laravel backend authentication
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem(STORAGE_KEYS.USER);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed?.token) {
                        config.headers = config.headers || {};
                        config.headers.Authorization = `Bearer ${parsed.token}`;
                    }
                }
            } catch (error) {
                if (isDebugLoggingEnabled) {
                    console.warn("⚠️ [Ticketing API Request] Failed to read auth token", error);
                }
            }
        }

        // Log request in development
        if (isDebugLoggingEnabled) {
            console.log(`🎫 [Ticketing API Request] ${config.method?.toUpperCase()} ${config.url}`, {
                params: config.params,
                data: config.data,
            });
        }

        return config;
    },
    (error) => {
        console.error("❌ [Ticketing API Request Error]", error);
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles responses and errors
 */
ticketingAxios.interceptors.response.use(
    (response) => {
        // Log response in development
        if (isDebugLoggingEnabled) {
            console.log(
                `✅ [Ticketing API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
                {
                    status: response.status,
                    data: response.data,
                }
            );
        }

        return response;
    },
    (error) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            console.error(`❌ [Ticketing API Error] ${status}:`, data);

            // Standardize error format
            return Promise.reject({
                status,
                message: data?.message || data?.error || "An error occurred",
                errors: data?.errors || null,
                data: data,
            });
        } else if (error.request) {
            // Request was made but no response received (network error)
            console.error("❌ [Ticketing Network Error] No response received:", error.request);
            return Promise.reject({
                status: 0,
                message: "Network error. Please check your connection.",
                errors: null,
            });
        } else {
            // Something else happened
            console.error("❌ [Ticketing Request Error]", error.message);
            return Promise.reject({
                status: 0,
                message: error.message || "An unexpected error occurred",
                errors: null,
            });
        }
    }
);

/**
 * API Helper Methods
 * Convenience methods for common HTTP operations
 */
export const ticketingApi = {
    /**
     * GET request
     * @param {string} url - API endpoint
     * @param {object} config - Axios config
     */
    get: (url, config = {}) => ticketingAxios.get(url, config),

    /**
     * POST request
     * @param {string} url - API endpoint
     * @param {object} data - Request body
     * @param {object} config - Axios config
     */
    post: (url, data = {}, config = {}) => ticketingAxios.post(url, data, config),

    /**
     * PUT request
     * @param {string} url - API endpoint
     * @param {object} data - Request body
     * @param {object} config - Axios config
     */
    put: (url, data = {}, config = {}) => ticketingAxios.put(url, data, config),

    /**
     * PATCH request
     * @param {string} url - API endpoint
     * @param {object} data - Request body
     * @param {object} config - Axios config
     */
    patch: (url, data = {}, config = {}) => ticketingAxios.patch(url, data, config),

    /**
     * DELETE request
     * @param {string} url - API endpoint
     * @param {object} config - Axios config
     */
    delete: (url, config = {}) => ticketingAxios.delete(url, config),
};

// Export configured axios instance
export default ticketingAxios;
