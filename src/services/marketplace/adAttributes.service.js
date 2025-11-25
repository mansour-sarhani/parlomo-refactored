import { api } from "@/lib/axios";
import { appendIfDefined, isFileLike, normalizeFlag } from "@/services/marketplace/helpers";

const MULTIPART_HEADERS = {
    headers: {
        "Content-Type": "multipart/form-data",
    },
};

const buildPayload = (payload = {}) => {
    const formData = new FormData();

    appendIfDefined(formData, "title", payload.title);
    appendIfDefined(formData, "name", payload.name);
    appendIfDefined(formData, "type", payload.type);
    appendIfDefined(formData, "description", payload.description);

    const requiredFlag = normalizeFlag(payload.required);
    if (requiredFlag !== undefined) {
        formData.append("required", requiredFlag);
    }

    const statusFlag = normalizeFlag(payload.status);
    if (statusFlag !== undefined) {
        formData.append("status", statusFlag);
    }

    if (isFileLike(payload.image)) {
        formData.append("image", payload.image);
    }

    return formData;
};

export const adAttributesService = {
    fetchAttributes(params = {}) {
        return api.get("/api/admin/classified-ad-attribute", { params });
    },

    fetchAllAttributes(params = {}) {
        const query = { ...params, list: "all" };
        return api.get("/api/admin/classified-ad-attribute", { params: query });
    },

    fetchAttributeById(id) {
        return api.get(`/api/admin/classified-ad-attribute/${id}`);
    },

    fetchAttributesForCategory(categoryId) {
        return api.get(`/api/classified-ad-category/get-attribute/${categoryId}`);
    },

    createAttribute(payload = {}) {
        const formData = buildPayload(payload);
        return api.post("/api/classified-ad-attribute", formData, MULTIPART_HEADERS);
    },

    updateAttribute(id, changes = {}) {
        const formData = buildPayload(changes);
        return api.post(`/api/classified-ad-attribute/${id}`, formData, MULTIPART_HEADERS);
    },
};

export default adAttributesService;


