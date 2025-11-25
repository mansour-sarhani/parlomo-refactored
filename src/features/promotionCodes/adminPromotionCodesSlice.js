import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminPromotionCodesService } from "@/services/promotionCodes.service";

const normalizeError = (error, fallbackMessage) => {
    if (!error) {
        return fallbackMessage;
    }

    const responseData = error.response?.data ?? error.data;

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
    currentPromotionCode: null,
    loading: false,
    creating: false,
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

export const fetchAdminPromotionCodes = createAsyncThunk(
    "adminPromotionCodes/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminPromotionCodesService.list(params);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load promotion codes")
            );
        }
    }
);

export const createAdminPromotionCode = createAsyncThunk(
    "adminPromotionCodes/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await adminPromotionCodesService.create(payload);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to create promotion code")
            );
        }
    }
);

export const updateAdminPromotionCode = createAsyncThunk(
    "adminPromotionCodes/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await adminPromotionCodesService.update(
                id,
                changes
            );
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to update promotion code")
            );
        }
    }
);

const adminPromotionCodesSlice = createSlice({
    name: "adminPromotionCodes",
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
        setCurrentPromotionCode(state, action) {
            state.currentPromotionCode = action.payload ?? null;
        },
        clearCurrentPromotionCode(state) {
            state.currentPromotionCode = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminPromotionCodes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminPromotionCodes.fulfilled, (state, action) => {
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
            .addCase(fetchAdminPromotionCodes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createAdminPromotionCode.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createAdminPromotionCode.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createAdminPromotionCode.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })
            .addCase(updateAdminPromotionCode.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateAdminPromotionCode.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateAdminPromotionCode.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const {
    setFilters,
    setPage,
    setCurrentPromotionCode,
    clearCurrentPromotionCode,
    clearError,
} = adminPromotionCodesSlice.actions;

export default adminPromotionCodesSlice.reducer;

