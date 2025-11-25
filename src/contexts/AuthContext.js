'use client';

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { STORAGE_KEYS } from "@/constants/config";
import { authService } from "@/services/auth.service";

const AuthContext = createContext();

const normalizeApiError = (error, fallbackMessage) => {
    if (!error) {
        return {
            message: fallbackMessage,
            errors: null,
            status: undefined,
        };
    }

    const responseData = error?.response?.data;

    return {
        message: responseData?.message || error?.message || fallbackMessage,
        errors: responseData?.errors || error?.errors || null,
        status: error?.response?.status || error?.status,
    };
};

/**
 * AuthProvider Component
 * Manages authentication state across the application
 * Uses httpOnly cookies for token storage (handled by server)
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authData, setAuthData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    // Initialize auth state from local storage (no API call)
    useEffect(() => {
        if (typeof window === "undefined") {
            setLoading(false);
            return;
        }

        try {
            const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setAuthData(parsedUser);
                setUser(parsedUser?.user || {
                    name: parsedUser?.name,
                    email: parsedUser?.email,
                    username: parsedUser?.username,
                });
                setIsAuthenticated(Boolean(parsedUser?.token));
            } else {
                setUser(null);
                setAuthData(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Failed to read auth state from storage:", error);
            setUser(null);
            setAuthData(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    const persistAuthState = useCallback((payload) => {
        if (typeof window === "undefined") {
            return;
        }

        try {
            setAuthData(payload);
            const derivedUser =
                payload?.user || {
                    name: payload?.name,
                    email: payload?.email,
                    username: payload?.username,
                };

            setUser(derivedUser);
            setIsAuthenticated(Boolean(payload?.token));

            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(payload));
        } catch (error) {
            console.error("Failed to persist auth state:", error);
        }
    }, []);

    const clearAuthState = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEYS.USER);
        }

        setAuthData(null);
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    /**
     * Login function
     * @param {object} credentials - Login payload (username/email, password, token)
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const login = async (credentials) => {
        try {
            const data = await authService.login(credentials);

            persistAuthState(data);

            return {
                success: true,
                data,
            };
        } catch (error) {
            const normalizedError = normalizeApiError(error, "An error occurred during login");

            return {
                success: false,
                ...normalizedError,
            };
        }
    };

    const register = async (payload) => {
        try {
            const data = await authService.register(payload);

            persistAuthState(data);

            return {
                success: true,
                data,
            };
        } catch (error) {
            const normalizedError = normalizeApiError(error, "An error occurred during registration");

            return {
                success: false,
                ...normalizedError,
            };
        }
    };

    const loginWithGoogle = async (queryString) => {
        try {
            const data = await authService.loginWithGoogle(queryString);

            persistAuthState(data);

            return {
                success: true,
                data,
            };
        } catch (error) {
            const normalizedError = normalizeApiError(error, "Google authentication failed");

            return {
                success: false,
                ...normalizedError,
            };
        }
    };

    /**
     * Logout function
     * Clears httpOnly cookie on server and clears local state
     */
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Always clear local state, even if API call fails
            clearAuthState();

            // Redirect to login
            router.push("/login");
        }
    };

    /**
     * Update user data
     * @param {object} userData - Updated user data
     */
    const updateUser = (userData) => {
        setUser(userData);
        setAuthData((prev) => {
            const updated = {
                ...prev,
                user: userData,
            };

            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
            }

            return updated;
        });
    };

    const value = {
        user,
        authData,
        loading,
        isAuthenticated,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * Access authentication context
 * @returns {object} Auth context value
 */
export function useAuth() {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
}

