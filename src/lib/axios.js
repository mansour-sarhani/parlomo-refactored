import axios from "axios";
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from "@/constants/config";

const isDebugLoggingEnabled = process.env.NEXT_PUBLIC_ENABLE_API_DEBUG === "true";

/**
 * Axios Instance Configuration
 * Centralized HTTP client with interceptors for authentication and error handling
 */

// Create base axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Request Interceptor
 * Cookies are automatically sent with requests - no manual token injection needed!
 * This interceptor is mainly for logging in development mode.
 */
axiosInstance.interceptors.request.use(
    (config) => {
        // Legacy API expects bearer token header instead of cookies
        config.withCredentials = config.withCredentials ?? false;

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
                    console.warn("⚠️ [API Request] Failed to read auth token", error);
                }
            }
        }

        // Log request in development
        if (isDebugLoggingEnabled) {
            console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, {
                params: config.params,
                data: config.data,
            });
        }

        return config;
    },
    (error) => {
        console.error("❌ [API Request Error]", error);
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles common response scenarios and errors
 */
axiosInstance.interceptors.response.use(
    (response) => {
        // Log response in development
        if (isDebugLoggingEnabled) {
            console.log(
                `✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
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

            console.error(`❌ [API Error] ${status}:`, data);

            switch (status) {
                case 401:
                    // Unauthorized - Token expired or invalid
                    // Don't redirect for auth check endpoint (expected behavior when not logged in)
                    handleUnauthorized();
                    break;

                case 403:
                    // Forbidden - User doesn't have permission
                    console.error(
                        "Access forbidden:",
                        data?.message || "You do not have permission to access this resource"
                    );
                    break;

                case 404:
                    // Not Found
                    console.error(
                        "Resource not found:",
                        data?.message || "The requested resource was not found"
                    );
                    break;

                case 422:
                    // Validation Error - Already logged above at line 88
                    break;

                case 429:
                    // Too Many Requests
                    console.error(
                        "Rate limit exceeded:",
                        data?.message || "Too many requests. Please try again later."
                    );
                    break;

                case 500:
                case 502:
                case 503:
                case 504:
                    // Server Errors
                    console.error(
                        "Server error:",
                        data?.message || "An error occurred on the server. Please try again later."
                    );
                    break;

                default:
                    console.error("API error:", data?.message || "An unexpected error occurred");
            }

            // Standardize error format
            return Promise.reject({
                status,
                message: data?.message || "An error occurred",
                errors: data?.errors || null,
                data: data,
            });
        } else if (error.request) {
            // Request was made but no response received (network error)
            console.error("❌ [Network Error] No response received:", error.request);
            return Promise.reject({
                status: 0,
                message: "Network error. Please check your internet connection.",
                errors: null,
            });
        } else {
            // Something else happened
            console.error("❌ [Request Error]", error.message);
            return Promise.reject({
                status: 0,
                message: error.message || "An unexpected error occurred",
                errors: null,
            });
        }
    }
);

/**
 * Handle Unauthorized Access (401)
 * Cookie is cleared by server, we just need to redirect to login
 */
function handleUnauthorized() {
    if (typeof window !== "undefined") {
        // Clear any user data from localStorage (optional, for UI state)
        localStorage.removeItem(STORAGE_KEYS.USER);

        // Get current path to redirect back after login
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath === "/login";

        // Don't redirect if already on login page
        if (!isLoginPage) {
            if (isDebugLoggingEnabled) {
                console.log("🔒 Session expired. Redirecting to login...");
            }

            // Store the current path to redirect back after login
            sessionStorage.setItem("redirect_after_login", currentPath);

            // Redirect to login
            window.location.href = "/login";
        }
    }
}

/**
 * API Helper Methods
 * Convenience methods for common HTTP operations
 */
export const api = {
    /**
     * GET request
     * @param {string} url - API endpoint
     * @param {object} config - Axios config
     */
    get: (url, config = {}) => axiosInstance.get(url, config),

    /**
     * POST request
     * @param {string} url - API endpoint
     * @param {object} data - Request body
     * @param {object} config - Axios config
     */
    post: (url, data = {}, config = {}) => axiosInstance.post(url, data, config),

    /**
     * PUT request
     * @param {string} url - API endpoint
     * @param {object} data - Request body
     * @param {object} config - Axios config
     */
    put: (url, data = {}, config = {}) => axiosInstance.put(url, data, config),

    /**
     * PATCH request
     * @param {string} url - API endpoint
     * @param {object} data - Request body
     * @param {object} config - Axios config
     */
    patch: (url, data = {}, config = {}) => axiosInstance.patch(url, data, config),

    /**
     * DELETE request
     * @param {string} url - API endpoint
     * @param {object} config - Axios config
     */
    delete: (url, config = {}) => axiosInstance.delete(url, config),
};

// Export configured axios instance
export default axiosInstance;
