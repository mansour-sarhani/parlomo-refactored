import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminBadgesService } from "@/services/adminBadges.service";

const initialState = {
    list: [],
    currentBadge: null,
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

const normalizeError = (error, fallbackMessage) => {
    if (!error) {
        return fallbackMessage;
    }

    const responseData = error.response?.data;
    return (
        responseData?.message ||
        responseData?.error ||
        error.message ||
        fallbackMessage
    );
};

export const fetchAdminBadges = createAsyncThunk(
    "adminBadges/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminBadgesService.list(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load badge packages")
            );
        }
    }
);

export const fetchAdminBadgeById = createAsyncThunk(
    "adminBadges/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminBadgesService.getById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load badge package")
            );
        }
    }
);

export const createAdminBadge = createAsyncThunk(
    "adminBadges/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await adminBadgesService.create(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to create badge package")
            );
        }
    }
);

export const updateAdminBadge = createAsyncThunk(
    "adminBadges/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await adminBadgesService.update(id, changes);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to update badge package")
            );
        }
    }
);

const parsePagination = (meta = {}, fallbackLimit = 10) => ({
    page: meta.current_page || 1,
    pages: meta.last_page || 0,
    total: meta.total || 0,
    limit: meta.per_page || fallbackLimit,
});

const adminBadgesSlice = createSlice({
    name: "adminBadges",
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
        clearCurrentBadge(state) {
            state.currentBadge = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminBadges.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminBadges.fulfilled, (state, action) => {
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
            .addCase(fetchAdminBadges.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchAdminBadgeById.pending, (state) => {
                state.fetchingSingle = true;
            })
            .addCase(fetchAdminBadgeById.fulfilled, (state, action) => {
                state.fetchingSingle = false;
                state.currentBadge = action.payload || null;
            })
            .addCase(fetchAdminBadgeById.rejected, (state, action) => {
                state.fetchingSingle = false;
                state.error = action.payload;
            })

            .addCase(createAdminBadge.pending, (state) => {
                state.creating = true;
            })
            .addCase(createAdminBadge.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createAdminBadge.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })

            .addCase(updateAdminBadge.pending, (state) => {
                state.updating = true;
            })
            .addCase(updateAdminBadge.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateAdminBadge.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const { setFilters, setPage, clearCurrentBadge, clearError } =
    adminBadgesSlice.actions;

export default adminBadgesSlice.reducer;


