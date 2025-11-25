import { api } from "@/lib/axios";

const buildQueryParams = (params = {}) => {
    const query = {};

    if (params.page) {
        query.page = params.page;
    }

    if (params.limit) {
        query.per_page = params.limit;
    }

    return query;
};

export const adminCommentsService = {
    /**
     * Get directory comments for admin to reply to
     * @param {object} params - Query parameters (page, limit)
     * @returns {Promise} API response with comments data
     */
    async list(params = {}) {
        const response = await api.get("/api/reviews", {
            params: buildQueryParams(params),
        });

        return response.data;
    },

    /**
     * Reply to a directory comment
     * @param {object} data - Reply data { body, parent }
     * @returns {Promise} API response
     */
    async reply(data) {
        if (!data.body || !data.parent) {
            throw new Error("Body and parent comment ID are required");
        }

        const response = await api.post("/api/reviews/directory/replay", data);
        return response.data;
    },
};

export default adminCommentsService;

