import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adCategoriesService } from "@/services/marketplace";

const initialState = {
    list: [],
    allOptions: [],
    current: null,
    children: [],
    loading: false,
    creating: false,
    updating: false,
    attaching: false,
    detaching: false,
    fetchingSingle: false,
    fetchingChildren: false,
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
        typeId: "",
        search: "",
    },
};

export const fetchAdCategories = createAsyncThunk(
    "marketplace/adCategories/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adCategoriesService.fetchCategories(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load ad categories");
        }
    }
);

export const fetchAllAdCategories = createAsyncThunk(
    "marketplace/adCategories/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await adCategoriesService.fetchAllCategories();
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load categories list");
        }
    }
);

export const fetchAdCategoryById = createAsyncThunk(
    "marketplace/adCategories/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await adCategoriesService.fetchCategoryById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load category");
        }
    }
);

export const fetchAdCategoriesByType = createAsyncThunk(
    "marketplace/adCategories/fetchByType",
    async (typeId, { rejectWithValue }) => {
        try {
            const response = await adCategoriesService.fetchCategoriesByType(typeId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load categories for type");
        }
    }
);

export const fetchAdCategoryChildren = createAsyncThunk(
    "marketplace/adCategories/fetchChildren",
    async (parentId, { rejectWithValue }) => {
        try {
            const response = await adCategoriesService.fetchCategoryChildren(parentId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load sub categories");
        }
    }
);

export const createAdCategory = createAsyncThunk(
    "marketplace/adCategories/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await adCategoriesService.createCategory(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to create category");
        }
    }
);

export const updateAdCategory = createAsyncThunk(
    "marketplace/adCategories/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await adCategoriesService.updateCategory(id, changes);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to update category");
        }
    }
);

export const attachAttributeToCategory = createAsyncThunk(
    "marketplace/adCategories/attachAttribute",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await adCategoriesService.attachAttributeToCategory(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to attach attribute");
        }
    }
);

export const detachAttributeFromCategory = createAsyncThunk(
    "marketplace/adCategories/detachAttribute",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await adCategoriesService.detachAttributeFromCategory(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to detach attribute");
        }
    }
);

const adCategoriesSlice = createSlice({
    name: "marketplaceAdCategories",
    initialState,
    reducers: {
        setAdCategoryFilters(state, action) {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        setAdCategoryPage(state, action) {
            state.pagination.page = action.payload;
        },
        clearCurrentAdCategory(state) {
            state.current = null;
        },
        clearAdCategoryError(state) {
            state.error = null;
        },
        clearAdCategoryChildren(state) {
            state.children = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdCategories.fulfilled, (state, action) => {
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
            .addCase(fetchAdCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchAllAdCategories.fulfilled, (state, action) => {
                state.allOptions = action.payload?.data || [];
            })
            .addCase(fetchAllAdCategories.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(fetchAdCategoryById.pending, (state) => {
                state.fetchingSingle = true;
            })
            .addCase(fetchAdCategoryById.fulfilled, (state, action) => {
                state.fetchingSingle = false;
                state.current = action.payload || null;
            })
            .addCase(fetchAdCategoryById.rejected, (state) => {
                state.fetchingSingle = false;
            })

            .addCase(fetchAdCategoryChildren.pending, (state) => {
                state.fetchingChildren = true;
            })
            .addCase(fetchAdCategoryChildren.fulfilled, (state, action) => {
                state.fetchingChildren = false;
                state.children = action.payload?.data || [];
            })
            .addCase(fetchAdCategoryChildren.rejected, (state, action) => {
                state.fetchingChildren = false;
                state.error = action.payload;
            })

            .addCase(createAdCategory.pending, (state) => {
                state.creating = true;
            })
            .addCase(createAdCategory.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createAdCategory.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })

            .addCase(updateAdCategory.pending, (state) => {
                state.updating = true;
            })
            .addCase(updateAdCategory.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateAdCategory.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            })

            .addCase(attachAttributeToCategory.pending, (state) => {
                state.attaching = true;
            })
            .addCase(attachAttributeToCategory.fulfilled, (state) => {
                state.attaching = false;
            })
            .addCase(attachAttributeToCategory.rejected, (state, action) => {
                state.attaching = false;
                state.error = action.payload;
            })

            .addCase(detachAttributeFromCategory.pending, (state) => {
                state.detaching = true;
            })
            .addCase(detachAttributeFromCategory.fulfilled, (state) => {
                state.detaching = false;
            })
            .addCase(detachAttributeFromCategory.rejected, (state, action) => {
                state.detaching = false;
                state.error = action.payload;
            });
    },
});

export const {
    setAdCategoryFilters,
    setAdCategoryPage,
    clearCurrentAdCategory,
    clearAdCategoryError,
    clearAdCategoryChildren,
} = adCategoriesSlice.actions;

export default adCategoriesSlice.reducer;


