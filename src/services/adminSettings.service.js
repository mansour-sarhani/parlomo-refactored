"use client";

import { api } from "@/lib/axios";

const normalizeSettingResponse = (response) => {
    if (!response) {
        return "";
    }

    if (typeof response === "string") {
        return response;
    }

    // Legacy endpoints often wrap payloads in { data: { value } }
    if (response?.data && typeof response.data?.value !== "undefined") {
        return response.data.value ?? "";
    }

    if (typeof response?.value !== "undefined") {
        return response.value ?? "";
    }

    return "";
};

const getErrorMessage = (error) => {
    if (!error) {
        return "Unexpected error";
    }

    if (error?.response?.data?.message) {
        return error.response.data.message;
    }

    if (typeof error.message === "string" && error.message.length > 0) {
        return error.message;
    }

    return "Unexpected error";
};

export const adminSettingsService = {
    async fetchSetting(key) {
        try {
            const response = await api.get("/api/setting", {
                params: { key },
            });

            return normalizeSettingResponse(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },

    async updateSetting({ key, value }) {
        try {
            const response = await api.post("/api/setting", { key, value });
            return normalizeSettingResponse(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },
};

export default adminSettingsService;


