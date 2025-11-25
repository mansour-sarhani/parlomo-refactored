import { api } from "@/lib/axios";

export const businessBadgesService = {
    fetchPackages(type) {
        return api.get("/api/badgePackage", {
            params: type ? { type } : undefined,
        });
    },

    purchaseBadge(payload = {}) {
        return api.post("/api/directory/buy/badge", payload);
    },
};

export default businessBadgesService;


