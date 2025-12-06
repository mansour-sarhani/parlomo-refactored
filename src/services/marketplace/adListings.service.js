import { api } from "@/lib/axios";
import { ensureFormData } from "@/services/marketplace/helpers";

const MULTIPART_HEADERS = {
    headers: {
        "Content-Type": "multipart/form-data",
    },
};

export const adListingsService = {
    fetchPublicListings(params = {}) {
        return api.get("/api/classified-ad", { params });
    },

    fetchAdminListings(params = {}) {
        return api.get("/api/admin/classified-ad", { params });
    },

    fetchAdminListingById(id) {
        return api.get(`/api/admin/classified-ad/${id}`);
    },

    fetchUserListings(params = {}) {
        return api.get("/api/classified-ad/own/list", { params });
    },

    fetchUserListingById(id) {
        return api.get(`/api/classified-ad/own/single/${id}`);
    },

    searchAdminListings(params = {}) {
        return api.get("/api/admin/classified-ad", { params });
    },

    createListing(payload = {}) {
        const formData = ensureFormData(payload);
        return api.post("/api/classified-ad", formData, MULTIPART_HEADERS);
    },

    updateListing(id, changes = {}) {
        const formData = ensureFormData(changes);
        return api.post(`/api/classified-ad/${id}`, formData, MULTIPART_HEADERS);
    },
};

export default adListingsService;


