import { api } from "@/lib/axios";

const appendIfDefined = (formData, key, value, { allowEmptyString = false } = {}) => {
    if (value === undefined || value === null) {
        return;
    }

    if (value === "" && !allowEmptyString) {
        return;
    }

    formData.append(key, value);
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
        if (value === "1" || value.toLowerCase() === "true" || value.toLowerCase() === "yes") {
            return "1";
        }

        if (value === "0" || value.toLowerCase() === "false" || value.toLowerCase() === "no") {
            return "0";
        }
    }

    return value ? "1" : "0";
};

export const adminAdvertisingOrdersService = {
    async list(params = {}) {
        const query = {};

        if (params.page) {
            query.page = params.page;
        }

        if (params.limit) {
            query.per_page = params.limit;
        }

        if (params.status) {
            query.status = params.status;
        }

        if (params.search) {
            query.search = params.search;
        }

        const response = await api.get("/api/omid-advertising-order/admin-list", {
            params: query,
        });

        return response.data;
    },

    async update(id, payload = {}) {
        const formData = new FormData();

        appendIfDefined(formData, "title", payload.title, { allowEmptyString: true });
        appendIfDefined(formData, "description", payload.description, { allowEmptyString: true });
        appendIfDefined(formData, "link", payload.link, { allowEmptyString: true });

        const formattedStart = formatLegacyDate(payload.startDate);
        const formattedEnd = formatLegacyDate(payload.endDate);

        appendIfDefined(formData, "startDate", formattedStart, { allowEmptyString: true });
        appendIfDefined(formData, "endDate", formattedEnd, { allowEmptyString: true });

        const socialMedia = normalizeToggle(payload.socialMedia);
        appendIfDefined(formData, "socialMedia", socialMedia, { allowEmptyString: true });
        appendIfDefined(formData, "status", payload.status, { allowEmptyString: true });

        if (payload.file instanceof File || payload.file instanceof Blob) {
            formData.append("file", payload.file);
        }

        formData.append("_method", "PATCH");

        const response = await api.post(`/api/omid-advertising-order/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },
};

export default adminAdvertisingOrdersService;
