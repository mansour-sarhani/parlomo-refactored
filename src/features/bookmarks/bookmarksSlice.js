import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { bookmarkService } from "@/services/bookmark.service";

const createInitialCollectionState = () => ({
    items: [],
    loading: false,
    error: null,
    pagination: {
        page: 1,
        pages: 1,
        total: 0,
        limit: 10,
    },
    links: {
        next: null,
        prev: null,
    },
});

const initialState = {
    ads: createInitialCollectionState(),
    directories: createInitialCollectionState(),
    events: createInitialCollectionState(),
};

// --- Async thunks --------------------------------------------------------

export const fetchBookmarkedAds = createAsyncThunk(
    "bookmarks/fetchBookmarkedAds",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await bookmarkService.getBookmarkedAds(params);
            return response.data;
        } catch (error) {
            const message = error?.response?.data?.message || error.message || "Failed to load bookmarked ads";
            return rejectWithValue(message);
        }
    }
);

export const fetchBookmarkedDirectories = createAsyncThunk(
    "bookmarks/fetchBookmarkedDirectories",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await bookmarkService.getBookmarkedDirectories(params);
            return response.data;
        } catch (error) {
            const message = error?.response?.data?.message || error.message || "Failed to load bookmarked directories";
            return rejectWithValue(message);
        }
    }
);

export const fetchBookmarkedEvents = createAsyncThunk(
    "bookmarks/fetchBookmarkedEvents",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await bookmarkService.getBookmarkedEvents(params);
            return response.data;
        } catch (error) {
            const message = error?.response?.data?.message || error.message || "Failed to load bookmarked events";
            return rejectWithValue(message);
        }
    }
);

export const toggleAdBookmark = createAsyncThunk(
    "bookmarks/toggleAdBookmark",
    async (adId, { rejectWithValue }) => {
        try {
            const response = await bookmarkService.toggleAdBookmark(adId);
            return { id: adId, status: response.data?.status };
        } catch (error) {
            const message = error?.response?.data?.message || error.message || "Unable to update ad bookmark";
            return rejectWithValue(message);
        }
    }
);

export const toggleDirectoryBookmark = createAsyncThunk(
    "bookmarks/toggleDirectoryBookmark",
    async (directoryId, { rejectWithValue }) => {
        try {
            const response = await bookmarkService.toggleDirectoryBookmark(directoryId);
            return { id: directoryId, status: response.data?.status };
        } catch (error) {
            const message = error?.response?.data?.message || error.message || "Unable to update directory bookmark";
            return rejectWithValue(message);
        }
    }
);

export const toggleEventBookmark = createAsyncThunk(
    "bookmarks/toggleEventBookmark",
    async (eventId, { rejectWithValue }) => {
        try {
            const response = await bookmarkService.toggleEventBookmark(eventId);
            return { id: eventId, status: response.data?.status };
        } catch (error) {
            const message = error?.response?.data?.message || error.message || "Unable to update event bookmark";
            return rejectWithValue(message);
        }
    }
);

const applyCollectionLoading = (collection) => {
    collection.loading = true;
    collection.error = null;
};

const applyCollectionFulfilled = (collection, payload) => {
    collection.loading = false;
    collection.items = payload?.data ?? [];
    collection.pagination.page = payload?.meta?.current_page ?? collection.pagination.page;
    collection.pagination.pages = payload?.meta?.last_page ?? collection.pagination.pages;
    collection.pagination.total = payload?.meta?.total ?? collection.pagination.total;
    collection.pagination.limit = payload?.meta?.per_page ?? collection.pagination.limit;
    collection.links.next = payload?.links?.next ?? null;
    collection.links.prev = payload?.links?.prev ?? null;
};

const applyCollectionRejected = (collection, error) => {
    collection.loading = false;
    collection.error = error;
};

const bookmarksSlice = createSlice({
    name: "bookmarks",
    initialState,
    reducers: {
        setAdsPage: (state, action) => {
            state.ads.pagination.page = action.payload;
        },
        setDirectoriesPage: (state, action) => {
            state.directories.pagination.page = action.payload;
        },
        setEventsPage: (state, action) => {
            state.events.pagination.page = action.payload;
        },
        clearAdsError: (state) => {
            state.ads.error = null;
        },
        clearDirectoriesError: (state) => {
            state.directories.error = null;
        },
        clearEventsError: (state) => {
            state.events.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch bookmarked ads -------------------------------------------------
            .addCase(fetchBookmarkedAds.pending, (state) => {
                applyCollectionLoading(state.ads);
            })
            .addCase(fetchBookmarkedAds.fulfilled, (state, action) => {
                applyCollectionFulfilled(state.ads, action.payload);
            })
            .addCase(fetchBookmarkedAds.rejected, (state, action) => {
                applyCollectionRejected(state.ads, action.payload);
            })

            // Fetch bookmarked directories ---------------------------------------
            .addCase(fetchBookmarkedDirectories.pending, (state) => {
                applyCollectionLoading(state.directories);
            })
            .addCase(fetchBookmarkedDirectories.fulfilled, (state, action) => {
                applyCollectionFulfilled(state.directories, action.payload);
            })
            .addCase(fetchBookmarkedDirectories.rejected, (state, action) => {
                applyCollectionRejected(state.directories, action.payload);
            })

            // Fetch bookmarked events --------------------------------------------
            .addCase(fetchBookmarkedEvents.pending, (state) => {
                applyCollectionLoading(state.events);
            })
            .addCase(fetchBookmarkedEvents.fulfilled, (state, action) => {
                applyCollectionFulfilled(state.events, action.payload);
            })
            .addCase(fetchBookmarkedEvents.rejected, (state, action) => {
                applyCollectionRejected(state.events, action.payload);
            })

            // Toggle bookmark status updates -------------------------------------
            .addCase(toggleAdBookmark.fulfilled, (state, action) => {
                const isSaved = action.payload?.status === "saved";
                state.ads.items = state.ads.items.map((item) =>
                    item.id === action.payload.id ? { ...item, bookmarked: isSaved } : item
                );
            })
            .addCase(toggleDirectoryBookmark.fulfilled, (state, action) => {
                const isSaved = action.payload?.status === "saved";
                state.directories.items = state.directories.items.map((item) =>
                    item.id === action.payload.id ? { ...item, bookmarked: isSaved } : item
                );
            })
            .addCase(toggleEventBookmark.fulfilled, (state, action) => {
                const isSaved = action.payload?.status === "saved";
                state.events.items = state.events.items.map((item) =>
                    item.id === action.payload.id ? { ...item, bookmarked: isSaved } : item
                );
            });
    },
});

export const {
    setAdsPage,
    setDirectoriesPage,
    setEventsPage,
    clearAdsError,
    clearDirectoriesError,
    clearEventsError,
} = bookmarksSlice.actions;

export default bookmarksSlice.reducer;


