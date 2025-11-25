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

const formatLegacyDate = (value) => {
    if (!value) {
        return undefined;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};

const normalizeToggle = (value) => {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value === "string") {
        if (value === "1" || value.toLowerCase() === "true") {
            return "1";
        }

        if (value === "0" || value.toLowerCase() === "false") {
            return "0";
        }
    }

    return value ? "1" : "0";
};

const fetchSettingValue = async (key) => {
    const response = await api.get("/api/setting", {
        params: { key },
    });

    return response.data;
};

export const userAdvertisingService = {
    async getIntroContent() {
        const data = await fetchSettingValue("Advertising");
        return data?.data?.value ?? data?.value ?? "";
    },

    async listTypes() {
        const response = await api.get("/api/omid-advertising-type", {
            params: { list: "all" },
        });

        return normalizeArray(response.data);
    },

    async listPackagesByType(typeId, params = {}) {
        const query = {
            ...params,
            typeId,
        };

        const response = await api.get("/api/omid-advertising", {
            params: query,
        });

        return normalizeArray(response.data);
    },

    async purchase(payload = {}) {
        const formData = new FormData();

        if (payload.packageId) {
            formData.append("package", payload.packageId);
        }

        if (payload.file instanceof File || payload.file instanceof Blob) {
            formData.append("file", payload.file);
        }

        const formattedStart = formatLegacyDate(payload.startDate);
        if (formattedStart) {
            formData.append("startDate", formattedStart);
        }

        if (payload.link) {
            formData.append("link", payload.link);
        }

        if (payload.title) {
            formData.append("title", payload.title);
        }

        if (payload.description) {
            formData.append("description", payload.description);
        }

        const socialMedia = normalizeToggle(payload.socialMedia);
        if (socialMedia !== undefined) {
            formData.append("socialMedia", socialMedia);
        }

        const response = await api.post("/api/omid-advertising-order/buy", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    async listOrders(params = {}) {
        const query = {};

        if (params.page) {
            query.page = params.page;
        }

        if (params.limit) {
            query.per_page = params.limit;
        }

        const response = await api.get("/api/omid-advertising-order/own-list", {
            params: query,
        });

        return response.data;
    },
};

export default userAdvertisingService;
