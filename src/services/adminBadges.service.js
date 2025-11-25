import { api } from "@/lib/axios";

const appendIfPresent = (formData, key, value, { allowEmptyString = false } = {}) => {
    if (value === undefined || value === null) {
        return;
    }

    if (value === "" && !allowEmptyString) {
        return;
    }

    formData.append(key, value);
};

const normalizeNumeric = (value) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    return Number.isNaN(Number(value)) ? value : Number(value);
};

export const adminBadgesService = {
    async list(params = {}) {
        const query = {};

        if (params.page) {
            query.page = params.page;
        }

        if (params.limit) {
            query.per_page = params.limit;
        }

        return api.get("/api/admin/badge-package", { params: query });
    },

    async getById(id) {
        return api.get(`/api/badgePackage/${id}`);
    },

    async create(payload = {}) {
        const formData = new FormData();

        appendIfPresent(formData, "title", payload.title);
        appendIfPresent(formData, "description", payload.description);
        appendIfPresent(formData, "badgeType", payload.badgeType);

        const days = normalizeNumeric(payload.days);
        if (days !== undefined) {
            formData.append("days", days);
        }

        const extraDays = normalizeNumeric(payload.extraDays);
        if (extraDays !== undefined) {
            formData.append("extraDays", extraDays);
        }

        const price = normalizeNumeric(payload.price);
        if (price !== undefined) {
            formData.append("price", price);
        }

        if (payload.image instanceof File || payload.image instanceof Blob) {
            formData.append("image", payload.image);
        }

        return api.post("/api/badgePackage", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    async update(id, payload = {}) {
        const formData = new FormData();

        appendIfPresent(formData, "title", payload.title, { allowEmptyString: true });
        appendIfPresent(formData, "description", payload.description, { allowEmptyString: true });
        appendIfPresent(formData, "badgeType", payload.badgeType, { allowEmptyString: true });
        appendIfPresent(formData, "status", payload.status, { allowEmptyString: true });

        const days = normalizeNumeric(payload.days);
        if (days !== undefined) {
            formData.append("days", days);
        }

        const extraDays = normalizeNumeric(payload.extraDays);
        if (extraDays !== undefined) {
            formData.append("extraDays", extraDays);
        }

        const price = normalizeNumeric(payload.price);
        if (price !== undefined) {
            formData.append("price", price);
        }

        if (payload.image instanceof File || payload.image instanceof Blob) {
            formData.append("image", payload.image);
        }

        formData.append("_method", "PATCH");

        return api.post(`/api/badgePackage/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};

export default adminBadgesService;


