import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminAdvertisingPackagesService } from "@/services/advertising";

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
    currentPackage: null,
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

export const fetchAdminAdvertisingPackages = createAsyncThunk(
    "adminAdvertisingPackages/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminAdvertisingPackagesService.list(params);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load advertising packages")
            );
        }
    }
);

export const createAdminAdvertisingPackage = createAsyncThunk(
    "adminAdvertisingPackages/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await adminAdvertisingPackagesService.create(payload);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to create advertising package")
            );
        }
    }
);

export const updateAdminAdvertisingPackage = createAsyncThunk(
    "adminAdvertisingPackages/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await adminAdvertisingPackagesService.update(id, changes);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to update advertising package")
            );
        }
    }
);

const adminAdvertisingPackagesSlice = createSlice({
    name: "adminAdvertisingPackages",
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
        setCurrentPackage(state, action) {
            state.currentPackage = action.payload ?? null;
        },
        clearCurrentPackage(state) {
            state.currentPackage = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminAdvertisingPackages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminAdvertisingPackages.fulfilled, (state, action) => {
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
            .addCase(fetchAdminAdvertisingPackages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createAdminAdvertisingPackage.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createAdminAdvertisingPackage.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createAdminAdvertisingPackage.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })

            .addCase(updateAdminAdvertisingPackage.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateAdminAdvertisingPackage.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateAdminAdvertisingPackage.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const {
    setFilters,
    setPage,
    setCurrentPackage,
    clearCurrentPackage,
    clearError,
} = adminAdvertisingPackagesSlice.actions;

export default adminAdvertisingPackagesSlice.reducer;
