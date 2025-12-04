import axios from "axios";

/**
 * Ticketing API Axios Instance
 * Dedicated axios instance for ticketing features that use local Next.js API routes
 * This allows ticketing APIs to run on localhost while legacy APIs continue using the Laravel backend
 */

const isDebugLoggingEnabled = process.env.NEXT_PUBLIC_ENABLE_API_DEBUG === "true";

// Create ticketing axios instance - always points to local Next.js API routes
const ticketingAxios = axios.create({
    baseURL: process.env.DEV_BASE_URL || "http://localhost:3000",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Request Interceptor
 * Logs requests in development mode
 */
ticketingAxios.interceptors.request.use(
    (config) => {
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
