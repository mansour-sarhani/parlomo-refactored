import { api } from "@/lib/axios";

const normalizeStatus = (value) => {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value === "string") {
        return value === "1" || value.toLowerCase() === "active" ? "1" : "0";
    }

    return value ? "1" : "0";
};

const appendIfDefined = (formData, key, value) => {
    if (value === undefined || value === null) {
        return;
    }

    formData.append(key, value);
};

export const eventCategoriesService = {
    async getCategories(params = {}) {
        const query = {};

        if (params.page) {
            query.page = params.page;
        }

        if (params.limit) {
            query.per_page = params.limit;
        }

        if (params.search) {
            query.search = params.search;
        }

        return api.get("/api/admin/show-category-list", { params: query });
    },

    async getCategoryById(id) {
        return api.get(`/api/admin/show-category/${id}`);
    },

    async createCategory(payload = {}) {
        const formData = new FormData();

        appendIfDefined(formData, "title", payload.title);

        if (payload.image instanceof File || payload.image instanceof Blob) {
            formData.append("image", payload.image);
        }

        return api.post("/api/event-Category", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    async updateCategory(id, payload = {}) {
        const formData = new FormData();

        appendIfDefined(formData, "title", payload.title);

        const normalizedStatus = normalizeStatus(payload.status);
        if (normalizedStatus !== undefined) {
            formData.append("status", normalizedStatus);
        }

        if (payload.image instanceof File || payload.image instanceof Blob) {
            formData.append("image", payload.image);
        }

        formData.append("_method", "PATCH");

        return api.post(`/api/event-Category/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};

export default eventCategoriesService;

