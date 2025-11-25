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

export const adminReviewDirectoriesService = {
    async list(params = {}) {
        const response = await api.get("/api/admin/review/directory-listing", {
            params: buildQueryParams(params),
        });

        return response.data;
    },

    async getById(id) {
        if (!id) {
            throw new Error("Directory id is required");
        }

        const response = await api.get(`/api/admin/review/directory-listing/${id}`);
        return response.data;
    },

    async updateStatus(id, payload = {}) {
        if (!id) {
            throw new Error("Directory id is required");
        }

        const body = {
            status: payload.status,
            reason: payload.reason ?? "",
            _method: "PATCH",
        };

        const response = await api.post(`/api/admin/review/directory-listing/${id}`, body);
        return response.data;
    },
};

export default adminReviewDirectoriesService;

