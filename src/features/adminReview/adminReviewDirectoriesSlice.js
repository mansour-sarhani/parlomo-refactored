import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminReviewDirectoriesService } from "@/services/review";

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

export const fetchAdminReviewDirectories = createAsyncThunk(
    "adminReviewDirectories/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminReviewDirectoriesService.list(params);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load business listings pending review")
            );
        }
    }
);

export const fetchAdminReviewDirectoryById = createAsyncThunk(
    "adminReviewDirectories/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminReviewDirectoriesService.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load business listing details")
            );
        }
    }
);

export const updateAdminReviewDirectoryStatus = createAsyncThunk(
    "adminReviewDirectories/updateStatus",
    async ({ id, status, reason }, { rejectWithValue }) => {
        try {
            const response = await adminReviewDirectoriesService.updateStatus(id, {
                status,
                reason,
            });
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to update business listing status")
            );
        }
    }
);

const adminReviewDirectoriesSlice = createSlice({
    name: "adminReviewDirectories",
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
            .addCase(fetchAdminReviewDirectories.pending, (state) => {
                state.loadingList = true;
                state.error = null;
            })
            .addCase(fetchAdminReviewDirectories.fulfilled, (state, action) => {
                state.loadingList = false;
                const payload = action.payload || {};
                state.list = payload.data || [];
                state.pagination = parsePagination(
                    payload.meta,
                    state.pagination.limit
                );
            })
            .addCase(fetchAdminReviewDirectories.rejected, (state, action) => {
                state.loadingList = false;
                state.error = action.payload;
            })

            .addCase(fetchAdminReviewDirectoryById.pending, (state) => {
                state.loadingDetail = true;
                state.error = null;
            })
            .addCase(fetchAdminReviewDirectoryById.fulfilled, (state, action) => {
                state.loadingDetail = false;
                state.current = action.payload?.data || action.payload || null;
            })
            .addCase(fetchAdminReviewDirectoryById.rejected, (state, action) => {
                state.loadingDetail = false;
                state.error = action.payload;
            })

            .addCase(updateAdminReviewDirectoryStatus.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateAdminReviewDirectoryStatus.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateAdminReviewDirectoryStatus.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const {
    setFilters: setAdminReviewDirectoriesFilters,
    setPage: setAdminReviewDirectoriesPage,
    clearCurrent: clearAdminReviewDirectory,
    clearError: clearAdminReviewDirectoriesError,
} = adminReviewDirectoriesSlice.actions;

export default adminReviewDirectoriesSlice.reducer;

