import { api } from "@/lib/axios";
import { ensureFormData } from "@/services/marketplace/helpers";
import { buildBusinessFormData } from "@/components/businesses/wizard/payload";

const MULTIPART_HEADERS = {
    headers: {
        "Content-Type": "multipart/form-data",
    },
};

export const businessListingsService = {
    fetchAdminListings(params = {}) {
        return api.get("/api/admin/directory", { params });
    },

    fetchPublicListings(params = {}) {
        return api.get("/api/directory", { params });
    },

    fetchAdminListingById(id) {
        return api.get(`/api/admin/directory/${id}`);
    },

    fetchAdminListingOptions() {
        return api.get("/api/admin/directory", {
            params: { list: "all" },
        });
    },

    changeListingOwner(payload = {}) {
        return api.post("/api/admin/directory/change", payload);
    },

    searchUsers(query) {
        return api.get("/api/user/admin/autocomplete", {
            params: { username: query },
        });
    },

    searchLocations(query) {
        return api.get("/api/front/postcode", {
            params: { postcode: query },
        });
    },

    fetchMyListings(params = {}) {
        return api.get("/api/directory/own/my-directory", { params });
    },

    fetchMyListingById(id) {
        return api.get(`/api/directory/own/single/${id}`);
    },

    createListing(payload = {}) {
        // Check if payload uses the new FormData builder
        if (payload && payload.__useFormDataBuilder) {
            const formData = buildBusinessFormData(payload.draft, payload.overrides);
            return api.post("/api/directory", formData, MULTIPART_HEADERS);
        }
        // Fallback to old method for backward compatibility
        const formData = ensureFormData(payload);
        return api.post("/api/directory", formData, MULTIPART_HEADERS);
    },

    updateListing(id, changes = {}) {
        // Check if changes uses the new FormData builder
        if (changes && changes.__useFormDataBuilder) {
            const formData = buildBusinessFormData(changes.draft, changes.overrides);
            formData.append("_method", changes._method ?? "PATCH");
            return api.post(`/api/directory/${id}`, formData, MULTIPART_HEADERS);
        }
        // Fallback to old method for backward compatibility
        const formData = ensureFormData({
            ...changes,
            _method: changes._method ?? "PATCH",
        });

        return api.post(`/api/directory/${id}`, formData, MULTIPART_HEADERS);
    },
};

export default businessListingsService;


