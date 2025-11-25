import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { businessListingsService } from "@/services/businesses";

const initialState = {
    adminList: [],
    adminOptions: [],
    myList: [],
    publicList: [],
    currentAdminListing: null,
    currentMyListing: null,
    loading: false,
    myLoading: false,
    publicLoading: false,
    optionsLoading: false,
    creating: false,
    updating: false,
    changingOwner: false,
    error: null,
    myError: null,
    publicError: null,
    changeOwnerError: null,
    pagination: {
        page: 1,
        pages: 0,
        total: 0,
        limit: 10,
    },
    filters: {
        query: "",
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

export const fetchBusinessListings = createAsyncThunk(
    "businessListings/fetchAdmin",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await businessListingsService.fetchAdminListings(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load business listings");
        }
    }
);

export const fetchPublicBusinessListings = createAsyncThunk(
    "businessListings/fetchPublic",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await businessListingsService.fetchPublicListings(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load business listings");
        }
    }
);

export const fetchBusinessListingById = createAsyncThunk(
    "businessListings/fetchAdminById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await businessListingsService.fetchAdminListingById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load business");
        }
    }
);

export const fetchBusinessListingOptions = createAsyncThunk(
    "businessListings/fetchAdminOptions",
    async (_, { rejectWithValue }) => {
        try {
            const response = await businessListingsService.fetchAdminListingOptions();
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load business options");
        }
    }
);

export const changeBusinessListingOwner = createAsyncThunk(
    "businessListings/changeOwner",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await businessListingsService.changeListingOwner(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to change business owner");
        }
    }
);

export const fetchMyBusinessListings = createAsyncThunk(
    "businessListings/fetchMine",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await businessListingsService.fetchMyListings(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load your businesses");
        }
    }
);

export const fetchMyBusinessById = createAsyncThunk(
    "businessListings/fetchMineById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await businessListingsService.fetchMyListingById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load your business");
        }
    }
);

export const createBusinessListing = createAsyncThunk(
    "businessListings/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await businessListingsService.createListing(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to create business");
        }
    }
);

export const updateBusinessListing = createAsyncThunk(
    "businessListings/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await businessListingsService.updateListing(id, changes);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to update business");
        }
    }
);

const businessListingsSlice = createSlice({
    name: "businessListings",
    initialState,
    reducers: {
        setBusinessListingFilters(state, action) {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        setBusinessListingPage(state, action) {
            state.pagination.page = action.payload;
        },
        clearCurrentAdminBusiness(state) {
            state.currentAdminListing = null;
        },
        clearCurrentMyBusiness(state) {
            state.currentMyListing = null;
        },
        clearBusinessListingsError(state) {
            state.error = null;
            state.changeOwnerError = null;
        },
        clearMyBusinessListingsError(state) {
            state.myError = null;
        },
        clearPublicBusinessListingsError(state) {
            state.publicError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBusinessListings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBusinessListings.fulfilled, (state, action) => {
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
            .addCase(fetchBusinessListings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchBusinessListingById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBusinessListingById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentAdminListing = action.payload || null;
            })
            .addCase(fetchBusinessListingById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchBusinessListingOptions.pending, (state) => {
                state.optionsLoading = true;
            })
            .addCase(fetchBusinessListingOptions.fulfilled, (state, action) => {
                state.optionsLoading = false;
                state.adminOptions = action.payload?.data || [];
            })
            .addCase(fetchBusinessListingOptions.rejected, (state) => {
                state.optionsLoading = false;
            })

            .addCase(changeBusinessListingOwner.pending, (state) => {
                state.changingOwner = true;
                state.changeOwnerError = null;
            })
            .addCase(changeBusinessListingOwner.fulfilled, (state) => {
                state.changingOwner = false;
            })
            .addCase(changeBusinessListingOwner.rejected, (state, action) => {
                state.changingOwner = false;
                state.changeOwnerError = action.payload;
            })

            .addCase(fetchMyBusinessListings.pending, (state) => {
                state.myLoading = true;
                state.myError = null;
            })
            .addCase(fetchMyBusinessListings.fulfilled, (state, action) => {
                state.myLoading = false;
                const payload = action.payload || {};
                state.myList = payload.data || [];
                const meta = payload.meta || {};
                state.pagination.page = meta.current_page || 1;
                state.pagination.pages = meta.last_page || 0;
                state.pagination.total = meta.total || 0;
                state.pagination.limit = meta.per_page || state.pagination.limit;
                state.links.next = payload.links?.next ?? null;
                state.links.prev = payload.links?.prev ?? null;
            })
            .addCase(fetchMyBusinessListings.rejected, (state, action) => {
                state.myLoading = false;
                state.myError = action.payload;
            })

            .addCase(fetchMyBusinessById.pending, (state) => {
                state.myLoading = true;
            })
            .addCase(fetchMyBusinessById.fulfilled, (state, action) => {
                state.myLoading = false;
                state.currentMyListing = action.payload || null;
            })
            .addCase(fetchMyBusinessById.rejected, (state, action) => {
                state.myLoading = false;
                state.myError = action.payload;
            })

            .addCase(createBusinessListing.pending, (state) => {
                state.creating = true;
            })
            .addCase(createBusinessListing.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createBusinessListing.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })

            .addCase(updateBusinessListing.pending, (state) => {
                state.updating = true;
            })
            .addCase(updateBusinessListing.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateBusinessListing.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            })

            .addCase(fetchPublicBusinessListings.pending, (state) => {
                state.publicLoading = true;
                state.publicError = null;
            })
            .addCase(fetchPublicBusinessListings.fulfilled, (state, action) => {
                state.publicLoading = false;
                const payload = action.payload || {};
                state.publicList = payload.data || [];
                const meta = payload.meta || {};
                state.pagination.page = meta.current_page || 1;
                state.pagination.pages = meta.last_page || 0;
                state.pagination.total = meta.total || 0;
                state.pagination.limit = meta.per_page || state.pagination.limit;
                state.links.next = payload.links?.next ?? null;
                state.links.prev = payload.links?.prev ?? null;
            })
            .addCase(fetchPublicBusinessListings.rejected, (state, action) => {
                state.publicLoading = false;
                state.publicError = action.payload;
            });
    },
});

export const {
    setBusinessListingFilters,
    setBusinessListingPage,
    clearCurrentAdminBusiness,
    clearCurrentMyBusiness,
    clearBusinessListingsError,
    clearMyBusinessListingsError,
    clearPublicBusinessListingsError,
} = businessListingsSlice.actions;

export default businessListingsSlice.reducer;


