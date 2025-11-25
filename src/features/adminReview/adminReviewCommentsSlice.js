import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminReviewCommentsService } from "@/services/review";

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
};

export const fetchAdminReviewComments = createAsyncThunk(
    "adminReviewComments/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminReviewCommentsService.list(params);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load comments pending review")
            );
        }
    }
);

export const updateAdminReviewCommentStatus = createAsyncThunk(
    "adminReviewComments/updateStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await adminReviewCommentsService.updateStatus(id, {
                status,
            });
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to update comment status")
            );
        }
    }
);

const adminReviewCommentsSlice = createSlice({
    name: "adminReviewComments",
    initialState,
    reducers: {
        setPage(state, action) {
            state.pagination.page = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminReviewComments.pending, (state) => {
                state.loadingList = true;
                state.error = null;
            })
            .addCase(fetchAdminReviewComments.fulfilled, (state, action) => {
                state.loadingList = false;
                const payload = action.payload || {};
                state.list = payload.data || [];
                state.pagination = parsePagination(
                    payload.meta,
                    state.pagination.limit
                );
            })
            .addCase(fetchAdminReviewComments.rejected, (state, action) => {
                state.loadingList = false;
                state.error = action.payload;
            })

            .addCase(updateAdminReviewCommentStatus.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateAdminReviewCommentStatus.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateAdminReviewCommentStatus.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const {
    setPage: setAdminReviewCommentsPage,
    clearError: clearAdminReviewCommentsError,
} = adminReviewCommentsSlice.actions;

export default adminReviewCommentsSlice.reducer;

