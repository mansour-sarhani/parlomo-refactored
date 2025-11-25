import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adAttributesService } from "@/services/marketplace";

const initialState = {
    list: [],
    allOptions: [],
    current: null,
    categoryAttributes: [],
    categoryAttributesPrice: null,
    loading: false,
    creating: false,
    updating: false,
    fetchingSingle: false,
    fetchingCategoryAttributes: false,
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
};

export const fetchAdAttributes = createAsyncThunk(
    "marketplace/adAttributes/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adAttributesService.fetchAttributes(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load ad attributes");
        }
    }
);

export const fetchAllAdAttributes = createAsyncThunk(
    "marketplace/adAttributes/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adAttributesService.fetchAllAttributes(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load attribute list");
        }
    }
);

export const fetchAdAttributeById = createAsyncThunk(
    "marketplace/adAttributes/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await adAttributesService.fetchAttributeById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load attribute");
        }
    }
);

export const fetchAttributesForCategory = createAsyncThunk(
    "marketplace/adAttributes/fetchForCategory",
    async (categoryId, { rejectWithValue }) => {
        try {
            const response = await adAttributesService.fetchAttributesForCategory(categoryId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load category attributes");
        }
    }
);

export const createAdAttribute = createAsyncThunk(
    "marketplace/adAttributes/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await adAttributesService.createAttribute(payload);
            return response.data;
        } catch (error) {
            // Extract validation errors if available
            const errorMessage = error?.message || "Failed to create attribute";
            const validationErrors = error?.errors;
            
            // Return structured error data for better handling in components
            if (validationErrors && typeof validationErrors === "object") {
                return rejectWithValue({
                    message: errorMessage,
                    errors: validationErrors,
                });
            }
            
            return rejectWithValue({
                message: errorMessage,
                errors: null,
            });
        }
    }
);

export const updateAdAttribute = createAsyncThunk(
    "marketplace/adAttributes/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await adAttributesService.updateAttribute(id, changes);
            return response.data;
        } catch (error) {
            // Extract validation errors if available
            const errorMessage = error?.message || "Failed to update attribute";
            const validationErrors = error?.errors;
            
            // Return structured error data for better handling in components
            if (validationErrors && typeof validationErrors === "object") {
                return rejectWithValue({
                    message: errorMessage,
                    errors: validationErrors,
                });
            }
            
            return rejectWithValue({
                message: errorMessage,
                errors: null,
            });
        }
    }
);

const adAttributesSlice = createSlice({
    name: "marketplaceAdAttributes",
    initialState,
    reducers: {
        setAdAttributePage(state, action) {
            state.pagination.page = action.payload;
        },
        clearCurrentAdAttribute(state) {
            state.current = null;
        },
        clearAdAttributeError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdAttributes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdAttributes.fulfilled, (state, action) => {
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
            .addCase(fetchAdAttributes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchAllAdAttributes.fulfilled, (state, action) => {
                state.allOptions = action.payload?.data || [];
            })
            .addCase(fetchAllAdAttributes.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(fetchAdAttributeById.pending, (state) => {
                state.fetchingSingle = true;
            })
            .addCase(fetchAdAttributeById.fulfilled, (state, action) => {
                state.fetchingSingle = false;
                state.current = action.payload || null;
            })
            .addCase(fetchAdAttributeById.rejected, (state) => {
                state.fetchingSingle = false;
            })

            .addCase(fetchAttributesForCategory.pending, (state) => {
                state.fetchingCategoryAttributes = true;
            })
            .addCase(fetchAttributesForCategory.fulfilled, (state, action) => {
                state.fetchingCategoryAttributes = false;
                // legacy response returns { attribute: [], adsPrice: value }
                state.categoryAttributes = action.payload?.attribute || [];
                state.categoryAttributesPrice = action.payload?.adsPrice ?? null;
            })
            .addCase(fetchAttributesForCategory.rejected, (state, action) => {
                state.fetchingCategoryAttributes = false;
                state.error = action.payload;
            })

            .addCase(createAdAttribute.pending, (state) => {
                state.creating = true;
                state.error = null; // Clear previous errors
            })
            .addCase(createAdAttribute.fulfilled, (state) => {
                state.creating = false;
                state.error = null; // Clear errors on success
            })
            .addCase(createAdAttribute.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })

            .addCase(updateAdAttribute.pending, (state) => {
                state.updating = true;
                state.error = null; // Clear previous errors
            })
            .addCase(updateAdAttribute.fulfilled, (state) => {
                state.updating = false;
                state.error = null; // Clear errors on success
            })
            .addCase(updateAdAttribute.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const {
    setAdAttributePage,
    clearCurrentAdAttribute,
    clearAdAttributeError,
} = adAttributesSlice.actions;

export default adAttributesSlice.reducer;


