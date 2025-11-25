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
    appendIfDefined(formData, "description", payload.description);
    appendIfDefined(formData, "price", payload.price);

    const normalizedStatus = normalizeFlag(payload.status);
    if (normalizedStatus !== undefined) {
        formData.append("status", normalizedStatus);
    }

    if (isFileLike(payload.image)) {
        formData.append("image", payload.image);
    }

    return formData;
};

export const adTypesService = {
    /**
     * Fetch paginated ad types.
     * @param {object} params
     * @returns {Promise}
     */
    fetchTypes(params = {}) {
        return api.get("/api/admin/classified-ad-type", { params });
    },

    /**
     * Fetch full list of ad types (no pagination).
     * @param {object} params
     * @returns {Promise}
     */
    fetchAllTypes(params = {}) {
        const query = { ...params, list: "all" };
        return api.get("/api/admin/classified-ad-type", { params: query });
    },

    /**
     * Fetch a single ad type by ID.
     * @param {number|string} id
     * @returns {Promise}
     */
    fetchTypeById(id) {
        return api.get(`/api/admin/classified-ad-type/${id}`);
    },

    /**
     * Create a new ad type.
     * @param {object} payload
     * @returns {Promise}
     */
    createType(payload = {}) {
        const formData = buildPayload(payload);
        return api.post("/api/classified-ad-type", formData, MULTIPART_HEADERS);
    },

    /**
     * Update an existing ad type.
     * @param {number|string} id
     * @param {object} changes
     * @returns {Promise}
     */
    updateType(id, changes = {}) {
        const formData = buildPayload(changes);
        return api.post(`/api/classified-ad-type/${id}`, formData, MULTIPART_HEADERS);
    },
};

export default adTypesService;


