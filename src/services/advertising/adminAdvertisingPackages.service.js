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

const normalizeNumeric = (value) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const numeric = Number(value);
    return Number.isNaN(numeric) ? value : numeric;
};

const normalizeStatus = (value) => {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (value === "") {
        return undefined;
    }

    if (typeof value === "string") {
        return value;
    }

    return value ? "Active" : "Pending";
};

export const adminAdvertisingPackagesService = {
    async list(params = {}) {
        const query = {};

        if (params.page) {
            query.page = params.page;
        }

        if (params.limit) {
            query.per_page = params.limit;
        }

        if (params.typeId) {
            query.typeId = params.typeId;
        }

        if (params.status) {
            query.status = params.status;
        }

        const response = await api.get("/api/omid-advertising/admin-list", {
            params: query,
        });

        return response.data;
    },

    async create(payload = {}) {
        const formData = new FormData();

        appendIfDefined(formData, "title", payload.title);
        appendIfDefined(formData, "advertisingType", payload.advertisingType);

        const days = normalizeNumeric(payload.days);
        const price = normalizeNumeric(payload.price);
        const socialMediaPrice = normalizeNumeric(payload.socialMedia);
        const width = normalizeNumeric(payload.width);
        const height = normalizeNumeric(payload.height);

        appendIfDefined(formData, "days", days);
        appendIfDefined(formData, "price", price);
        appendIfDefined(formData, "socialMedia", socialMediaPrice);
        appendIfDefined(formData, "width", width);
        appendIfDefined(formData, "height", height);
        appendIfDefined(formData, "description", payload.description, { allowEmptyString: true });

        if (payload.image instanceof File || payload.image instanceof Blob) {
            formData.append("image", payload.image);
        }

        const response = await api.post("/api/omid-advertising", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    async update(id, payload = {}) {
        const formData = new FormData();

        appendIfDefined(formData, "title", payload.title, { allowEmptyString: true });
        appendIfDefined(formData, "advertisingType", payload.advertisingType, { allowEmptyString: true });

        const days = normalizeNumeric(payload.days);
        const price = normalizeNumeric(payload.price);
        const socialMediaPrice = normalizeNumeric(payload.socialMedia);
        const width = normalizeNumeric(payload.width);
        const height = normalizeNumeric(payload.height);

        appendIfDefined(formData, "days", days);
        appendIfDefined(formData, "price", price);
        appendIfDefined(formData, "socialMedia", socialMediaPrice);
        appendIfDefined(formData, "width", width);
        appendIfDefined(formData, "height", height);
        appendIfDefined(formData, "description", payload.description, { allowEmptyString: true });

        const status = normalizeStatus(payload.status);
        appendIfDefined(formData, "status", status, { allowEmptyString: true });

        if (payload.image instanceof File || payload.image instanceof Blob) {
            formData.append("image", payload.image);
        }

        formData.append("_method", "PATCH");

        const response = await api.post(`/api/omid-advertising/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },
};

export default adminAdvertisingPackagesService;
