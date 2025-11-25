import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "@/constants/config";

const LEGACY_API_BASE_URL =
    process.env.NEXT_PUBLIC_URL_KEY ||
    process.env.NEXT_PUBLIC_LIVE_URL_KEY ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    API_BASE_URL;

const authHttp = axios.create({
    baseURL: `${LEGACY_API_BASE_URL.replace(/\/$/, "")}`,
    withCredentials: false,
});

authHttp.interceptors.request.use((config) => {
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
            console.error("Failed to attach auth token", error);
        }
    }

    return config;
});

export const authService = {
    login: async (payload) => {
        const response = await authHttp.post("/api/login", payload);
        return response.data;
    },

    register: async (payload) => {
        const response = await authHttp.post("/api/register", payload);
        return response.data;
    },

    loginWithGoogle: async (queryString) => {
        const response = await authHttp.get(`/api/auth/callback?${queryString}`);
        return response.data;
    },

    fetchGoogleAuthUrl: async () => {
        const response = await authHttp.get("/api/auth");
        return response.data;
    },

    logout: async () => {
        try {
            const response = await authHttp.get("/api/user/logout");
            return response.data;
        } catch (error) {
            if (error?.response?.status === 401) {
                return {
                    status: 401,
                    message: error?.response?.data?.message || "Unauthenticated.",
                };
            }
            return Promise.reject({
                status: error?.response?.status || 0,
                message: error?.response?.data?.message || error?.message || "Logout failed",
                errors: error?.response?.data?.errors || null,
            });
        }
    },
};

export default authService;

