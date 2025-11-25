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
    appendIfDefined(formData, "price", payload.price);
    appendIfDefined(formData, "type", payload.type ?? payload.classified_ad_type_id);
    appendIfDefined(formData, "parent", payload.parent ?? payload.parent_id);
    appendIfDefined(formData, "quoteText", payload.quoteText ?? payload.quote_text);

    const showPriceFlag = normalizeFlag(payload.showPrice ?? payload.show_price);
    if (showPriceFlag !== undefined) {
        formData.append("showPrice", showPriceFlag);
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

export const adCategoriesService = {
    fetchCategories(params = {}) {
        return api.get("/api/admin/classified-ad-category", { params });
    },

    fetchAllCategories() {
        return api.get("/api/admin/classified-ad-category-all");
    },

    fetchCategoryById(id) {
        return api.get(`/api/admin/classified-ad-category/${id}`);
    },

    fetchCategoriesByType(typeId) {
        return api.get("/api/classified-ad-category", { params: { typeId } });
    },

    fetchCategoryChildren(parentId) {
        return api.get("/api/classified-ad-category", { params: { categoryId: parentId } });
    },

    createCategory(payload = {}) {
        const formData = buildPayload(payload);
        return api.post("/api/classified-ad-category", formData, MULTIPART_HEADERS);
    },

    updateCategory(id, changes = {}) {
        const formData = buildPayload(changes);
        return api.post(`/api/classified-ad-category/${id}`, formData, MULTIPART_HEADERS);
    },

    attachAttributeToCategory(payload = {}) {
        return api.post("/api/classified-ad-category/add-attribute", payload);
    },

    detachAttributeFromCategory(payload = {}) {
        return api.post("/api/classified-ad-category/delete-attribute", payload);
    },
};

export default adCategoriesService;


