import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { eventCategoriesService } from "@/services/eventCategories.service";

const initialState = {
    list: [],
    currentCategory: null,
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
    filters: {
        search: "",
    },
    links: {
        next: null,
        prev: null,
    },
};

export const fetchEventCategories = createAsyncThunk(
    "eventCategories/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await eventCategoriesService.getCategories(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load event categories");
        }
    }
);

export const fetchEventCategoryById = createAsyncThunk(
    "eventCategories/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await eventCategoriesService.getCategoryById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load category");
        }
    }
);

export const createEventCategory = createAsyncThunk(
    "eventCategories/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await eventCategoriesService.createCategory(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to create category");
        }
    }
);

export const updateEventCategory = createAsyncThunk(
    "eventCategories/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await eventCategoriesService.updateCategory(id, changes);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to update category");
        }
    }
);

const eventCategoriesSlice = createSlice({
    name: "eventCategories",
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
        clearCurrentCategory(state) {
            state.currentCategory = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEventCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEventCategories.fulfilled, (state, action) => {
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
            .addCase(fetchEventCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchEventCategoryById.pending, (state) => {
                state.fetchingSingle = true;
            })
            .addCase(fetchEventCategoryById.fulfilled, (state, action) => {
                state.fetchingSingle = false;
                state.currentCategory = action.payload || null;
            })
            .addCase(fetchEventCategoryById.rejected, (state) => {
                state.fetchingSingle = false;
            })

            .addCase(createEventCategory.pending, (state) => {
                state.creating = true;
            })
            .addCase(createEventCategory.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createEventCategory.rejected, (state) => {
                state.creating = false;
            })

            .addCase(updateEventCategory.pending, (state) => {
                state.updating = true;
            })
            .addCase(updateEventCategory.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateEventCategory.rejected, (state) => {
                state.updating = false;
            });
    },
});

export const { setFilters, setPage, clearCurrentCategory, clearError } = eventCategoriesSlice.actions;

export default eventCategoriesSlice.reducer;

