import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminReviewAdsService } from "@/services/review";

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
    current: null,
    loadingList: false,
    loadingDetail: false,
    updating: false,
    error: null,
    pagination: {
        page: 1,
        pages: 0,
        total: 0,
        limit: 10,
    },
    filters: {},
};

export const fetchAdminReviewAds = createAsyncThunk(
    "adminReviewAds/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminReviewAdsService.list(params);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load ads pending review")
            );
        }
    }
);

export const fetchAdminReviewAdById = createAsyncThunk(
    "adminReviewAds/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminReviewAdsService.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load ad details")
            );
        }
    }
);

export const updateAdminReviewAdStatus = createAsyncThunk(
    "adminReviewAds/updateStatus",
    async ({ id, status, reason }, { rejectWithValue }) => {
        try {
            const response = await adminReviewAdsService.updateStatus(id, {
                status,
                reason,
            });
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to update ad status")
            );
        }
    }
);

const adminReviewAdsSlice = createSlice({
    name: "adminReviewAds",
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
        clearCurrent(state) {
            state.current = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminReviewAds.pending, (state) => {
                state.loadingList = true;
                state.error = null;
            })
            .addCase(fetchAdminReviewAds.fulfilled, (state, action) => {
                state.loadingList = false;
                const payload = action.payload || {};
                state.list = payload.data || [];
                state.pagination = parsePagination(
                    payload.meta,
                    state.pagination.limit
                );
            })
            .addCase(fetchAdminReviewAds.rejected, (state, action) => {
                state.loadingList = false;
                state.error = action.payload;
            })

            .addCase(fetchAdminReviewAdById.pending, (state) => {
                state.loadingDetail = true;
                state.error = null;
            })
            .addCase(fetchAdminReviewAdById.fulfilled, (state, action) => {
                state.loadingDetail = false;
                state.current = action.payload?.data || action.payload || null;
            })
            .addCase(fetchAdminReviewAdById.rejected, (state, action) => {
                state.loadingDetail = false;
                state.error = action.payload;
            })

            .addCase(updateAdminReviewAdStatus.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateAdminReviewAdStatus.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateAdminReviewAdStatus.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const {
    setFilters: setAdminReviewAdsFilters,
    setPage: setAdminReviewAdsPage,
    clearCurrent: clearAdminReviewAd,
    clearError: clearAdminReviewAdsError,
} =
    adminReviewAdsSlice.actions;

export default adminReviewAdsSlice.reducer;

