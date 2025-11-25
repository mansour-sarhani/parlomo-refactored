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

export const adminReviewCommentsService = {
    async list(params = {}) {
        const response = await api.get("/api/admin/review/comment", {
            params: buildQueryParams(params),
        });

        return response.data;
    },

    async updateStatus(id, payload = {}) {
        if (!id) {
            throw new Error("Comment id is required");
        }

        const body = {
            status: payload.status,
            reason: payload.reason ?? "Reviewed by admin",
            _method: "PATCH",
        };

        const response = await api.post(`/api/admin/review/comment/${id}`, body);
        return response.data;
    },
};

export default adminReviewCommentsService;

