import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminReviewEventsService } from "@/services/review";

const normalizeError = (error, fallbackMessage) => {
    if (!error) {
        return fallbackMessage;
    }

    if (typeof error === "string") {
        return error;
    }

    if (error.message && !error.response) {
        return error.message;
    }

    const responseData = error.response?.data || error;
    return (
        responseData?.message ||
        responseData?.error ||
        responseData?.errors?.[0] ||
        error.message ||
        fallbackMessage
    );
};

const parsePagination = (meta = {}, fallbackLimit = 10) => ({
    page: meta.current_page || 1,
    pages: meta.last_page || 0,
    total: meta.total || 0,
    limit: meta.per_page || fallbackLimit,
});

const initialState = {
    list: [],
    loadingList: false,
    updating: false,
    error: null,
    pagination: {
        page: 1,
        pages: 0,
        total: 0,
        limit: 10,
    },
    filters: {
        name: "",
        category: "",
    },
};

export const fetchAdminReviewEvents = createAsyncThunk(
    "adminReviewEvents/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminReviewEventsService.list(params);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load events pending review")
            );
        }
    }
);

export const updateAdminReviewEventStatus = createAsyncThunk(
    "adminReviewEvents/updateStatus",
    async ({ id, status, reason }, { rejectWithValue }) => {
        try {
            const response = await adminReviewEventsService.updateStatus(id, {
                status,
                reason,
            });
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to update event status")
            );
        }
    }
);

const adminReviewEventsSlice = createSlice({
    name: "adminReviewEvents",
    initialState,
    reducers: {
        setFilters(state, action) {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        setPage(state, action) {
            state.pagination.page = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminReviewEvents.pending, (state) => {
                state.loadingList = true;
                state.error = null;
            })
            .addCase(fetchAdminReviewEvents.fulfilled, (state, action) => {
                state.loadingList = false;
                const payload = action.payload || {};
                state.list = payload.data || [];
                state.pagination = parsePagination(
                    payload.meta,
                    state.pagination.limit
                );
            })
            .addCase(fetchAdminReviewEvents.rejected, (state, action) => {
                state.loadingList = false;
                state.error = action.payload;
            })

            .addCase(updateAdminReviewEventStatus.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateAdminReviewEventStatus.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateAdminReviewEventStatus.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const {
    setFilters: setAdminReviewEventsFilters,
    setPage: setAdminReviewEventsPage,
    clearError: clearAdminReviewEventsError,
} = adminReviewEventsSlice.actions;

export default adminReviewEventsSlice.reducer;

