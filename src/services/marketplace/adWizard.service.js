import { api } from "@/lib/axios";
import { ensureFormData } from "@/services/marketplace/helpers";

const MULTIPART_HEADERS = {
    headers: {
        "Content-Type": "multipart/form-data",
    },
};

export const adWizardService = {
    verifyPostcode(postcode) {
        return api.post("/api/postcode/verify", { postcode });
    },

    searchLiveLocation(postcode) {
        return api.get("/api/front/postcode", { params: { postcode } });
    },

    createDraftListing(payload = {}) {
        const formData = ensureFormData(payload);
        return api.post("/api/classified-ad", formData, MULTIPART_HEADERS);
    },

    verifyListingPhone(payload = {}) {
        return api.post("/api/classified-ad/verify-ads", payload);
    },

    resendVerificationCode(adsId) {
        return api.post("/api/classified-ad/new/verify-code", { adsId });
    },

    fetchListingForEdit(id) {
        return api.get(`/api/classified-ad/own/single/${id}`);
    },
};

export default adWizardService;


