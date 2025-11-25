import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { userAdvertisingService } from "@/services/advertising";

const normalizeError = (error, fallbackMessage) => {
    if (!error) {
        return fallbackMessage;
    }

    const responseData = error.response?.data;
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
    loading: false,
    error: null,
    pagination: {
        page: 1,
        pages: 0,
        total: 0,
        limit: 10,
    },
    links: {
        next: null,
        prev: null,
    },
};

export const fetchUserAdvertisingOrders = createAsyncThunk(
    "userAdvertisingOrders/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await userAdvertisingService.listOrders(params);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load advertising orders")
            );
        }
    }
);

const userAdvertisingOrdersSlice = createSlice({
    name: "userAdvertisingOrders",
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
            .addCase(fetchUserAdvertisingOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserAdvertisingOrders.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload || {};
                state.list = payload.data || [];
                state.pagination = parsePagination(
                    payload.meta,
                    state.pagination.limit
                );
                state.links.next = payload.links?.next ?? null;
                state.links.prev = payload.links?.prev ?? null;
            })
            .addCase(fetchUserAdvertisingOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setPage, clearError } = userAdvertisingOrdersSlice.actions;

export default userAdvertisingOrdersSlice.reducer;
