import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adTypesService } from "@/services/marketplace";

const initialState = {
    list: [],
    allOptions: [],
    current: null,
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
    links: {
        next: null,
        prev: null,
    },
    filters: {
        search: "",
    },
};

export const fetchAdTypes = createAsyncThunk(
    "marketplace/adTypes/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adTypesService.fetchTypes(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load ad types");
        }
    }
);

export const fetchAllAdTypes = createAsyncThunk(
    "marketplace/adTypes/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adTypesService.fetchAllTypes(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load ad types list");
        }
    }
);

export const fetchAdTypeById = createAsyncThunk(
    "marketplace/adTypes/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await adTypesService.fetchTypeById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load ad type");
        }
    }
);

export const createAdType = createAsyncThunk(
    "marketplace/adTypes/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await adTypesService.createType(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to create ad type");
        }
    }
);

export const updateAdType = createAsyncThunk(
    "marketplace/adTypes/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await adTypesService.updateType(id, changes);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to update ad type");
        }
    }
);

const adTypesSlice = createSlice({
    name: "marketplaceAdTypes",
    initialState,
    reducers: {
        setAdTypeFilters(state, action) {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        setAdTypePage(state, action) {
            state.pagination.page = action.payload;
        },
        clearCurrentAdType(state) {
            state.current = null;
        },
        clearAdTypeError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdTypes.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload || {};
                state.list = payload.data || [];
                const meta = payload.meta || {};
                state.pagination.page = meta.current_page || 1;
                state.pagination.pages = meta.last_page || 0;
                state.pagination.total = meta.total || 0;
                state.pagination.limit = meta.per_page || state.pagination.limit;
                state.links.next = payload.links?.next ?? null;
                state.links.prev = payload.links?.prev ?? null;
            })
            .addCase(fetchAdTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchAllAdTypes.fulfilled, (state, action) => {
                state.allOptions = action.payload?.data || [];
            })
            .addCase(fetchAllAdTypes.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(fetchAdTypeById.pending, (state) => {
                state.fetchingSingle = true;
            })
            .addCase(fetchAdTypeById.fulfilled, (state, action) => {
                state.fetchingSingle = false;
                state.current = action.payload || null;
            })
            .addCase(fetchAdTypeById.rejected, (state) => {
                state.fetchingSingle = false;
            })

            .addCase(createAdType.pending, (state) => {
                state.creating = true;
            })
            .addCase(createAdType.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createAdType.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })

            .addCase(updateAdType.pending, (state) => {
                state.updating = true;
            })
            .addCase(updateAdType.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateAdType.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const { setAdTypeFilters, setAdTypePage, clearCurrentAdType, clearAdTypeError } = adTypesSlice.actions;

export default adTypesSlice.reducer;


