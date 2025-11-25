import { api } from "@/lib/axios";

const buildQueryParams = (params = {}) => {
    const query = {};

    if (params.page) {
        query.page = params.page;
    }

    if (params.limit) {
        query.per_page = params.limit;
    }

    if (params.search) {
        query.search = params.search;
    }

    if (params.status) {
        query.status = params.status;
    }

    if (params.model) {
        query.model = params.model;
    }

    return query;
};

const sanitizePayload = (payload = {}) => {
    const result = {};

    if (payload.code !== undefined) {
        result.code = payload.code;
    }

    if (payload.model !== undefined) {
        result.model = payload.model;
    }

    if (payload.discountType !== undefined) {
        result.discountType = payload.discountType;
    }

    if (payload.price !== undefined) {
        result.price = payload.price;
    }

    if (payload.useTime !== undefined) {
        result.useTime = payload.useTime;
    }

    if (payload.validFrom !== undefined) {
        result.validFrom = payload.validFrom;
    }

    if (payload.validTo !== undefined) {
        result.validTo = payload.validTo;
    }

    if (payload.status !== undefined) {
        result.status = payload.status;
    }

    return result;
};

export const adminPromotionCodesService = {
    async list(params = {}) {
        const response = await api.get("/api/discount-codes", {
            params: buildQueryParams(params),
        });

        return response.data;
    },

    async create(payload = {}) {
        const response = await api.post(
            "/api/discount-codes",
            sanitizePayload(payload)
        );

        return response.data;
    },

    async update(id, payload = {}) {
        const requestBody = {
            ...sanitizePayload(payload),
            _method: "PATCH",
        };

        const response = await api.post(
            `/api/discount-codes/${id}`,
            requestBody
        );

        return response.data;
    },
};

export default adminPromotionCodesService;

