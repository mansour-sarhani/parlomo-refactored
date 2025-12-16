/**
 * Public Event Categories Redux Slice
 * State management for public event categories
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { publicEventCategoriesService } from '@/services/public-event-categories.service';

// ==================== INITIAL STATE ====================

const initialState = {
    list: [],
    currentCategory: null,
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    seeding: false,
    error: null,
    pagination: {
        page: 1,
        pages: 0,
        total: 0,
        limit: 20,
    },
    filters: {
        search: '',
        status: 'all',
    },
};

// ==================== ASYNC THUNKS ====================

/**
 * Fetch all categories with pagination and filters
 */
export const fetchPublicEventCategories = createAsyncThunk(
    'publicEventCategories/fetchList',
    async (params = {}, { getState, rejectWithValue }) => {
        try {
            const state = getState().publicEventCategories;

            // Merge with current filters if not provided
            const queryParams = {
                page: params.page || state.pagination.page,
                limit: params.limit || state.pagination.limit,
                status: params.status !== undefined ? params.status : state.filters.status,
                search: params.search !== undefined ? params.search : state.filters.search,
            };

            const response = await publicEventCategoriesService.getCategories(queryParams);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to load categories');
        }
    }
);

/**
 * Fetch active categories only (for dropdowns)
 */
export const fetchActiveCategories = createAsyncThunk(
    'publicEventCategories/fetchActive',
    async (_, { rejectWithValue }) => {
        try {
            const response = await publicEventCategoriesService.getActiveCategories();
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to load categories');
        }
    }
);

/**
 * Fetch single category by ID
 */
export const fetchPublicEventCategoryById = createAsyncThunk(
    'publicEventCategories/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await publicEventCategoriesService.getCategory(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to load category');
        }
    }
);

/**
 * Create new category
 */
export const createPublicEventCategory = createAsyncThunk(
    'publicEventCategories/create',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await publicEventCategoriesService.createCategory(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to create category');
        }
    }
);

/**
 * Update existing category
 */
export const updatePublicEventCategory = createAsyncThunk(
    'publicEventCategories/update',
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await publicEventCategoriesService.updateCategory(id, changes);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to update category');
        }
    }
);

/**
 * Delete category
 */
export const deletePublicEventCategory = createAsyncThunk(
    'publicEventCategories/delete',
    async (id, { rejectWithValue }) => {
        try {
            const response = await publicEventCategoriesService.deleteCategory(id);
            return { id, ...response.data };
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to delete category');
        }
    }
);

/**
 * Seed default categories
 */
export const seedPublicEventCategories = createAsyncThunk(
    'publicEventCategories/seed',
    async (reset = false, { rejectWithValue }) => {
        try {
            const response = await publicEventCategoriesService.seedCategories(reset);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to seed categories');
        }
    }
);

// ==================== SLICE ====================

const publicEventCategoriesSlice = createSlice({
    name: 'publicEventCategories',
    initialState,
    reducers: {
        setFilters(state, action) {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
            // Reset to first page when filters change
            state.pagination.page = 1;
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
        resetFilters(state) {
            state.filters = initialState.filters;
            state.pagination.page = 1;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all categories
            .addCase(fetchPublicEventCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPublicEventCategories.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload || {};
                state.list = payload.data || [];
                const meta = payload.meta || {};
                state.pagination.page = meta.current_page || 1;
                state.pagination.pages = meta.last_page || 0;
                state.pagination.total = meta.total || 0;
                state.pagination.limit = meta.per_page || state.pagination.limit;
            })
            .addCase(fetchPublicEventCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch active categories
            .addCase(fetchActiveCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActiveCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload?.categories || [];
            })
            .addCase(fetchActiveCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch single category
            .addCase(fetchPublicEventCategoryById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPublicEventCategoryById.fulfilled, (state, action) => {
                state.loading = false;
                // API returns { success: true, data: {...category} }
                // response.data from axios gives us { success, data }, so we need action.payload.data
                state.currentCategory = action.payload?.data || action.payload || null;
            })
            .addCase(fetchPublicEventCategoryById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create category
            .addCase(createPublicEventCategory.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createPublicEventCategory.fulfilled, (state, action) => {
                state.creating = false;
                // Add to list if returned
                if (action.payload?.category) {
                    state.list.unshift(action.payload.category);
                    state.pagination.total += 1;
                }
            })
            .addCase(createPublicEventCategory.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })

            // Update category
            .addCase(updatePublicEventCategory.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updatePublicEventCategory.fulfilled, (state, action) => {
                state.updating = false;
                // Update in list
                if (action.payload?.category) {
                    const index = state.list.findIndex(
                        (cat) => cat.id === action.payload.category.id || cat._id === action.payload.category._id
                    );
                    if (index !== -1) {
                        state.list[index] = action.payload.category;
                    }
                    // Update current if same
                    if (state.currentCategory?.id === action.payload.category.id) {
                        state.currentCategory = action.payload.category;
                    }
                }
            })
            .addCase(updatePublicEventCategory.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            })

            // Delete category
            .addCase(deletePublicEventCategory.pending, (state) => {
                state.deleting = true;
                state.error = null;
            })
            .addCase(deletePublicEventCategory.fulfilled, (state, action) => {
                state.deleting = false;
                // Remove from list
                if (action.payload?.id) {
                    state.list = state.list.filter(
                        (cat) => cat.id !== action.payload.id && cat._id !== action.payload.id
                    );
                    state.pagination.total = Math.max(0, state.pagination.total - 1);
                }
            })
            .addCase(deletePublicEventCategory.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload;
            })

            // Seed categories
            .addCase(seedPublicEventCategories.pending, (state) => {
                state.seeding = true;
                state.error = null;
            })
            .addCase(seedPublicEventCategories.fulfilled, (state) => {
                state.seeding = false;
            })
            .addCase(seedPublicEventCategories.rejected, (state, action) => {
                state.seeding = false;
                state.error = action.payload;
            });
    },
});

// ==================== ACTIONS ====================

export const {
    setFilters,
    setPage,
    clearCurrentCategory,
    clearError,
    resetFilters,
} = publicEventCategoriesSlice.actions;

// ==================== SELECTORS ====================

export const selectPublicEventCategories = (state) => state.publicEventCategories.list;
export const selectActiveCategories = (state) =>
    state.publicEventCategories.list.filter((cat) => cat.status === 'active');
export const selectCurrentCategory = (state) => state.publicEventCategories.currentCategory;
export const selectCategoriesLoading = (state) => state.publicEventCategories.loading;
export const selectCategoriesCreating = (state) => state.publicEventCategories.creating;
export const selectCategoriesUpdating = (state) => state.publicEventCategories.updating;
export const selectCategoriesDeleting = (state) => state.publicEventCategories.deleting;
export const selectCategoriesSeeding = (state) => state.publicEventCategories.seeding;
export const selectCategoriesError = (state) => state.publicEventCategories.error;
export const selectCategoriesPagination = (state) => state.publicEventCategories.pagination;
export const selectCategoriesFilters = (state) => state.publicEventCategories.filters;

export default publicEventCategoriesSlice.reducer;
