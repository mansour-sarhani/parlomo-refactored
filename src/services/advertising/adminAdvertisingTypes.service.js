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

const normalizeStatus = (value) => {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (value === "" || value === "default") {
        return undefined;
    }

    if (typeof value === "string") {
        return value;
    }

    return value ? "1" : "0";
};

export const adminAdvertisingTypesService = {
    async list(params = {}) {
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

        if (params.status) {
            query.status = params.status;
        }

        const response = await api.get("/api/omid-advertising-type/admin-list", {
            params: query,
        });

        return response.data;
    },

    async getById(id) {
        const response = await api.get(`/api/omid-advertising-type/admin-list/${id}`);
        return response.data;
    },

    async create(payload = {}) {
        const formData = new FormData();

        appendIfDefined(formData, "title", payload.title);
        appendIfDefined(formData, "placeType", payload.placeType);

        const status = normalizeStatus(payload.status);
        appendIfDefined(formData, "status", status, { allowEmptyString: true });

        if (payload.image instanceof File || payload.image instanceof Blob) {
            formData.append("image", payload.image);
        }

        const response = await api.post("/api/omid-advertising-type", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    async update(id, payload = {}) {
        const formData = new FormData();

        appendIfDefined(formData, "title", payload.title, { allowEmptyString: true });
        appendIfDefined(formData, "placeType", payload.placeType, { allowEmptyString: true });

        const status = normalizeStatus(payload.status);
        appendIfDefined(formData, "status", status, { allowEmptyString: true });

        if (payload.image instanceof File || payload.image instanceof Blob) {
            formData.append("image", payload.image);
        }

        formData.append("_method", "PATCH");

        const response = await api.post(`/api/omid-advertising-type/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },
};

export default adminAdvertisingTypesService;
