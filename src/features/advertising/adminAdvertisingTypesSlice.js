import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminAdvertisingTypesService } from "@/services/advertising";

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
    currentType: null,
    loading: false,
    creating: false,
    updating: false,
    fetchingSingle: false,
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

export const fetchAdminAdvertisingTypes = createAsyncThunk(
    "adminAdvertisingTypes/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminAdvertisingTypesService.list(params);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load advertising types")
            );
        }
    }
);

export const fetchAdminAdvertisingTypeById = createAsyncThunk(
    "adminAdvertisingTypes/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminAdvertisingTypesService.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load advertising type")
            );
        }
    }
);

export const createAdminAdvertisingType = createAsyncThunk(
    "adminAdvertisingTypes/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await adminAdvertisingTypesService.create(payload);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to create advertising type")
            );
        }
    }
);

export const updateAdminAdvertisingType = createAsyncThunk(
    "adminAdvertisingTypes/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await adminAdvertisingTypesService.update(id, changes);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to update advertising type")
            );
        }
    }
);

const adminAdvertisingTypesSlice = createSlice({
    name: "adminAdvertisingTypes",
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
        clearCurrentType(state) {
            state.currentType = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminAdvertisingTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminAdvertisingTypes.fulfilled, (state, action) => {
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
            .addCase(fetchAdminAdvertisingTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchAdminAdvertisingTypeById.pending, (state) => {
                state.fetchingSingle = true;
            })
            .addCase(fetchAdminAdvertisingTypeById.fulfilled, (state, action) => {
                state.fetchingSingle = false;
                state.currentType = action.payload?.data || action.payload || null;
            })
            .addCase(fetchAdminAdvertisingTypeById.rejected, (state, action) => {
                state.fetchingSingle = false;
                state.error = action.payload;
            })

            .addCase(createAdminAdvertisingType.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createAdminAdvertisingType.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createAdminAdvertisingType.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })

            .addCase(updateAdminAdvertisingType.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateAdminAdvertisingType.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateAdminAdvertisingType.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const { setFilters, setPage, clearCurrentType, clearError } =
    adminAdvertisingTypesSlice.actions;

export default adminAdvertisingTypesSlice.reducer;
