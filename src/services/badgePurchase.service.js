import { api } from "@/lib/axios";

const normalizeArray = (payload) => {
    if (!payload) {
        return [];
    }

    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload.data)) {
        return payload.data;
    }

    return [];
};

const getSettingValue = async (key) => {
    const response = await api.get("/api/setting", {
        params: { key },
    });

    return response.data;
};

export const badgePurchaseService = {
    async getIntroContent() {
        const data = await getSettingValue("Badge");
        return data?.data?.value ?? data?.value ?? "";
    },

    async getBadgePackages() {
        const response = await api.get("/api/badgePackage");
        return normalizeArray(response.data);
    },

    async getUserDirectories() {
        const response = await api.get("/api/directory/own/my-directory", {
            params: { list: "all" },
        });

        return normalizeArray(response.data);
    },

    async purchaseBadge(payload = {}) {
        const response = await api.post("/api/directory/buy/badge", payload);
        return response.data;
    },
};

export default badgePurchaseService;


