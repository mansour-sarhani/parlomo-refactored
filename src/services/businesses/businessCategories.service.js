import { api } from "@/lib/axios";
import { ensureFormData } from "@/services/marketplace/helpers";

const MULTIPART_HEADERS = {
    headers: {
        "Content-Type": "multipart/form-data",
    },
};

export const businessCategoriesService = {
    fetchCategories(params = {}) {
        return api.get("/api/admin/directory-category", { params });
    },

    fetchPublicCategories(params = {}) {
        return api.get("/api/directory-category", { params });
    },

    fetchCategoryById(id) {
        return api.get(`/api/admin/directory-category/${id}`);
    },

    fetchCategoryOptions() {
        return api.get("/api/admin/directory-category", {
            params: { list: "all" },
        });
    },

    fetchCategoryOptionsForEdit() {
        return api.get("/api/admin/directory-category", {
            params: { list: "allEdit" },
        });
    },

    createCategory(payload = {}) {
        const formData = ensureFormData(payload);
        return api.post("/api/directory-category", formData, MULTIPART_HEADERS);
    },

    updateCategory(id, changes = {}) {
        const formData = ensureFormData({
            ...changes,
            _method: changes._method ?? "PATCH",
        });

        return api.post(`/api/directory-category/${id}`, formData, MULTIPART_HEADERS);
    },
};

export default businessCategoriesService;


