import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminCommentsService } from "@/services/adminComments.service";

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

const fallbackLimit = 10;

const parsePagination = (meta = {}) => ({
    page: meta.current_page || 1,
    pages: meta.last_page || 0,
    total: meta.total || 0,
    limit: meta.per_page || fallbackLimit,
});

const initialState = {
    list: [],
    loadingList: false,
    replying: false,
    error: null,
    pagination: {
        page: 1,
        pages: 0,
        total: 0,
        limit: 10,
    },
};

export const fetchAdminComments = createAsyncThunk(
    "adminComments/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminCommentsService.list(params);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load directory comments")
            );
        }
    }
);

export const replyToComment = createAsyncThunk(
    "adminComments/reply",
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminCommentsService.reply(data);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to reply to comment")
            );
        }
    }
);

const adminCommentsSlice = createSlice({
    name: "adminComments",
    initialState,
    reducers: {
        setPage: (state, action) => {
            state.pagination.page = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch comments
            .addCase(fetchAdminComments.pending, (state) => {
                state.loadingList = true;
                state.error = null;
            })
            .addCase(fetchAdminComments.fulfilled, (state, action) => {
                state.loadingList = false;
                state.list = action.payload.data || [];
                state.pagination = parsePagination(action.payload.meta);
                state.error = null;
            })
            .addCase(fetchAdminComments.rejected, (state, action) => {
                state.loadingList = false;
                state.error = action.payload?.message || "Failed to load comments";
            })
            // Reply to comment
            .addCase(replyToComment.pending, (state) => {
                state.replying = true;
                state.error = null;
            })
            .addCase(replyToComment.fulfilled, (state) => {
                state.replying = false;
                state.error = null;
            })
            .addCase(replyToComment.rejected, (state, action) => {
                state.replying = false;
                state.error = action.payload?.message || "Failed to reply to comment";
            });
    },
});

export const { setPage, clearError } = adminCommentsSlice.actions;
export default adminCommentsSlice.reducer;

