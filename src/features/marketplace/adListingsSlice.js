import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adListingsService } from "@/services/marketplace";

const initialState = {
    adminList: [],
    userList: [],
    currentAdminListing: null,
    currentUserListing: null,
    loading: false,
    userLoading: false,
    creating: false,
    updating: false,
    error: null,
    userError: null,
    pagination: {
        page: 1,
        pages: 0,
        total: 0,
        limit: 10,
    },
    userPagination: {
        page: 1,
        pages: 0,
        total: 0,
        limit: 10,
    },
    filters: {
        query: "",
        type: "",
        category: "",
        postcode: "",
        location: "",
        radius: "",
    },
    links: {
        next: null,
        prev: null,
    },
};

export const fetchAdminListings = createAsyncThunk(
    "marketplace/adListings/fetchAdmin",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adListingsService.fetchAdminListings(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load listings");
        }
    }
);

export const fetchAdminListingById = createAsyncThunk(
    "marketplace/adListings/fetchAdminById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await adListingsService.fetchAdminListingById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load listing");
        }
    }
);

export const fetchUserListings = createAsyncThunk(
    "marketplace/adListings/fetchUser",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adListingsService.fetchUserListings(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load your listings");
        }
    }
);

export const fetchUserListingById = createAsyncThunk(
    "marketplace/adListings/fetchUserById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await adListingsService.fetchUserListingById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load listing");
        }
    }
);

export const createAdListing = createAsyncThunk(
    "marketplace/adListings/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await adListingsService.createListing(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to create listing");
        }
    }
);

export const updateAdListing = createAsyncThunk(
    "marketplace/adListings/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await adListingsService.updateListing(id, changes);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to update listing");
        }
    }
);

const adListingsSlice = createSlice({
    name: "marketplaceAdListings",
    initialState,
    reducers: {
        setAdListingFilters(state, action) {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        setAdListingPage(state, action) {
            state.pagination.page = action.payload;
        },
        setUserListingPage(state, action) {
            state.userPagination.page = action.payload;
        },
        clearCurrentAdminListing(state) {
            state.currentAdminListing = null;
        },
        clearCurrentUserListing(state) {
            state.currentUserListing = null;
        },
        clearAdListingError(state) {
            state.error = null;
        },
        clearUserListingError(state) {
            state.userError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminListings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminListings.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload || {};
                state.adminList = payload.data || [];
                const meta = payload.meta || {};
                state.pagination.page = meta.current_page || 1;
                state.pagination.pages = meta.last_page || 0;
                state.pagination.total = meta.total || 0;
                state.pagination.limit = meta.per_page || state.pagination.limit;
                state.links.next = payload.links?.next ?? null;
                state.links.prev = payload.links?.prev ?? null;
            })
            .addCase(fetchAdminListings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchAdminListingById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminListingById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentAdminListing = action.payload || null;
            })
            .addCase(fetchAdminListingById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchUserListings.pending, (state) => {
                state.userLoading = true;
                state.userError = null;
            })
            .addCase(fetchUserListings.fulfilled, (state, action) => {
                state.userLoading = false;
                const payload = action.payload || {};
                state.userList = payload.data || [];
                // Store pagination info if available
                const meta = payload.meta || {};
                state.userPagination.page = meta.current_page || 1;
                state.userPagination.pages = meta.last_page || 0;
                state.userPagination.total = meta.total || 0;
                state.userPagination.limit = meta.per_page || state.userPagination.limit;
            })
            .addCase(fetchUserListings.rejected, (state, action) => {
                state.userLoading = false;
                state.userError = action.payload;
            })

            .addCase(fetchUserListingById.pending, (state) => {
                state.userLoading = true;
            })
            .addCase(fetchUserListingById.fulfilled, (state, action) => {
                state.userLoading = false;
                state.currentUserListing = action.payload || null;
            })
            .addCase(fetchUserListingById.rejected, (state, action) => {
                state.userLoading = false;
                state.userError = action.payload;
            })

            .addCase(createAdListing.pending, (state) => {
                state.creating = true;
            })
            .addCase(createAdListing.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createAdListing.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })

            .addCase(updateAdListing.pending, (state) => {
                state.updating = true;
            })
            .addCase(updateAdListing.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateAdListing.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const {
    setAdListingFilters,
    setAdListingPage,
    setUserListingPage,
    clearCurrentAdminListing,
    clearCurrentUserListing,
    clearAdListingError,
    clearUserListingError,
} = adListingsSlice.actions;

export default adListingsSlice.reducer;


