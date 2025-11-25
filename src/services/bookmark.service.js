import { api } from "@/lib/axios";

/**
 * Bookmark Service - encapsulates legacy bookmark endpoints
 *
 * The Laravel backend exposes three bookmark resources (ads, directories, events)
 * following the `{ data, links, meta }` pagination contract.
 */
export const bookmarkService = {
    /**
     * Fetch bookmarked classified ads for the authenticated user.
     *
     * @param {Object} params
     * @param {number} [params.page]
     * @returns {Promise<import("axios").AxiosResponse>}
     */
    getBookmarkedAds: async (params = {}) => {
        return api.get("/api/bookmark/ads", {
            params: normalizeListParams(params),
        });
    },

    /**
     * Fetch bookmarked business directories for the authenticated user.
     */
    getBookmarkedDirectories: async (params = {}) => {
        return api.get("/api/bookmark/directory", {
            params: normalizeListParams(params),
        });
    },

    /**
     * Fetch bookmarked events for the authenticated user.
     */
    getBookmarkedEvents: async (params = {}) => {
        return api.get("/api/bookmark/event", {
            params: normalizeListParams(params),
        });
    },

    /**
     * Toggle classified ad bookmark state.
     *
     * @param {number|string} adId
     */
    toggleAdBookmark: async (adId) => {
        return api.post("/api/bookmark/ads", { ads: adId });
    },

    /**
     * Toggle directory bookmark state.
     */
    toggleDirectoryBookmark: async (directoryId) => {
        return api.post("/api/bookmark/directory", { directory: directoryId });
    },

    /**
     * Toggle event bookmark state.
     */
    toggleEventBookmark: async (eventId) => {
        return api.post("/api/bookmark/event", { event: eventId });
    },
};

function normalizeListParams(params = {}) {
    const payload = {};

    if (params.page) {
        payload.page = params.page;
    }

    if (params.limit) {
        payload.per_page = params.limit;
    }

    return payload;
}


