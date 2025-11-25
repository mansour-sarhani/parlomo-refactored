import { api } from "@/lib/axios";

const buildQueryParams = (params = {}) => {
    const query = {};

    if (params.page) {
        query.page = params.page;
    }

    if (params.limit) {
        query.per_page = params.limit;
    }

    if (params.name) {
        query.name = params.name;
    }

    if (params.category) {
        query.category = params.category;
    }

    return query;
};

export const adminReviewEventsService = {
    async list(params = {}) {
        const response = await api.get("/api/event/admin/pending-event", {
            params: buildQueryParams(params),
        });

        return response.data;
    },

    async updateStatus(id, payload = {}) {
        if (!id) {
            throw new Error("Event id is required");
        }

        const formData = new FormData();
        formData.append("status", payload.status);
        formData.append("reason", payload.reason ?? "");
        formData.append("_method", "PATCH");

        const response = await api.post(`/api/admin/review/event/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },
};

export default adminReviewEventsService;

