import { api } from "@/lib/axios";

const buildInvoiceQuery = (params = {}) => {
    const query = {};

    if (params.page) {
        query.page = params.page;
    }

    if (params.limit) {
        query.per_page = params.limit;
    }

    if (params.startDate) {
        query.startDate = params.startDate;
    }

    if (params.endDate) {
        query.endDate = params.endDate;
    }

    return query;
};

export const reportsService = {
    listAdminInvoices(params = {}) {
        return api.get("/api/report/admin/my-invoice", {
            params: buildInvoiceQuery(params),
        });
    },

    listUserInvoices(params = {}) {
        return api.get("/api/report/my-invoice", {
            params: buildInvoiceQuery(params),
        });
    },
};

export default reportsService;

