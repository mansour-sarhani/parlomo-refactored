import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { businessCategoriesService } from "@/services/businesses";

const initialState = {
    list: [],
    publicList: [],
    options: [],
    editOptions: [],
    currentCategory: null,
    loading: false,
    publicLoading: false,
    creating: false,
    updating: false,
    fetchingSingle: false,
    optionsLoading: false,
    editOptionsLoading: false,
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

export const fetchBusinessCategories = createAsyncThunk(
    "businessCategories/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await businessCategoriesService.fetchCategories(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load business categories");
        }
    }
);

export const fetchPublicBusinessCategories = createAsyncThunk(
    "businessCategories/fetchPublicList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await businessCategoriesService.fetchPublicCategories(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load business categories");
        }
    }
);

export const fetchBusinessCategoryById = createAsyncThunk(
    "businessCategories/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await businessCategoriesService.fetchCategoryById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load category");
        }
    }
);

export const fetchBusinessCategoryOptions = createAsyncThunk(
    "businessCategories/fetchOptions",
    async (_, { rejectWithValue }) => {
        try {
            const response = await businessCategoriesService.fetchCategoryOptions();
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load category options");
        }
    }
);

export const fetchBusinessCategoryOptionsForEdit = createAsyncThunk(
    "businessCategories/fetchOptionsForEdit",
    async (_, { rejectWithValue }) => {
        try {
            const response = await businessCategoriesService.fetchCategoryOptionsForEdit();
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load editable category options");
        }
    }
);

export const createBusinessCategory = createAsyncThunk(
    "businessCategories/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await businessCategoriesService.createCategory(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to create category");
        }
    }
);

export const updateBusinessCategory = createAsyncThunk(
    "businessCategories/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await businessCategoriesService.updateCategory(id, changes);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to update category");
        }
    }
);

const businessCategoriesSlice = createSlice({
    name: "businessCategories",
    initialState,
    reducers: {
        setBusinessCategoryFilters(state, action) {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        setBusinessCategoryPage(state, action) {
            state.pagination.page = action.payload;
        },
        clearBusinessCategory(state) {
            state.currentCategory = null;
        },
        clearBusinessCategoryError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBusinessCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBusinessCategories.fulfilled, (state, action) => {
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
            .addCase(fetchBusinessCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchPublicBusinessCategories.pending, (state) => {
                state.publicLoading = true;
                state.error = null;
            })
            .addCase(fetchPublicBusinessCategories.fulfilled, (state, action) => {
                state.publicLoading = false;
                state.publicList = action.payload || [];
            })
            .addCase(fetchPublicBusinessCategories.rejected, (state, action) => {
                state.publicLoading = false;
                state.error = action.payload;
            })

            .addCase(fetchBusinessCategoryById.pending, (state) => {
                state.fetchingSingle = true;
            })
            .addCase(fetchBusinessCategoryById.fulfilled, (state, action) => {
                state.fetchingSingle = false;
                state.currentCategory = action.payload || null;
            })
            .addCase(fetchBusinessCategoryById.rejected, (state) => {
                state.fetchingSingle = false;
            })

            .addCase(fetchBusinessCategoryOptions.pending, (state) => {
                state.optionsLoading = true;
            })
            .addCase(fetchBusinessCategoryOptions.fulfilled, (state, action) => {
                state.optionsLoading = false;
                state.options = action.payload?.data || [];
            })
            .addCase(fetchBusinessCategoryOptions.rejected, (state) => {
                state.optionsLoading = false;
            })

            .addCase(fetchBusinessCategoryOptionsForEdit.pending, (state) => {
                state.editOptionsLoading = true;
            })
            .addCase(fetchBusinessCategoryOptionsForEdit.fulfilled, (state, action) => {
                state.editOptionsLoading = false;
                state.editOptions = action.payload?.data || [];
            })
            .addCase(fetchBusinessCategoryOptionsForEdit.rejected, (state) => {
                state.editOptionsLoading = false;
            })

            .addCase(createBusinessCategory.pending, (state) => {
                state.creating = true;
            })
            .addCase(createBusinessCategory.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createBusinessCategory.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })

            .addCase(updateBusinessCategory.pending, (state) => {
                state.updating = true;
            })
            .addCase(updateBusinessCategory.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateBusinessCategory.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const {
    setBusinessCategoryFilters,
    setBusinessCategoryPage,
    clearBusinessCategory,
    clearBusinessCategoryError,
} = businessCategoriesSlice.actions;

export default businessCategoriesSlice.reducer;


