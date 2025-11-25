import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminAdvertisingOrdersService } from "@/services/advertising";

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
    currentOrder: null,
    loading: false,
    updating: false,
    error: null,
    pagination: {
        page: 1,
        pages: 0,
        total: 0,
        limit: 10,
    },
    filters: {},
    links: {
        next: null,
        prev: null,
    },
};

export const fetchAdminAdvertisingOrders = createAsyncThunk(
    "adminAdvertisingOrders/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminAdvertisingOrdersService.list(params);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load advertising orders")
            );
        }
    }
);

export const updateAdminAdvertisingOrder = createAsyncThunk(
    "adminAdvertisingOrders/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await adminAdvertisingOrdersService.update(id, changes);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to update advertising order")
            );
        }
    }
);

const adminAdvertisingOrdersSlice = createSlice({
    name: "adminAdvertisingOrders",
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
        setCurrentOrder(state, action) {
            state.currentOrder = action.payload ?? null;
        },
        clearCurrentOrder(state) {
            state.currentOrder = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminAdvertisingOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminAdvertisingOrders.fulfilled, (state, action) => {
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
            .addCase(fetchAdminAdvertisingOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateAdminAdvertisingOrder.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateAdminAdvertisingOrder.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateAdminAdvertisingOrder.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const {
    setFilters,
    setPage,
    setCurrentOrder,
    clearCurrentOrder,
    clearError,
} = adminAdvertisingOrdersSlice.actions;

export default adminAdvertisingOrdersSlice.reducer;
