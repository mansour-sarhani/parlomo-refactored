import { api } from "@/lib/axios";

const formatLegacyDate = (value) => {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};

const normalizeBoolean = (value) => {
    if (value === undefined || value === null) return undefined;

    if (typeof value === "string") {
        if (value === "1" || value.toLowerCase() === "true" || value.toLowerCase() === "active") {
            return "1";
        }

        return "0";
    }

    return value ? "1" : "0";
};

const appendIfDefined = (formData, key, value) => {
    if (value === undefined || value === null) {
        return;
    }

    if (Array.isArray(value)) {
        value.forEach((item) => {
            if (item !== undefined && item !== null) {
                formData.append(`${key}[]`, item);
            }
        });
        return;
    }

    formData.append(key, value);
};

export const eventsService = {
    async getEvents(params = {}) {
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

        return api.get("/api/admin/show-event-list", { params: query });
    },

    async getEventById(id) {
        return api.get(`/api/admin/show-event/${id}`);
    },

    async createEvent(payload = {}) {
        const formData = new FormData();

        appendIfDefined(formData, "title", payload.title);
        appendIfDefined(formData, "category", payload.category);
        appendIfDefined(formData, "description", payload.description);
        appendIfDefined(formData, "contactNumber", payload.contactNumber);
        appendIfDefined(formData, "email", payload.email);
        appendIfDefined(formData, "siteLink", payload.siteLink);
        appendIfDefined(formData, "youtubeLink", payload.youtubeLink);
        appendIfDefined(formData, "postcode", payload.postcode);

        const formattedEventDate = formatLegacyDate(payload.eventDate);
        const formattedValidDate = formatLegacyDate(payload.validDate);

        appendIfDefined(formData, "eventDate", formattedEventDate);
        appendIfDefined(formData, "eventTime", payload.eventTime);
        appendIfDefined(formData, "validDate", formattedValidDate);
        appendIfDefined(formData, "showOnMap", normalizeBoolean(payload.showOnMap));

        const images = Array.isArray(payload.images) ? payload.images : payload.image;
        if (Array.isArray(images)) {
            images.forEach((file) => {
                if (file instanceof File || file instanceof Blob) {
                    formData.append("image[]", file);
                }
            });
        }

        return api.post("/api/event", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    async updateEvent(id, payload = {}) {
        const formData = new FormData();

        appendIfDefined(formData, "title", payload.title);
        appendIfDefined(formData, "category", payload.category);
        appendIfDefined(formData, "description", payload.description);
        appendIfDefined(formData, "contactNumber", payload.contactNumber);
        appendIfDefined(formData, "email", payload.email);
        appendIfDefined(formData, "siteLink", payload.siteLink);
        appendIfDefined(formData, "youtubeLink", payload.youtubeLink);
        appendIfDefined(formData, "postcode", payload.postcode);
        appendIfDefined(formData, "status", payload.status);

        const formattedEventDate = formatLegacyDate(payload.eventDate);
        const formattedValidDate = formatLegacyDate(payload.validDate);

        appendIfDefined(formData, "eventDate", formattedEventDate);
        appendIfDefined(formData, "eventTime", payload.eventTime);
        appendIfDefined(formData, "validDate", formattedValidDate);
        appendIfDefined(formData, "showOnMap", normalizeBoolean(payload.showOnMap));

        if (Array.isArray(payload.newImages)) {
            payload.newImages.forEach((file) => {
                if (file instanceof File || file instanceof Blob) {
                    formData.append("newImage[]", file);
                }
            });
        }

        formData.append("_method", "PATCH");

        return api.post(`/api/admin/review/event/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    async getEventCategories() {
        return api.get("/api/event-Category");
    },
};

export default eventsService;

