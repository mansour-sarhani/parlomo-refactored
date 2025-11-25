import { api } from "@/lib/axios";
import { businessListingsService } from "@/services/businesses/businessListings.service";
import { businessBadgesService } from "@/services/businesses/businessBadges.service";

export const businessWizardService = {
    verifyPostcode(payload) {
        return api.post("/api/postcode/verify", payload);
    },

    searchLiveLocation(query) {
        if (!query) {
            return Promise.resolve({ data: { locationList: [] } });
        }

        return api.get("/api/front/postcode", {
            params: { postcode: query },
        });
    },

    checkCategoryChildren(categoryId) {
        return api.get("/api/directory-category", {
            params: { categoryId },
        });
    },

    createBusiness(payload) {
        return businessListingsService.createListing(payload);
    },

    updateBusiness(id, changes) {
        return businessListingsService.updateListing(id, changes);
    },

    verifyPhone(payload) {
        return api.post("/api/classified-ad/verify-ads", payload);
    },

    resendVerificationCode(directoryId) {
        return api.post("/api/classified-ad/new/verify-code", { directoryId });
    },

    fetchOwnBusiness(id) {
        return businessListingsService.fetchMyListingById(id);
    },

    fetchOwnBusinesses(params = {}) {
        return businessListingsService.fetchMyListings(params);
    },

    purchaseBadge(payload) {
        return businessBadgesService.purchaseBadge(payload);
    },
};

export default businessWizardService;


